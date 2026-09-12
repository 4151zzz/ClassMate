import React, { useState, useEffect } from "react";
import { Users, Upload } from "lucide-react";
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
import { FacultyMember } from "@/types/practicum";
import { toast } from "sonner";
import { gdrive } from "@/lib/gdrive";

interface FacultyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  facultyToEdit: FacultyMember | null;
  onSave: (member: FacultyMember) => void;
}

export const FacultyDialog: React.FC<FacultyDialogProps> = ({
  isOpen,
  onClose,
  facultyToEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState<FacultyMember>({
    id: "",
    name: "",
    position: "ครูผู้สอน",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    phone: "",
    email: "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  });

  useEffect(() => {
    if (facultyToEdit) {
      setFormData(facultyToEdit);
    } else {
      setFormData({
        id: `fac-${Date.now()}`,
        name: "",
        position: "ครูผู้สอน",
        department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
        phone: "",
        email: "",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      });
    }
  }, [facultyToEdit, isOpen]);

  const [isUploading, setIsUploading] = useState(false);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      if (gdrive.isConfigured()) {
        toast.loading("กำลังอัปโหลดรูปภาพไปยัง Google Drive...");
        try {
          const cloudUrl = await gdrive.uploadFile(file, "ClassMate_Practicum_Files");
          setFormData((prev) => ({ ...prev, avatar: cloudUrl }));
          toast.dismiss();
          toast.success("อัปโหลดรูปภาพขึ้น Google Drive สำเร็จ!");
        } catch (err) {
          toast.dismiss();
          toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Google Drive");
          const localUrl = await gdrive.readFileAsDataURL(file);
          setFormData((prev) => ({ ...prev, avatar: localUrl }));
        }
      } else {
        const localUrl = await gdrive.readFileAsDataURL(file);
        setFormData((prev) => ({ ...prev, avatar: localUrl }));
        toast.info("บันทึกรูปภาพในเครื่อง (สามารถเชื่อมต่อ Google Drive ได้ที่เมนู Cloud)");
      }
      setIsUploading(false);
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
            <Users className="w-5 h-5 text-cyber-purple" />
            {facultyToEdit ? "แก้ไขข้อมูลครู/บุคลากร" : "เพิ่มข้อมูลครู/บุคลากร"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            ระบุรายละเอียดครูอาจารย์หรือบุคลากรในสถานศึกษา
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          {/* Avatar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-cyber-purple/40 bg-black shrink-0">
              <img
                src={formData.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="font-semibold text-slate-200 block">รูปถ่าย (URL หรือ อัปโหลด)</label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
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
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">ชื่อ - นามสกุล</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">ตำแหน่งหน้าที่</label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">กลุ่มสาระฯ / ฝ่าย</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">เบอร์โทรศัพท์</label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">อีเมล</label>
              <Input
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
