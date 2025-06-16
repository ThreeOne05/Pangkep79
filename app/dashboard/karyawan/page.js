"use client";
import { useEffect, useState, useRef } from "react";
import KaryawanForm from "@/app/components/karyawan/KaryawanForm";
import KaryawanKasbonModal from "@/app/components/karyawan/KaryawanKasbonModal";
import KaryawanIzinModal from "@/app/components/karyawan/KaryawanIzinModal";
import KaryawanList from "@/app/components/karyawan/KaryawanList";
import {
  UserGroupIcon,
  PlusCircleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

// Helper untuk format tanggal dd-mm-yyyy (untuk data lama, jika perlu)
function formatDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export default function KaryawanPage() {
  const [karyawan, setKaryawan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [kasbonKaryawan, setKasbonKaryawan] = useState(null);
  const [ajukanKaryawan, setAjukanKaryawan] = useState(null);
  const [detailKaryawan, setDetailKaryawan] = useState(null);

  const listRef = useRef(null);

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        const res = await fetch("/api/karyawan");
        if (res.ok) {
          const data = await res.json();
          setKaryawan(data);
        }
      } catch {}
      setIsLoading(false);
    };
    fetchKaryawan();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (listRef.current && !listRef.current.contains(event.target)) {
        setSelected(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAddClick = () => setShowForm(true);
  const handleAddKaryawan = (baru) => setKaryawan((prev) => [baru, ...prev]);

  // Hapus tanpa alert/confirm
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/karyawan/${id}`, { method: "DELETE" });
      if (res.ok) {
        setKaryawan((prev) => prev.filter((k) => String(k._id) !== String(id)));
        if (String(selected) === String(id)) setSelected(null);
      }
      // Tidak ada alert apapun
    } catch {
      // Tidak ada alert apapun
    }
  };

  // Ajukan Izin
  const handleAjukanIzin = async (id, izinBaru) => {
    try {
      const res = await fetch(`/api/karyawan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ajukanIzin", izinBaru }),
      });
      if (res.ok) {
        const updated = await res.json();
        setKaryawan((prev) =>
          prev.map((k) => (String(k._id) === String(updated._id) ? updated : k))
        );
        setAjukanKaryawan(null);
      }
      // Tidak ada alert apapun
    } catch {
      // Tidak ada alert apapun
    }
  };

  const handleTambahKasbon = async (id, jumlah) => {
    try {
      const res = await fetch(`/api/karyawan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tambahKasbon", jumlah }),
      });
      if (res.ok) {
        const updated = await res.json();
        setKaryawan((prev) =>
          prev.map((k) => (String(k._id) === String(updated._id) ? updated : k))
        );
        setKasbonKaryawan(null);
      }
      // Tidak ada alert apapun
    } catch {
      // Tidak ada alert apapun
    }
  };

  const selectedKaryawan =
    karyawan.find((k) => String(k._id) === String(selected)) || null;

  const handleSelect = (id) => {
    setSelected((prev) => (String(prev) === String(id) ? null : String(id)));
  };

  const handleDetail = (id) => {
    const data = karyawan.find((k) => String(k._id) === String(id));
    if (data) setDetailKaryawan(data);
  };

  // MODAL DETAIL -- DAFTAR IZIN & KASBON
  const DetailModal = ({ karyawan, onClose }) => {
    const daftarIzin = Array.isArray(karyawan.izin) ? karyawan.izin : [];
    const daftarKasbon = Array.isArray(karyawan.kasbon) ? karyawan.kasbon : [];

    // Helper untuk warna izin
    function izinColor(tipe) {
      if (tipe === "sakit") return "text-red-600";
      if (tipe === "izin") return "text-blue-700";
      if (tipe === "libur") return "text-green-700";
      return "";
    }

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl border-2 border-blue-100 relative">
          <button
            className="absolute right-3 top-3 text-xl text-gray-400 hover:text-red-500 font-bold transition"
            onClick={onClose}
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-3 text-blue-700 flex items-center gap-2 drop-shadow">
            <UserGroupIcon className="w-7 h-7 text-blue-400" />
            Detail Karyawan
          </h2>
          <div className="space-y-3 text-black">
            <div>
              <b>Nama:</b>{" "}
              <span className="font-semibold">{karyawan.nama}</span>
            </div>
            <div>
              <b>Jabatan:</b>{" "}
              <span className="font-semibold">{karyawan.jabatan}</span>
            </div>
            <div>
              <b>Kasbon:</b>
              <ul className="list-disc pl-5 mt-1">
                {daftarKasbon.length > 0 ? (
                  daftarKasbon.map((kasbon, idx) => (
                    <li key={idx} className="text-xs">
                      <span className="text-green-700 font-semibold">
                        Rp {kasbon.jumlah?.toLocaleString("id-ID") || 0}
                      </span>
                      {" - "}
                      <span className="text-gray-600">
                        {formatDDMMYYYY(kasbon.tanggal)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400">Tidak ada kasbon</li>
                )}
              </ul>
            </div>
            <div>
              <b>Daftar Izin:</b>
              <ul className="list-disc pl-5 mt-1">
                {daftarIzin.length > 0 ? (
                  daftarIzin.map((izin, idx) => (
                    <li
                      key={idx}
                      className={`text-xs font-semibold ${izinColor(
                        izin.tipe
                      )}`}
                    >
                      {izin.tipe === "libur" && izin.tanggalAkhir
                        ? `Minta Libur: ${formatDDMMYYYY(
                            izin.tanggal
                          )} s/d ${formatDDMMYYYY(izin.tanggalAkhir)}`
                        : izin.tipe === "izin"
                        ? `Izin Tidak Masuk: ${formatDDMMYYYY(izin.tanggal)}`
                        : izin.tipe === "sakit"
                        ? `Sakit: ${formatDDMMYYYY(izin.tanggal)}`
                        : `Izin: ${formatDDMMYYYY(izin.tanggal)}`}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400">Tidak ada izin</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <style jsx>{`
          .animate-fadeIn {
            animation: fadeIn 0.18s;
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
  };

  return (
    <div className="min-h-screen py-6 px-2">
      <div className="max-w-7xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-6 w-full">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-full shadow">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
            </span>
            <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">
              Daftar Karyawan
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold shadow transition"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Tambah
            </button>
            <button
              onClick={() =>
                selectedKaryawan && setKasbonKaryawan(selectedKaryawan)
              }
              className={
                "inline-flex items-center gap-1 border border-orange-400 text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow hover:bg-orange-100 transition" +
                (!selectedKaryawan ? " opacity-50 cursor-not-allowed" : "")
              }
              disabled={!selectedKaryawan}
            >
              <BanknotesIcon className="w-4 h-4" /> Kasbon
            </button>
            <button
              onClick={() =>
                selectedKaryawan && setAjukanKaryawan(selectedKaryawan)
              }
              className={
                "inline-flex items-center gap-1 border border-blue-400 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow hover:bg-blue-100 transition" +
                (!selectedKaryawan ? " opacity-50 cursor-not-allowed" : "")
              }
              disabled={!selectedKaryawan}
            >
              <CalendarDaysIcon className="w-4 h-4" /> Ajukan Izin
            </button>
          </div>
        </div>
        {/* LIST */}
        <div ref={listRef}>
          {isLoading ? (
            <div className="text-center py-16 text-gray-400 text-lg animate-pulse">
              Loading data karyawan...
            </div>
          ) : karyawan.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-lg">
              Belum ada karyawan
            </div>
          ) : (
            <KaryawanList
              karyawan={karyawan}
              selectedId={selected}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onDetail={handleDetail}
            />
          )}
        </div>
      </div>
      {showForm && (
        <KaryawanForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddKaryawan}
        />
      )}
      {ajukanKaryawan && (
        <KaryawanIzinModal
          karyawan={ajukanKaryawan}
          onClose={() => setAjukanKaryawan(null)}
          onSubmit={async (izinBaru) =>
            handleAjukanIzin(ajukanKaryawan._id, izinBaru)
          }
        />
      )}
      {kasbonKaryawan && (
        <KaryawanKasbonModal
          karyawan={kasbonKaryawan}
          onClose={() => setKasbonKaryawan(null)}
          onSubmit={async (jumlah) =>
            handleTambahKasbon(kasbonKaryawan._id, jumlah)
          }
        />
      )}
      {detailKaryawan && (
        <DetailModal
          karyawan={detailKaryawan}
          onClose={() => setDetailKaryawan(null)}
        />
      )}
    </div>
  );
}
