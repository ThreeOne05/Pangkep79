"use client";
import Link from "next/link";
import { XCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { menuItems } from "./path";
import useDarkMode from "../hooks/useDarkMode"; // pastikan path benar
import { useState, useEffect } from "react";

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const isDark = useDarkMode();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarBg = isDark
    ? "bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900"
    : "bg-gradient-to-br from-purple-100 via-white to-pink-100";
  const borderStyle = isDark
    ? "border-r-4 border-pink-400/40"
    : "border-r-4 border-purple-400/30";
  const sidebarText = isDark ? "text-pink-100" : "text-purple-800";
  const menuHover = isDark
    ? "hover:bg-pink-800/30 hover:text-white"
    : "hover:bg-purple-200/60 hover:text-pink-700";
  const shadow = isDark ? "shadow-purple-950/40" : "shadow-purple-200/40";

  return (
    <>
      {/* Backdrop untuk mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`
          ${sidebarBg} ${sidebarText} ${borderStyle} ${shadow}
          fixed z-40 flex flex-col
          transition-all duration-500
          ${
            isOpen
              ? "translate-x-0 opacity-100"
              : `${
                  isMobile ? "-translate-x-full" : "-translate-x-[200px]"
                } opacity-0 pointer-events-none`
          }
          shadow-xl
          ${
            isMobile
              ? "top-0 left-0 h-full w-64 rounded-r-xl pl-3 pr-2 py-3 gap-2"
              : "top-20 left-0 h-80 w-48 rounded-r-2xl pl-4 pr-3 py-6 gap-4"
          }
        `}
        style={{
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Brand - Compact */}
        <div className={`${isMobile ? "mb-3" : "mb-6"}`}>
          <div className="flex items-center justify-between">
            <span
              className={`font-bold tracking-tight select-none ${
                isMobile ? "text-sm" : "text-lg"
              }`}
            >
              Menu
            </span>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <XCircleIcon className="w-4 h-4 text-pink-300" />
              </button>
            )}
          </div>
          <div
            className={`h-0.5 mt-1 rounded-full ${isMobile ? "w-6" : "w-8"} ${
              isDark ? "bg-pink-400/80" : "bg-purple-400/60"
            }`}
          />
        </div>

        {/* Menu - Ultra Compact */}
        <ul
          className={`flex flex-col ${
            isMobile ? "gap-1" : "gap-1.5"
          } flex-1 overflow-y-auto`}
        >
          {menuItems.map((item, idx) => (
            <li key={idx}>
              <Link
                href={item.path}
                onClick={isMobile ? toggleSidebar : undefined} // Auto close di mobile
                className={`
                  block rounded-lg font-medium
                  transition-all duration-200 ease-in-out
                  ${menuHover}
                  hover:translate-x-1
                  ${isMobile ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}
                `}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Toggle Button - Desktop Only */}
      {!isMobile && (
        <button
          className={`
            fixed top-20 z-50 left-2 transition-all duration-300
            ${isOpen ? "translate-x-48" : ""}
          `}
          onClick={toggleSidebar}
          aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
          type="button"
        >
          {isOpen ? (
            <XCircleIcon className="w-6 h-6 text-pink-400 bg-white/80 rounded-full shadow hover:scale-110 transition-all" />
          ) : (
            <ArrowRightCircleIcon className="w-6 h-6 text-purple-600 bg-white/80 rounded-full shadow hover:scale-110 transition-all" />
          )}
        </button>
      )}

      {/* Mobile Toggle Button - Small */}
      {isMobile && !isOpen && (
        <button
          className="fixed top-4 left-4 p-2 z-50 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all"
          onClick={toggleSidebar}
          aria-label="Buka menu"
          type="button"
        >
          <ArrowRightCircleIcon className="w-4 h-4" />
        </button>
      )}
    </>
  );
};
