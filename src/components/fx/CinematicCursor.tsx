import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export const CinematicCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  // Smooth springs for cursor follow
  const springX = useSpring(mouseX, { damping: 25, stiffness: 350 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 350 });

  // Center precision dot spring (tighter response)
  const dotSpringX = useSpring(mouseX, { damping: 35, stiffness: 700 });
  const dotSpringY = useSpring(mouseY, { damping: 35, stiffness: 700 });

  // Dynamic torch spotlight following the mouse
  const torchBackground = useMotionTemplate`radial-gradient(650px circle at ${springX}px ${springY}px, rgba(0, 240, 255, 0.045), rgba(6, 182, 212, 0.01) 40%, transparent 70%)`;

  useEffect(() => {
    // Only enable custom cursor on non-touch screens
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    // Track hovered interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest('[role="button"]') ||
        target.closest('[role="tab"]') ||
        target.closest(".interactive") ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Large Ambient Soft Torch Spotlight following mouse */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
        style={{
          background: torchBackground,
        }}
      />

      {/* 2. Outer Trailing Magnetic Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-50 rounded-full border mix-blend-screen"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovered ? 56 : isClicked ? 18 : 26,
          height: isHovered ? 56 : isClicked ? 18 : 26,
          backgroundColor: isHovered
            ? "rgba(0, 240, 255, 0.14)"
            : isClicked
            ? "rgba(0, 240, 255, 0.3)"
            : "transparent",
          borderColor: isHovered
            ? "rgba(0, 240, 255, 0.9)"
            : "rgba(255, 255, 255, 0.45)",
          backdropFilter: isHovered ? "blur(1px)" : "none",
        }}
        transition={{ type: "spring", damping: 20, stiffness: 320 }}
      />

      {/* 3. Center Precision Core Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-50 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.9)]"
        style={{
          x: dotSpringX,
          y: dotSpringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovered ? 8 : isClicked ? 3 : 4,
          height: isHovered ? 8 : isClicked ? 3 : 4,
          scale: isClicked ? 0.6 : 1,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 450 }}
      />
    </>
  );
};
