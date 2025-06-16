"use client";
import { useEffect, useState } from "react";

export function BubbleBackground() {
  const [isDark, setIsDark] = useState(false);

  // Sync with dark mode on <html>
  useEffect(() => {
    // Initial check
    setIsDark(document.documentElement.classList.contains("dark"));
    // Watch for changes to the 'dark' class
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Logic ternary: background gradient berubah sesuai dark mode, bubble tetap sama
  const gradientClass = isDark
    ? "bg-gradient-to-br from-purple-900 to-purple-950"
    : "bg-gradient-to-br from-purple-200 to-purple-300";

  return (
    <>
      {/* Absolute background untuk viewport - TIDAK FIXED */}
      <div
        className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {/* Background gradient (berubah sesuai mode) */}
        <div className={`absolute inset-0 w-full h-full ${gradientClass}`} />

        {/* Bubbles (tetap sama) */}
        <div className="absolute left-[7vw] top-[14vh] w-[190px] h-[190px] rounded-full bg-pink-400 opacity-100 blur-3xl animate-bubbleUpDown" />
        <div className="absolute left-[73vw] top-[12vh] w-[70px] h-[70px] rounded-full bg-pink-300 opacity-100 blur-2xl animate-bubbleLeftRight" />
        <div className="absolute left-[24vw] top-[60vh] w-[120px] h-[120px] rounded-full bg-pink-500 opacity-100 blur-2xl animate-bubbleScale" />
        <div className="absolute left-[78vw] top-[67vh] w-[160px] h-[160px] rounded-full bg-pink-300 opacity-100 blur-3xl animate-bubbleUpDownSlow" />
        <div className="absolute left-[52vw] top-[40vh] w-[60px] h-[60px] rounded-full bg-pink-400 opacity-100 blur-xl animate-bubbleLeftRightReverse animate-bubbleScaleFast" />
        <div className="absolute left-[19vw] top-[78vh] w-[110px] h-[110px] rounded-full bg-pink-400 opacity-100 blur-2xl animate-bubbleUpDownAlt animate-bubbleScaleAlt" />
        <div className="absolute left-[12vw] top-[55vh] w-[80px] h-[80px] rounded-full bg-pink-300 opacity-100 blur-xl animate-bubbleLeftRightShort animate-bubbleScale" />
        <div className="absolute left-[62vw] top-[82vh] w-[140px] h-[140px] rounded-full bg-pink-500 opacity-100 blur-2xl animate-bubbleScaleSlow animate-bubbleUpDown2" />
        <div className="absolute left-[87vw] top-[35vh] w-[55px] h-[55px] rounded-full bg-pink-400 opacity-100 blur-xl animate-bubbleLeftRightShort animate-bubbleScaleFast" />
        <div className="absolute left-[37vw] top-[18vh] w-[90px] h-[90px] rounded-full bg-pink-300 opacity-100 blur-2xl animate-bubbleUpDown2 animate-bubbleScale" />
        <div className="absolute left-[45vw] top-[25vh] w-[70px] h-[70px] rounded-full bg-pink-400 opacity-100 blur-xl animate-bubbleLeftRightShort animate-bubbleScaleFast" />
      </div>

      {/* Additional background untuk scroll areas */}
      <div
        className="absolute inset-0 -z-20 w-full pointer-events-none"
        style={{ minHeight: "200vh" }}
        aria-hidden="true"
      >
        <div
          className={`absolute inset-0 w-full h-full ${gradientClass}`}
          style={{ minHeight: "200vh" }}
        />

        {/* Extended bubbles untuk scroll area */}
        <div className="absolute left-[15vw] top-[120vh] w-[150px] h-[150px] rounded-full bg-pink-400 opacity-100 blur-3xl animate-bubbleUpDown" />
        <div className="absolute left-[65vw] top-[130vh] w-[90px] h-[90px] rounded-full bg-pink-300 opacity-100 blur-2xl animate-bubbleLeftRight" />
        <div className="absolute left-[35vw] top-[150vh] w-[130px] h-[130px] rounded-full bg-pink-500 opacity-100 blur-2xl animate-bubbleScale" />
        <div className="absolute left-[80vw] top-[140vh] w-[70px] h-[70px] rounded-full bg-pink-300 opacity-100 blur-xl animate-bubbleUpDownSlow" />
        <div className="absolute left-[25vw] top-[180vh] w-[100px] h-[100px] rounded-full bg-pink-400 opacity-100 blur-2xl animate-bubbleScale" />
      </div>
    </>
  );
}
