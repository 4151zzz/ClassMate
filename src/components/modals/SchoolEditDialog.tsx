import React, { useState, useEffect } from "react";
import { Building2, Upload, MapPin } from "lucide-react";
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
import { SchoolInfo } from "@/types/practicum";

interface SchoolEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolInfo;
  onSave: (updated: Partial<SchoolInfo>) => void;
}

export const SchoolEditDialog: React.FC<SchoolEditDialogProps> = ({
  isOpen,
  onClose,
  school,
  onSave,
}) => {
  const [formData, setFormData] = useState<SchoolInfo>(school);

  useEffect(() => {
    setFormData(school);
  }, [school, isOpen]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData((prev) => ({ ...prev, badge: result }));
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <Building2 className="w-5 h-5 text-cyber-cyan" />
            แก้ไขข้อมูลสถานศึกษาที่ปฏิบัติการสอน
          </DialogTitle>
          <DialogDescription className="text-xs">
            อัปเดตข้อมูลทั่วไป อัตลักษณ์ คำขวัญ วิสัยทัศน์ และแผนที่ตั้งของโรงเรียน
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          {/* Logo Upload */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/10">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-cyber-cyan/40 bg-black p-1 shrink-0">
              <img
                src={formData.badge}
                alt="Badge"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="font-semibold text-slate-200 block">ตราประจำโรงเรียน (Logo/Badge)</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://..."
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
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
              <label className="text-slate-300 mb-1 block">ชื่อโรงเรียน (ภาษาไทย)</label>
              <Input
                value={formData.nameTh}
                onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ชื่อโรงเรียน (ภาษาอังกฤษ)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">สังกัด</label>
              <Input
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ชื่อผู้อำนวยการสถานศึกษา</label>
              <Input
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">คำขวัญ / อัตลักษณ์สถานศึกษา (Motto)</label>
            <Input
              value={formData.motto}
              onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
            />
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">วิสัยทัศน์และพันธกิจ (Vision & Mission)</label>
            <Textarea
              rows={3}
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            />
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">ที่อยู่สถานศึกษา</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">เบอร์โทรศัพท์</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">อีเมลโรงเรียน</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">เว็บไซต์โรงเรียน</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 mb-1 block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyber-cyan" />
              ลิงก์แผนที่ Google Maps Embed (iframe src URL)
            </label>
            <Input
              placeholder="https://www.google.com/maps/embed?..."
              value={formData.mapUrl}
              onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกข้อมูลโรงเรียน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
