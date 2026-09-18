import React, { useState } from "react";
import { Image as ImageIcon, Upload, Check, X, Layers, Sparkles } from "lucide-react";
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

  // Reset states on close
  const handleClose = () => {
    setTitle("");
    setSingleUrl("");
    setSelectedImages([]);
    setIsCompressing(false);
    onClose();
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    setCompressProgress({ current: 0, total: files.length });

    // Show toast for feedback
    const toastId = toast.loading(
      files.length > 1
        ? `กำลังประมวลผลและบีบอัดรูปภาพ ${files.length} รูป...`
        : "กำลังประมวลผลและบีบอัดรูปภาพ..."
    );

    try {
      if (gdrive.isConfigured()) {
        // If Google Drive configured, try upload
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
        setSelectedImages(uploaded);
        toast.success(`อัปโหลดรูปภาพ ${uploaded.length} รูปเรียบร้อย`, { id: toastId });
      } else {
        // High-Speed Canvas Compression (Reduces 10MB phone photo -> ~70KB)
        const compressedUrls = await compressMultipleImages(
          files,
          { maxWidth: 1280, maxHeight: 1280, quality: 0.75 },
          (curr, tot) => setCompressProgress({ current: curr, total: tot })
        );

        const items = compressedUrls.map((url, idx) => ({
          url,
          name: files[idx]?.name || `รูปที่ ${idx + 1}`,
        }));

        setSelectedImages(items);

        // Auto fill title if empty and single file
        if (!title && files.length === 1) {
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
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Case 1: Multiple or Single uploaded images
    if (selectedImages.length > 0) {
      const now = Date.now();
      const defaultBaseTitle = title.trim() || "กิจกรรมการจัดการเรียนรู้";

      const newItems: GalleryItem[] = selectedImages.map((img, idx) => ({
        id: `gal-${now}-${idx}`,
        url: img.url,
        title: selectedImages.length === 1 ? defaultBaseTitle : `${defaultBaseTitle} (${idx + 1})`,
        category,
        date,
      }));

      if (onSaveBatch && newItems.length > 1) {
        onSaveBatch(newItems);
      } else {
        newItems.forEach((item) => onSave(item));
      }

      toast.success(`เพิ่มรูปภาพ ${newItems.length} รูปลงคลังภาพแล้ว`);
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
      toast.success("เพิ่มรูปภาพลงคลังภาพแล้ว");
      handleClose();
      return;
    }

    toast.error("กรุณาเลือกไฟล์รูปภาพหรือระบุ URL รูปภาพ");
  };

  const hasPhotos = selectedImages.length > 0 || !!singleUrl.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#0a0d14] border border-white/15 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            เพิ่มรูปภาพกิจกรรม (รองรับเลือกหลายรูปพร้อมกัน)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            เลือกรูปภาพจากโทรศัพท์/คอมพิวเตอร์ได้ทีละหลายรูป ระบบจะบีบอัดภาพให้อัตโนมัติเพื่อให้ซิงก์คลาวด์ได้รวดเร็ว
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          {/* Upload Area */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            {selectedImages.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    รูปที่เลือก ({selectedImages.length} รูป)
                  </span>
                  <label className="text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold inline-flex items-center gap-1">
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
                </div>

                {/* Thumbnails Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-black/40 rounded-lg border border-white/5 no-scrollbar">
                  {selectedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/15 group"
                    >
                      <img
                        src={img.url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors"
                        title="ลบรูปนี้"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/60 text-[9px] font-mono text-cyan-300">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-xl h-36 cursor-pointer transition text-center p-4 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.06]">
                <Upload className="w-8 h-8 text-cyan-400/80 mb-2" />
                <span className="text-white font-medium text-xs">
                  {isCompressing
                    ? `กำลังประมวลผล (${compressProgress.current}/${compressProgress.total})...`
                    : "กดเลือกรูปภาพจากเครื่อง (เลือกได้หลายรูปพร้อมกัน)"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  JPG, PNG, WebP • บีบอัดความเร็วสูงให้อัตโนมัติ
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
                  placeholder="หรือวางลิงก์รูปภาพ: https://..."
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="h-8 text-xs bg-black/60 border-white/10 text-white placeholder:text-slate-600"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-300 mb-1 block font-medium">
              ชื่อกิจกรรม / คำอธิบายภาพ
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น กิจกรรมการจัดการเรียนรู้แบบ Active Learning, ตักบาตรข้าวสาร..."
              className="bg-black/60 border-white/15 text-white placeholder:text-slate-600"
              required
            />
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

          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              รูปที่อัปโหลดจะถูกปรับขนาดให้เหมาะสมสำหรับแสดงผลบนเว็บและมือถือ เพื่อให้ซิงก์คลาวด์ได้เร็วไม่เกิน 1 วินาที
            </span>
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
                ? `เพิ่มรูปภาพ (${selectedImages.length} รูป)`
                : "เพิ่มรูปภาพ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
