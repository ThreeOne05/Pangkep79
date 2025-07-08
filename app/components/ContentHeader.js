import {
  PlusIcon,
  ArrowsUpDownIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

export function ContentHeader({
  title,
  onAdd,
  onToggleDelete,
  isDeleteMode,
  isReorderMode,
  onToggleReorder,
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        title="Tambah Produk"
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow transition flex items-center"
        onClick={onAdd}
      >
        <PlusIcon className="w-5 h-5" />
      </button>
      <button
        title="Hapus Produk"
        className={`${
          isDeleteMode ? "bg-red-600" : "bg-red-400 hover:bg-red-500"
        } text-white rounded-full p-2 shadow transition flex items-center`}
        onClick={onToggleDelete}
      >
        <TrashIcon className="w-5 h-5" />
      </button>
      <button
        title="Urutkan Produk"
        className={`
          flex items-center px-4 py-2 rounded-full font-semibold shadow transition-all
          border-2
          ${
            isReorderMode
              ? "border-blue-500 bg-blue-50 text-blue-700 scale-105 ring-2 ring-blue-200"
              : "border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-600"
          }
        `}
        style={{
          fontWeight: isReorderMode ? "bold" : "normal",
          boxShadow: isReorderMode ? "0 2px 8px 0 #3b82f61a" : "",
        }}
        onClick={onToggleReorder}
      >
        <ArrowsUpDownIcon className={`w-5 h-5 mr-2 ${isReorderMode}`} />
        {isReorderMode ? "Aktif" : "Urutkan"}
      </button>
      <style jsx global>{`
        @keyframes bounce-short {
          0%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(2px);
          }
        }
        .animate-bounce-short {
          animation: bounce-short 0.7s infinite;
        }
      `}</style>
    </div>
  );
}
