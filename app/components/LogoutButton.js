"use client";
import { useRouter } from "next/navigation";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(null);

  useEffect(() => {
    const getTheme = () => {
      const stored = localStorage.getItem("theme");
      if (stored) setDarkMode(stored === "dark");
      else
        setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    getTheme();
    const observer = () => getTheme();
    window.addEventListener("storage", observer);
    return () => window.removeEventListener("storage", observer);
  }, []);

  if (darkMode === null) return null;
  const baseClass =
    "p-1 rounded-full transition-colors duration-300 shadow mr-5 z-50";
  const themeClass = darkMode
    ? "bg-pink-200 text-purple-700 hover:bg-pink-300"
    : "bg-purple-700 text-pink-200 hover:bg-purple-800";

  return (
    <button
      onClick={() => {
        localStorage.removeItem("kasir");
        router.replace("/");
      }}
      className={`${baseClass} ${themeClass}`}
      title="Logout"
      type="button"
    >
      <ArrowUturnLeftIcon className="h-5 w-5" />
    </button>
  );
}
