import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import {
  LayoutDashboard,
  School,
  UserCheck,
  Users,
  Calendar,
  Image as ImageIcon,
  Trophy,
  Sparkles,
} from "lucide-react";
import { ThemeProvider } from "next-themes";
import { StarsBackgroundDemo } from "@/components/background/StarsBackgroundDemo";
import { CinematicCursor } from "@/components/fx/CinematicCursor";
import { CinematicViewerHero } from "@/components/hero/CinematicViewerHero";
import { Navbar } from "@/components/hud/Navbar";
import { TeacherHero } from "@/components/hero/TeacherHero";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { SchoolTab } from "@/components/tabs/SchoolTab";
import { MentorsTab } from "@/components/tabs/MentorsTab";
import { FacultyTab } from "@/components/tabs/FacultyTab";
import { TimetableTab } from "@/components/tabs/TimetableTab";
import { GalleryTab } from "@/components/tabs/GalleryTab";
import { ShowcaseTab } from "@/components/tabs/ShowcaseTab";

// Modals
import { AuthDialog } from "@/components/modals/AuthDialog";
import { ShareDialog } from "@/components/modals/ShareDialog";
import { CloudSyncDialog } from "@/components/modals/CloudSyncDialog";
import { ProfileEditDialog } from "@/components/modals/ProfileEditDialog";
import { SchoolEditDialog } from "@/components/modals/SchoolEditDialog";
import { CompetenciesDialog } from "@/components/modals/CompetenciesDialog";
import { MentorDialog } from "@/components/modals/MentorDialog";
import { FacultyDialog } from "@/components/modals/FacultyDialog";
import { TimetableSlotDialog } from "@/components/modals/TimetableSlotDialog";
import { TeachingLogDialog } from "@/components/modals/TeachingLogDialog";
import { PlanViewDialog } from "@/components/modals/PlanViewDialog";
import { GalleryUploadDialog } from "@/components/modals/GalleryUploadDialog";
import { ShowcaseDialog } from "@/components/modals/ShowcaseDialog";
import { LightboxDialog } from "@/components/modals/LightboxDialog";

import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { usePracticumData } from "@/hooks/usePracticumData";
import {
  Mentor,
  FacultyMember,
  TimetableSlot,
  TeachingLog,
  GalleryItem,
  StudentShowcase,
} from "@/types/practicum";

export function App() {
  const { user: currentUser, login: loginWithGoogle, logout: logoutGoogle } = useGoogleAuth();

  const {
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
  } = usePracticumData(currentUser);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Dialog States
  const [authOpen, setAuthOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [cloudOpen, setCloudOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [compOpen, setCompOpen] = useState(false);

  // Item-specific dialog states
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [mentorToEdit, setMentorToEdit] = useState<Mentor | null>(null);

  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [facultyToEdit, setFacultyToEdit] = useState<FacultyMember | null>(null);

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<TimetableSlot | null>(null);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<TeachingLog | null>(null);

  const [planViewOpen, setPlanViewOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TeachingLog | null>(null);

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const [showcaseModalOpen, setShowcaseModalOpen] = useState(false);
  const [showcaseToEdit, setShowcaseToEdit] = useState<StudentShowcase | null>(null);

  const scrollToDossier = () => {
    const el = document.getElementById("dossier-content");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
        <Toaster position="bottom-right" richColors theme="dark" />

        {/* Global Cinematic Custom Cursor & Torch Spotlight */}
        <CinematicCursor />

        {/* Dynamic Stars Background */}
        <StarsBackgroundDemo />

        {/* Top Floating Notification when Viewing Another User's Shared Link */}
        {isViewingShared && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-cyan-950/90 border-b border-cyan-500/40 text-cyan-200 text-xs py-2 px-4 flex items-center justify-between backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="truncate">
                {isLoadingCloudData
                  ? "กำลังโหลดข้อมูลพอร์ตโฟลิโอจากคลาวด์..."
                  : `กำลังดูพอร์ตโฟลิโอของ: ${data.student.fullName || "ผู้ปฏิบัติการสอน"} (${data.student.studentId || "รหัสนักศึกษา"})`}
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 shrink-0">
                โหมดผู้เข้าชม (Read-Only)
              </span>
            </div>
            <a
              href={typeof window !== "undefined" ? window.location.origin + window.location.pathname : "/"}
              className="text-[11px] text-cyan-400 hover:text-cyan-200 font-medium underline shrink-0 ml-3 transition-colors"
            >
              เปิดพอร์ตโฟลิโอของคุณเอง →
            </a>
          </div>
        )}

        {/* Cinematic Jeffrey Milanes style Hero Landing for Viewer / Share Mode */}
        {!isEditMode && (
          <CinematicViewerHero
            student={data.student}
            school={data.school}
            currentUser={currentUser}
            onScrollToContent={scrollToDossier}
            onOpenShare={() => setShareOpen(true)}
            onUnlockEdit={() => setAuthOpen(true)}
          />
        )}

        <div id="dossier-content" className="relative z-10 flex-1 flex flex-col">
          {/* Sticky Glassmorphic Navbar */}
          <Navbar
            currentUser={currentUser}
            isEditMode={isEditMode}
            onOpenAuthDialog={() => setAuthOpen(true)}
            onToggleViewerMode={() => toggleEditMode(false)}
            onOpenShareDialog={() => setShareOpen(true)}
            onOpenCloudDialog={() => setCloudOpen(true)}
            onExportJSON={exportJSON}
            onImportJSON={importJSON}
            onResetDefault={resetToDefault}
          />

          {/* Main Content Area */}
          <main className="flex-1 container mx-auto px-4 pb-20 relative z-10">
            {/* Conditional Header: Scene 02 Header for Viewer Mode, or TeacherHero for Edit Mode */}
            {!isEditMode ? (
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 gap-4 pt-8">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-500 uppercase tracking-widest mb-1.5">
                    <span>SCENE 02</span>
                    <span className="text-slate-700">/</span>
                    <span className="text-cyan-400 font-semibold">PRACTICUM DOSSIER</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                    รายงานผลการปฏิบัติการสอน
                  </h2>
                  <p className="text-xs text-slate-400 font-light mt-1">
                    {data.school.nameTh} · {data.student.academicYear} · {data.student.faculty}
                  </p>
                </div>

                {/* Compact Stats Ticker */}
                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-3 px-5 text-xs backdrop-blur-md">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">ชั่วโมงสอน</span>
                    <span className="font-bold text-white text-sm">
                      {data.student.completedHours} <span className="text-slate-500 font-normal">/ {data.student.totalHours} ชม.</span>
                    </span>
                  </div>
                  <div className="w-[1px] h-7 bg-white/10" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">แผนการสอน</span>
                    <span className="font-bold text-white text-sm">
                      {data.student.lessonPlansCount} <span className="text-slate-500 font-normal">แผน</span>
                    </span>
                  </div>
                  <div className="w-[1px] h-7 bg-white/10" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">ระดับชั้น</span>
                    <span className="font-bold text-white text-sm">{data.student.classesTaught || "มัธยมศึกษา"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <TeacherHero
                student={data.student}
                isEditMode={isEditMode}
                onEditProfile={() => setProfileOpen(true)}
              />
            )}

            {/* Tab Navigation System */}
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-start pb-6 overflow-x-auto no-scrollbar">
                  <TabsList className="h-11 p-1 bg-black/60 border border-white/15 backdrop-blur-2xl">
                    <TabsTrigger value="overview">
                      <span className="font-mono text-[10px] opacity-60">01</span>
                      <span>ภาพรวม & สมรรถนะ</span>
                    </TabsTrigger>
                    <TabsTrigger value="school">
                      <span className="font-mono text-[10px] opacity-60">02</span>
                      <span>สถานศึกษา</span>
                    </TabsTrigger>
                    <TabsTrigger value="mentors">
                      <span className="font-mono text-[10px] opacity-60">03</span>
                      <span>ครูพี่เลี้ยง</span>
                    </TabsTrigger>
                    <TabsTrigger value="faculty">
                      <span className="font-mono text-[10px] opacity-60">04</span>
                      <span>ทำเนียบบุคลากร</span>
                    </TabsTrigger>
                    <TabsTrigger value="timetable">
                      <span className="font-mono text-[10px] opacity-60">05</span>
                      <span>ตารางสอน & แผน</span>
                    </TabsTrigger>
                    <TabsTrigger value="gallery">
                      <span className="font-mono text-[10px] opacity-60">06</span>
                      <span>คลังภาพกิจกรรม</span>
                    </TabsTrigger>
                    <TabsTrigger value="showcase">
                      <span className="font-mono text-[10px] opacity-60">07</span>
                      <span>ผลงานผู้เรียน</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

            {/* TAB PANELS */}
            <TabsContent value="overview">
              <OverviewTab
                student={data.student}
                competencies={data.competencies}
                isEditMode={isEditMode}
                onEditCompetencies={() => setCompOpen(true)}
                onEditProfile={() => setProfileOpen(true)}
              />
            </TabsContent>

            <TabsContent value="school">
              <SchoolTab
                school={data.school}
                isEditMode={isEditMode}
                onEditSchool={() => setSchoolOpen(true)}
              />
            </TabsContent>

            <TabsContent value="mentors">
              <MentorsTab
                mentors={data.mentors}
                isEditMode={isEditMode}
                onAddMentor={() => {
                  setMentorToEdit(null);
                  setMentorModalOpen(true);
                }}
                onEditMentor={(m) => {
                  setMentorToEdit(m);
                  setMentorModalOpen(true);
                }}
                onDeleteMentor={deleteMentor}
              />
            </TabsContent>

            <TabsContent value="faculty">
              <FacultyTab
                faculty={data.faculty}
                isEditMode={isEditMode}
                onAddFaculty={() => {
                  setFacultyToEdit(null);
                  setFacultyModalOpen(true);
                }}
                onEditFaculty={(f) => {
                  setFacultyToEdit(f);
                  setFacultyModalOpen(true);
                }}
                onDeleteFaculty={deleteFaculty}
              />
            </TabsContent>

            <TabsContent value="timetable">
              <TimetableTab
                timetable={data.timetable}
                teachingLogs={data.teachingLogs}
                isEditMode={isEditMode}
                onAddSlot={() => {
                  setSlotToEdit(null);
                  setSlotModalOpen(true);
                }}
                onEditSlot={(s) => {
                  setSlotToEdit(s);
                  setSlotModalOpen(true);
                }}
                onDeleteSlot={deleteTimetableSlot}
                onAddLog={() => {
                  setLogToEdit(null);
                  setLogModalOpen(true);
                }}
                onEditLog={(l) => {
                  setLogToEdit(l);
                  setLogModalOpen(true);
                }}
                onDeleteLog={deleteTeachingLog}
                onViewPlan={(l) => {
                  setSelectedPlan(l);
                  setPlanViewOpen(true);
                }}
              />
            </TabsContent>

            <TabsContent value="gallery">
              <GalleryTab
                gallery={data.gallery}
                isEditMode={isEditMode}
                onAddPhoto={() => setGalleryModalOpen(true)}
                onDeletePhoto={deleteGalleryItem}
                onOpenLightbox={(item) => {
                  setLightboxItem(item);
                  setLightboxOpen(true);
                }}
              />
            </TabsContent>

            <TabsContent value="showcase">
              <ShowcaseTab
                showcases={data.studentShowcases}
                isEditMode={isEditMode}
                onAddShowcase={() => {
                  setShowcaseToEdit(null);
                  setShowcaseModalOpen(true);
                }}
                onEditShowcase={(sc) => {
                  setShowcaseToEdit(sc);
                  setShowcaseModalOpen(true);
                }}
                onDeleteShowcase={deleteShowcase}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#04060a]/90 backdrop-blur-xl py-6 relative z-10 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ClassMate Practicum</span>
            <span>• ระบบรายงานและแฟ้มสะสมงานวิชาชีพครู</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Powered by React + shadcn/ui + Three.js</span>
            <span className="text-cyber-cyan font-mono">v2.0 Cinematic Edition</span>
          </div>
        </div>
      </footer>
      </div>

      {/* MODALS */}
      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        currentUser={currentUser}
        onLogin={loginWithGoogle}
        onLogout={logoutGoogle}
      />

      <ShareDialog
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        getShareUrl={getShareUrl}
        publishShareUrl={publishShareUrl}
        publishedUid={publishedUid}
        isPublishing={isPublishing}
        studentName={data.student.fullName}
        studentId={data.student.studentId}
      />

      <CloudSyncDialog
        isOpen={cloudOpen}
        onClose={() => setCloudOpen(false)}
        onExportJSON={exportJSON}
        studentId={data.student.studentId}
        portfolioData={data}
      />

      <ProfileEditDialog
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        student={data.student}
        onSave={updateStudent}
      />

      <SchoolEditDialog
        isOpen={schoolOpen}
        onClose={() => setSchoolOpen(false)}
        school={data.school}
        onSave={updateSchool}
      />

      <CompetenciesDialog
        isOpen={compOpen}
        onClose={() => setCompOpen(false)}
        competencies={data.competencies}
        onSave={updateCompetencies}
      />

      <MentorDialog
        isOpen={mentorModalOpen}
        onClose={() => setMentorModalOpen(false)}
        mentorToEdit={mentorToEdit}
        onSave={saveMentor}
      />

      <FacultyDialog
        isOpen={facultyModalOpen}
        onClose={() => setFacultyModalOpen(false)}
        facultyToEdit={facultyToEdit}
        onSave={saveFaculty}
      />

      <TimetableSlotDialog
        isOpen={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        slotToEdit={slotToEdit}
        teachingLogs={data.teachingLogs}
        onSave={saveTimetableSlot}
      />

      <TeachingLogDialog
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        logToEdit={logToEdit}
        onSave={saveTeachingLog}
      />

      <PlanViewDialog
        isOpen={planViewOpen}
        onClose={() => setPlanViewOpen(false)}
        log={selectedPlan}
        onEdit={(log) => {
          setLogToEdit(log);
          setLogModalOpen(true);
        }}
      />

      <GalleryUploadDialog
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        onSave={saveGalleryItem}
      />

      <ShowcaseDialog
        isOpen={showcaseModalOpen}
        onClose={() => setShowcaseModalOpen(false)}
        showcaseToEdit={showcaseToEdit}
        onSave={saveShowcase}
      />

      <LightboxDialog
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        item={lightboxItem}
      />
    </div>
    </ThemeProvider>
  );
}
