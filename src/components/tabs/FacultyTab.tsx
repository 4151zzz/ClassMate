import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Building,
  UserX,
} from "lucide-react";
import { FacultyMember } from "@/types/practicum";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FacultyTabProps {
  faculty: FacultyMember[];
  isEditMode: boolean;
  onAddFaculty: () => void;
  onEditFaculty: (member: FacultyMember) => void;
  onDeleteFaculty: (id: string) => void;
}

export const FacultyTab: React.FC<FacultyTabProps> = ({
  faculty,
  isEditMode,
  onAddFaculty,
  onEditFaculty,
  onDeleteFaculty,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  // Extract unique departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    faculty.forEach((f) => {
      if (f.department) depts.add(f.department);
    });
    return ["all", ...Array.from(depts)];
  }, [faculty]);

  // Filtered list
  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesDept = selectedDept === "all" || f.department === selectedDept;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.position.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [faculty, selectedDept, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyber-purple" />
            ทำเนียบครูและบุคลากรทางการศึกษา
          </h3>
          <p className="text-xs text-muted-foreground">
            School Faculty & Staff Directory ({faculty.length} ท่าน)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="ค้นหาชื่อ, ตำแหน่ง, กลุ่มสาระฯ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-black/40 border-white/15 focus:border-cyber-purple"
            />
          </div>
          {isEditMode && (
            <Button
              variant="default"
              size="sm"
              onClick={onAddFaculty}
              className="text-xs gap-1.5 shrink-0 bg-cyber-purple/20 border-cyber-purple/50 text-purple-300 hover:bg-cyber-purple/30"
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มบุคลากร
            </Button>
          )}
        </div>
      </div>

      {/* Department Filter Pills */}
      {departments.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-full text-xs transition whitespace-nowrap cursor-pointer ${
                selectedDept === dept
                  ? "bg-cyber-purple/30 text-purple-300 border border-cyber-purple/60 shadow-[0_0_10px_rgba(112,0,255,0.3)] font-semibold"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              {dept === "all" ? "ทั้งหมด" : dept}
            </button>
          ))}
        </div>
      )}

      {/* Faculty Grid */}
      {filteredFaculty.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-white/20">
          <CardContent className="space-y-3">
            <UserX className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">ไม่พบบุคลากรตามเงื่อนไขที่ค้นหา</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFaculty.map((f, idx) => (
            <motion.div
              key={f.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="h-full border-white/10 hover:border-cyber-purple/40 transition group relative overflow-hidden flex flex-col items-center text-center p-5 space-y-3">
                {isEditMode && (
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEditFaculty(f)}
                      className="h-6 w-6 text-[10px] border-white/10 hover:border-cyber-cyan/50"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDeleteFaculty(f.id)}
                      className="h-6 w-6 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/20"
                      title="ลบ"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                )}

                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyber-purple/30 p-0.5 bg-black/40 group-hover:border-cyber-purple transition duration-300">
                  <img
                    src={f.avatar}
                    alt={f.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                    {f.name}
                  </h4>
                  <p className="text-xs text-slate-300">{f.position}</p>
                  <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 mt-1">
                    {f.department}
                  </Badge>
                </div>

                <div className="w-full pt-2 border-t border-white/5 flex flex-col gap-1 text-[11px] text-muted-foreground">
                  {f.phone && (
                    <div className="flex items-center justify-center gap-1.5">
                      <Phone className="w-3 h-3 text-cyber-green" />
                      <span>{f.phone}</span>
                    </div>
                  )}
                  {f.email && (
                    <div className="flex items-center justify-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-cyber-purple" />
                      <span className="truncate">{f.email}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
