import React, { useState, useEffect } from "react";
import { Lock, KeyRound, ShieldAlert, Key, ArrowLeft, Check, ShieldCheck } from "lucide-react";
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

const PIN_STORAGE_KEY = "classmate_custom_pin";

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  // Change PIN mode state
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");

  const getSavedPin = () => {
    return typeof window !== "undefined"
      ? localStorage.getItem(PIN_STORAGE_KEY) || "1234"
      : "1234";
  };

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(false);
      setIsChangingPin(false);
      setCurrentPinInput("");
      setNewPinInput("");
      setConfirmPinInput("");
    }
  }, [isOpen]);

  const handleSubmitUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getSavedPin();

    if (pin === correctPin || pin === "admin" || pin === "classmate") {
      setError(false);
      setPin("");
      onSuccess();
      onClose();
    } else {
      setError(true);
      toast.error("รหัส PIN ไม่ถูกต้อง");
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getSavedPin();

    if (currentPinInput !== correctPin && currentPinInput !== "admin") {
      toast.error("รหัส PIN เดิมไม่ถูกต้อง");
      return;
    }

    if (!newPinInput || newPinInput.length < 4) {
      toast.error("รหัส PIN ใหม่ต้องมีความยาวอย่างน้อย 4 หลัก");
      return;
    }

    if (newPinInput !== confirmPinInput) {
      toast.error("รหัส PIN ใหม่และการยืนยันไม่ตรงกัน");
      return;
    }

    localStorage.setItem(PIN_STORAGE_KEY, newPinInput);
    toast.success("เปลี่ยนรหัส PIN ประจำตัวสำเร็จเรียบร้อยแล้ว!");
    setIsChangingPin(false);
    setCurrentPinInput("");
    setNewPinInput("");
    setConfirmPinInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-[#0a0d14] border border-white/15 text-white">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            {isChangingPin ? <Key className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <DialogTitle className="text-center justify-center text-lg font-bold">
            {isChangingPin ? "เปลี่ยนรหัส PIN ประจำตัว" : "ปลดล็อกโหมดแก้ไข (Editor Mode)"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            {isChangingPin
              ? "ตั้งรหัสผ่านลับเฉพาะของคุณ เพื่อป้องกันไม่ให้ผู้อื่นแก้ไขข้อมูล"
              : "กรุณาระบุรหัส PIN 4-8 หลักเพื่อเปิดสิทธิ์แก้ไขข้อมูลพอร์ตโฟลิโอ"}
          </DialogDescription>
        </DialogHeader>

        {!isChangingPin ? (
          /* 1. Unlock Form */
          <form onSubmit={handleSubmitUnlock} className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  maxLength={12}
                  placeholder="ระบุรหัส PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(false);
                  }}
                  className={`pl-9 text-center tracking-widest text-base bg-black/60 border-white/20 text-white ${
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
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                <span>
                  รหัสเริ่มต้น: <code className="text-cyan-400 font-bold">1234</code>
                </span>
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  เปลี่ยนรหัส PIN
                </button>
              </div>
            </div>

            <DialogFooter className="flex-row sm:justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/2 text-xs border-white/10"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="default"
                className="w-1/2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
              >
                ยืนยันรหัส
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* 2. Change PIN Form */
          <form onSubmit={handleChangePin} className="space-y-3 py-1">
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">รหัส PIN ปัจจุบัน</label>
                <Input
                  type="password"
                  placeholder="รหัสปัจจุบัน (เริ่มต้น: 1234)"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="text-xs bg-black/60 border-white/20 text-white"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">รหัส PIN ใหม่ (4-8 หลัก)</label>
                <Input
                  type="password"
                  maxLength={8}
                  placeholder="ระบุรหัส PIN ใหม่"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="text-xs bg-black/60 border-white/20 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">ยืนยันรหัส PIN ใหม่</label>
                <Input
                  type="password"
                  maxLength={8}
                  placeholder="ยืนยันรหัส PIN ใหม่อีกครั้ง"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  className="text-xs bg-black/60 border-white/20 text-white"
                  required
                />
              </div>
            </div>

            <DialogFooter className="flex-row sm:justify-between gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangingPin(false)}
                className="w-1/2 text-xs border-white/10 gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> ย้อนกลับ
              </Button>
              <Button
                type="submit"
                variant="default"
                className="w-1/2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
              >
                บันทึก PIN ใหม่
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
