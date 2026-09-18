import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Maximize2,
  Calendar,
  Layers,
  Search,
} from "lucide-react";
import { GalleryItem } from "@/types/practicum";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface GalleryTabProps {
  gallery: GalleryItem[];
  isEditMode: boolean;
  onAddPhoto: () => void;
  onDeletePhoto: (id: string) => void;
  onOpenLightbox: (item: GalleryItem) => void;
}

const CATEGORIES = [
  { key: "all", label: "ทั้งหมด" },
  { key: "classroom", label: "การจัดการเรียนรู้" },
  { key: "activities", label: "กิจกรรม & นิเทศ" },
  { key: "projects", label: "โครงงานผู้เรียน" },
  { key: "events", label: "กิจกรรมโรงเรียน" },
];

export const GalleryTab: React.FC<GalleryTabProps> = ({
  gallery,
  isEditMode,
  onAddPhoto,
  onDeletePhoto,
  onOpenLightbox,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return gallery.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (item.date && item.date.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchCat && matchSearch;
    });
  }, [gallery, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyber-cyan" />
            คลังภาพถ่ายกิจกรรมและบรรยากาศการจัดการเรียนรู้
          </h3>
          <p className="text-xs text-muted-foreground">
            Teaching Practicum Photo Gallery ({gallery.length} รูป)
          </p>
        </div>

        {isEditMode && (
          <Button
            variant="default"
            size="sm"
            onClick={onAddPhoto}
            className="text-xs gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> เพิ่มรูปภาพกิจกรรม
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.key
                  ? "bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/60 shadow-[0_0_12px_rgba(0,240,255,0.3)] font-semibold"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search by Topic/Title */}
        {gallery.length > 0 && (
          <div className="relative min-w-[200px] sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามหัวข้อภาพ..."
              className="pl-8 h-8 text-xs bg-black/40 border-white/10 text-white placeholder:text-slate-500 rounded-full"
            />
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-white/20">
          <CardContent className="space-y-3">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">ไม่มีรูปภาพในหมวดหมู่นี้</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d111d] aspect-[4/3] shadow-xl hover:border-cyber-cyan/50 transition duration-300"
            >
              {/* Image */}
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition" />

              {/* Top Bar Actions */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenLightbox(item)}
                  className="h-7 w-7 bg-black/60 border-white/20 text-white hover:text-cyber-cyan hover:border-cyber-cyan"
                  title="ขยายภาพ"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
                {isEditMode && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDeletePhoto(item.id)}
                    className="h-7 w-7 bg-red-950/80 border-red-500/50 text-red-300 hover:bg-red-900"
                    title="ลบรูปภาพ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Bottom Info */}
              <div
                className="absolute bottom-0 inset-x-0 p-4 space-y-1 z-10 cursor-pointer"
                onClick={() => onOpenLightbox(item)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-cyber-cyan/20 border-cyber-cyan/40">
                    {item.category}
                  </Badge>
                  {item.date && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {item.date}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyber-cyan transition line-clamp-2">
                  {item.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
