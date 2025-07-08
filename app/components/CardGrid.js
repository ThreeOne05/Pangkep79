"use client";
import { Card } from "./card.js";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

/**
 * CardGrid dengan fitur swap on click dan animasi wiggle santai:
 * - Saat mode reorder aktif, klik satu produk, highlight biru.
 * - Klik produk lain, keduanya bertukar tempat, dan panggil onReorder.
 * - Tidak ada drag, tidak ada long press.
 * - Animasi wiggle lembut/santai saat mode reorder aktif.
 */
export const CardGrid = ({
  cards,
  isDeleteMode,
  isReorderActive,
  onDelete,
  onCardClick,
  onReorder,
}) => {
  const [selectedSwapIndex, setSelectedSwapIndex] = useState(null);

  // Reset swap seleksi jika data/mode berubah
  useEffect(() => {
    setSelectedSwapIndex(null);
  }, [cards, isReorderActive]);

  const handleCardClick = (card, idx, e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    if (isDeleteMode) return;

    if (isReorderActive) {
      if (selectedSwapIndex === null) {
        setSelectedSwapIndex(idx);
      } else if (selectedSwapIndex !== idx) {
        // SWAP dua kartu
        const newCards = [...cards];
        const temp = newCards[selectedSwapIndex];
        newCards[selectedSwapIndex] = newCards[idx];
        newCards[idx] = temp;
        setSelectedSwapIndex(null);
        if (onReorder) onReorder(newCards);
      } else {
        // Klik yang sama, batal
        setSelectedSwapIndex(null);
      }
    } else {
      if (onCardClick) onCardClick(card);
    }
  };

  return (
    <div
      className={`
        flex flex-wrap justify-center
        gap-2 relative
      `}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
    >
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={`
            relative group select-none
            transition
            ${isReorderActive ? "wiggle-santai" : ""}
            ${
              isReorderActive && selectedSwapIndex === i
                ? "ring-4 ring-blue-400 bg-blue-50 scale-105 z-10 rounded-full"
                : ""
            }
            ${
              isReorderActive &&
              selectedSwapIndex !== null &&
              selectedSwapIndex !== i
                ? "opacity-80"
                : ""
            }
            ${isReorderActive ? "cursor-pointer" : ""}
          `}
          style={{
            borderRadius: isReorderActive ? "9999px" : "1rem",
            transition: "all 0.17s cubic-bezier(.34,2,.6,1)",
          }}
          onClick={(e) => handleCardClick(card, i, e)}
        >
          <Card
            title={card.title}
            description={card.description}
            image={card.image}
            isMobile={false}
            imageProps={{
              draggable: false,
              onContextMenu: (e) => {
                e.preventDefault();
                return false;
              },
              style: { userSelect: "none", pointerEvents: "none" },
            }}
          />
          {isDeleteMode && (
            <button
              onClick={() => onDelete(card.id)}
              className={`
                absolute bg-red-500 text-white rounded-full transition-opacity hover:opacity-80
                top-0 right-0 p-1
              `}
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {/* Wiggle-santai CSS keyframes */}
      <style jsx global>{`
        @keyframes wiggleSantai {
          0%,
          100% {
            transform: rotate(-1deg);
          }
          30% {
            transform: rotate(1.3deg);
          }
          60% {
            transform: rotate(-0.7deg);
          }
          80% {
            transform: rotate(0.7deg);
          }
        }
        .wiggle-santai {
          animation: wiggleSantai 1.3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
