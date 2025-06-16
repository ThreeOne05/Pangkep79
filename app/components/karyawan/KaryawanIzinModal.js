"use client";
import { useState } from "react";

const TIPE = [
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin Tidak Masuk" },
  { value: "libur", label: "Minta Libur (maks 2 hari)" },
];

export default function KaryawanIzinModal({ karyawan, onClose, onSubmit }) {
  const [tipeIzin, setTipeIzin] = useState("sakit");
  const [tanggal, setTanggal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

  // Hitung sisa libur bulan ini (maks 2 hari)
  const bulanIni = new Date().toISOString().slice(0, 7);
  const izinLiburBulanIni = (karyawan.izin || [])
    .filter(
      (izin) =>
        izin.tipe === "libur" &&
        izin.tanggal &&
        izin.tanggal.startsWith(bulanIni)
    )
    .reduce((acc, izin) => {
      if (izin.tanggalAkhir) {
        let curr = new Date(izin.tanggal);
        const end = new Date(izin.tanggalAkhir);
        while (curr <= end) {
          acc.push(curr.toISOString().slice(0, 10));
          curr.setDate(curr.getDate() + 1);
        }
      } else if (izin.tanggal) {
        acc.push(izin.tanggal);
      }
      return acc;
    }, []);
  const sisaLibur = 2 - izinLiburBulanIni.length;

  function handleSubmit(e) {
    e.preventDefault();
    if (tipeIzin === "libur") {
      if (!tanggal || !tanggalAkhir) {
        alert("Tanggal mulai dan selesai wajib diisi!");
        return;
      }
      if (tanggalAkhir < tanggal) {
        alert("Tanggal akhir tidak boleh sebelum tanggal mulai!");
        return;
      }
      if (
        tanggal.slice(0, 7) !== bulanIni ||
        tanggalAkhir.slice(0, 7) !== bulanIni
      ) {
        alert("Libur hanya bisa untuk bulan berjalan!");
        return;
      }
      // Jumlah hari libur
      const start = new Date(tanggal);
      const end = new Date(tanggalAkhir);
      const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
      if (diff > sisaLibur) {
        alert(`Sisa jatah libur hanya ${sisaLibur} hari bulan ini.`);
        return;
      }
      // Cek overlap
      let curr = new Date(tanggal);
      let overlap = false;
      while (curr <= end) {
        if (izinLiburBulanIni.includes(curr.toISOString().slice(0, 10))) {
          overlap = true;
          break;
        }
        curr.setDate(curr.getDate() + 1);
      }
      if (overlap) {
        alert("Ada tanggal yang sudah diajukan libur sebelumnya di bulan ini.");
        return;
      }
      onSubmit({ tipe: tipeIzin, tanggal, tanggalAkhir });
    } else {
      if (!tanggal) {
        alert("Tanggal wajib diisi!");
        return;
      }
      onSubmit({ tipe: tipeIzin, tanggal });
    }
    setTipeIzin("sakit");
    setTanggal("");
    setTanggalAkhir("");
    onClose();
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
          Ajukan Izin{" "}
          <span className="block text-xs font-normal text-gray-700 mt-1">
            ({karyawan.nama})
          </span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-black">
          <div>
            <label className="block text-xs font-bold mb-1 text-blue-800">
              Tipe Izin
            </label>
            <select
              className="w-full border border-blue-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
              value={tipeIzin}
              onChange={(e) => {
                setTipeIzin(e.target.value);
                setTanggal("");
                setTanggalAkhir("");
              }}
            >
              {TIPE.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {tipeIzin === "libur" ? (
            <>
              <div>
                <label className="block text-xs font-bold mb-1 text-blue-800">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={tanggal}
                  min={bulanIni + "-01"}
                  max={bulanIni + "-31"}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-blue-800">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={tanggalAkhir}
                  min={tanggal || bulanIni + "-01"}
                  max={bulanIni + "-31"}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
                  required
                  disabled={sisaLibur === 1}
                />
                {sisaLibur === 1 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Sisa 1 hari libur, hanya bisa pilih 1 tanggal saja
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Sisa jatah libur bulan ini:{" "}
                <span
                  className={
                    sisaLibur === 0 ? "text-red-500" : "text-green-600"
                  }
                >
                  {sisaLibur} hari
                </span>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold mb-1 text-blue-800">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
                required
              />
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
              Ajukan
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
