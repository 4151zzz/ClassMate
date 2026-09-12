import React, { useState, useEffect } from "react";
import { User, Image as ImageIcon, Sparkles, Upload } from "lucide-react";
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
import { StudentProfile } from "@/types/practicum";
import { toast } from "sonner";
import { gdrive } from "@/lib/gdrive";

interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onSave: (updated: Partial<StudentProfile>) => void;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
}) => {
  const [formData, setFormData] = useState<StudentProfile>(student);
  const [avatarPreview, setAvatarPreview] = useState(student.avatar);

  useEffect(() => {
    setFormData(student);
    setAvatarPreview(student.avatar);
  }, [student, isOpen]);

  const [isUploading, setIsUploading] = useState(false);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      if (gdrive.isConfigured()) {
        toast.loading("กำลังอัปโหลดรูปภาพไปยัง Google Drive...");
        try {
          const cloudUrl = await gdrive.uploadFile(file, "ClassMate_Practicum_Files");
          setAvatarPreview(cloudUrl);
          setFormData((prev) => ({ ...prev, avatar: cloudUrl }));
          toast.dismiss();
          toast.success("อัปโหลดรูปภาพขึ้น Google Drive สำเร็จ!");
        } catch (err) {
          toast.dismiss();
          toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Google Drive");
          const localUrl = await gdrive.readFileAsDataURL(file);
          setAvatarPreview(localUrl);
          setFormData((prev) => ({ ...prev, avatar: localUrl }));
        }
      } else {
        const localUrl = await gdrive.readFileAsDataURL(file);
        setAvatarPreview(localUrl);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <User className="w-5 h-5 text-cyber-cyan" />
            แก้ไขข้อมูลโปรไฟล์นักศึกษาปฏิบัติการสอน
          </DialogTitle>
          <DialogDescription className="text-xs">
            อัปเดตข้อมูลส่วนตัว วุฒิการศึกษา คำคมปรัชญา และสถิติการปฏิบัติการสอน
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {/* Avatar Upload / URL */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/10">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-cyber-cyan/40 bg-black shrink-0">
              <img
                src={avatarPreview || formData.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                รูปถ่ายประจำตัว (Avatar)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) => {
                    setFormData({ ...formData, avatar: e.target.value });
                    setAvatarPreview(e.target.value);
                  }}
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
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">รหัสนักศึกษา</label>
              <Input
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">สาขาวิชา</label>
              <Input
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">คณะ</label>
              <Input
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">มหาวิทยาลัย / สถาบัน</label>
              <Input
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ปีการศึกษา / ภาคเรียน</label>
              <Input
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              />
            </div>
          </div>

          {/* Quote */}
          <div>
            <label className="text-slate-300 mb-1 block">
              คำคม / ปรัชญาประจำใจในการจัดการเรียนรู้
            </label>
            <Input
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="“คำคมหรือความเชื่อในการจัดการศึกษา...”"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-slate-300 mb-1 block">
              ประวัติและความมุ่งมั่น (Philosophy & Bio)
            </label>
            <Textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-slate-300 mb-1 block">
              แท็กความเชี่ยวชาญ (คั่นด้วยเครื่องหมายจุลภาค , )
            </label>
            <Input
              value={(formData.tags || []).join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                })
              }
            />
          </div>

          {/* Numbers: Hours, Plans, Classes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">ชั่วโมงที่สอนแล้ว</label>
              <Input
                type="number"
                value={formData.completedHours}
                onChange={(e) =>
                  setFormData({ ...formData, completedHours: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ชั่วโมงทั้งหมด</label>
              <Input
                type="number"
                value={formData.totalHours}
                onChange={(e) =>
                  setFormData({ ...formData, totalHours: parseInt(e.target.value) || 360 })
                }
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">จำนวนแผนการสอน</label>
              <Input
                type="number"
                value={formData.lessonPlansCount}
                onChange={(e) =>
                  setFormData({ ...formData, lessonPlansCount: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ระดับชั้นที่สอน</label>
              <Input
                value={formData.classesTaught}
                onChange={(e) => setFormData({ ...formData, classesTaught: e.target.value })}
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">อีเมลติดต่อ</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">เบอร์โทรศัพท์</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกการแก้ไข
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
