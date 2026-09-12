import React from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  School,
  BookOpen,
  Clock,
  Mail,
  Phone,
  Tag,
  CheckCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { StudentProfile } from "@/types/practicum";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TeacherHeroProps {
  student: StudentProfile;
  isEditMode: boolean;
  onEditProfile: () => void;
}

export const TeacherHero: React.FC<TeacherHeroProps> = ({
  student,
  isEditMode,
  onEditProfile,
}) => {
  const percentComplete = Math.min(
    100,
    Math.round((student.completedHours / (student.totalHours || 360)) * 100)
  );

  return (
    <section className="relative pt-6 pb-8 md:pt-10 md:pb-12 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Avatar & Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl bg-[#0b0f1c]/70 border border-white/10 backdrop-blur-2xl shadow-2xl relative group"
          >
            {/* Holographic Glowing Border Accent */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-cyan/30 via-transparent to-cyber-purple/30 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-1000 -z-10" />

            {/* Avatar with Halo Ring */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-cyber-cyan/60 p-1 shadow-[0_0_25px_rgba(0,240,255,0.35)] relative">
                <img
                  src={student.avatar}
                  alt={student.fullName}
                  className="w-full h-full object-cover rounded-xl transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-2 -right-2">
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Active
                </span>
              </div>
            </div>

            {/* Teacher Details */}
            <div className="flex-1 space-y-2.5 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant="default" className="text-xs">
                  {student.status || "นักศึกษาฝึกปฏิบัติการสอน"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  รหัสนักศึกษา: {student.studentId}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {student.fullName}
              </h1>

              <div className="text-sm text-slate-300 space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <GraduationCap className="w-4 h-4 text-cyber-cyan shrink-0" />
                  <span>{student.faculty} • {student.major}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-xs">
                  <School className="w-4 h-4 text-cyber-purple shrink-0" />
                  <span>{student.university} ({student.academicYear})</span>
                </div>
              </div>

              {/* Philosophy Quote */}
              <blockquote className="border-l-2 border-cyber-cyan/50 pl-3 italic text-xs sm:text-sm text-cyan-200/90 font-light pt-1">
                {student.quote}
              </blockquote>

              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                {(student.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                  >
                    <Tag className="w-2.5 h-2.5 text-cyber-cyan" />
                    {t}
                  </span>
                ))}
              </div>

              {isEditMode && (
                <div className="pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onEditProfile}
                    className="text-xs gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    แก้ไขข้อมูลโปรไฟล์
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Quick Stats Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5"
          >
            {/* Hours Counter Card */}
            <div className="p-4 rounded-xl bg-[#0d1222]/80 border border-white/10 backdrop-blur-xl hover:border-cyber-cyan/40 transition">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40">
                    <Clock className="w-4 h-4 text-cyber-cyan" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">ชั่วโมงปฏิบัติการสอน</span>
                </div>
                <span className="text-xs font-bold text-cyber-cyan">{percentComplete}%</span>
              </div>
              <div className="text-xl font-black text-white mb-2">
                {student.completedHours} <span className="text-xs font-normal text-muted-foreground">/ {student.totalHours} ชม.</span>
              </div>
              <Progress value={percentComplete} className="h-2" />
            </div>

            {/* Lesson Plans & Classes */}
            <div className="p-4 rounded-xl bg-[#0d1222]/80 border border-white/10 backdrop-blur-xl hover:border-cyber-purple/40 transition">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-cyber-purple" />
                    <span>แผนการสอน</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {student.lessonPlansCount}{" "}
                    <span className="text-xs font-normal text-slate-400">แผน</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyber-green" />
                    <span>ระดับชั้นที่สอน</span>
                  </div>
                  <div className="text-sm font-semibold text-white truncate" title={student.classesTaught}>
                    {student.classesTaught || "มัธยมศึกษา"}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact quick strip */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs text-slate-300">
              <a
                href={`mailto:${student.email}`}
                className="flex items-center gap-1.5 hover:text-cyber-cyan transition truncate"
              >
                <Mail className="w-3.5 h-3.5 text-cyber-cyan" />
                <span className="truncate">{student.email}</span>
              </a>
              {student.phone && (
                <a
                  href={`tel:${student.phone}`}
                  className="flex items-center gap-1.5 hover:text-cyber-cyan transition shrink-0 ml-2"
                >
                  <Phone className="w-3.5 h-3.5 text-cyber-green" />
                  <span>{student.phone}</span>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
