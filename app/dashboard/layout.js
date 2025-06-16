import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton"; // Pastikan path sesuai struktur project Anda

export default function DashboardLayout({ children }) {
  const navLinks = [
    { name: "HomePage", path: "/dashboard" },
    { name: "Pemasukan", path: "/dashboard/pemasukan" },
    { name: "Analisis", path: "/dashboard/analisis" },
    { name: "Karyawan", path: "/dashboard/karyawan" },
  ];

  return (
    <div>
      <nav className="flex justify-between items-center px-9 py-5 bg-blue-50 text-black mx-8 rounded-b-4xl">
        <ul className="flex space-x-4">
          {navLinks.map((link, index) => (
            <li key={index}>
              <Link href={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>
        <LogoutButton />
      </nav>

      <main>{children}</main>
    </div>
  );
}
