import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  FileText,
  ExternalLink,
  Users,
  DoorOpen,
  CheckCircle2,
  CalendarCheck,
  CalendarDays,
} from "lucide-react";
import { TimetableSlot, TeachingLog } from "@/types/practicum";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TimetableTabProps {
  timetable: TimetableSlot[];
  teachingLogs: TeachingLog[];
  isEditMode: boolean;
  onAddSlot: () => void;
  onEditSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (id: string) => void;
  onAddLog: () => void;
  onEditLog: (log: TeachingLog) => void;
  onDeleteLog: (id: string) => void;
  onViewPlan: (log: TeachingLog) => void;
}

const DAYS_CONFIG = [
  { key: "จันทร์", name: "วันจันทร์", en: "Monday", color: "#facc15", badgeClass: "text-amber-300 border-amber-500/40 bg-amber-500/10" },
  { key: "อังคาร", name: "วันอังคาร", en: "Tuesday", color: "#f472b6", badgeClass: "text-pink-300 border-pink-500/40 bg-pink-500/10" },
  { key: "พุธ", name: "วันพุธ", en: "Wednesday", color: "#34d399", badgeClass: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" },
  { key: "พฤหัสบดี", name: "วันพฤหัสบดี", en: "Thursday", color: "#fb923c", badgeClass: "text-orange-300 border-orange-500/40 bg-orange-500/10" },
  { key: "ศุกร์", name: "วันศุกร์", en: "Friday", color: "#60a5fa", badgeClass: "text-blue-300 border-blue-500/40 bg-blue-500/10" },
];

export const TimetableTab: React.FC<TimetableTabProps> = ({
  timetable,
  teachingLogs,
  isEditMode,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  onAddLog,
  onEditLog,
  onDeleteLog,
  onViewPlan,
}) => {
  const [subView, setSubView] = useState<"timetable" | "logs">("timetable");

  return (
    <div className="space-y-6">
      {/* View Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-white/10 w-fit">
          <Button
            variant={subView === "timetable" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubView("timetable")}
            className="text-xs gap-1.5 font-semibold"
          >
            <CalendarDays className="w-3.5 h-3.5" /> ตารางสอนประจำสัปดาห์
          </Button>
          <Button
            variant={subView === "logs" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubView("logs")}
            className="text-xs gap-1.5 font-semibold"
          >
            <CalendarCheck className="w-3.5 h-3.5" /> บันทึกและแผนการสอน ({teachingLogs.length})
          </Button>
        </div>

        {isEditMode && (
          <div>
            {subView === "timetable" ? (
              <Button
                variant="default"
                size="sm"
                onClick={onAddSlot}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มคาบสอนในตาราง
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onAddLog}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มบันทึกและแผนการสอน
              </Button>
            )}
          </div>
        )}
      </div>

      {/* VIEW 1: TIMETABLE BOARD */}
      {subView === "timetable" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DAYS_CONFIG.map((d) => {
            const daySlots = timetable
              .filter((s) => s.day === d.key)
              .sort((a, b) => a.period - b.period);

            return (
              <div
                key={d.key}
                className="rounded-2xl bg-[#0b0e1a]/80 border border-white/10 p-3 flex flex-col gap-3 min-h-[300px]"
              >
                {/* Day Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{d.name}</h4>
                      <span className="text-[10px] text-muted-foreground">{d.en}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${d.badgeClass}`}>
                    {daySlots.length} คาบ
                  </Badge>
                </div>

                {/* Slots List */}
                <div className="space-y-2.5 flex-1">
                  {daySlots.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-xs opacity-50">
                      ไม่มีคาบสอน
                    </div>
                  ) : (
                    daySlots.map((slot) => {
                      const linkedPlan = teachingLogs.find((l) => l.id === slot.planId);

                      return (
                        <div
                          key={slot.id}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyber-cyan/40 transition group relative space-y-1.5 text-left"
                        >
                          {isEditMode && (
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              <button
                                onClick={() => onEditSlot(slot)}
                                className="text-slate-400 hover:text-cyber-cyan p-1"
                                title="แก้ไขคาบสอน"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteSlot(slot.id)}
                                className="text-slate-400 hover:text-red-400 p-1"
                                title="ลบ"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-[11px] font-semibold text-cyber-cyan">
                            <Clock className="w-3 h-3" />
                            <span>คาบที่ {slot.period} ({slot.time})</span>
                          </div>

                          <div className="text-xs font-bold text-white">
                            {slot.subjectCode}: {slot.subjectName}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-cyber-purple" />
                              {slot.grade}
                            </span>
                            •
                            <span className="flex items-center gap-1">
                              <DoorOpen className="w-3 h-3 text-cyber-green" />
                              {slot.room}
                            </span>
                          </div>

                          {linkedPlan && (
                            <div className="pt-1">
                              <button
                                onClick={() => onViewPlan(linkedPlan)}
                                className="text-[10px] text-emerald-300 hover:underline flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3 text-emerald-400" />
                                แผน: {linkedPlan.title}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TEACHING LOGS & LESSON PLANS */}
      {subView === "logs" && (
        <div className="space-y-4">
          {teachingLogs.length === 0 ? (
            <Card className="text-center py-12 border-dashed border-white/20">
              <CardContent className="space-y-3">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm text-muted-foreground">ยังไม่มีบันทึกและแผนการจัดการเรียนรู้</p>
                {isEditMode && (
                  <Button variant="default" size="sm" onClick={onAddLog} className="text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> เพิ่มแผนการสอนแรก
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            teachingLogs.map((log, idx) => (
              <motion.div
                key={log.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="border-white/10 hover:border-cyber-cyan/40 transition">
                  <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left: Date & Week */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="p-3 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 text-center min-w-[90px]">
                        <span className="text-[11px] font-bold text-cyber-cyan block">
                          {log.week || "สัปดาห์ที่ 1"}
                        </span>
                        <span className="text-xs text-white font-medium block mt-0.5">
                          {log.hours} ชม.
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="success" className="text-[10px]">
                            {log.status || "ผ่านการนิเทศ"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.date}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">
                          {log.title}
                        </h4>
                        <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">
                          {log.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span>รายวิชา: <strong className="text-slate-200">{log.subject}</strong></span>
                          •
                          <span>ระดับชั้น: <strong className="text-slate-200">{log.grade}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onViewPlan(log)}
                        className="text-xs gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> ดูแผนการสอน
                      </Button>
                      {log.planLink && (
                        <a
                          href={log.planLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Drive
                        </a>
                      )}
                      {isEditMode && (
                        <div className="flex items-center gap-1 pl-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEditLog(log)}
                            className="h-8 w-8 text-xs border-white/10 hover:border-cyber-cyan/50"
                            title="แก้ไข"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDeleteLog(log.id)}
                            className="h-8 w-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/20"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
