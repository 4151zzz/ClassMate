import React, { useState, useEffect } from "react";
import { BookOpen, FileText, Upload } from "lucide-react";
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
import { TeachingLog } from "@/types/practicum";

interface TeachingLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  logToEdit: TeachingLog | null;
  onSave: (log: TeachingLog) => void;
}

export const TeachingLogDialog: React.FC<TeachingLogDialogProps> = ({
  isOpen,
  onClose,
  logToEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState<TeachingLog>({
    id: "",
    week: "สัปดาห์ที่ 1",
    date: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }),
    hours: 4,
    title: "",
    description: "",
    subject: "ว22103 วิทยาการคำนวณ",
    grade: "มัธยมศึกษาปีที่ 2",
    status: "ผ่านการนิเทศ",
    objectives: "1. นักเรียนสามารถอธิบายหลักการทำงานได้ถูกต้อง\n2. นักเรียนสามารถประยุกต์ใช้แก้ปัญหาในชีวิตจริงได้\n3. นักเรียนมีส่วนร่วมในการทำกิจกรรมกลุ่ม",
    steps: "• ขั้นนำ (10 นาที): ชวนคิดด้วยคำถามกระตุ้นความสนใจ\n• ขั้นสอน (35 นาที): ปฏิบัติกิจกรรมกลุ่ม Active Learning\n• ขั้นสรุป (15 นาที): นำเสนอผลงานและร่วมกันสรุปองค์ความรู้",
    planLink: "",
    pdfDataUrl: "",
  });

  useEffect(() => {
    if (logToEdit) {
      setFormData(logToEdit);
    } else {
      setFormData({
        id: `log-${Date.now()}`,
        week: "สัปดาห์ที่ 1",
        date: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }),
        hours: 4,
        title: "",
        description: "",
        subject: "ว22103 วิทยาการคำนวณ",
        grade: "มัธยมศึกษาปีที่ 2",
        status: "ผ่านการนิเทศ",
        objectives: "1. นักเรียนสามารถอธิบายหลักการทำงานได้ถูกต้อง\n2. นักเรียนสามารถประยุกต์ใช้แก้ปัญหาในชีวิตจริงได้\n3. นักเรียนมีส่วนร่วมในการทำกิจกรรมกลุ่ม",
        steps: "• ขั้นนำ (10 นาที): ชวนคิดด้วยคำถามกระตุ้นความสนใจ\n• ขั้นสอน (35 นาที): ปฏิบัติกิจกรรมกลุ่ม Active Learning\n• ขั้นสรุป (15 นาที): นำเสนอผลงานและร่วมกันสรุปองค์ความรู้",
        planLink: "",
        pdfDataUrl: "",
      });
    }
  }, [logToEdit, isOpen]);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData((prev) => ({ ...prev, pdfDataUrl: result }));
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
            <BookOpen className="w-5 h-5 text-cyber-cyan" />
            {logToEdit ? "แก้ไขบันทึกและแผนการจัดการเรียนรู้" : "เพิ่มบันทึกและแผนการจัดการเรียนรู้"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            กรอกรายละเอียดสัปดาห์ที่สอน หัวข้อ จุดประสงค์ กิจกรรม และแนบไฟล์แผนการสอน PDF
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">สัปดาห์ที่สอน</label>
              <Input
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                placeholder="สัปดาห์ที่ 1"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">วันที่สอน</label>
              <Input
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">จำนวนชั่วโมงที่สอน</label>
              <Input
                type="number"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">ชื่อแผนการจัดการเรียนรู้ / หัวข้อการสอน</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="การออกแบบอัลกอริทึมและการเขียนโปรแกรม..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">รายวิชา</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">ระดับชั้น</label>
              <Input
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">สถานะแผนการสอน</label>
              <Input
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 mb-1 block">คำอธิบายสรุปการจัดการเรียนรู้</label>
            <Textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="สรุปผลการจัดกิจกรรม บรรยากาศ และการมีส่วนร่วมของผู้เรียน..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 mb-1 block">จุดประสงค์การเรียนรู้ (Objectives)</label>
              <Textarea
                rows={3}
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-300 mb-1 block">กิจกรรมการเรียนรู้ (Activities / Steps)</label>
              <Textarea
                rows={3}
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              />
            </div>
          </div>

          {/* PDF Attachment & Drive Link */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <label className="font-semibold text-slate-200 block">เอกสารแนบไฟล์แผนการสอน (PDF หรือ Drive Link)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">ลิงก์ Google Drive / เว็บไซต์ภายนอก</label>
                <Input
                  value={formData.planLink || ""}
                  onChange={(e) => setFormData({ ...formData, planLink: e.target.value })}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">อัปโหลดไฟล์ PDF แผนการสอน (Interactive Preview)</label>
                <label className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer text-slate-300 font-medium">
                  <Upload className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span className="truncate">
                    {formData.pdfDataUrl ? "เปลี่ยนไฟล์ PDF" : "เลือกไฟล์ PDF เพื่อพรีวิว"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกแผนการสอน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
