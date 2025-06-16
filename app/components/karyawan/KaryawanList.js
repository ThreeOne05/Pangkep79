"use client";
export default function KaryawanList({
  karyawan,
  selectedId,
  onSelect,
  onDelete,
  onDetail,
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 w-1xl">
      {karyawan.map((k) => {
        const isLibur = k.libur && k.libur.includes(today);
        const isSelected = String(selectedId) === String(k._id);

        return (
          <li
            key={k._id}
            className={
              "group relative flex items-center gap-4 bg-white/80 border rounded-2xl shadow hover:shadow-lg p-4 cursor-pointer transition " +
              (isSelected
                ? "border-blue-500 ring-2 ring-blue-300 scale-105"
                : "border-gray-100 hover:border-blue-300")
            }
            onClick={() => onSelect(String(k._id))}
            tabIndex={0}
            role="button"
          >
            {/* Avatar */}
            <span className="bg-blue-100 text-blue-600 rounded-full p-2">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.309 0-10 1.654-10 5v3h20v-3c0-3.346-6.691-5-10-5z" />
              </svg>
            </span>
            <div className="flex-grow">
              <div className="font-bold text-lg text-blue-900">{k.nama}</div>
              <div className="text-1xl text-blue-500 font-semibold mb-1">
                {k.jabatan}
              </div>
              {isLibur && (
                <div className="inline-block bg-pink-100 text-pink-600 px-2 py-0.5 rounded text-xs font-semibold mb-1">
                  Libur Hari Ini
                </div>
              )}
              {/* TOMBOL DETAIL */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetail(String(k._id));
                  }}
                  className="px-3 py-1 rounded-lg text-xs bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
                >
                  Detail
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(k._id);
                  }}
                  className="px-3 py-1 rounded-lg text-xs bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
                  title="Hapus"
                >
                  Hapus
                </button>
              </div>
            </div>
            {isSelected && (
              <div className="absolute inset-0 rounded-2xl ring-4 ring-blue-200 pointer-events-none" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
