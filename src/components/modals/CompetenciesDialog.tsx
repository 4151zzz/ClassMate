import React, { useState, useEffect } from "react";
import { Award, Brain, Laptop, Users } from "lucide-react";
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
import { Competency } from "@/types/practicum";

interface CompetenciesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  competencies: Competency[];
  onSave: (comps: Competency[]) => void;
}

export const CompetenciesDialog: React.FC<CompetenciesDialogProps> = ({
  isOpen,
  onClose,
  competencies,
  onSave,
}) => {
  const [comps, setComps] = useState<Competency[]>(competencies);

  useEffect(() => {
    setComps(competencies);
  }, [competencies, isOpen]);

  const handleChange = (index: number, field: "title" | "desc", value: string) => {
    const next = [...comps];
    next[index] = { ...next[index], [field]: value };
    setComps(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(comps);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Award className="w-5 h-5 text-cyber-amber" />
            แก้ไขสมรรถนะสำคัญของผู้เรียนและวิชาชีพครู
          </DialogTitle>
          <DialogDescription className="text-xs">
            กำหนดหัวข้อและคำอธิบายสมรรถนะ 3 ด้านหลักสำหรับการจัดการเรียนรู้
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {comps.map((c, idx) => (
            <div
              key={c.id || idx}
              className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: c.color || "#00f0ff" }}
                />
                <span>สมรรถนะด้านที่ {idx + 1}</span>
              </div>
              <div>
                <label className="text-slate-300 mb-1 block">หัวข้อสมรรถนะ</label>
                <Input
                  value={c.title}
                  onChange={(e) => handleChange(idx, "title", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 mb-1 block">คำอธิบายสมรรถนะ</label>
                <Textarea
                  rows={2}
                  value={c.desc}
                  onChange={(e) => handleChange(idx, "desc", e.target.value)}
                  required
                />
              </div>
            </div>
          ))}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกสมรรถนะ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
