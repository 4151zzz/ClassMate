import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Copy, Check, ExternalLink, QrCode } from "lucide-react";
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

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  getShareUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = isOpen ? getShareUrl() : "";

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan mb-2 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Share2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center justify-center">
            แชร์พอร์ตโฟลิโอการปฏิบัติการสอน
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            สแกน QR Code หรือคัดลอกลิงก์เพื่อส่งให้อาจารย์นิเทศก์หรือคณะกรรมการประเมิน
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-3 space-y-4">
          {/* QR Code Container */}
          <div className="p-4 rounded-2xl bg-white shadow-2xl border-4 border-cyber-cyan/40">
            {shareUrl ? (
              <QRCodeSVG
                value={shareUrl}
                size={180}
                level="M"
                includeMargin={false}
              />
            ) : (
              <div className="w-[180px] h-[180px] flex items-center justify-center text-black/50 text-xs">
                กำลังสร้าง QR Code...
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground text-center max-w-xs">
            ระบบจะบีบอัดข้อมูลพอร์ตโฟลิโอทั้งหมดลงใน URL ทำให้ผู้รับสามารถเปิดดูได้ทันทีโดยไม่ต้องเชื่อมต่อฐานข้อมูลภายนอก
          </p>

          {/* Copy Link Input */}
          <div className="w-full flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="text-xs font-mono bg-black/60 border-white/20 select-all truncate"
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 shrink-0 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
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
            className="w-full text-xs"
          >
            ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
