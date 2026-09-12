import React from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Building,
  MessageSquareQuote,
  GraduationCap,
} from "lucide-react";
import { Mentor } from "@/types/practicum";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MentorsTabProps {
  mentors: Mentor[];
  isEditMode: boolean;
  onAddMentor: () => void;
  onEditMentor: (mentor: Mentor) => void;
  onDeleteMentor: (id: string) => void;
}

export const MentorsTab: React.FC<MentorsTabProps> = ({
  mentors,
  isEditMode,
  onAddMentor,
  onEditMentor,
  onDeleteMentor,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyber-cyan" />
            ครูพี่เลี้ยงและอาจารย์นิเทศก์
          </h3>
          <p className="text-xs text-muted-foreground">
            Cooperating Teachers & University Supervisors
          </p>
        </div>
        {isEditMode && (
          <Button
            variant="default"
            size="sm"
            onClick={onAddMentor}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> เพิ่มข้อมูลครูพี่เลี้ยง
          </Button>
        )}
      </div>

      {mentors.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-white/20">
          <CardContent className="space-y-3">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลครูพี่เลี้ยงหรืออาจารย์นิเทศก์</p>
            {isEditMode && (
              <Button variant="default" size="sm" onClick={onAddMentor} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> เพิ่มทันที
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((m, idx) => (
            <motion.div
              key={m.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="h-full border-white/10 hover:border-cyber-cyan/40 transition group relative overflow-hidden flex flex-col justify-between">
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    backgroundColor:
                      m.roleType === "supervisor" ? "#00f0ff" : "#7000ff",
                  }}
                />

                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 p-0.5 bg-black/40 shrink-0">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div>
                      <Badge
                        variant={m.roleType === "supervisor" ? "default" : "secondary"}
                        className="text-[10px] mb-1"
                      >
                        {m.roleTitle}
                      </Badge>
                      <CardTitle className="text-base sm:text-lg text-white group-hover:text-cyber-cyan transition">
                        {m.name}
                      </CardTitle>
                      <p className="text-xs text-slate-300">{m.position}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        {m.department}
                      </p>
                    </div>
                  </div>

                  {isEditMode && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditMentor(m)}
                        className="h-7 w-7 text-xs border-white/10 hover:border-cyber-cyan/50"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteMentor(m.id)}
                        className="h-7 w-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/20"
                        title="ลบข้อมูล"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  {/* Feedback comment */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyber-cyan">
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      บันทึกข้อเสนอแนะและการนิเทศ
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{m.comment || "ยังไม่มีบันทึกความคิดเห็นหรือข้อเสนอแนะ"}"
                    </p>
                  </div>

                  {/* Contacts */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {m.phone && (
                      <a
                        href={`tel:${m.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-cyber-green transition"
                      >
                        <Phone className="w-3 h-3 text-cyber-green" />
                        {m.phone}
                      </a>
                    )}
                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-cyber-cyan transition"
                      >
                        <Mail className="w-3 h-3 text-cyber-cyan" />
                        อีเมล
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
