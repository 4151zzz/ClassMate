import { useState, useEffect, useCallback } from "react";
import LZString from "lz-string";
import { toast } from "sonner";
import {
  PracticumData,
  StudentProfile,
  SchoolInfo,
  Competency,
  Mentor,
  FacultyMember,
  TimetableSlot,
  TeachingLog,
  GalleryItem,
  StudentShowcase,
} from "@/types/practicum";
import { DEFAULT_PRACTICUM_DATA } from "@/lib/mockData";

const STORAGE_KEY = "classmate_practicum_portfolio_v2";
const AUTH_KEY = "classmate_is_editor_authenticated";

export function usePracticumData() {
  const [data, setData] = useState<PracticumData>(() => {
    // 1. Try to load from URL hash if shared
    try {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash.startsWith("data=")) {
        const compressed = hash.replace("data=", "");
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse shared data from hash:", e);
    }

    // 2. Try localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to load data from localStorage:", e);
    }

    // 3. Fallback to default mock data
    return DEFAULT_PRACTICUM_DATA;
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("edit") === "true";
  });

  // Persist data on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data to localStorage:", e);
    }
  }, [data]);

  // Persist edit mode auth
  useEffect(() => {
    localStorage.setItem(AUTH_KEY, isEditMode ? "true" : "false");
  }, [isEditMode]);

  const toggleEditMode = useCallback((authenticated = false) => {
    if (isEditMode) {
      setIsEditMode(false);
      toast.info("สลับไปยังโหมดผู้เข้าชม (Viewer Mode)");
    } else {
      if (authenticated) {
        setIsEditMode(true);
        toast.success("ปลดล็อกโหมดแก้ไข (Editor Mode)");
      }
    }
  }, [isEditMode]);

  // Reset to default
  const resetToDefault = useCallback(() => {
    if (window.confirm("คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่? (การกระทำนี้ไม่สามารถย้อนกลับได้)")) {
      setData(DEFAULT_PRACTICUM_DATA);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("รีเซ็ตข้อมูลพอร์ตโฟลิโอกลับสู่ค่าเริ่มต้นแล้ว");
    }
  }, []);

  // Export JSON
  const exportJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ClassMate_Portfolio_${data.student.studentId || "data"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("ดาวน์โหลดไฟล์สำรองข้อมูล JSON เรียบร้อย");
  }, [data]);

  // Import JSON
  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        if (imported && imported.student && imported.school) {
          setData(imported);
          toast.success("นำเข้าข้อมูลพอร์ตโฟลิโอสำเร็จ");
        } else {
          toast.error("รูปแบบไฟล์ JSON ไม่ถูกต้อง");
        }
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์ JSON");
      }
    };
    reader.readAsText(file);
  }, []);

  // Generate Share URL safely
  const getShareUrl = useCallback(() => {
    try {
      // Clean oversized data URIs for URL sharing to keep link within browser safe limits
      const shareData = JSON.parse(JSON.stringify(data));
      if (shareData.student?.avatar?.startsWith("data:") && shareData.student.avatar.length > 3000) {
        shareData.student.avatar = "";
      }
      const jsonStr = JSON.stringify(shareData);
      const compressed = LZString.compressToEncodedURIComponent(jsonStr);
      const url = new URL(window.location.href);
      url.hash = `data=${compressed}`;
      return url.toString();
    } catch (err) {
      console.error("Failed to generate share URL:", err);
      return window.location.href;
    }
  }, [data]);

  // CRUD Actions
  const updateStudent = useCallback((student: Partial<StudentProfile>) => {
    setData((prev) => ({
      ...prev,
      student: { ...prev.student, ...student },
    }));
    toast.success("บันทึกข้อมูลโปรไฟล์นักศึกษาแล้ว");
  }, []);

  const updateSchool = useCallback((school: Partial<SchoolInfo>) => {
    setData((prev) => ({
      ...prev,
      school: { ...prev.school, ...school },
    }));
    toast.success("บันทึกข้อมูลสถานศึกษาแล้ว");
  }, []);

  const updateCompetencies = useCallback((competencies: Competency[]) => {
    setData((prev) => ({
      ...prev,
      competencies,
    }));
    toast.success("บันทึกสมรรถนะผู้เรียนแล้ว");
  }, []);

  // Mentors
  const saveMentor = useCallback((mentor: Mentor) => {
    setData((prev) => {
      const exists = prev.mentors.some((m) => m.id === mentor.id);
      return {
        ...prev,
        mentors: exists
          ? prev.mentors.map((m) => (m.id === mentor.id ? mentor : m))
          : [...prev.mentors, mentor],
      };
    });
    toast.success("บันทึกข้อมูลครูพี่เลี้ยง/อาจารย์นิเทศก์แล้ว");
  }, []);

  const deleteMentor = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      mentors: prev.mentors.filter((m) => m.id !== id),
    }));
    toast.info("ลบข้อมูลครูพี่เลี้ยงเรียบร้อย");
  }, []);

  // Faculty
  const saveFaculty = useCallback((member: FacultyMember) => {
    setData((prev) => {
      const exists = prev.faculty.some((f) => f.id === member.id);
      return {
        ...prev,
        faculty: exists
          ? prev.faculty.map((f) => (f.id === member.id ? member : f))
          : [...prev.faculty, member],
      };
    });
    toast.success("บันทึกข้อมูลอาจารย์เรียบร้อย");
  }, []);

  const deleteFaculty = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      faculty: prev.faculty.filter((f) => f.id !== id),
    }));
    toast.info("ลบข้อมูลอาจารย์เรียบร้อย");
  }, []);

  // Timetable
  const saveTimetableSlot = useCallback((slot: TimetableSlot) => {
    setData((prev) => {
      const exists = prev.timetable.some((s) => s.id === slot.id);
      return {
        ...prev,
        timetable: exists
          ? prev.timetable.map((s) => (s.id === slot.id ? slot : s))
          : [...prev.timetable, slot],
      };
    });
    toast.success("บันทึกคาบสอนในตารางแล้ว");
  }, []);

  const deleteTimetableSlot = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      timetable: prev.timetable.filter((s) => s.id !== id),
    }));
    toast.info("ลบคาบสอนเรียบร้อย");
  }, []);

  // Teaching Logs
  const saveTeachingLog = useCallback((log: TeachingLog) => {
    setData((prev) => {
      const exists = prev.teachingLogs.some((l) => l.id === log.id);
      return {
        ...prev,
        teachingLogs: exists
          ? prev.teachingLogs.map((l) => (l.id === log.id ? log : l))
          : [...prev.teachingLogs, log],
      };
    });
    toast.success("บันทึกแผนการจัดการเรียนรู้แล้ว");
  }, []);

  const deleteTeachingLog = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      teachingLogs: prev.teachingLogs.filter((l) => l.id !== id),
    }));
    toast.info("ลบแผนการจัดการเรียนรู้เรียบร้อย");
  }, []);

  // Gallery
  const saveGalleryItem = useCallback((item: GalleryItem) => {
    setData((prev) => {
      const exists = prev.gallery.some((g) => g.id === item.id);
      return {
        ...prev,
        gallery: exists
          ? prev.gallery.map((g) => (g.id === item.id ? item : g))
          : [item, ...prev.gallery],
      };
    });
    toast.success("บันทึกรูปภาพกิจกรรมแล้ว");
  }, []);

  const deleteGalleryItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((g) => g.id !== id),
    }));
    toast.info("ลบรูปภาพเรียบร้อย");
  }, []);

  // Student Showcase
  const saveShowcase = useCallback((item: StudentShowcase) => {
    setData((prev) => {
      const exists = prev.studentShowcases.some((s) => s.id === item.id);
      return {
        ...prev,
        studentShowcases: exists
          ? prev.studentShowcases.map((s) => (s.id === item.id ? item : s))
          : [...prev.studentShowcases, item],
      };
    });
    toast.success("บันทึกผลงานนักเรียนแล้ว");
  }, []);

  const deleteShowcase = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      studentShowcases: prev.studentShowcases.filter((s) => s.id !== id),
    }));
    toast.info("ลบผลงานนักเรียนเรียบร้อย");
  }, []);

  return {
    data,
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    resetToDefault,
    exportJSON,
    importJSON,
    getShareUrl,
    updateStudent,
    updateSchool,
    updateCompetencies,
    saveMentor,
    deleteMentor,
    saveFaculty,
    deleteFaculty,
    saveTimetableSlot,
    deleteTimetableSlot,
    saveTeachingLog,
    deleteTeachingLog,
    saveGalleryItem,
    deleteGalleryItem,
    saveShowcase,
    deleteShowcase,
  };
}
