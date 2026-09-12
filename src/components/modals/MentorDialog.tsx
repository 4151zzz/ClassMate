import React, { useState, useEffect } from "react";
import { UserCheck, Upload } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Mentor } from "@/types/practicum";
import { toast } from "sonner";
import { gdrive } from "@/lib/gdrive";

interface MentorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentorToEdit: Mentor | null;
  onSave: (mentor: Mentor) => void;
}

export const MentorDialog: React.FC<MentorDialogProps> = ({
  isOpen,
  onClose,
  mentorToEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState<Mentor>({
    id: "",
    name: "",
    roleTitle: "ครูพี่เลี้ยง (Mentor Teacher)",
    roleType: "mentor",
    position: "ครูชำนาญการพิเศษ",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    comment: "",
    phone: "",
    email: "",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
  });

  useEffect(() => {
    if (mentorToEdit) {
      setFormData(mentorToEdit);
    } else {
      setFormData({
        id: `mentor-${Date.now()}`,
        name: "",
        roleTitle: "ครูพี่เลี้ยง (Mentor Teacher)",
        roleType: "mentor",
        position: "ครูชำนาญการพิเศษ",
        department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
        comment: "",
        phone: "",
        email: "",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
      });
    }
  }, [mentorToEdit, isOpen]);

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <UserCheck className="w-5 h-5 text-cyber-cyan" />
            {mentorToEdit ? "แก้ไขข้อมูลครูพี่เลี้ยง / อาจารย์นิเทศก์" : "เพิ่มครูพี่เลี้ยง / อาจารย์นิเทศก์"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            ระบุรายละเอียดครูพี่เลี้ยงประจำโรงเรียนหรืออาจารย์นิเทศก์จากมหาวิทยาลัย
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          {/* Avatar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-cyber-cyan/40 bg-black shrink-0">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">ชื่อ - นามสกุล</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ประเภทผู้ให้คำปรึกษา</label>
              <select
                value={formData.roleType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roleType: e.target.value as "mentor" | "supervisor",
                    roleTitle:
                      e.target.value === "supervisor"
                        ? "อาจารย์นิเทศก์ประจำสถาบัน"
                        : "ครูพี่เลี้ยงประจำสถานศึกษา",
                  })
                }
                className="w-full h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-xs text-white focus:border-cyber-cyan focus:outline-none"
              >
                <option value="mentor" className="bg-[#0b0e1a]">ครูพี่เลี้ยงประจำโรงเรียน</option>
                <option value="supervisor" className="bg-[#0b0e1a]">อาจารย์นิเทศก์จากมหาวิทยาลัย</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">หัวข้อบทบาท (Role Title)</label>
              <Input
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ตำแหน่งวิทยฐานะ</label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">กลุ่มสาระฯ / คณะหรือภาควิชา</label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">บันทึกข้อเสนอแนะหรือการนิเทศ (Feedback / Comment)</label>
            <Textarea
              rows={2}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="ความเห็น ข้อเสนอแนะ หรือข้อประเมินการปฏิบัติการสอน..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">เบอร์โทรศัพท์</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">อีเมล</label>
              <Input
                value={formData.email}
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
