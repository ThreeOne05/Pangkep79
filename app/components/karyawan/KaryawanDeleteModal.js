"use client";

export default function KaryawanDeleteModal({ karyawan, onClose, onConfirm }) {
  const handleDelete = () => {
    onConfirm(karyawan._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-2">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative border-2 border-red-100 animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold transition"
          onClick={onClose}
          aria-label="Tutup"
        >
          &times;
        </button>

        {/* Icon Warning */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-red-700 mb-3">
          Delete
        </h2>

        <p className="text-center font-bold text-blue-900 text-lg mb-6">
          {karyawan.nama}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Hapus
          </button>
        </div>

        <style jsx>{`
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
