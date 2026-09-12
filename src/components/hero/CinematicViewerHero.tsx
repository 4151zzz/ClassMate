import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { ChevronDown, Mail, Share2, Lock, ArrowRight, Film } from "lucide-react";
import { StudentProfile, SchoolInfo } from "@/types/practicum";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { GoogleUser } from "@/hooks/useGoogleAuth";

interface CinematicViewerHeroProps {
  student: StudentProfile;
  school: SchoolInfo;
  currentUser?: GoogleUser | null;
  onScrollToContent: () => void;
  onOpenShare: () => void;
  onUnlockEdit: () => void;
}

export const CinematicViewerHero: React.FC<CinematicViewerHeroProps> = ({
  student,
  school,
  currentUser,
  onScrollToContent,
  onOpenShare,
  onUnlockEdit,
}) => {
  // Extract First Name and Last Name for massive typography
  const nameParts = student.fullName.replace(/^(นาย|นางสาว|นาง|ดร\.)\s*/, "").split(" ");
  const firstName = nameParts[0] || student.fullName;
  const lastName = nameParts.slice(1).join(" ") || "";

  // Dynamic typing animation text
  const phrases = [
    "I EMPOWER LEARNERS",
    "I TEACH COMPUTING",
    "I SHAPE THE FUTURE",
    "ACTIVE LEARNING",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const updateSpeed = isDeleting ? 40 : 90;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        if (displayText.length === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, updateSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  // 3D Card Tilt & Specular Light Physics for Portrait
  const cardRef = useRef<HTMLDivElement>(null);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  const rotateX = useSpring(useTransform(cardY, [-0.5, 0.5], [14, -14]), { damping: 18, stiffness: 220 });
  const rotateY = useSpring(useTransform(cardX, [-0.5, 0.5], [-14, 14]), { damping: 18, stiffness: 220 });

  const glareXPercent = useTransform(cardX, [-0.5, 0.5], [10, 90]);
  const glareYPercent = useTransform(cardY, [-0.5, 0.5], [10, 90]);
  const glareBackground = useMotionTemplate`radial-gradient(400px circle at ${glareXPercent}% ${glareYPercent}%, rgba(0, 240, 255, 0.22), transparent 75%)`;

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    cardX.set(xPct);
    cardY.set(yPct);
  };

  const handleCardMouseLeave = () => {
    cardX.set(0);
    cardY.set(0);
  };

  return (
    <section className="relative w-full min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* 1. TOP HEADER BAR */}
      <header className="w-full z-20 px-6 sm:px-12 py-6 flex items-center justify-between">
        {/* Signature Monogram / Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tighter text-white/90 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {firstName.charAt(0)}
            <span className="text-cyan-400 font-sans text-xl not-italic ml-0.5">.</span>
            <span className="font-light text-xs tracking-widest uppercase font-sans text-slate-400 block -mt-1">
              Practicum Dossier
            </span>
          </div>
        </div>

        {/* Top Right Controls & Email with Magnetic Buttons */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs tracking-widest uppercase">
          {student.email && (
            <a
              href={`mailto:${student.email}`}
              className="hidden md:flex items-center gap-1.5 text-slate-400 hover:text-white transition font-mono tracking-wider"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>{student.email}</span>
            </a>
          )}

          <MagneticButton
            strength={0.25}
            onClick={onOpenShare}
            className="text-xs tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/10 gap-1.5 border border-white/15 rounded-full px-4 py-1.5 backdrop-blur-md"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>แชร์พอร์ต</span>
          </MagneticButton>

          <MagneticButton
            strength={0.25}
            onClick={onUnlockEdit}
            className="text-xs tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/10 gap-2 px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-md"
            title={currentUser ? "จัดการบัญชี Google" : "เข้าสู่ระบบด้วย Google"}
          >
            {currentUser ? (
              <>
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-4 h-4 rounded-full object-cover border border-cyan-400/60"
                />
                <span className="hidden sm:inline font-mono lowercase text-[11px] text-cyan-300">
                  {currentUser.email}
                </span>
                <span className="sm:hidden">บัญชี</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">เข้าสู่ระบบ Google</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </>
            )}
          </MagneticButton>
        </div>
      </header>

      {/* 2. MAIN HERO CONTENT: SPLIT SCREEN (Portrait Left, Impact Typography Right) */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 py-6">
        {/* Left Column: Full-Height Portrait with 3D Tilt & Studio Blend */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="lg:col-span-5 relative flex items-center justify-center lg:justify-start [perspective:1000px]"
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative w-72 sm:w-80 md:w-96 lg:w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 transition-shadow duration-500 hover:shadow-[0_25px_60px_rgba(0,240,255,0.15)] hover:border-cyan-500/40"
          >
            {/* Subtle vignette gradient overlays for studio blending */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/30 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />

            {/* Specular Glare light sheen tracking cursor */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-15 mix-blend-color-dodge transition-opacity duration-300 opacity-40 group-hover:opacity-80"
              style={{
                background: glareBackground,
              }}
            />

            <img
              src={student.avatar}
              alt={student.fullName}
              className="w-full h-full object-cover object-center transition duration-500 scale-100 group-hover:scale-105"
            />

            {/* Glowing Accent Badge */}
            <div className="absolute bottom-4 left-4 z-20 [transform:translateZ(30px)]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 border border-white/20 text-[11px] text-slate-300 backdrop-blur-md shadow-lg group-hover:border-cyan-400/50 transition">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {student.status || "นักศึกษาปฏิบัติการสอนในสถานศึกษา"}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Massive Typography (Jeffrey Milanes Style) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-7 flex flex-col justify-center space-y-5 text-left"
        >
          {/* Massive Name Title */}
          <div className="space-y-1">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase text-white leading-none hover:text-cyan-50 transition-colors duration-300">
              {firstName}
            </h1>
            {lastName && (
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase text-white leading-none hover:text-cyan-50 transition-colors duration-300">
                {lastName}
              </h1>
            )}
          </div>

          {/* Subtitle track */}
          <div className="pt-2">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-slate-400">
              {student.major} · {student.faculty}
            </p>
            <p className="text-xs tracking-[0.18em] uppercase text-cyan-400/90 pt-1 font-mono">
              {school.nameTh || "สถานศึกษาปฏิบัติการสอน"} · {student.university}
            </p>
          </div>

          {/* Typewriter Punchy Headline */}
          <div className="pt-3 min-h-[48px] flex items-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center">
              <span>{displayText}</span>
              <span className="w-1 h-7 bg-cyan-400 ml-1.5 animate-pulse" />
            </h2>
          </div>

          {/* Teacher Philosophy / Bio Summary */}
          <p className="text-sm sm:text-base text-slate-300 font-light max-w-xl leading-relaxed pt-1">
            {student.bio ||
              "มุ่งมั่นพัฒนาการจัดการเรียนรู้เชิงรุก (Active Learning) บูรณาการวิทยาการคำนวณและเทคโนโลยีดิจิทัล เพื่อสร้างแรงบันดาลใจและบ่มเพาะศักยภาพผู้เรียนในศตวรรษที่ 21"}
          </p>

          {/* Call to action: Magnetic explore button */}
          <div className="pt-4 flex items-center gap-4">
            <MagneticButton
              strength={0.35}
              onClick={onScrollToContent}
              className="bg-white text-black font-bold hover:bg-slate-200 hover:text-black rounded-full px-8 py-3.5 shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(0,240,255,0.4)] text-xs sm:text-sm uppercase tracking-wider"
            >
              <span>สำรวจแฟ้มสะสมงาน</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>

            <span className="text-xs text-slate-500 hidden sm:inline font-mono">
              {student.completedHours} / {student.totalHours} HRS COMPLETED
            </span>
          </div>
        </motion.div>
      </div>

      {/* 3. BOTTOM BAR (SCENE 01 / SCROLL THE STORY / CINEMATIC ICON) */}
      <footer className="w-full z-20 px-6 sm:px-12 py-5 flex items-center justify-between text-xs tracking-widest uppercase text-slate-500">
        {/* Bottom Left: Scene Indicator */}
        <div className="flex items-center gap-2 font-mono">
          <span>SCENE</span>
          <span className="text-white font-bold">01</span>
        </div>

        {/* Bottom Center: Scroll the story button */}
        <MagneticButton
          strength={0.3}
          onClick={onScrollToContent}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition tracking-widest cursor-pointer group py-1 px-3 rounded-full hover:bg-white/5"
        >
          <span className="text-[11px]">SCROLL THE STORY</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-cyan-400 group-hover:translate-y-1 transition-transform" />
        </MagneticButton>

        {/* Bottom Right: Film Icon / Branding */}
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-slate-600 hover:text-cyan-400 transition" />
          <span className="hidden sm:inline font-mono text-[10px]">CLASSMATE CINEMATIC</span>
        </div>
      </footer>
    </section>
  );
};
