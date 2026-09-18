import React, { useState } from "react";
import { LogIn, LogOut, Check, Sparkles, ShieldCheck, Mail, User as UserIcon } from "lucide-react";
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
import { GoogleUser } from "@/hooks/useGoogleAuth";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GoogleUser | null;
  onLogin: (userData: { email: string; name?: string; picture?: string }) => boolean;
  onLogout: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [email, setEmail] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  // Remember recently logged in emails for quick 1-click access
  const recentEmails = React.useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("classmate_recent_emails");
      const list = stored ? (JSON.parse(stored) as string[]) : [];
      // Add defaults if empty
      const combined = Array.from(new Set([...list, "0987654321wun@gmail.com", "admincream@gmail.com"]));
      return combined.filter((e) => e && e.includes("@"));
    } catch {
      return ["0987654321wun@gmail.com"];
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (customEmail || email).trim().toLowerCase();
    if (!targetEmail) return;

    // Save to recent emails
    try {
      const updated = Array.from(new Set([targetEmail, ...recentEmails])).slice(0, 5);
      localStorage.setItem("classmate_recent_emails", JSON.stringify(updated));
    } catch {}

    const ok = onLogin({ email: targetEmail });
    if (ok) {
      setEmail("");
      setIsSwitching(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0a0d14] border border-white/15 text-white shadow-2xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-2 shadow-[0_0_25px_rgba(255,255,255,0.15)]">
            {/* Google G Brand SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <DialogTitle className="text-center justify-center text-lg font-bold">
            {currentUser && !isSwitching
              ? "บัญชี Google ที่เข้าสู่ระบบอยู่"
              : "เข้าสู่ระบบด้วย Gmail"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            {currentUser && !isSwitching
              ? "จัดการสิทธิ์ความเป็นเจ้าของและพอร์ตโฟลิโอของคุณ"
              : "ระบุอีเมล Gmail เพื่อเปิดและซิงก์ข้อมูลพอร์ตโฟลิโอของคุณอัตโนมัติ"}
          </DialogDescription>
        </DialogHeader>

        {currentUser && !isSwitching ? (
          /* Logged-in State */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-cyan-500/30 flex items-center gap-3.5">
              <img
                src={currentUser.picture}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border border-cyan-400/50 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white truncate">
                    {currentUser.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold shrink-0">
                    เจ้าของพอร์ต
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                คุณมีสิทธิ์เข้าถึง <strong>โหมดแก้ไข (Editor Mode)</strong> และซิงก์ข้อมูลบนคลาวด์อย่างสมบูรณ์
              </span>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSwitching(true)}
                className="w-full sm:w-1/2 text-xs border-white/15 hover:bg-white/5"
              >
                สลับบัญชี Gmail อื่น
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full sm:w-1/2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Clean & Fast Login Form (Gmail Only) */
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4 py-2">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 mb-1.5 block font-semibold">
                  กรอกอีเมล Gmail ของคุณ <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    placeholder="เช่น 0987654321wun@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs font-mono bg-black/60 border-cyan-500/40 text-cyan-100 placeholder:text-slate-600 focus:border-cyan-400"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Select Recent Email */}
              {recentEmails.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400 block">เข้าสู่ระบบด่วนด้วยบัญชีที่เคยใช้:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {recentEmails.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          setEmail(em);
                          handleSubmit(undefined, em);
                        }}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-colors"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-200 leading-relaxed">
                ✨ <strong>ใส่แค่อีเมล Gmail:</strong> ระบบจะค้นหาและดึงข้อมูลแฟ้มสะสมงานของคุณทั้งหมดจากคลาวด์ลงมาให้อัตโนมัติทันที ไม่ต้องกรอกชื่อใหม่
              </div>
            </div>

            <DialogFooter className="flex-row sm:justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isSwitching) setIsSwitching(false);
                  else onClose();
                }}
                className="w-1/2 text-xs border-white/10"
              >
                {isSwitching ? "ย้อนกลับ" : "ยกเลิก"}
              </Button>
              <Button
                type="submit"
                variant="default"
                className="w-1/2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <LogIn className="w-3.5 h-3.5 text-black" />
                <span>เข้าสู่ระบบ & ซิงก์ข้อมูล</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
