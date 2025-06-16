"use client";
import { Card } from "./card.js";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

export const CardGrid = ({ cards, isDeleteMode, onDelete, onCardClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className={`
        flex flex-wrap justify-center
        ${isMobile ? "gap-1 px-1" : "gap-2 md:gap-3 lg:gap-3 px-1 sm:px-0"}
      `}
    >
      {cards.map((card) => (
        <div key={card.id} className="relative group">
          <Card
            title={card.title}
            description={card.description}
            image={card.image}
            onClick={() => !isDeleteMode && onCardClick(card)}
            isMobile={isMobile} // Pass mobile state to Card
          />
          {isDeleteMode && (
            <button
              onClick={() => onDelete(card.id)}
              className={`
                absolute bg-red-500 text-white rounded-full transition-opacity hover:opacity-80
                ${
                  isMobile
                    ? "top-0 right-0 p-0.5"
                    : "top-0 right-0 sm:-top-2 sm:-right-2 p-1"
                }
              `}
            >
              <XCircleIcon
                className={`
                  ${isMobile ? "w-3 h-3" : "w-4 h-4 sm:w-5 sm:h-5"}
                `}
              />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
