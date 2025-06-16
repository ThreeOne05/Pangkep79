"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jangan block halaman login (/)
    if (pathname === "/") return;
    // Jika belum login, redirect ke /
    if (typeof window !== "undefined" && !localStorage.getItem("kasir")) {
      router.replace("/");
    }
  }, [router, pathname]);

  return children;
}
