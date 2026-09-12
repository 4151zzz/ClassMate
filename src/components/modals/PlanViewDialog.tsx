import React, { useState } from "react";
import {
  FileText,
  ExternalLink,
  Download,
  Calendar,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  FileCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeachingLog } from "@/types/practicum";

interface PlanViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  log: TeachingLog | null;
  onEdit?: (log: TeachingLog) => void;
}

export const PlanViewDialog: React.FC<PlanViewDialogProps> = ({
  isOpen,
  onClose,
  log,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "pdf">("summary");

  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">
              {log.week || "สัปดาห์ที่ 1"}
            </Badge>
            <Badge variant="success" className="text-xs">
              {log.status || "ผ่านการนิเทศ"}
            </Badge>
          </div>
          <DialogTitle className="text-lg sm:text-xl text-white">
            {log.title}
          </DialogTitle>
          <DialogDescription className="text-xs flex flex-wrap items-center gap-3 text-slate-300 pt-1">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyber-cyan" />
              {log.subject}
            </span>
            •
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyber-purple" />
              {log.grade}
            </span>
            •
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyber-green" />
              {log.date}
            </span>
            •
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyber-amber" />
              {log.hours} ชั่วโมง
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Sub-tab view switch */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <Button
            variant={activeTab === "summary" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("summary")}
            className="text-xs gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> สาระสำคัญ & กิจกรรม
          </Button>
          <Button
            variant={activeTab === "pdf" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("pdf")}
            className="text-xs gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" /> เอกสารฉบับเต็ม (PDF Preview)
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-2 text-xs space-y-4">
          {activeTab === "summary" ? (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <h5 className="font-semibold text-cyber-cyan">คำอธิบายสรุป</h5>
                <p className="text-slate-200 leading-relaxed">{log.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h5 className="font-semibold text-cyber-purple">จุดประสงค์การเรียนรู้ (Objectives)</h5>
                <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                  {log.objectives || "1. นักเรียนสามารถอธิบายหลักการและกระบวนการทำงานได้ถูกต้อง\n2. นักเรียนสามารถประยุกต์ใช้ทักษะการแก้ปัญหาในสถานการณ์จริงได้\n3. นักเรียนมีวินัยและมีความรับผิดชอบต่อการทำงานร่วมกัน"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h5 className="font-semibold text-cyber-green">กระบวนการจัดการเรียนรู้ (Active Learning Steps)</h5>
                <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                  {log.steps || "• ขั้นนำ (10 นาที): ชวนคิดด้วยคำถามกระตุ้นความสนใจและยกตัวอย่างปัญหาจริง\n• ขั้นสอน (35 นาที): ดำเนินกิจกรรมกลุ่ม Active Learning และฝึกปฏิบัติโค้ด\n• ขั้นสรุป (15 นาที): ร่วมกันสรุปผลและประเมินชิ้นงาน"}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[420px] rounded-xl overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center">
              {log.pdfDataUrl ? (
                <iframe
                  src={`${log.pdfDataUrl}#toolbar=1`}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                />
              ) : log.planLink && log.planLink.endsWith(".pdf") ? (
                <iframe
                  src={`${log.planLink}#toolbar=1`}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-slate-500 mx-auto opacity-40" />
                  <h4 className="text-sm font-bold text-white">เอกสารแผนการสอนฉบับเต็ม</h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {log.planLink
                      ? "มีลิงก์จัดเก็บภายนอก สามารถกดเปิดผ่าน Google Drive ได้ทันที"
                      : "ยังไม่ได้แนบไฟล์ PDF ท่านสามารถอัปโหลดไฟล์ PDF ผ่านปุ่มแก้ไขแผนการสอน"}
                  </p>
                  {log.planLink && (
                    <a
                      href={log.planLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/50 text-cyber-cyan text-xs font-semibold hover:bg-cyber-cyan/30"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> เปิดใน Google Drive
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-white/10 flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            {log.pdfDataUrl && (
              <a
                href={log.pdfDataUrl}
                download={`${log.title}.pdf`}
                className="inline-flex items-center gap-1 text-xs text-cyber-cyan hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> ดาวน์โหลด PDF
              </a>
            )}
            {log.planLink && (
              <a
                href={log.planLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" /> เปิดลิงก์ภายนอก
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(log);
                }}
                className="text-xs"
              >
                แก้ไขแผนนี้
              </Button>
            )}
            <Button variant="default" size="sm" onClick={onClose} className="text-xs">
              ปิด
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
