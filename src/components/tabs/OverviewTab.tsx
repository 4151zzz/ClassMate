import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Laptop,
  Users,
  Award,
  BookOpen,
  Edit3,
  Target,
  Sparkles,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import { StudentProfile, Competency } from "@/types/practicum";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OverviewTabProps {
  student: StudentProfile;
  competencies: Competency[];
  isEditMode: boolean;
  onEditCompetencies: () => void;
  onEditProfile: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  student,
  competencies,
  isEditMode,
  onEditCompetencies,
  onEditProfile,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "brain":
      case "fa-brain":
        return <Brain className="w-4 h-4 text-white" />;
      case "laptop":
      case "fa-laptop-code":
        return <Laptop className="w-4 h-4 text-white" />;
      case "users":
      case "fa-users":
        return <Users className="w-4 h-4 text-white" />;
      default:
        return <Sparkles className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Biography & Vision Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-white/10 bg-[#08080a]/90 backdrop-blur-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                <Target className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold uppercase tracking-tight">
                  ประวัติและความมุ่งมั่นในการจัดการเรียนรู้
                </CardTitle>
                <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">
                  Philosophy, Commitment & Active Learning Approach
                </p>
              </div>
            </div>
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                className="text-xs gap-1.5 border-white/10 hover:border-white/20"
              >
                <Edit3 className="w-3 h-3" /> แก้ไขประวัติ
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
              {student.bio || "ยังไม่ได้ระบุข้อมูลประวัติและความมุ่งมั่น"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Competencies Section */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div>
            <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest block">
              Core Competencies
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
              สมรรถนะสำคัญของผู้เรียนและวิชาชีพครู
            </h3>
          </div>
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditCompetencies}
              className="text-xs gap-1.5 border-white/10 hover:border-white/20"
            >
              <Edit3 className="w-3 h-3" /> แก้ไขสมรรถนะ
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {competencies.map((comp, idx) => (
            <motion.div
              key={comp.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="h-full border-white/10 bg-[#08080a]/90 hover:border-white/25 transition group p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition duration-300">
                      {getIcon(comp.icon)}
                    </div>
                    <span className="font-mono text-xs text-slate-500 font-bold">
                      0{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition leading-snug">
                    {comp.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {comp.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-1 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                  <span>STANDARD</span>
                  <span className="text-slate-400">· COMPLIANT</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Practicum Highlights & Core Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-white/10 bg-[#08080a]/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base uppercase tracking-tight border-b border-white/5 pb-3">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>เป้าหมายการประเมินมาตรฐานวิชาชีพครู (คุรุสภา)</span>
          </div>
          <div className="space-y-3 text-xs text-slate-300 font-light leading-relaxed">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white font-semibold block text-xs">1. ด้านการจัดการเรียนรู้</strong>
              <span>พัฒนาหลักสูตร ออกแบบแผนการจัดการเรียนรู้เชิงรุก (Active Learning) บูรณาการเครื่องมือดิจิทัลและ AI</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white font-semibold block text-xs">2. ด้านการส่งเสริมการเรียนรู้</strong>
              <span>จัดบรรยากาศห้องเรียนที่ปลอดภัย มีส่วนร่วม สร้างแรงบันดาลใจ และส่งเสริมคุณธรรมจริยธรรม</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white font-semibold block text-xs">3. ด้านการพัฒนาตนเองและวิชาชีพ</strong>
              <span>ทำงานร่วมกับชุมชนแห่งการเรียนรู้ทางวิชาชีพ (PLC) และวิจัยในชั้นเรียนเพื่อแก้ปัญหาผู้เรียน</span>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-[#08080a]/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base uppercase tracking-tight border-b border-white/5 pb-3">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>แนวทางการจัดการเรียนรู้ในศตวรรษที่ 21</span>
          </div>
          <div className="space-y-3 text-xs text-slate-300 font-light leading-relaxed">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white font-semibold block text-xs">Project-Based Learning (PBL)</strong>
              <span>ให้นักเรียนลงมือปฏิบัติโครงงานจริง แก้ปัญหาในบริบทชีวิตจริงและท้องถิ่นอย่างสร้างสรรค์</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white font-semibold block text-xs">AI & Digital Tool Integration</strong>
              <span>ใช้เครื่องมือ Generative AI, Google Colab และ Scratch ในการฝึกตรรกะการคิดและการแก้ปัญหา</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white font-semibold block text-xs">Authentic Assessment</strong>
              <span>ประเมินผลตามสภาพจริงด้วยรูบริกส์ (Rubrics) และกระตุ้นการประเมินตนเอง (Self-Assessment)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
