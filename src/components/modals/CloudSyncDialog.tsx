import React, { useState, useEffect } from "react";
import {
  Cloud,
  CheckCircle,
  HardDrive,
  Download,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  Settings,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { gdrive } from "@/lib/gdrive";

interface CloudSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJSON: () => void;
  studentId?: string;
  portfolioData?: any;
  onRestoreFromCloud?: () => Promise<boolean>;
}

export const CloudSyncDialog: React.FC<CloudSyncDialogProps> = ({
  isOpen,
  onClose,
  onExportJSON,
  studentId = "default",
  portfolioData,
  onRestoreFromCloud,
}) => {
  const [scriptUrl, setScriptUrl] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentUrl = gdrive.getScriptUrl();
      setScriptUrl(currentUrl);
      setIsConfigured(gdrive.isConfigured());
    }
  }, [isOpen]);

  const handleSaveUrl = () => {
    const cleanUrl = scriptUrl.trim();
    if (cleanUrl && !cleanUrl.startsWith("https://script.google.com/")) {
      toast.error("รูปแบบ URL ต้องเริ่มต้นด้วย https://script.google.com/...");
      return;
    }

    gdrive.setScriptUrl(cleanUrl);
    setIsConfigured(gdrive.isConfigured());

    if (cleanUrl) {
      toast.success("บันทึกการตั้งค่า Google Drive Web App URL สำเร็จ");
    } else {
      toast.info("ยกเลิกการเชื่อมต่อ Google Drive (กลับมาใช้พื้นที่จัดเก็บในเครื่อง)");
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(gdrive.getAppsScriptCode());
      setCopiedCode(true);
      toast.success("คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว");
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      toast.error("ไม่สามารถคัดลอกได้อัตโนมัติ กรุณาคัดลอกด้วยตนเอง");
    }
  };

  const handleManualSync = async () => {
    if (!isConfigured) {
      toast.error("กรุณาระบุและบันทึก Google Apps Script URL ก่อนทำการซิงก์");
      return;
    }

    if (!portfolioData) {
      toast.error("ไม่พบข้อมูลพอร์ตโฟลิโอสำหรับซิงก์");
      return;
    }

    setIsSyncing(true);
    toast.loading("กำลังซิงก์ข้อมูลไปยัง Google Drive...");

    try {
      const ok = await gdrive.syncPortfolioToCloud(studentId, portfolioData);
      toast.dismiss();
      if (ok) {
        toast.success("ซิงก์ข้อมูลพอร์ตโฟลิโอขึ้น Google Drive เรียบร้อยแล้ว");
      } else {
        toast.error("ซิงก์ไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ของ Web App ใน Apps Script");
      }
    } catch (e) {
      toast.dismiss();
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Google Drive");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#0a0d14] border border-white/15 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-2 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Cloud className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center justify-center text-lg font-bold">
            ระบบเชื่อมต่อ Cloud & Google Drive
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            อัปโหลดรูปภาพอัตโนมัติและสำรองข้อมูลแฟ้มสะสมงานไปยัง Google Drive ของคุณ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Multi-Device Cloud Sync & Restore Section */}
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-cyan-300">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span>ซิงก์ข้อมูลข้ามเครื่อง (Multi-Device Cloud Sync)</span>
              </div>
              <Badge variant="outline" className="border-cyan-400/50 text-cyan-300 text-[10px]">
                Real-Time Live
              </Badge>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              หากคุณเข้าสู่ระบบจากคอมพิวเตอร์หรือโทรศัพท์เครื่องอื่น สามารถกดปุ่มด้านล่างเพื่อดึงข้อมูลพอร์ตล่าสุดจากบัญชีนี้ลงมาแสดงผลได้ทันที
            </p>
            {onRestoreFromCloud && (
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  await onRestoreFromCloud();
                }}
                className="w-full text-xs gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ดึงข้อมูลพอร์ตโฟลิโอล่าสุดจากคลาวด์เดี๋ยวนี้ (Pull from Cloud)</span>
              </Button>
            )}
          </div>

          {/* Status Badge */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              isConfigured
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-slate-800/40 border-white/10 text-slate-300"
            }`}
          >
            {isConfigured ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-bold">
                  {isConfigured ? "เชื่อมต่อ Google Drive เรียบร้อย" : "ยังไม่ได้เชื่อมต่อ Google Drive"}
                </h5>
                <Badge
                  variant="outline"
                  className={
                    isConfigured
                      ? "border-emerald-500/50 text-emerald-300 text-[10px]"
                      : "border-slate-500 text-slate-400 text-[10px]"
                  }
                >
                  {isConfigured ? "Online Sync" : "Local Mode"}
                </Badge>
              </div>
              <p className="text-[11px] leading-relaxed mt-1 text-slate-400">
                {isConfigured
                  ? "เมื่ออัปโหลดรูปภาพใหม่ ระบบจะส่งไฟล์ไปเก็บไว้ใน Google Drive ของคุณโดยตรง และออกลิงก์ภาพมาแสดงผลในพอร์ตทันที"
                  : "ปัจจุบันรูปภาพจะถูกจัดเก็บในหน่วยความจำเบราว์เซอร์ หากต้องการให้รูปภาพและข้อมูลอัปโหลดลง Google Drive กรุณาตั้งค่า Google Apps Script ด้านล่าง"}
              </p>
            </div>
          </div>

          {/* Web App URL Input Section */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Google Apps Script Web App URL</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              นำ URL ที่ได้จากการ Deploy เป็น Web App ใน Google Drive ของท่านมาใส่ที่นี่:
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                className="text-xs font-mono bg-black/60 border-white/20 text-slate-200 placeholder:text-slate-600"
              />
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveUrl}
                className="shrink-0 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
              >
                บันทึก
              </Button>
            </div>

            {/* Quick action buttons when configured */}
            {isConfigured && (
              <div className="pt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full text-xs gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>ซิงก์ข้อมูลพอร์ตโฟลิโอขึ้น Google Drive ตอนนี้</span>
                </Button>
              </div>
            )}
          </div>

          {/* Setup Guide & Copy Script Code */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">ขั้นตอนการสร้าง Google Apps Script (ทำครั้งเดียว):</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyScript}
                className="gap-1.5 text-[11px] h-7 px-2.5 border-white/20 text-cyan-400 hover:bg-cyan-500/10"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "คัดลอกโค้ดแล้ว" : "คัดลอกโค้ด Script"}</span>
              </Button>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-400 leading-relaxed pl-1">
              <li>
                เปิดเว็บไซต์{" "}
                <a
                  href="https://script.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                >
                  script.google.com <ExternalLink className="w-2.5 h-2.5" />
                </a>{" "}
                แล้วกด <strong>"โครงการใหม่ (New Project)"</strong>
              </li>
              <li>ลบโค้ดเดิมทั้งหมดออก แล้ววางโค้ดที่คัดลอกมาลงไป</li>
              <li>
                กดปุ่ม <strong>"ทำให้ใช้งานได้ (Deploy)"</strong> &gt; <strong>"การทำให้ใช้งานได้รายการใหม่ (New deployment)"</strong>
              </li>
              <li>
                เลือกประเภท <strong>"เว็บแอป (Web App)"</strong> และตั้งค่าให้ <strong>"ทุกคน (Anyone)"</strong> เข้าถึงได้
              </li>
              <li>คัดลอก <strong>Web app URL</strong> นำมาวางในช่องด้านบนแล้วกด "บันทึก"</li>
            </ol>
          </div>

          {/* Local JSON Backup Section */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <span>สำรองข้อมูลเป็นไฟล์ JSON ออฟไลน์</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onExportJSON();
                }}
                className="gap-1.5 text-[11px] h-7 border-white/20"
              >
                <Download className="w-3 h-3" /> ดาวน์โหลดไฟล์ JSON
              </Button>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              สามารถดาวน์โหลดไฟล์พอร์ตโฟลิโอเก็บไว้ในคอมพิวเตอร์หรือแฟลชไดรฟ์เพื่อนำกลับมาเปิดหรือแก้ไขใหม่ได้ตลอดเวลา
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full text-xs border-white/10">
            ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
