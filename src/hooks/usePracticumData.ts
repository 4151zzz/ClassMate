import { useState, useEffect, useCallback, useRef } from "react";
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
import { GoogleUser } from "@/hooks/useGoogleAuth";
import {
  publishPortfolioToCloud,
  fetchPortfolioFromCloud,
  getCachedPortfolio,
} from "@/lib/cloudShare";

const BASE_STORAGE_KEY = "classmate_practicum_portfolio_v2";

export function usePracticumData(currentUser?: GoogleUser | null) {
  const getStorageKey = (email?: string) => {
    return email
      ? `classmate_portfolio_${email.toLowerCase().trim()}`
      : BASE_STORAGE_KEY;
  };

  const activeKey = getStorageKey(currentUser?.email);

  // Check if URL has a shared UID (?u=... or ?uid=... or ?id=...)
  const getSharedUidFromUrl = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("u") || params.get("uid") || params.get("id");
    } catch {
      return null;
    }
  };

  const initialSharedUid = getSharedUidFromUrl();
  const [sharedUid, setSharedUid] = useState<string | null>(initialSharedUid);
  const isViewingShared = !!sharedUid;

  // Initialize data
  const loadDataForKey = (key: string, user?: GoogleUser | null): PracticumData => {
    // 1. Try URL shared UID if present (cached version first)
    if (initialSharedUid) {
      const cached = getCachedPortfolio(initialSharedUid);
      if (cached) return cached;
    }

    // 2. Try URL hash if shared offline
    try {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash.startsWith("data=")) {
        const compressed = hash.replace("data=", "");
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (decompressed) {
          return JSON.parse(decompressed);
        }
      }
    } catch (e) {
      console.warn("Failed to parse shared data from hash:", e);
    }

    // 3. Try localStorage for this account
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`Failed to load data for key ${key}:`, e);
    }

    // 4. Fallback to default mock data (pre-filled with Google User info if logged in)
    if (user) {
      const isPlainUsername = user.name && user.name === user.email.split("@")[0];
      const displayName = !user.name || isPlainUsername ? DEFAULT_PRACTICUM_DATA.student.fullName : user.name;
      return {
        ...DEFAULT_PRACTICUM_DATA,
        student: {
          ...DEFAULT_PRACTICUM_DATA.student,
          fullName: displayName,
          email: user.email,
          avatar: user.picture || DEFAULT_PRACTICUM_DATA.student.avatar,
        },
      };
    }

    return DEFAULT_PRACTICUM_DATA;
  };

  const [data, setData] = useState<PracticumData>(() =>
    loadDataForKey(activeKey, currentUser)
  );

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    // If viewing someone else's shared link, start in read-only viewer mode
    if (initialSharedUid) return false;
    return !!currentUser;
  });

  const [isLoadingCloudData, setIsLoadingCloudData] = useState<boolean>(false);

  // Fetch shared portfolio from cloud if UID is in URL
  useEffect(() => {
    if (!sharedUid) return;

    let isMounted = true;
    setIsLoadingCloudData(true);

    fetchPortfolioFromCloud(sharedUid)
      .then((remoteData) => {
        if (isMounted && remoteData) {
          setData(remoteData);
          setIsEditMode(false);
          toast.info(`กำลังแสดงพอร์ตโฟลิโอของ: ${remoteData.student?.fullName || "ผู้ปฏิบัติการสอน"}`, {
            description: "โหมดผู้เข้าชม (Viewer Mode)",
            duration: 4000,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load shared portfolio from cloud:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCloudData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sharedUid]);

  // Track previous user to detect account changes
  const prevUserEmailRef = useRef<string | undefined>(currentUser?.email);

  useEffect(() => {
    // Do not overwrite if viewing someone else's shared link
    if (sharedUid) return;

    const currentEmail = currentUser?.email;
    if (currentEmail !== prevUserEmailRef.current) {
      prevUserEmailRef.current = currentEmail;
      const newKey = getStorageKey(currentEmail);
      const loaded = loadDataForKey(newKey, currentUser);
      setData(loaded);
      // Auto enable edit mode for logged in user, disable for guest
      setIsEditMode(!!currentUser);
    }
  }, [currentUser, sharedUid]);

  // Persist data on change into current user's isolated storage (only when not viewing someone else's shared UID)
  useEffect(() => {
    if (sharedUid) return; // Never overwrite local storage when viewing a shared link
    try {
      localStorage.setItem(activeKey, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save data to localStorage key ${activeKey}:`, e);
    }
  }, [data, activeKey, sharedUid]);

  const toggleEditMode = useCallback(
    (authenticated = false) => {
      if (isEditMode) {
        setIsEditMode(false);
        toast.info("สลับไปยังโหมดผู้เข้าชม (Viewer Mode)");
      } else {
        if (currentUser || authenticated) {
          setIsEditMode(true);
          toast.success("เข้าสู่โหมดแก้ไข (Editor Mode)");
        } else {
          toast.error("กรุณาเข้าสู่ระบบด้วย Google เพื่อแก้ไขพอร์ตโฟลิโอ");
        }
      }
    },
    [isEditMode, currentUser]
  );

  // Reset to default for current user
  const resetToDefault = useCallback(() => {
    if (
      window.confirm(
        "คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่? (การกระทำนี้ไม่สามารถย้อนกลับได้)"
      )
    ) {
      const freshData = currentUser
        ? {
            ...DEFAULT_PRACTICUM_DATA,
            student: {
              ...DEFAULT_PRACTICUM_DATA.student,
              fullName: currentUser.name || DEFAULT_PRACTICUM_DATA.student.fullName,
              email: currentUser.email,
              avatar: currentUser.picture || DEFAULT_PRACTICUM_DATA.student.avatar,
            },
          }
        : DEFAULT_PRACTICUM_DATA;

      setData(freshData);
      localStorage.removeItem(activeKey);
      toast.success("รีเซ็ตข้อมูลพอร์ตโฟลิโอกลับสู่ค่าเริ่มต้นแล้ว");
    }
  }, [activeKey, currentUser]);

  // Export JSON
  const exportJSON = useCallback(() => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `ClassMate_Portfolio_${data.student.studentId || currentUser?.email || "data"}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("ดาวน์โหลดไฟล์สำรองข้อมูล JSON เรียบร้อย");
  }, [data, currentUser]);

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

  // Published Cloud UID for lightweight sharing
  const [publishedUid, setPublishedUid] = useState<string>(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("classmate_last_published_uid") || ""
      : "";
  });
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Publish to Cloud to get lightweight share URL
  const publishShareUrl = useCallback(async (): Promise<string> => {
    setIsPublishing(true);
    try {
      const uid = await publishPortfolioToCloud(data);
      setPublishedUid(uid);
      if (typeof window !== "undefined") {
        localStorage.setItem("classmate_last_published_uid", uid);
      }
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?u=${uid}`;
      toast.success("สร้างลิงก์แชร์สั้นผ่านคลาวด์เรียบร้อยแล้ว", {
        description: `UID: ${uid}`,
      });
      return shareUrl;
    } catch (err) {
      console.warn("Failed to publish to cloud:", err);
      toast.error("ไม่สามารถเชื่อมต่อคลาวด์เพื่อสร้างลิงก์สั้นได้");
      throw err;
    } finally {
      setIsPublishing(false);
    }
  }, [data]);

  // Synchronous share URL getter
  const getShareUrl = useCallback(
    (mode: "short" | "hash" = "short") => {
      const baseUrl = window.location.origin + window.location.pathname;

      if (mode === "short") {
        if (publishedUid) {
          return `${baseUrl}?u=${publishedUid}`;
        }
        if (data.student.studentId) {
          return `${baseUrl}?id=${encodeURIComponent(data.student.studentId)}`;
        }
        return baseUrl;
      }

      // Hash mode (offline full data backup)
      try {
        const shareData = JSON.parse(JSON.stringify(data));
        if (
          shareData.student?.avatar?.startsWith("data:") &&
          shareData.student.avatar.length > 3000
        ) {
          shareData.student.avatar = "";
        }
        const jsonStr = JSON.stringify(shareData);
        const compressed = LZString.compressToEncodedURIComponent(jsonStr);
        return `${baseUrl}#data=${compressed}`;
      } catch (err) {
        console.error("Failed to generate share URL:", err);
        return baseUrl;
      }
    },
    [data, publishedUid]
  );

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
    toast.success("บันทึกข้อมูลบุคลากรแล้ว");
  }, []);

  const deleteFaculty = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      faculty: prev.faculty.filter((f) => f.id !== id),
    }));
    toast.info("ลบข้อมูลบุคลากรเรียบร้อย");
  }, []);

  // Timetable Slots
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
    toast.success("บันทึกคาบสอนเรียบร้อยแล้ว");
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
    toast.success("บันทึกแผนและบันทึกหลังสอนแล้ว");
  }, []);

  const deleteTeachingLog = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      teachingLogs: prev.teachingLogs.filter((l) => l.id !== id),
    }));
    toast.info("ลบแผนการสอนเรียบร้อย");
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
    toast.success("บันทึกภาพกิจกรรมแล้ว");
  }, []);

  const deleteGalleryItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((g) => g.id !== id),
    }));
    toast.info("ลบภาพกิจกรรมเรียบร้อย");
  }, []);

  // Student Showcase
  const saveShowcase = useCallback((showcase: StudentShowcase) => {
    setData((prev) => {
      const exists = prev.showcases.some((s) => s.id === showcase.id);
      return {
        ...prev,
        showcases: exists
          ? prev.showcases.map((s) => (s.id === showcase.id ? showcase : s))
          : [showcase, ...prev.showcases],
      };
    });
    toast.success("บันทึกผลงานนักเรียนแล้ว");
  }, []);

  const deleteShowcase = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      showcases: prev.showcases.filter((s) => s.id !== id),
    }));
    toast.info("ลบผลงานนักเรียนเรียบร้อย");
  }, []);

  return {
    data,
    isEditMode,
    toggleEditMode,
    resetToDefault,
    exportJSON,
    importJSON,
    getShareUrl,
    publishedUid,
    publishShareUrl,
    isPublishing,
    isViewingShared,
    isLoadingCloudData,
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
