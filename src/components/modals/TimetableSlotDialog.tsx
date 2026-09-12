import React, { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen } from "lucide-react";
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
import { TimetableSlot, TeachingLog } from "@/types/practicum";

interface TimetableSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slotToEdit: TimetableSlot | null;
  teachingLogs: TeachingLog[];
  onSave: (slot: TimetableSlot) => void;
}

export const TimetableSlotDialog: React.FC<TimetableSlotDialogProps> = ({
  isOpen,
  onClose,
  slotToEdit,
  teachingLogs,
  onSave,
}) => {
  const [formData, setFormData] = useState<TimetableSlot>({
    id: "",
    day: "จันทร์",
    period: 1,
    time: "08:30 - 09:20",
    subjectCode: "",
    subjectName: "",
    grade: "ม.2/4",
    room: "Lab 502",
    planId: "",
  });

  useEffect(() => {
    if (slotToEdit) {
      setFormData(slotToEdit);
    } else {
      setFormData({
        id: `tt-${Date.now()}`,
        day: "จันทร์",
        period: 1,
        time: "08:30 - 09:20",
        subjectCode: "",
        subjectName: "",
        grade: "ม.2/4",
        room: "Lab 502",
        planId: "",
      });
    }
  }, [slotToEdit, isOpen]);

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
            <Calendar className="w-5 h-5 text-cyber-cyan" />
            {slotToEdit ? "แก้ไขคาบสอนในตาราง" : "เพิ่มคาบสอนในตาราง"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            กำหนดวัน คาบเรียน รหัสวิชา ชั้นเรียน ห้องเรียน และเชื่อมโยงแผนการสอน
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">วันสอน</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-xs text-white focus:border-cyber-cyan focus:outline-none"
              >
                <option value="จันทร์" className="bg-[#0b0e1a]">วันจันทร์ (Monday)</option>
                <option value="อังคาร" className="bg-[#0b0e1a]">วันอังคาร (Tuesday)</option>
                <option value="พุธ" className="bg-[#0b0e1a]">วันพุธ (Wednesday)</option>
                <option value="พฤหัสบดี" className="bg-[#0b0e1a]">วันพฤหัสบดี (Thursday)</option>
                <option value="ศุกร์" className="bg-[#0b0e1a]">วันศุกร์ (Friday)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">คาบที่</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">ช่วงเวลาเรียน (เช่น 08:30 - 09:20)</label>
            <Input
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">รหัสวิชา</label>
              <Input
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                placeholder="ว22103"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ชื่อวิชา</label>
              <Input
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                placeholder="วิทยาการคำนวณ 2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">ระดับชั้น/ห้องเรียน</label>
              <Input
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="ม.2/4"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">สถานที่/ห้องปฏิบัติการ</label>
              <Input
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Lab 502"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">เชื่อมโยงแผนการจัดการเรียนรู้ (ถ้ามี)</label>
            <select
              value={formData.planId || ""}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              className="w-full h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-xs text-white focus:border-cyber-cyan focus:outline-none"
            >
              <option value="" className="bg-[#0b0e1a]">-- ไม่เชื่อมโยงแผนการสอน --</option>
              {teachingLogs.map((log) => (
                <option key={log.id} value={log.id} className="bg-[#0b0e1a]">
                  {log.week ? `${log.week}: ` : ""}{log.title} ({log.subject})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกคาบสอน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
