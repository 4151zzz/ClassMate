import React from "react";
import { motion } from "framer-motion";
import {
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  UserCheck,
  Building2,
  Edit3,
  Compass,
  Quote,
} from "lucide-react";
import { SchoolInfo } from "@/types/practicum";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SchoolTabProps {
  school: SchoolInfo;
  isEditMode: boolean;
  onEditSchool: () => void;
}

export const SchoolTab: React.FC<SchoolTabProps> = ({
  school,
  isEditMode,
  onEditSchool,
}) => {
  return (
    <div className="space-y-6">
      {/* Main School Identity Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-cyber-cyan/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyber-cyan/10 to-transparent rounded-bl-full pointer-events-none" />

          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-cyber-cyan/40 p-1 bg-black/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] shrink-0">
                <img
                  src={school.badge}
                  alt={school.nameTh}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Badge variant="default" className="text-xs mb-1">
                  {school.affiliation || "สังกัด สพฐ."}
                </Badge>
                <CardTitle className="text-xl sm:text-2xl text-white">
                  {school.nameTh}
                </CardTitle>
                <p className="text-sm text-cyan-200 font-light">{school.nameEn}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <UserCheck className="w-3.5 h-3.5 text-cyber-green" />
                  <span>ผู้อำนวยการ: {school.director}</span>
                </p>
              </div>
            </div>

            {isEditMode && (
              <Button
                variant="default"
                size="sm"
                onClick={onEditSchool}
                className="text-xs gap-1.5 self-center sm:self-start"
              >
                <Edit3 className="w-3.5 h-3.5" /> แก้ไขข้อมูลสถานศึกษา
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Motto */}
            {school.motto && (
              <div className="flex items-start gap-2 bg-white/[0.03] p-3.5 rounded-xl border border-white/10">
                <Quote className="w-4 h-4 text-cyber-amber shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-200/90 italic">
                  {school.motto}
                </p>
              </div>
            )}

            {/* Vision */}
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyber-cyan uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                วิสัยทัศน์และพันธกิจ (Vision & Mission)
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {school.vision}
              </p>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>ที่ตั้ง</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2" title={school.address}>
                  {school.address}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-cyber-green" />
                  <span>โทรศัพท์</span>
                </div>
                <p className="text-xs text-slate-300">{school.phone || "-"}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-cyber-purple" />
                  <span>อีเมล</span>
                </div>
                <p className="text-xs text-slate-300 truncate" title={school.email}>
                  {school.email || "-"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="w-3.5 h-3.5 text-cyber-amber" />
                  <span>เว็บไซต์</span>
                </div>
                {school.website ? (
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline truncate block"
                  >
                    {school.website}
                  </a>
                ) : (
                  <p className="text-xs text-slate-300">-</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Google Map Embed */}
      {school.mapUrl && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-white/10 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 text-cyber-cyan" />
                แผนที่ตั้งสถานศึกษา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80 rounded-xl overflow-hidden border border-white/10">
                <iframe
                  src={school.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="School Location Map"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
