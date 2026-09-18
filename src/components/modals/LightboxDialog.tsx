import React, { useEffect, useCallback } from "react";
import { X, Download, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GalleryItem } from "@/types/practicum";

interface LightboxDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryItem | null;
  gallery?: GalleryItem[];
  onNavigate?: (item: GalleryItem) => void;
}

export const LightboxDialog: React.FC<LightboxDialogProps> = ({
  isOpen,
  onClose,
  item,
  gallery = [],
  onNavigate,
}) => {
  if (!item) return null;

  const currentIndex = gallery.findIndex((g) => g.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < gallery.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev && onNavigate) {
      onNavigate(gallery[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, gallery, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(gallery[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, gallery, onNavigate]);

  // Keyboard arrow keys navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-cyan-500/40 text-white shadow-2xl">
        <div className="relative flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-3.5 bg-black/80 border-b border-white/10 z-20">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                {item.category}
              </Badge>
              {item.date && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  {item.date}
                </span>
              )}
              {gallery.length > 1 && currentIndex >= 0 && (
                <span className="text-xs text-slate-400 font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {currentIndex + 1} / {gallery.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={item.url}
                download={`${item.title || "image"}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด</span>
              </a>
            </div>
          </div>

          {/* Main Image View with Next/Prev navigation */}
          <div className="relative w-full max-h-[75vh] flex items-center justify-center bg-black/90 p-2 select-none">
            {/* Prev Arrow */}
            {hasPrev && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-cyan-500 hover:text-black text-white transition-all z-20 border border-white/20 shadow-xl"
                title="ภาพก่อนหน้า (ลูกศรซ้าย)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={item.url}
              alt={item.title}
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all"
            />

            {/* Next Arrow */}
            {hasNext && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-cyan-500 hover:text-black text-white transition-all z-20 border border-white/20 shadow-xl"
                title="ภาพถัดไป (ลูกศรขวา)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Caption */}
          <div className="p-4 bg-black/80 border-t border-white/10 flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-bold text-white">
              {item.title}
            </h4>
            {gallery.length > 1 && (
              <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
                กดลูกศร ◀ ▶ บนคีย์บอร์ดเพื่อเปลี่ยนรูป
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
