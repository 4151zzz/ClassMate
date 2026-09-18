import React, { useState } from "react";
import { Image as ImageIcon, Upload, Check, X, Layers, Sparkles, Trash2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GalleryItem } from "@/types/practicum";
import { toast } from "sonner";
import { compressImage, compressMultipleImages } from "@/lib/imageCompressor";
import { gdrive } from "@/lib/gdrive";

interface GalleryUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: GalleryItem) => void;
  onSaveBatch?: (items: GalleryItem[]) => void;
}

export const GalleryUploadDialog: React.FC<GalleryUploadDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveBatch,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("classroom");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
  );
  const [singleUrl, setSingleUrl] = useState("");
  const [selectedImages, setSelectedImages] = useState<{ url: string; name: string }[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0 });
  const [titleMode, setTitleMode] = useState<"same" | "numbered">("same");

  // Reset states on close
  const handleClose = () => {
    setTitle("");
    setSingleUrl("");
    setSelectedImages([]);
    setIsCompressing(false);
    setTitleMode("same");
    onClose();
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    setCompressProgress({ current: 0, total: files.length });

    const toastId = toast.loading(
      files.length > 1
        ? `กำลังประมวลผลและบีบอัดภาพ ${files.length} รูป...`
        : "กำลังประมวลผลและบีบอัดภาพ..."
    );

    try {
      if (gdrive.isConfigured()) {
        const uploaded: { url: string; name: string }[] = [];
        for (let i = 0; i < files.length; i++) {
          try {
            const url = await gdrive.uploadFile(files[i], "ClassMate_Practicum_Files");
            uploaded.push({ url, name: files[i].name });
          } catch {
            const local = await compressImage(files[i], { maxWidth: 1280, maxHeight: 1280, quality: 0.75 });
            uploaded.push({ url: local, name: files[i].name });
          }
          setCompressProgress({ current: i + 1, total: files.length });
        }
        // Append to existing selected images
        setSelectedImages((prev) => [...prev, ...uploaded]);
        toast.success(`อัปโหลดรูปภาพ ${uploaded.length} รูปเรียบร้อย`, { id: toastId });
      } else {
        // High-Speed Client-Side Canvas Compression (~70KB per photo)
        const compressedUrls = await compressMultipleImages(
          files,
          { maxWidth: 1280, maxHeight: 1280, quality: 0.75 },
          (curr, tot) => setCompressProgress({ current: curr, total: tot })
        );

        const items = compressedUrls.map((url, idx) => ({
          url,
          name: files[idx]?.name || `รูปที่ ${idx + 1}`,
        }));

        // Append to existing selected images so user can add more batches
        setSelectedImages((prev) => [...prev, ...items]);

        // Auto fill title if still empty
        if (!title) {
          const rawName = files[0].name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          setTitle(rawName || "กิจกรรมการจัดการเรียนรู้");
        }

        toast.success(
          files.length > 1
            ? `บีบอัดรูปภาพ ${items.length} รูปเรียบร้อย (พร้อมบันทึกและซิงก์)`
            : "บีบอัดรูปภาพเรียบร้อย (ขนาดกะทัดรัด พร้อมซิงก์คลาวด์)",
          { id: toastId }
        );
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการประมวลผลรูปภาพ", { id: toastId });
    } finally {
      setIsCompressing(false);
      // Reset input value so same files can be re-selected if needed
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedImages([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Case 1: Multiple or Single uploaded images
    if (selectedImages.length > 0) {
      const now = Date.now();
      const defaultBaseTitle = title.trim() || "กิจกรรมการจัดการเรียนรู้";

      // Create a separate GalleryItem for EACH image!
      const newItems: GalleryItem[] = selectedImages.map((img, idx) => ({
        id: `gal-${now}-${idx}`,
        url: img.url,
        // When titleMode === "same": exact same title for all photos
        // When titleMode === "numbered": adds (1), (2), etc.
        title:
          titleMode === "same" || selectedImages.length === 1
            ? defaultBaseTitle
            : `${defaultBaseTitle} (${idx + 1})`,
        category,
        date,
      }));

      if (onSaveBatch && newItems.length > 1) {
        onSaveBatch(newItems);
      } else {
        newItems.forEach((item) => onSave(item));
      }

      toast.success(
        selectedImages.length > 1
          ? `เพิ่มภาพ ${newItems.length} รูปลงคลังภาพเรียบร้อย (หัวข้อ: "${defaultBaseTitle}")`
          : `เพิ่มรูปภาพลงคลังภาพเรียบร้อย`
      );
      handleClose();
      return;
    }

    // Case 2: Manual URL entered
    if (singleUrl.trim()) {
      onSave({
        id: `gal-${Date.now()}`,
        url: singleUrl.trim(),
        title: title.trim() || "กิจกรรมการจัดการเรียนรู้",
        category,
        date,
      });
      toast.success("เพิ่มรูปภาพลงคลังภาพเรียบร้อย");
      handleClose();
      return;
    }

    toast.error("กรุณาเลือกไฟล์รูปภาพหรือระบุ URL รูปภาพ");
  };

  const hasPhotos = selectedImages.length > 0 || !!singleUrl.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-[#0a0d14] border border-white/15 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            เพิ่มรูปภาพกิจกรรม (อัปโหลดหลายรูปในหัวข้อเดียวกัน)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            เลือกรูปภาพพร้อมกันได้หลายรูป ระบบจะแยกเป็นรูปละ 1 รายการในคลังภาพให้อัตโนมัติในหัวข้อเดียวกัน
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          {/* Title / Topic Name */}
          <div>
            <label className="text-slate-300 mb-1.5 block font-semibold flex items-center justify-between">
              <span>ชื่อหัวข้อกิจกรรม <span className="text-cyan-400">*</span></span>
              {selectedImages.length > 1 && (
                <span className="text-[11px] text-cyan-400 font-normal">
                  (จะใช้ชื่อนี้กับทั้ง {selectedImages.length} รูปที่เลือก)
                </span>
              )}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ตักบาตรข้าวสารอาหารแห้ง, การจัดการเรียนรู้แบบ Active Learning..."
              className="bg-black/60 border-cyan-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400"
              required
            />
          </div>

          {/* Title Naming Style Toggle (Only when multiple photos selected) */}
          {selectedImages.length > 1 && (
            <div className="p-2.5 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/25 space-y-1.5">
              <span className="text-[11px] font-semibold text-cyan-200 block">
                รูปแบบชื่อภาพเมื่อแยกในคลังภาพ:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTitleMode("same")}
                  className={`p-2 rounded-lg text-left border text-xs transition-all flex items-start gap-2 ${
                    titleMode === "same"
                      ? "bg-cyan-500/20 border-cyan-400 text-white font-medium shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                      : "bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${titleMode === "same" ? "text-cyan-400" : "text-slate-500"}`} />
                  <div>
                    <span className="font-semibold block">ชื่อหัวข้อเดียวกันทุกรูป</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {title.trim() || "ชื่อหัวข้อ"}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTitleMode("numbered")}
                  className={`p-2 rounded-lg text-left border text-xs transition-all flex items-start gap-2 ${
                    titleMode === "numbered"
                      ? "bg-cyan-500/20 border-cyan-400 text-white font-medium shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                      : "bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${titleMode === "numbered" ? "text-cyan-400" : "text-slate-500"}`} />
                  <div>
                    <span className="font-semibold block">ต่อท้ายด้วยหมายเลข</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {title.trim() || "ชื่อหัวข้อ"} (1), (2)...
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
            {selectedImages.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5 text-xs">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    รูปที่เลือก ({selectedImages.length} รูป)
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold inline-flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/30">
                      <Upload className="w-3 h-3" /> เพิ่มรูปอีก
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFiles}
                        className="hidden"
                        disabled={isCompressing}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={clearAllImages}
                      className="text-[11px] text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                      title="ล้างรูปทั้งหมด"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1.5 bg-black/50 rounded-xl border border-white/10 no-scrollbar">
                  {selectedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/15 group bg-slate-900"
                    >
                      <img
                        src={img.url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-red-500 text-white transition-colors"
                        title="ลบรูปนี้"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-mono text-cyan-300">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  ✓ บีบอัดพร้อมบันทึกเป็น {selectedImages.length} รายการแยกในคลังภาพ
                </p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl h-36 cursor-pointer transition text-center p-4 bg-cyan-500/[0.03] hover:bg-cyan-500/[0.08]">
                <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                <span className="text-white font-semibold text-xs">
                  {isCompressing
                    ? `กำลังประมวลผล (${compressProgress.current}/${compressProgress.total})...`
                    : "กดเลือกรูปภาพจากเครื่อง (เลือกได้หลายรูปพร้อมกัน)"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  เลือกทีละหลายรูปได้เลย • ระบบบีบอัดภาพให้อัตโนมัติ (~70KB/รูป)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFiles}
                  className="hidden"
                  disabled={isCompressing}
                />
              </label>
            )}

            {/* Manual URL fallback */}
            {selectedImages.length === 0 && (
              <div className="pt-1">
                <Input
                  placeholder="หรือวางลิงก์รูปภาพเดี่ยว: https://..."
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="h-8 text-xs bg-black/60 border-white/10 text-white placeholder:text-slate-600"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block font-medium">หมวดหมู่ภาพ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 rounded-lg border border-white/15 bg-black/60 px-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="classroom" className="bg-[#0a0d14]">การจัดการเรียนรู้ (Classroom)</option>
                <option value="activities" className="bg-[#0a0d14]">กิจกรรม & นิเทศ (Activities)</option>
                <option value="projects" className="bg-[#0a0d14]">โครงงานผู้เรียน (Projects)</option>
                <option value="events" className="bg-[#0a0d14]">กิจกรรมโรงเรียน (Events)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 mb-1 block font-medium">วันที่จัดกิจกรรม</label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="19 ก.ย. 2568"
                className="h-9 bg-black/60 border-white/15 text-white"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-white/10 text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={!hasPhotos || isCompressing}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              {isCompressing
                ? "กำลังประมวลผล..."
                : selectedImages.length > 1
                ? `บันทึกและแยกเป็น ${selectedImages.length} ภาพในคลัง`
                : "เพิ่มรูปภาพ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
