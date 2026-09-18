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
  checkRemotePortfolioUpdate,
  getCachedPortfolio,
  saveCachedPortfolio,
  getCachedUpdatedAt,
  getPermanentPortfolioUid,
  setPermanentPortfolioUid,
} from "@/lib/cloudShare";

const BASE_STORAGE_KEY = "classmate_practicum_portfolio_v2";

export function usePracticumData(
  currentUser?: GoogleUser | null,
  onUpdateUserProfile?: (name: string, picture?: string) => void
) {
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

    // 1.5. If logged-in user, check if we have a cached version for this user's permanent UID
    if (user?.email) {
      const accountUid = getPermanentPortfolioUid(user.email);
      const cached = getCachedPortfolio(accountUid);
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
      const isPlainUsername = !user.name || user.name === user.email.split("@")[0];
      const displayName = isPlainUsername ? "กำลังโหลดข้อมูล..." : user.name;
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

  // Fetch shared portfolio from cloud if UID is in URL + Live Polling for real-time updates
  useEffect(() => {
    if (!sharedUid) return;

    let isMounted = true;
    let lastUpdatedAt = 0;
    setIsLoadingCloudData(true);

    fetchPortfolioFromCloud(sharedUid)
      .then((result) => {
        if (isMounted && result) {
          setData(result.data);
          lastUpdatedAt = result.updatedAt;
          setIsEditMode(false);
          toast.info(`กำลังแสดงพอร์ตโฟลิโอของ: ${result.data.student?.fullName || "ผู้ปฏิบัติการสอน"}`, {
            description: "โหมดผู้เข้าชม (Viewer Mode) • ซิงก์เรียลไทม์สด",
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

    // Real-Time Live Polling: Check if student has published updates while viewing
    const checkUpdate = async () => {
      if (!isMounted || document.hidden) return;
      try {
        const update = await checkRemotePortfolioUpdate(sharedUid, lastUpdatedAt);
        if (isMounted && update && update.updatedAt > lastUpdatedAt) {
          lastUpdatedAt = update.updatedAt;
          setData(update.data);
          toast.success("ข้อมูลพอร์ตโฟลิโอมีการอัปเดตล่าสุดแบบเรียลไทม์", {
            description: `ซิงก์เมื่อ: ${new Date(update.updatedAt).toLocaleTimeString("th-TH")}`,
            duration: 3500,
          });
        }
      } catch {
        // silent polling
      }
    };

    const intervalId = setInterval(checkUpdate, 6000);
    const onVisibilityChange = () => {
      if (!document.hidden) checkUpdate();
    };
    window.addEventListener("focus", onVisibilityChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", onVisibilityChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [sharedUid]);

  // Track previous user to detect account changes
  const prevUserEmailRef = useRef<string | undefined>(currentUser?.email);
  const isCloudRestoreCheckedRef = useRef<boolean>(false);

  useEffect(() => {
    // Do not overwrite if viewing someone else's shared link
    if (sharedUid) return;

    const currentEmail = currentUser?.email;
    if (currentEmail !== prevUserEmailRef.current) {
      prevUserEmailRef.current = currentEmail;
      isCloudRestoreCheckedRef.current = false;
      const newKey = getStorageKey(currentEmail);
      const loaded = loadDataForKey(newKey, currentUser);
      setData(loaded);
      // Auto enable edit mode for logged in user, disable for guest
      setIsEditMode(!!currentUser);
    }
  }, [currentUser, sharedUid]);

  // Cross-Device Account Cloud Sync:
  // When logging in on another computer / device, fetch the user's existing portfolio from cloud
  useEffect(() => {
    if (sharedUid || !currentUser?.email) {
      isCloudRestoreCheckedRef.current = true;
      return;
    }

    let isMounted = true;
    const accountUid = getPermanentPortfolioUid(currentUser.email);
    const userStorageKey = getStorageKey(currentUser.email);

    setIsLoadingCloudData(true);

    fetchPortfolioFromCloud(accountUid)
      .then((cloudResult) => {
        if (!isMounted) return;

        if (cloudResult && cloudResult.data && cloudResult.data.student) {
          // Cloud has existing portfolio for this Google account! Always load it!
          setData(cloudResult.data);
          saveCachedPortfolio(accountUid, cloudResult.data, cloudResult.updatedAt);
          try {
            localStorage.setItem(userStorageKey, JSON.stringify(cloudResult.data));
          } catch (e) {
            console.warn("Failed to cache cloud restored data:", e);
          }

          if (onUpdateUserProfile && cloudResult.data.student.fullName) {
            onUpdateUserProfile(
              cloudResult.data.student.fullName,
              cloudResult.data.student.avatar
            );
          }

          toast.success("ซิงก์ข้อมูลพอร์ตโฟลิโอของคุณแล้ว", {
            description: `ยินดีต้อนรับ ${cloudResult.data.student.fullName} (ดึงข้อมูลจากคลาวด์เรียบร้อย)`,
            duration: 4000,
          });
        } else {
          // Cloud has no portfolio yet for this email, if this device has custom data, push it as initial
          const currentLocalStr = localStorage.getItem(userStorageKey);
          if (currentLocalStr) {
            try {
              const localData = JSON.parse(currentLocalStr);
              if (
                localData?.student?.fullName &&
                localData.student.fullName !== "กำลังโหลดข้อมูล..." &&
                localData.student.fullName !== DEFAULT_PRACTICUM_DATA.student.fullName
              ) {
                publishPortfolioToCloud(localData, accountUid, currentUser.email);
              }
            } catch {}
          }
        }
        isCloudRestoreCheckedRef.current = true;
      })
      .catch((err) => {
        console.warn("Cross-device cloud restore check failed:", err);
        isCloudRestoreCheckedRef.current = true;
      })
      .finally(() => {
        if (isMounted) setIsLoadingCloudData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.email, sharedUid, onUpdateUserProfile]);

  // Persist data on change into current user's isolated storage (only when not viewing someone else's shared UID)
  useEffect(() => {
    if (sharedUid) return; // Never overwrite local storage when viewing a shared link
    if (data.student?.fullName === "กำลังโหลดข้อมูล...") return; // Don't persist temporary loading placeholder

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

  // Permanent Portfolio UID for consistent live sharing
  const [portfolioUid, setPortfolioUid] = useState<string>(() => {
    return getPermanentPortfolioUid(currentUser?.email);
  });

  // Keep portfolioUid aligned when user account changes
  useEffect(() => {
    if (sharedUid) return;
    const uid = getPermanentPortfolioUid(currentUser?.email);
    setPortfolioUid(uid);
  }, [currentUser?.email, sharedUid]);

  // Real-time Cloud Sync Status
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(0);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMountRef = useRef<boolean>(true);

  // Background Auto-Sync to Cloud whenever data changes (Debounced ~1200ms)
  useEffect(() => {
    if (sharedUid) return; // Do not auto-sync if viewing someone else's shared link

    // Skip the very first initial mount
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    // If logged in, wait until cloud check has completed to prevent overwriting cloud with default data
    if (currentUser?.email && !isCloudRestoreCheckedRef.current) {
      return;
    }

    // Never auto-sync default mock template or placeholder loading state to cloud
    if (
      !data.student?.fullName ||
      data.student.fullName === DEFAULT_PRACTICUM_DATA.student.fullName ||
      data.student.fullName === "กำลังโหลดข้อมูล..."
    ) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    setSyncStatus("syncing");

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await publishPortfolioToCloud(data, portfolioUid, currentUser?.email);
        setLastSyncedAt(res.updatedAt);
        setSyncStatus("synced");
      } catch (err) {
        console.warn("Auto-sync to cloud failed:", err);
        setSyncStatus("error");
      }
    }, 1200);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [data, portfolioUid, sharedUid, currentUser?.email]);

  // Force publish to Cloud immediately (called from ShareDialog or Force Sync button)
  const publishShareUrl = useCallback(async (): Promise<string> => {
    setIsPublishing(true);
    setSyncStatus("syncing");
    try {
      const res = await publishPortfolioToCloud(data, portfolioUid, currentUser?.email);
      setLastSyncedAt(res.updatedAt);
      setSyncStatus("synced");
      setPermanentPortfolioUid(res.uid, currentUser?.email);

      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?u=${res.uid}`;
      toast.success("ซิงก์ข้อมูลพอร์ตโฟลิโอขึ้นลิงก์แชร์เรียบร้อยแล้ว", {
        description: `ลิงก์เดิมถาวร: ?u=${res.uid} (อัปเดตเรียลไทม์)`,
      });
      return shareUrl;
    } catch (err) {
      console.warn("Failed to publish to cloud:", err);
      setSyncStatus("error");
      toast.error("ไม่สามารถเชื่อมต่อคลาวด์ได้ในขณะนี้");
      throw err;
    } finally {
      setIsPublishing(false);
    }
  }, [data, portfolioUid, currentUser?.email]);

  // Manual Force Restore from Cloud for this account
  const restoreFromCloud = useCallback(async (): Promise<boolean> => {
    const targetEmail = currentUser?.email;
    const targetUid = targetEmail
      ? getPermanentPortfolioUid(targetEmail)
      : sharedUid || portfolioUid;

    toast.loading("กำลังดึงข้อมูลล่าสุดจากคลาวด์...");
    try {
      const res = await fetchPortfolioFromCloud(targetUid);
      toast.dismiss();
      if (res && res.data && res.data.student) {
        setData(res.data);
        saveCachedPortfolio(targetUid, res.data, res.updatedAt);
        if (targetEmail) {
          localStorage.setItem(getStorageKey(targetEmail), JSON.stringify(res.data));
        }
        if (onUpdateUserProfile && res.data.student.fullName) {
          onUpdateUserProfile(res.data.student.fullName, res.data.student.avatar);
        }
        toast.success("ดึงข้อมูลพอร์ตโฟลิโอจากคลาวด์สำเร็จ!", {
          description: `พอร์ตของ ${res.data.student.fullName || targetEmail}`,
        });
        return true;
      } else {
        toast.error("ยังไม่พบข้อมูลที่บันทึกไว้บนคลาวด์สำหรับบัญชีนี้");
        return false;
      }
    } catch (err) {
      toast.dismiss();
      toast.error("ไม่สามารถเชื่อมต่อคลาวด์ได้");
      return false;
    }
  }, [currentUser?.email, sharedUid, portfolioUid, onUpdateUserProfile]);

  // Synchronous share URL getter (Always returns permanent live URL for mode="short")
  const getShareUrl = useCallback(
    (mode: "short" | "hash" = "short") => {
      const baseUrl = window.location.origin + window.location.pathname;

      if (mode === "short") {
        return `${baseUrl}?u=${portfolioUid}`;
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
    [data, portfolioUid]
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

  const saveGalleryItems = useCallback((items: GalleryItem[]) => {
    if (!items || items.length === 0) return;
    setData((prev) => ({
      ...prev,
      gallery: [...items, ...prev.gallery],
    }));
    toast.success(`เพิ่มภาพกิจกรรม ${items.length} รูปเรียบร้อย`);
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
      const currentList = prev.studentShowcases || [];
      const exists = currentList.some((s) => s.id === showcase.id);
      return {
        ...prev,
        studentShowcases: exists
          ? currentList.map((s) => (s.id === showcase.id ? showcase : s))
          : [showcase, ...currentList],
      };
    });
    toast.success("บันทึกผลงานนักเรียนแล้ว");
  }, []);

  const deleteShowcase = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      studentShowcases: (prev.studentShowcases || []).filter((s) => s.id !== id),
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
    publishedUid: portfolioUid,
    portfolioUid,
    publishShareUrl,
    restoreFromCloud,
    isPublishing,
    syncStatus,
    lastSyncedAt,
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
    saveGalleryItems,
    deleteGalleryItem,
    saveShowcase,
    deleteShowcase,
  };
}
