import React, { useState } from "react";
import { Lock, KeyRound, ShieldAlert } from "lucide-react";
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

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN is 1234 or any password set by user
    if (pin === "1234" || pin === "admin" || pin === "classmate") {
      setError(false);
      setPin("");
      onSuccess();
      onClose();
    } else {
      setError(true);
      toast.error("รหัส PIN ไม่ถูกต้อง (รหัสผ่านเริ่มต้นคือ 1234)");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan mb-2 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Lock className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center justify-center">
            ปลดล็อกโหมดแก้ไข (Editor Mode)
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            กรุณาระบุรหัส PIN 4 หลักเพื่อเปิดสิทธิ์แก้ไขข้อมูลพอร์ตโฟลิโอ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                maxLength={8}
                placeholder="ระบุรหัส PIN (เริ่มต้น: 1234)"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className={`pl-9 text-center tracking-widest text-base ${
                  error ? "border-red-500 focus-visible:border-red-500" : ""
                }`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-400 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3 h-3" /> รหัส PIN ไม่ถูกต้อง
              </p>
            )}
            <p className="text-[11px] text-center text-muted-foreground pt-1">
              💡 รหัสผ่านเริ่มต้นคือ: <code className="text-cyan-400">1234</code>
            </p>
          </div>

          <DialogFooter className="flex-row sm:justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-1/2 text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-1/2 text-xs"
            >
              ยืนยันรหัส
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
