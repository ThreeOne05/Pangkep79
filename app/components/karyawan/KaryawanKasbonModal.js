"use client";
import { useState } from "react";

export default function KaryawanKasbonModal({ karyawan, onClose, onSubmit }) {
  const [jumlah, setJumlah] = useState("");
  const [loading, setLoading] = useState(false);

  function formatRupiah(angka) {
    if (!angka) return "";
    const num = angka.replace(/[^0-9]/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const handleInputChange = (e) => {
    setJumlah(formatRupiah(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = parseInt(jumlah.replace(/\./g, ""), 10);
    if (!value || value < 1) {
      alert("Nominal kasbon harus lebih dari 0");
      return;
    }
    setLoading(true);
    await onSubmit(value);
    setLoading(false);
    setJumlah("");
    onClose();
  };

  // Hitung total kasbon (sum seluruh kasbon jika array, atau angka jika satuan)
  let totalKasbon = 0;
  if (Array.isArray(karyawan.kasbon)) {
    totalKasbon = karyawan.kasbon.reduce(
      (sum, kas) =>
        sum + (typeof kas === "object" && kas.jumlah ? kas.jumlah : 0),
      0
    );
  } else if (typeof karyawan.kasbon === "number") {
    totalKasbon = karyawan.kasbon;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-2">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center relative border-2 border-blue-100 animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold transition"
          onClick={onClose}
          aria-label="Tutup"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-3 text-blue-700">
          Tambah Kasbon{" "}
          <span className="block text-xs font-normal text-gray-700 mt-1">
            ({karyawan.nama})
          </span>
        </h2>
        <div className="text-xs mb-3">
          Total kasbon saat ini:{" "}
          <span className="font-bold text-green-600">
            Rp {totalKasbon.toLocaleString("id-ID")}
          </span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-black">
          <div>
            <label className="block text-xs font-semibold mb-1 text-blue-800">
              Jumlah Kasbon (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={jumlah}
              onChange={handleInputChange}
              min={1}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 bg-blue-50/40 text-right"
              required
              placeholder="Masukkan jumlah (contoh: 1.000.000)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-100 text-gray-600 px-3 py-1.5 text-xs rounded-lg hover:bg-gray-200 font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white px-4 py-1.5 text-xs rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition active:scale-95"
            >
              {loading ? "Menambah..." : "Tambah"}
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
