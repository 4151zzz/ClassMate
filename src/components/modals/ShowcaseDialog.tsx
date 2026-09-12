import React, { useState, useEffect } from "react";
import { Trophy, Upload } from "lucide-react";
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
import { StudentShowcase } from "@/types/practicum";

interface ShowcaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  showcaseToEdit: StudentShowcase | null;
  onSave: (sc: StudentShowcase) => void;
}

export const ShowcaseDialog: React.FC<ShowcaseDialogProps> = ({
  isOpen,
  onClose,
  showcaseToEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState<StudentShowcase>({
    id: "",
    title: "",
    award: "รางวัลชนะเลิศ เหรียญทอง",
    studentNames: "",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80",
  });

  useEffect(() => {
    if (showcaseToEdit) {
      setFormData(showcaseToEdit);
    } else {
      setFormData({
        id: `sc-${Date.now()}`,
        title: "",
        award: "รางวัลชนะเลิศ เหรียญทอง",
        studentNames: "",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80",
      });
    }
  }, [showcaseToEdit, isOpen]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trophy className="w-5 h-5 text-cyber-amber" />
            {showcaseToEdit ? "แก้ไขผลงานและรางวัลของนักเรียน" : "เพิ่มผลงานและรางวัลของนักเรียน"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            ระบุชื่อโครงงาน รางวัลที่ได้รับ และรายชื่อนักเรียนผู้จัดทำ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          {/* Image */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-amber-500/30">
              <img
                src={formData.image}
                alt="Showcase"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="h-8 text-xs flex-1"
              />
              <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer text-slate-300 font-medium shrink-0">
                <Upload className="w-3 h-3" />
                <span>อัปโหลด</span>
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
            <label className="text-slate-300 mb-1 block">ชื่อโครงงาน / นวัตกรรม</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ระบบคัดแยกขยะอัจฉริยะด้วย AI..."
              required
            />
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">รางวัล / ผลการประเมิน</label>
            <Input
              value={formData.award}
              onChange={(e) => setFormData({ ...formData, award: e.target.value })}
              placeholder="รางวัลชนะเลิศ เหรียญทอง..."
              required
            />
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">รายชื่อนักเรียนผู้จัดทำ</label>
            <Input
              value={formData.studentNames}
              onChange={(e) => setFormData({ ...formData, studentNames: e.target.value })}
              placeholder="ด.ช.ธนภัทร สุขสม และ ด.ญ.กัญญาณัฐ วงศ์วิจิตร (ม.2/4)"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกผลงาน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
