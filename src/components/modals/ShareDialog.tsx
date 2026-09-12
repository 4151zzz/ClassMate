import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Share2,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  Info,
  RefreshCw,
  Cloud,
  Zap,
  HardDrive,
  ExternalLink,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  getShareUrl: (mode?: "short" | "hash") => string;
  publishShareUrl?: () => Promise<string>;
  publishedUid?: string;
  isPublishing?: boolean;
  studentName?: string;
  studentId?: string;
}

// Error Boundary to prevent QRCodeSVG from ever crashing the UI
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class QRErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("QRCodeSVG error suppressed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  getShareUrl,
  publishShareUrl,
  publishedUid,
  isPublishing = false,
  studentName,
  studentId,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareMode, setShareMode] = useState<"uid" | "hash">("uid");
  const [cloudUrl, setCloudUrl] = useState<string>("");
  const [syncing, setSyncing] = useState<boolean>(false);

  // Auto-publish to cloud on open if not published yet or when requested
  useEffect(() => {
    if (!isOpen) return;

    if (publishedUid) {
      const baseUrl = window.location.origin + window.location.pathname;
      setCloudUrl(`${baseUrl}?u=${publishedUid}`);
    } else if (publishShareUrl) {
      setSyncing(true);
      publishShareUrl()
        .then((url) => {
          setCloudUrl(url);
        })
        .catch(() => {
          // fallback to student id query
          const baseUrl = window.location.origin + window.location.pathname;
          setCloudUrl(studentId ? `${baseUrl}?id=${studentId}` : baseUrl);
        })
        .finally(() => {
          setSyncing(false);
        });
    } else {
      setCloudUrl(getShareUrl("short"));
    }
  }, [isOpen, publishedUid, publishShareUrl, studentId, getShareUrl]);

  // Handle manual re-sync to cloud
  const handleReSyncCloud = async () => {
    if (!publishShareUrl) return;
    setSyncing(true);
    try {
      const url = await publishShareUrl();
      setCloudUrl(url);
    } catch {
      toast.error("ไม่สามารถอัปเดตข้อมูลบนคลาวด์ได้");
    } finally {
      setSyncing(false);
    }
  };

  // Offline hash fallback URL
  const hashUrl = useMemo(() => {
    if (!isOpen) return "";
    try {
      return getShareUrl("hash");
    } catch {
      return window.location.href;
    }
  }, [isOpen, getShareUrl]);

  // Active URL based on selected tab
  const activeShareUrl = shareMode === "uid" ? cloudUrl || getShareUrl("short") : hashUrl;

  // QR Code target: For short UID it's always the short URL. For huge hash, fallback to site URL if > 2000 chars.
  const isHashTooLongForQR = shareMode === "hash" && hashUrl.length > 2000;
  const siteBaseUrl = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  const qrTarget = shareMode === "uid" ? activeShareUrl : isHashTooLongForQR ? siteBaseUrl : hashUrl;

  const handleCopy = async (urlToCopy: string) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success(
        shareMode === "uid"
          ? "คัดลอกลิงก์สั้น Cloud UID เรียบร้อยแล้ว (ส่งลง LINE/FB ได้ทันที)"
          : "คัดลอกลิงก์ข้อมูลพกพาออฟไลน์เรียบร้อยแล้ว"
      );
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("ไม่สามารถคัดลอกได้อัตโนมัติ กรุณากดเลือกข้อความและคัดลอกด้วยตนเอง");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0a0d14] border border-white/15 text-white shadow-2xl backdrop-blur-2xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <Share2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center justify-center text-lg font-bold">
            แชร์พอร์ตโฟลิโอการปฏิบัติการสอน
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            {studentName ? `พอร์ตโฟลิโอของ ${studentName}` : "ส่งให้อาจารย์นิเทศก์หรือคณะกรรมการประเมิน"}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher: Short UID vs Offline Hash */}
        <Tabs
          value={shareMode}
          onValueChange={(val) => setShareMode(val as "uid" | "hash")}
          className="w-full mt-1"
        >
          <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10 p-0.5 rounded-xl">
            <TabsTrigger
              value="uid"
              className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-semibold gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>ลิงก์สั้น Cloud UID</span>
            </TabsTrigger>
            <TabsTrigger
              value="hash"
              className="text-xs data-[state=active]:bg-white/15 data-[state=active]:text-white gap-1.5 transition-all"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>ลิงก์ข้อมูลพกพา</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Clean Short Cloud UID (Recommended) */}
          <TabsContent value="uid" className="space-y-3 pt-2">
            <div className="flex flex-col items-center justify-center py-1 space-y-3">
              {/* QR Code */}
              <div className="p-3.5 rounded-2xl bg-white shadow-2xl border-2 border-cyan-400/40 flex flex-col items-center justify-center relative group">
                <QRErrorBoundary
                  fallback={
                    <div className="w-[170px] h-[170px] flex flex-col items-center justify-center text-slate-600 text-xs text-center p-3">
                      <AlertCircle className="w-7 h-7 text-amber-500 mb-1.5" />
                      <span>ไม่สามารถสร้าง QR Code ได้</span>
                    </div>
                  }
                >
                  <QRCodeSVG
                    value={qrTarget || siteBaseUrl}
                    size={168}
                    level="M"
                    includeMargin={false}
                  />
                </QRErrorBoundary>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
                <Cloud className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>ลิงก์สั้นผ่าน Cloud UID พร้อมเปิดได้ทุกอุปกรณ์</span>
                {syncing && <RefreshCw className="w-3 h-3 animate-spin ml-1 text-cyan-400" />}
              </div>

              {/* Copy Link Input */}
              <div className="w-full flex items-center gap-2">
                <Input
                  readOnly
                  value={cloudUrl || activeShareUrl}
                  className="text-xs font-mono bg-black/60 border-cyan-500/40 select-all truncate text-cyan-200"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCopy(cloudUrl || activeShareUrl)}
                  className="gap-1.5 shrink-0 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Sync latest button */}
              {publishShareUrl && (
                <div className="w-full flex justify-between items-center text-[11px] text-slate-400 px-1">
                  <span>ความยาวลิงก์: <strong>{(cloudUrl || activeShareUrl).length} ตัวอักษร</strong></span>
                  <button
                    type="button"
                    onClick={handleReSyncCloud}
                    disabled={syncing || isPublishing}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                    <span>{syncing ? "กำลังอัปเดต..." : "อัปเดตข้อมูลล่าสุดลงลิงก์"}</span>
                  </button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Standalone Portable Hash */}
          <TabsContent value="hash" className="space-y-3 pt-2">
            <div className="flex flex-col items-center justify-center py-1 space-y-3">
              {/* QR Code Container */}
              <div className="p-3.5 rounded-2xl bg-white shadow-2xl border-2 border-white/20 flex flex-col items-center justify-center">
                <QRErrorBoundary
                  fallback={
                    <div className="w-[170px] h-[170px] flex flex-col items-center justify-center text-slate-600 text-xs text-center p-3">
                      <AlertCircle className="w-7 h-7 text-amber-500 mb-1.5" />
                      <span>ข้อมูลมีขนาดใหญ่เกินกว่าจะแสดง QR Code</span>
                      <span className="text-[10px] text-slate-400 mt-1">กรุณาใช้ปุ่มคัดลอกลิงก์</span>
                    </div>
                  }
                >
                  <QRCodeSVG
                    value={qrTarget}
                    size={168}
                    level="L"
                    includeMargin={false}
                  />
                </QRErrorBoundary>
              </div>

              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300 max-w-sm">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  โหมดนี้จะบรรจุข้อมูลพอร์ตทั้งหมดไว้ใน URL Hash ({hashUrl.length.toLocaleString()} ตัวอักษร) เหมาะสำหรับบันทึกออฟไลน์ แต่อาจถูกตัดทอนในแอปแชทบางชนิด
                </span>
              </div>

              {/* Copy Link Input */}
              <div className="w-full flex items-center gap-2">
                <Input
                  readOnly
                  value={hashUrl}
                  className="text-xs font-mono bg-black/60 border-white/20 select-all truncate text-slate-300"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCopy(hashUrl)}
                  className="gap-1.5 shrink-0 text-xs bg-white/20 hover:bg-white/30 text-white font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full text-xs border-white/10 hover:bg-white/5 text-slate-300"
          >
            ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
