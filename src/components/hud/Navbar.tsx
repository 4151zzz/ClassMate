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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface NavbarProps {
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
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan/30 to-cyber-purple/30 border border-cyber-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <GraduationCap className="w-5 h-5 text-cyber-cyan" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-cyan"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                ClassMate
              </span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0 border-cyber-cyan/50 uppercase">
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
          {/* Edit/Viewer Mode Switcher with magnetic pull */}
          {isEditMode ? (
            <MagneticButton
              strength={0.2}
              onClick={onToggleViewerMode}
              className="bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/30 gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">โหมดแก้ไข</span>
            </MagneticButton>
          ) : (
            <MagneticButton
              strength={0.2}
              onClick={onOpenAuthDialog}
              className="border border-white/20 hover:border-cyan-400/50 text-slate-300 hover:text-white gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">โหมดผู้เข้าชม</span>
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
