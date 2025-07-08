"use client";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const navLinks = [
    { name: "HomePage", path: "/dashboard" },
    { name: "Pemasukan", path: "/dashboard/pemasukan" },
    { name: "Analisis", path: "/dashboard/analisis" },
    { name: "Karyawan", path: "/dashboard/karyawan" },
  ];

  const pathname = usePathname();
  const navLinksWithActive = navLinks.map((link) => ({
    ...link,
    isActive:
      pathname === link.path ||
      (link.path !== "/dashboard" && pathname.startsWith(link.path)),
  }));

  return (
    <div>
      <nav className="flex justify-between items-center px-9 py-5 bg-blue-50 text-black mx-8 rounded-b-4xl">
        <ul className="flex space-x-4">
          {navLinksWithActive.map((link, index) => (
            <li key={index}>
              {link.isActive ? (
                <div className="active-nav bg-blue-200 rounded px-2 py-1">
                  <Link href={link.path}>{link.name}</Link>
                </div>
              ) : (
                <div>
                  <Link href={link.path}>{link.name}</Link>
                </div>
              )}
            </li>
          ))}
        </ul>
        <LogoutButton />
      </nav>

      <main>{children}</main>
    </div>
  );
}
