import React, { useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
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
import { GalleryItem } from "@/types/practicum";
import { toast } from "sonner";
import { gdrive } from "@/lib/gdrive";

interface GalleryUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: GalleryItem) => void;
}

export const GalleryUploadDialog: React.FC<GalleryUploadDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("classroom");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
  );
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      if (gdrive.isConfigured()) {
        toast.loading("กำลังอัปโหลดรูปภาพไปยัง Google Drive...");
        try {
          const cloudUrl = await gdrive.uploadFile(file, "ClassMate_Practicum_Files");
          setPreview(cloudUrl);
          setUrl(cloudUrl);
          toast.dismiss();
          toast.success("อัปโหลดรูปภาพขึ้น Google Drive สำเร็จ!");
        } catch (err) {
          toast.dismiss();
          toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Google Drive");
          const localUrl = await gdrive.readFileAsDataURL(file);
          setPreview(localUrl);
          setUrl(localUrl);
        }
      } else {
        const localUrl = await gdrive.readFileAsDataURL(file);
        setPreview(localUrl);
        setUrl(localUrl);
        toast.info("บันทึกรูปภาพในเครื่อง (สามารถเชื่อมต่อ Google Drive ได้ที่เมนู Cloud)");
      }
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onSave({
      id: `gal-${Date.now()}`,
      url,
      title: title || "กิจกรรมการจัดการเรียนรู้",
      category,
      date,
    });
    setTitle("");
    setUrl("");
    setPreview("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <ImageIcon className="w-5 h-5 text-cyber-cyan" />
            เพิ่มรูปภาพกิจกรรมและบรรยากาศการสอน
          </DialogTitle>
          <DialogDescription className="text-xs">
            อัปโหลดรูปภาพกิจกรรม หรือระบุลิงก์รูปภาพเพื่อนำไปแสดงในคลังภาพ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          {/* Image Preview & Upload */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            {preview || url ? (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-cyber-cyan/30">
                <img
                  src={preview || url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl h-36 cursor-pointer hover:border-cyber-cyan transition text-center p-4">
                <Upload className="w-8 h-8 text-cyber-cyan/60 mb-2" />
                <span className="text-slate-300 font-medium">กดเพื่อเลือกไฟล์ภาพ หรือ ลากไฟล์มาวาง</span>
                <span className="text-[11px] text-muted-foreground">JPG, PNG, WebP (ไม่เกิน 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
            )}

            <div className="flex items-center gap-2">
              <Input
                placeholder="หรือระบุ URL รูปภาพ: https://..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setPreview(e.target.value);
                }}
                className="h-8 text-xs flex-1"
              />
              <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer text-slate-300 font-medium shrink-0">
                <Upload className="w-3 h-3" />
                <span>เปลี่ยนไฟล์</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">ชื่อกิจกรรม / คำอธิบายภาพ</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="กิจกรรมการเรียนรู้แบบ Active Learning..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">หมวดหมู่ภาพ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-xs text-white focus:border-cyber-cyan focus:outline-none"
              >
                <option value="classroom" className="bg-[#0b0e1a]">การจัดการเรียนรู้ (Classroom)</option>
                <option value="activities" className="bg-[#0b0e1a]">กิจกรรม & นิเทศ (Activities)</option>
                <option value="projects" className="bg-[#0b0e1a]">โครงงานผู้เรียน (Projects)</option>
                <option value="events" className="bg-[#0b0e1a]">กิจกรรมโรงเรียน (Events)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">วันที่จัดกิจกรรม</label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="15 ก.ค. 2568"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" disabled={!url}>
              เพิ่มรูปภาพ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
