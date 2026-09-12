import React, { useState, useMemo, Component, ErrorInfo, ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Copy, Check, QrCode, AlertCircle, Info, ExternalLink } from "lucide-react";
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
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  getShareUrl: () => string;
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
}) => {
  const [copied, setCopied] = useState(false);

  // Safely retrieve share URL
  const shareUrl = useMemo(() => {
    if (!isOpen) return "";
    try {
      return getShareUrl();
    } catch (err) {
      console.error("Failed to generate share URL:", err);
      return window.location.href;
    }
  }, [isOpen, getShareUrl]);

  // Clean origin URL for fallback QR
  const siteUrl = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";

  // QR Code specification hard limit is ~2,953 bytes in binary mode.
  // URLs longer than ~2,000 chars should use the site URL for QR to avoid RangeError: Data too long.
  const isDataTooLongForQR = shareUrl.length > 2000;
  const qrValue = isDataTooLongForQR ? siteUrl : shareUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("คัดลอกลิงก์แชร์พอร์ตโฟลิโอเรียบร้อยแล้ว");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error("ไม่สามารถคัดลอกได้อัตโนมัติ กรุณากดคัดลอกด้วยตนเอง");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0a0d14] border border-white/15 text-white">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <Share2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center justify-center text-lg font-bold">
            แชร์พอร์ตโฟลิโอการปฏิบัติการสอน
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            สแกน QR Code หรือคัดลอกลิงก์เพื่อส่งให้อาจารย์นิเทศก์หรือคณะกรรมการประเมิน
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-2 space-y-3">
          {/* QR Code Container with Safe Error Boundary */}
          <div className="p-3.5 rounded-2xl bg-white shadow-2xl border-2 border-cyan-400/40 flex flex-col items-center justify-center">
            {qrValue ? (
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
                  value={qrValue}
                  size={170}
                  level="L"
                  includeMargin={false}
                />
              </QRErrorBoundary>
            ) : (
              <div className="w-[170px] h-[170px] flex items-center justify-center text-slate-500 text-xs">
                กำลังสร้าง QR Code...
              </div>
            )}
          </div>

          {/* Size Warning / Instructions */}
          {isDataTooLongForQR ? (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300 max-w-sm">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                QR Code นำทางไปยังหน้าเว็บหลัก เนื่องจากข้อมูลพอร์ตฉบับเต็มมีขนาดใหญ่ แนะนำให้กดปุ่ม <strong>"คัดลอกลิงก์"</strong> ด้านล่างเพื่อส่งข้อมูลฉบับเต็ม
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center max-w-xs">
              ระบบบีบอัดข้อมูลพอร์ตโฟลิโอลงใน URL ทำให้ผู้รับเปิดดูได้ทันทีโดยไม่ต้องเชื่อมฐานข้อมูลภายนอก
            </p>
          )}

          {/* Copy Link Input */}
          <div className="w-full flex items-center gap-2 pt-1">
            <Input
              readOnly
              value={shareUrl}
              className="text-xs font-mono bg-black/60 border-white/20 select-all truncate text-slate-300"
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 shrink-0 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
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
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full text-xs border-white/10 hover:bg-white/5"
          >
            ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
