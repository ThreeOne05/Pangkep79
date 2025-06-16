"use client";
import { useState } from "react";

export default function KaryawanForm({ onClose, onSubmit }) {
  const [nama, setNama] = useState("");
  const [isKasir, setIsKasir] = useState(false);
  const [kasirUsername, setKasirUsername] = useState("");
  const [kasirPassword, setKasirPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama) return alert("Nama wajib diisi");
    if (isKasir && (!kasirUsername || !kasirPassword)) {
      return alert("Username dan password kasir wajib diisi");
    }

    try {
      const res = await fetch("/api/karyawan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          kasir: isKasir
            ? { username: kasirUsername, password: kasirPassword }
            : undefined,
        }),
      });
      if (res.ok) {
        const karyawanBaru = await res.json();
        onSubmit(karyawanBaru);
        onClose();
      } else {
        alert("Gagal menambah karyawan");
      }
    } catch {
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-2">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 relative border-2 border-blue-100 animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold transition"
          onClick={onClose}
          aria-label="Tutup"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-center text-blue-700 mb-4">
          Tambah Karyawan
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <div>
            <label className="block text-xs font-bold mb-1 text-blue-800">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
              required
              autoFocus
              placeholder="Nama karyawan"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-800 mb-2">
              Apakah karyawan ini kasir?
            </label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={isKasir}
                  onChange={() => setIsKasir(true)}
                  className="mr-1"
                />
                Ya
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!isKasir}
                  onChange={() => setIsKasir(false)}
                  className="mr-1"
                />
                Tidak
              </label>
            </div>
          </div>
          {isKasir && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-bold mb-1 text-blue-800">
                  Username Kasir
                </label>
                <input
                  type="text"
                  value={kasirUsername}
                  onChange={(e) => setKasirUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
                  required={isKasir}
                  placeholder="Username kasir"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-blue-800">
                  Password Kasir
                </label>
                <input
                  type="password"
                  value={kasirPassword}
                  onChange={(e) => setKasirPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
                  required={isKasir}
                  placeholder="Password kasir"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-600 px-3 py-1.5 text-xs rounded-lg hover:bg-gray-200 font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white px-4 py-1.5 text-xs rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition active:scale-95"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
