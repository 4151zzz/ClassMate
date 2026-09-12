import React, { useRef } from "react";
import {
  GraduationCap,
  Lock,
  Unlock,
  Share2,
  Download,
  Upload,
  RotateCcw,
  Cloud,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { GoogleUser } from "@/hooks/useGoogleAuth";

interface NavbarProps {
  currentUser: GoogleUser | null;
  isEditMode: boolean;
  onOpenAuthDialog: () => void;
  onToggleViewerMode: () => void;
  onOpenShareDialog: () => void;
  onOpenCloudDialog: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onResetDefault: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isEditMode,
  onOpenAuthDialog,
  onToggleViewerMode,
  onOpenShareDialog,
  onOpenCloudDialog,
  onExportJSON,
  onImportJSON,
  onResetDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#06080d]/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                ClassMate
              </span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0 border-cyan-400/50 uppercase">
                Practicum v2.0
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              รายงานผลการปฏิบัติการสอน & แฟ้มสะสมงานวิชาชีพครู
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Google Auth Status / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 p-1 pr-2.5 rounded-full">
              <button
                onClick={onOpenAuthDialog}
                className="flex items-center gap-2 text-left group cursor-pointer"
                title="จัดการบัญชี Google"
              >
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full border border-cyan-400/50 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="hidden lg:block text-left">
                  <span className="text-[11px] font-bold text-white block leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono block leading-tight">
                    {isEditMode ? "กำลังแก้ไข" : "โหมดดูงาน"}
                  </span>
                </div>
              </button>

              {/* Edit / Viewer Toggle for owner */}
              <button
                onClick={onToggleViewerMode}
                className={`p-1 rounded-full text-xs font-semibold ml-1 cursor-pointer transition ${
                  isEditMode
                    ? "text-emerald-400 hover:bg-emerald-500/20"
                    : "text-slate-400 hover:bg-white/10"
                }`}
                title={isEditMode ? "สลับไปโหมดผู้เข้าชม" : "สลับไปโหมดแก้ไข"}
              >
                {isEditMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <MagneticButton
              strength={0.2}
              onClick={onOpenAuthDialog}
              className="bg-white text-black hover:bg-slate-200 gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
              <span className="hidden sm:inline">เข้าสู่ระบบ Google</span>
              <span className="sm:hidden">เข้าสู่ระบบ</span>
            </MagneticButton>
          )}

          {/* Share Portfolio */}
          <MagneticButton
            strength={0.25}
            onClick={onOpenShareDialog}
            className="gap-1.5 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <Share2 className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">แชร์พอร์ต</span>
          </MagneticButton>

          {/* Cloud Sync */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCloudDialog}
            className="gap-1.5 text-xs border-white/10 hover:border-white/20 hidden md:inline-flex"
            title="Google Drive Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Cloud</span>
          </Button>

          {/* Export JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportJSON}
            className="gap-1.5 text-xs border-white/10 hover:border-white/20 hidden lg:inline-flex"
            title="สำรองข้อมูล JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </Button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs border-white/10 hover:border-white/20 hidden lg:inline-flex"
            title="นำเข้าไฟล์ข้อมูล JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import</span>
          </Button>

          {/* Reset */}
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetDefault}
              className="border-red-500/20 text-red-400 hover:bg-red-500/20 p-2"
              title="รีเซ็ตกลับเป็นค่าเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
