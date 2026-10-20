"use client";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ToggleTheme() {
  // Hindari mismatch: mulai dari null, deteksi mode setelah mount
  const [darkMode, setDarkMode] = useState(null);

  useEffect(() => {
    // Cek preferensi localStorage dan OS
    const stored = localStorage.getItem("theme");
    let isDark = false;
    if (stored) {
      isDark = stored === "dark";
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      isDark = true;
    }
    setDarkMode(isDark);
    // Sync class di html
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode !== null) {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
  }, [darkMode]);

  // Jangan render apapun sampai sudah mounted (hindari mismatch)
  if (darkMode === null) return null;

  return (
    <button
      className={
        "fixed top-4 right-11 z-50 rounded-full p-2.5 shadow-lg transition-all duration-300 " +
        (darkMode
          ? "bg-slate-800 text-amber-300 shadow-slate-900/40"
          : "bg-white text-emerald-700 shadow-emerald-200/70")
      }
      onClick={() => setDarkMode((prev) => !prev)}
      aria-label="Toggle theme"
      type="button"
    >
      {darkMode ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
























































































































































































































































































































































































































































































