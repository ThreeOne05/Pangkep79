"use client";
import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Cek status awal
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    // Observe perubahan class
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
