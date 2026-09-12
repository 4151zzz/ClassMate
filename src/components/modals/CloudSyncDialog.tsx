import React from "react";
import { Cloud, CheckCircle, HardDrive, ShieldCheck, Download, ExternalLink } from "lucide-react";
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

interface CloudSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJSON: () => void;
}

export const CloudSyncDialog: React.FC<CloudSyncDialogProps> = ({
  isOpen,
  onClose,
  onExportJSON,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-2 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Cloud className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center justify-center">
            ระบบสำรองข้อมูล Cloud & Google Drive
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            ความปลอดภัยและการสำรองข้อมูลแฟ้มสะสมงานปฏิบัติการสอน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-emerald-300">ระบบบันทึกอัตโนมัติ (Active)</h5>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                ข้อมูลทุกอย่างจะถูกบันทึกในหน่วยความจำ LocalStorage ของเบราว์เซอร์อย่างปลอดภัยแบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <HardDrive className="w-4 h-4 text-cyber-cyan" />
              <span>การสำรองข้อมูลสำหรับจัดส่งการประเมิน</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              ท่านสามารถดาวน์โหลดไฟล์สำรองข้อมูล JSON เก็บไว้ใน Google Drive หรือคอมพิวเตอร์ส่วนตัวได้ตลอดเวลา และสามารถนำเข้าไฟล์เดิมกลับมาแก้ไขใหม่ได้เสมอ
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onExportJSON();
                onClose();
              }}
              className="w-full text-xs gap-1.5 mt-1"
            >
              <Download className="w-3.5 h-3.5" /> สำรองข้อมูล JSON เดี๋ยวนี้
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full text-xs">
            รับทราบ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
