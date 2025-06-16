"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export function Card({
  title,
  description,
  image,
  onClick,
  isMobile: propIsMobile,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use prop if provided, otherwise detect
  useEffect(() => {
    if (propIsMobile !== undefined) {
      setIsMobile(propIsMobile);
    } else {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }
  }, [propIsMobile]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`
        cursor-pointer transition-all duration-200
        ${
          isMobile
            ? "p-0.5 hover:shadow-md"
            : "p-1 sm:p-1.5 md:p-2 ml-0.5 sm:ml-1 hover:shadow-xl"
        }
      `}
      onClick={onClick}
    >
      <div
        className={`
          rounded-lg overflow-hidden shadow-md bg-white transition-transform hover:scale-105
          ${
            isMobile
              ? "max-w-[70px] w-[70px]"
              : "max-w-xs sm:max-w-[120px] md:max-w-[140px]"
          }
        `}
      >
        {/* Image Section */}
        {image && !imageError ? (
          <div
            className={`
              relative w-full
              ${isMobile ? "h-12" : "h-16 sm:h-14 md:h-18"}
            `}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes={
                isMobile
                  ? "70px"
                  : "(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
              }
              onError={handleImageError}
            />
          </div>
        ) : (
          // Fallback for missing/error images
          <div
            className={`
              w-full bg-gradient-to-br from-purple-200 to-pink-200 
              flex items-center justify-center
              ${isMobile ? "h-12" : "h-16 sm:h-14 md:h-18"}
            `}
          >
            <span
              className={`
                text-purple-600 font-bold
                ${isMobile ? "text-xs" : "text-sm md:text-base"}
              `}
            >
              {title?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}

        {/* Content Section */}
        <div
          className={`
            ${
              isMobile
                ? "px-1 py-0.5"
                : "px-2 py-1 sm:px-2 sm:py-1 md:px-3 md:py-1.5"
            }
          `}
        >
          {/* Title */}
          <div
            className={`
              font-bold text-black truncate
              ${
                isMobile
                  ? "text-[9px] leading-3 mb-0"
                  : "text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1"
              }
            `}
            title={title}
          >
            {title}
          </div>

          {/* Description - Smart Display */}
          {description && (
            <>
              {/* Full description for desktop */}
              {!isMobile && (
                <p
                  className="text-gray-700 text-[10px] sm:text-xs md:text-sm truncate"
                  title={description}
                >
                  {description}
                </p>
              )}

              {/* Price only for mobile */}
              {isMobile && (
                <p
                  className="text-gray-700 text-[8px] leading-3 truncate"
                  title={description}
                >
                  {/* Extract price if exists */}
                  {description.includes("Rp")
                    ? description.match(/Rp[\d.,\s]+/)?.[0]?.trim() ||
                      description.slice(0, 15) + "..."
                    : description.length > 8
                    ? description.slice(0, 8) + "..."
                    : description}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
