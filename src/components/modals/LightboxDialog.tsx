import React from "react";
import { X, Download, Calendar, Tag } from "lucide-react";
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
}

export const LightboxDialog: React.FC<LightboxDialogProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-cyber-cyan/40">
        <div className="relative flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-3.5 bg-black/70 border-b border-white/10 z-20">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">
                {item.category}
              </Badge>
              {item.date && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
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

          {/* Main Image View */}
          <div className="relative w-full max-h-[75vh] flex items-center justify-center bg-black/90 p-2">
            <img
              src={item.url}
              alt={item.title}
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Caption */}
          <div className="p-4 bg-black/80 border-t border-white/10">
            <h4 className="text-sm sm:text-base font-bold text-white">
              {item.title}
            </h4>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
