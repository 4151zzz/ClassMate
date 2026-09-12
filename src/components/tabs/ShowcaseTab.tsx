import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Plus,
  Edit3,
  Trash2,
  Award,
  Users,
  Sparkles,
} from "lucide-react";
import { StudentShowcase } from "@/types/practicum";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ShowcaseTabProps {
  showcases: StudentShowcase[];
  isEditMode: boolean;
  onAddShowcase: () => void;
  onEditShowcase: (sc: StudentShowcase) => void;
  onDeleteShowcase: (id: string) => void;
}

export const ShowcaseTab: React.FC<ShowcaseTabProps> = ({
  showcases,
  isEditMode,
  onAddShowcase,
  onEditShowcase,
  onDeleteShowcase,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyber-amber" />
            ผลงานเด่น & รางวัลความสำเร็จของผู้เรียน
          </h3>
          <p className="text-xs text-muted-foreground">
            Student Projects, Innovations & Awards Under Teacher's Mentorship
          </p>
        </div>

        {isEditMode && (
          <Button
            variant="default"
            size="sm"
            onClick={onAddShowcase}
            className="text-xs gap-1.5 self-start sm:self-auto bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30"
          >
            <Plus className="w-3.5 h-3.5" /> เพิ่มผลงานนักเรียน
          </Button>
        )}
      </div>

      {showcases.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-white/20">
          <CardContent className="space-y-3">
            <Award className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">ยังไม่มีรายการผลงานและรางวัลของนักเรียน</p>
            {isEditMode && (
              <Button variant="default" size="sm" onClick={onAddShowcase} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> เพิ่มผลงานแรก
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showcases.map((sc, idx) => (
            <motion.div
              key={sc.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="h-full border-white/10 hover:border-amber-500/50 transition group relative overflow-hidden flex flex-col justify-between">
                <div>
                  {/* Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                    <img
                      src={sc.image}
                      alt={sc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e1a] via-transparent to-transparent opacity-80" />

                    {/* Edit Controls */}
                    {isEditMode && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditShowcase(sc)}
                          className="h-7 w-7 bg-black/70 border-white/20 text-white hover:text-amber-300"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDeleteShowcase(sc.id)}
                          className="h-7 w-7 bg-red-950/80 border-red-500/50 text-red-300 hover:bg-red-900"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{sc.award}</span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-2">
                      {sc.title}
                    </h4>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs text-slate-300">
                    <Users className="w-3.5 h-3.5 text-cyber-cyan shrink-0" />
                    <span className="line-clamp-1">ผู้จัดทำ: {sc.studentNames}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
