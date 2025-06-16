"use client";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export const ContentHeader = ({
  title,
  onAdd,
  onToggleDelete,
  isDeleteMode,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2>{title}</h2>
      <div className="flex gap-4">
        <button
          onClick={onAdd}
          className="bg-green-400 text-gray-700 p-1.5 rounded-full"
        >
          <PlusCircleIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleDelete}
          className={`p-1.5 rounded-full ${
            isDeleteMode ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          <XCircleIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
