"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Helper untuk tanggal format dd-mm-yyyy
function getTodayDdMmYyyy() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(now.getDate())}-${pad(
    now.getMonth() + 1
  )}-${now.getFullYear()}`;
}

// Helper untuk waktu format HH:MM:SS
function getCurrentTime() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
    now.getSeconds()
  )}`;
}

// Deteksi device dan browser
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function isAndroidChrome() {
  return (
    /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent)
  );
}

export default function NotaPage() {
  const router = useRouter();
  const [notaData, setNotaData] = useState({
    products: [],
    tax: 0,
    subtotal: 0,
    total: 0,
  });
  const [isClient, setIsClient] = useState(false);
  const [kasirUsername, setKasirUsername] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Memoized calculation untuk performa yang lebih baik
  const calculations = useCallback(() => {
    const products = notaData.products || [];
    const tax = notaData.tax || 0;
    const subtotal =
      notaData.subtotal ||
      products.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      );
    const totalPrice = notaData.total || subtotal + tax;

    return { products, tax, subtotal, totalPrice };
  }, [notaData]);

  const { products, tax, subtotal, totalPrice } = calculations();

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(getCurrentTime());
    setIsMobile(isMobileDevice());

    // Override favicon dan meta tags untuk print tanpa menggunakan Head component
    const overrideFavicon = () => {
      try {
        // Remove existing favicons
        const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
        existingFavicons.forEach((favicon) => {
          if (favicon.parentNode) {
            favicon.parentNode.removeChild(favicon);
          }
        });

        // Add empty favicon untuk print
        const emptyFavicon = document.createElement("link");
        emptyFavicon.rel = "icon";
        emptyFavicon.href = "data:,";
        document.head.appendChild(emptyFavicon);

        // Set document title
        document.title = "Nota Pembayaran - Warung pangkep 79";

        // Add meta untuk mobile
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          viewportMeta = document.createElement("meta");
          viewportMeta.name = "viewport";
          viewportMeta.content =
            "width=device-width, initial-scale=1.0, user-scalable=yes";
          document.head.appendChild(viewportMeta);
        }
      } catch (error) {
        console.warn("Could not override favicon:", error);
      }
    };

    overrideFavicon();

    try {
      // Ambil data nota dari localStorage dengan error handling
      const storedNotaData = localStorage.getItem("notaProducts");
      if (storedNotaData) {
        const data = JSON.parse(storedNotaData);
        setNotaData(data);
      }

      // Ambil username kasir yang sedang login
      const storedKasirData = localStorage.getItem("kasir");
      if (storedKasirData) {
        const kasirData = JSON.parse(storedKasirData);
        setKasirUsername(kasirData.username || "Unknown");
      } else {
        setKasirUsername("Unknown");
      }
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      router.push("/");
    }
  }, [router]);

  // Redirect jika tidak ada produk
  useEffect(() => {
    if (isClient && products.length === 0) {
      router.push("/");
    }
  }, [products.length, router, isClient]);

  // Function untuk menghilangkan Next.js logo tapi TIDAK logo toko
  const hideNextJsLogosOnly = useCallback(() => {
    try {
      // Hide semua favicon dan icon Next.js
      const nextjsFavicons = document.querySelectorAll(
        [
          'link[rel="icon"][href*="next"]',
          'link[rel="shortcut icon"][href*="next"]',
          'link[rel="apple-touch-icon"][href*="next"]',
          'meta[name="msapplication-TileImage"][content*="next"]',
        ].join(",")
      );

      nextjsFavicons.forEach((icon) => {
        if (icon && icon.style) {
          icon.style.setProperty("display", "none", "important");
          icon.disabled = true;
        }
      });

      // Hide semua gambar Next.js tapi TIDAK logo toko
      const allImages = document.querySelectorAll("img, svg");
      allImages.forEach((img) => {
        const src = img.src || img.getAttribute("src") || "";
        const alt = img.alt || img.getAttribute("alt") || "";
        const className = img.className || "";

        // HANYA hide logo Next.js, TIDAK logo toko
        if (
          (src.includes("next") && !src.includes("logo-W.png")) ||
          src.includes("vercel") ||
          (src.includes("favicon") && !src.includes("logo-W.png")) ||
          (alt.toLowerCase().includes("next") &&
            !alt.toLowerCase().includes("logo toko")) ||
          (className.includes("next") && !className.includes("logo-toko"))
        ) {
          if (img.style) {
            img.style.setProperty("display", "none", "important");
            img.style.setProperty("visibility", "hidden", "important");
            img.style.setProperty("opacity", "0", "important");
          }
        }
      });

      // Hide Next.js development overlays
      const overlays = document.querySelectorAll(
        [
          "[data-nextjs-dialog-overlay]",
          "[data-nextjs-toast]",
          "[data-nextjs-scroll-focus-boundary]",
          "nextjs-portal",
          "#__next-build-watcher",
          '[class*="nextjs"]:not(.logo-toko)',
          '[id*="nextjs"]',
        ].join(",")
      );

      overlays.forEach((overlay) => {
        if (overlay && overlay.style) {
          overlay.style.setProperty("display", "none", "important");
          overlay.style.setProperty("visibility", "hidden", "important");
        }
      });
    } catch (error) {
      console.warn("Error hiding Next.js logos:", error);
    }
  }, []);

  // Print function - FIXED REMOVE TOP SPACING & PREVENT PAGE BREAKS
  const handlePrint = useCallback(() => {
    setIsPrintMode(true);

    // Hide Next.js logos tapi tidak logo toko
    hideNextJsLogosOnly();

    if (isAndroidChrome()) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const originalViewport = viewportMeta ? viewportMeta.content : "";

      if (viewportMeta) {
        viewportMeta.content =
          "width=device-width, initial-scale=1.0, user-scalable=no";
      }

      // CSS FIXED - REMOVE TOP SPACING & PREVENT PAGE BREAKS
      const printStyle = document.createElement("style");
      printStyle.id = "print-with-logo-style";
      printStyle.innerHTML = `
        @media screen {
          /* Hide Next.js development elements */
          [data-nextjs-dialog-overlay],
          [data-nextjs-toast],
          [data-nextjs-scroll-focus-boundary],
          .nextjs-portal,
          #__next-build-watcher,
          [class*="nextjs"]:not(.logo-toko),
          [id*="nextjs"],
          img[src*="next"]:not([src*="logo-W.png"]) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          
          @page {
            margin: 0 !important;
            size: auto !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            background: white !important;
            color: #000000 !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: optimizeLegibility !important;
            font-weight: 500 !important;
          }
          
          /* LOGO TOKO FULL WIDTH PRINT - PERFECT CENTER & FULL WIDTH */
          .logo-toko,
          img[src*="logo-W.png"] {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 58mm !important;
            height: auto !important;
            max-width: 58mm !important;
            min-width: 58mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            object-fit: contain !important;
            object-position: center !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
            position: relative !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
          
          /* REMOVE TOP SPACING - START FROM TOP */
          body * {
            visibility: hidden !important;
          }
          
          .receipt-container,
          .receipt-container * {
            visibility: visible !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          
          .receipt-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            padding: 4mm !important;
            width: 58mm !important;
            max-width: 58mm !important;
            background: white !important;
            color: #000000 !important;
            font-size: 16px !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
            line-height: 1.3 !important;
            letter-spacing: 0.3px !important;
          }
          
          .receipt-header {
            text-align: center !important;
            margin: 0 0 3mm 0 !important;
            padding: 0 !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 600 !important;
            color: #000000 !important;
            width: 100% !important;
            position: relative !important;
            font-size: 15px !important;
          }
          
          .receipt-info, .receipt-products, .receipt-totals {
            font-size: 15px !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
            margin-bottom: 3mm !important;
            line-height: 1.3 !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }
          
          .receipt-product-name {
            font-size: 16px !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 600 !important;
            margin-bottom: 2mm !important;
            word-wrap: break-word !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
            text-transform: uppercase !important;
          }
          
          .receipt-product-detail {
            font-size: 14px !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
            margin-bottom: 3mm !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }
          
          .receipt-total-final {
            font-size: 18px !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #000000 !important;
            letter-spacing: 0.4px !important;
            padding: 3mm 0 !important;
            border-top: 3px solid #000000 !important;
            border-bottom: 3px solid #000000 !important;
            margin: 3mm 0 !important;
          }
          
          .receipt-footer {
            text-align: center !important;
            font-size: 13px !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
            margin-top: 4mm !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }
          
          .dashed-line {
            border-top: 2px dashed #000000 !important;
            margin: 3mm 0 !important;
            width: 100% !important;
            opacity: 1 !important;
          }
          
          .double-line {
            border-top: 3px double #000000 !important;
            margin: 3mm 0 !important;
            width: 100% !important;
            opacity: 1 !important;
          }
          
          .solid-line {
            border-top: 2px solid #000000 !important;
            margin: 3mm 0 !important;
            width: 100% !important;
            opacity: 1 !important;
          }
          
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          .text-left { 
            text-align: left !important; 
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          .text-center { 
            text-align: center !important; 
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          .text-right { 
            text-align: right !important; 
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          .flex { display: flex !important; }
          .justify-between { justify-content: space-between !important; }
          .font-bold { 
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 600 !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }
          .font-black { 
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 700 !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }
          
          span, div, p, h1, h2, h3, h4, h5, h6 {
            color: #000000 !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          
          /* Hide hanya Next.js related images, bukan logo toko */
          img[src*="next"]:not([src*="logo-W.png"]),
          img[src*="vercel"],
          img[src*="favicon"]:not([src*="logo-W.png"]) {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `;

      try {
        document.head.appendChild(printStyle);
        document.body.classList.add("print-mode");
      } catch (e) {
        console.warn("Could not add print style:", e);
      }

      // Multiple attempts untuk hide Next.js logo (tapi tidak logo toko)
      const hideAttempts = [0, 100, 200, 300, 500, 700, 1000];
      hideAttempts.forEach((delay) => {
        setTimeout(() => hideNextJsLogosOnly(), delay);
      });

      // Print dengan delay
      setTimeout(() => {
        const originalTitle = document.title;
        document.title = "Nota Pembayaran - Warung pangkep 79";

        window.print();

        // Restore title
        setTimeout(() => {
          document.title = originalTitle;
        }, 1000);

        // Cleanup
        setTimeout(() => {
          try {
            document.body.classList.remove("print-mode");
            setIsPrintMode(false);

            const styleElement = document.getElementById(
              "print-with-logo-style"
            );
            if (styleElement && styleElement.parentNode) {
              styleElement.parentNode.removeChild(styleElement);
            }

            if (viewportMeta && originalViewport) {
              viewportMeta.content = originalViewport;
            }
          } catch (e) {
            console.warn("Cleanup error:", e);
            setIsPrintMode(false);
          }
        }, 3000);
      }, 1200);
    } else {
      // Desktop print
      setTimeout(() => {
        hideNextJsLogosOnly();

        const originalTitle = document.title;
        document.title = "Nota Pembayaran - Warung pangkep 79";

        window.print();

        setTimeout(() => {
          document.title = originalTitle;
          setIsPrintMode(false);
        }, 1000);
      }, 500);
    }
  }, [hideNextJsLogosOnly]);

  // Handle logo error
  const handleLogoError = useCallback((e) => {
    console.warn("Logo tidak dapat dimuat:", e.target.src);
    setLogoError(true);
    e.target.style.display = "none";
  }, []);

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Memuat nota...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-lg text-gray-600 mb-4">Tidak ada data nota</p>
          <button
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CSS dengan FONT ROBOTO CONDENSED yang lebih tipis dan FONT BESAR - YOUR FIXED CODE */}
      <style jsx global>{`
        /* Import Google Font Roboto Condensed */
        @import url("https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;600;700&display=swap");

        /* Hide hanya Next.js logos di development mode */
        img[src*="next"]:not([src*="logo-W.png"]),
        img[src*="vercel"],
        img[src*="favicon"]:not([src*="logo-W.png"]),
        img[alt*="Next"]:not([alt*="Logo Toko"]),
        svg[aria-label*="Next"],
        link[rel*="icon"][href*="next"],
        [data-nextjs-dialog-overlay],
        [data-nextjs-toast],
        [data-nextjs-scroll-focus-boundary],
        .nextjs-portal,
        #__next-build-watcher,
        [class*="nextjs"]:not(.logo-toko),
        [id*="nextjs"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        @page {
          margin: 0 !important;
          size: 58mm auto !important;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            background: white !important;
            color: #000000 !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: optimizeLegibility !important;
            font-weight: 500 !important;
          }

          /* Sembunyikan SEMUA elemen kecuali nota */
          body * {
            visibility: hidden !important;
          }

          .receipt-container,
          .receipt-container * {
            visibility: visible !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
          }

          /* LOGO TOKO FULL WIDTH PRINT - PERFECT CENTER & FULL WIDTH */
          .logo-toko,
          img[src*="logo-W.png"] {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 58mm !important;
            height: auto !important;
            max-width: 58mm !important;
            min-width: 58mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            object-fit: contain !important;
            object-position: center !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
            position: relative !important;
            left: 40% !important;
            transform: translateX(-50%) !important;
          }

          /* Hide hanya Next.js related images */
          img[src*="next"]:not([src*="logo-W.png"]),
          img[src*="vercel"],
          img[src*="favicon"]:not([src*="logo-W.png"]) {
            display: none !important;
            visibility: hidden !important;
          }

          .receipt-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            width: 70mm !important;
            max-width: 70mm !important;
            margin: 0 !important;
            padding: 0mm !important;
            background: white !important;
            color: #000000 !important;
            font-size: 16px !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
            line-height: 1.3 !important;
            letter-spacing: 0.3px !important;
          }

          .receipt-header {
            text-align: center !important;
            font-size: 15px !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 600 !important;
            margin: 0 0 3mm 0 !important;
            padding: 0 !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
            width: 100% !important;
            position: relative !important;
          }

          .receipt-info,
          .receipt-products,
          .receipt-totals {
            font-size: 15px !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
            margin-bottom: 3mm !important;
            line-height: 1.3 !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }

          .receipt-product-name {
            font-size: 16px !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 600 !important;
            margin-bottom: 2mm !important;
            word-wrap: break-word !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
            text-transform: uppercase !important;
          }

          .receipt-product-detail {
            font-size: 14px !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
            margin-bottom: 3mm !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }

          .receipt-total-final {
            font-size: 18px !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #000000 !important;
            letter-spacing: 0.4px !important;
            padding: 3mm 0 !important;
            border-top: 3px solid #000000 !important;
            border-bottom: 3px solid #000000 !important;
            margin: 3mm 0 !important;
          }

          .receipt-footer {
            text-align: center !important;
            font-size: 13px !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
            margin-top: 4mm !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }

          .dashed-line {
            border-top: 2px dashed #000000 !important;
            margin: 3mm 0 !important;
            width: 100% !important;
            opacity: 1 !important;
          }

          .double-line {
            border-top: 3px double #000000 !important;
            margin: 3mm 0 !important;
            width: 100% !important;
            opacity: 1 !important;
          }

          .solid-line {
            border-top: 2px solid #000000 !important;
            margin: 3mm 0 !important;
            width: 100% !important;
            opacity: 1 !important;
          }

          .no-print {
            display: none !important;
            visibility: hidden !important;
          }

          .text-left {
            text-align: left !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          .text-center {
            text-align: center !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          .text-right {
            text-align: right !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          .flex {
            display: flex !important;
          }
          .justify-between {
            justify-content: space-between !important;
          }
          .font-bold {
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 600 !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }
          .font-black {
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 700 !important;
            color: #000000 !important;
            letter-spacing: 0.3px !important;
          }

          /* Enhanced contrast untuk thermal printer dengan FONT ROBOTO CONDENSED */
          span,
          div,
          p,
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: #000000 !important;
            font-family: "Roboto Condensed", "Arial Narrow",
              "Helvetica Condensed", Arial, sans-serif !important;
            font-weight: 500 !important;
          }
        }

        /* SCREEN STYLES - FONT ROBOTO CONDENSED yang lebih tipis dan FONT BESAR */
        .receipt-container {
          font-family: "Roboto Condensed", "Arial Narrow", "Helvetica Condensed",
            Arial, sans-serif;
          max-width: ${isMobile ? "100%" : "260px"};
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }

        .receipt-container * {
          font-family: "Roboto Condensed", "Arial Narrow", "Helvetica Condensed",
            Arial, sans-serif !important;
          font-weight: 500 !important;
        }

        /* LOGO TOKO FULL WIDTH PREVIEW - PERFECT CENTER & FULL WIDTH */
        .logo-toko {
          width: 100% !important;
          height: auto !important;
          max-width: none !important;
          margin: 0 auto !important;
          padding: 0 !important;
          object-fit: contain !important;
          object-position: center !important;
          display: block !important;
          position: relative !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
        }

        .receipt-header {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .receipt-header .leading-tight {
          margin-top: 10px !important;
          padding: 0 ${isMobile ? "6px" : "6px"} !important;
        }

        .dashed-line {
          border-top: 1px dashed #333;
          margin: 10px 0;
        }

        .double-line {
          border-top: 2px solid #333;
          margin: 10px 0;
        }

        .solid-line {
          border-top: 1px solid #333;
          margin: 10px 0;
        }

        ${isMobile
          ? `
          .receipt-container {
            font-size: 16px !important;
            padding: 8px !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
          }
          
          .mobile-button {
            padding: 14px !important;
            font-size: 18px !important;
            touch-action: manipulation !important;
            min-height: 52px !important;
          }
        `
          : `
          .receipt-container {
            font-size: 15px !important;
            padding: 6px !important;
            font-family: 'Roboto Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif !important;
            font-weight: 500 !important;
          }
        `}
      `}</style>

      {/* DEFAULT BACKGROUND - NO WRAPPER */}
      <div className={isMobile ? "p-0.5" : "py-0.5"}>
        {/* Tombol Print - no container wrapper */}
        <div
          className={`max-w-md mx-auto mb-4 no-print ${isMobile ? "px-2" : ""}`}
        >
          <button
            onClick={handlePrint}
            disabled={isPrintMode}
            className={`w-full bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              isMobile ? "py-4 text-lg" : "py-3 text-base"
            }`}
            style={{
              fontFamily:
                "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
            }}
          >
            {isPrintMode ? "🔄 Memproses Print..." : "🖨️ PRINT NOTA (58mm)"}
          </button>
        </div>

        {/* Container Nota - FONT ROBOTO CONDENSED yang lebih tipis dan FONT BESAR */}
        <div
          className={`receipt-container mx-auto bg-white shadow-lg rounded-lg ${
            isMobile ? "p-2" : "p-2"
          }`}
        >
          {/* Header DENGAN Logo Toko FULL WIDTH PERFECT CENTER */}
          <div className="text-center receipt-header">
            {/* Logo Toko FULL WIDTH - PERFECT CENTER */}
            {!logoError && (
              <img
                src="/uploads/logo-W.png"
                alt="Logo Toko"
                className="logo-toko"
                onError={handleLogoError}
                onLoad={() =>
                  console.log(
                    "Logo berhasil dimuat dari:",
                    "/uploads/logo-W.png"
                  )
                }
              />
            )}

            <div
              className={`leading-tight font-bold ${
                isMobile ? "text-base" : "text-sm"
              }`}
              style={{
                fontFamily:
                  "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
              }}
            >
              <div
                className={`${
                  isMobile ? "text-sm" : "text-xs"
                } mt-2 text-black font-bold`}
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                Jl. Perintis Kemerdekaan No.km
                <br />
                RW.12, Tamalanrea
                <br />
                Kota Makassar
              </div>
            </div>
          </div>

          <div className="solid-line"></div>

          {/* Receipt Info - FONT BESAR */}
          <div className={`receipt-info ${isMobile ? "text-lg" : "text-base"}`}>
            <div className="flex justify-between mb-2">
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                Tanggal:
              </span>
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                {getTodayDdMmYyyy()}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                Kasir:
              </span>
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                {kasirUsername}
              </span>
            </div>
            {/* Tambahkan baris ini di bawah kasir untuk jenis pembayaran */}
            <div className="flex justify-between">
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                Pembayaran:
              </span>
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                {notaData.paymentMethod === "qris" ? "QRIS" : "Tunai"}
              </span>
            </div>
          </div>

          <div className="dashed-line"></div>

          {/* Products - FONT BESAR */}
          <div className="receipt-products">
            {products.map((product, index) => (
              <div key={index} className="mb-3">
                <div
                  className={`receipt-product-name font-bold ${
                    isMobile ? "text-base" : "text-sm"
                  }`}
                  style={{
                    fontFamily:
                      "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                  }}
                >
                  {product.name || "Produk Tidak Dikenal"}
                </div>
                <div
                  className={`receipt-product-detail flex justify-between ${
                    isMobile ? "text-base" : "text-sm"
                  }`}
                >
                  <span
                    className="font-bold"
                    style={{
                      fontFamily:
                        "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                    }}
                  >
                    {product.quantity || 0} x Rp
                    {(product.price || 0).toLocaleString("id-ID")}
                  </span>
                  <span
                    className="font-bold"
                    style={{
                      fontFamily:
                        "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                    }}
                  >
                    Rp
                    {(
                      (product.price || 0) * (product.quantity || 0)
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="dashed-line"></div>

          {/* Totals - FONT BESAR */}
          <div
            className={`receipt-totals space-y-2 ${
              isMobile ? "text-base" : "text-sm"
            }`}
          >
            <div className="flex justify-between">
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                Subtotal:
              </span>
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                Rp{subtotal.toLocaleString("id-ID")}
              </span>
            </div>

            {tax > 0 && (
              <div className="flex justify-between">
                <span
                  className="font-bold"
                  style={{
                    fontFamily:
                      "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                  }}
                >
                  Pajak (10%):
                </span>
                <span
                  className="font-bold"
                  style={{
                    fontFamily:
                      "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                  }}
                >
                  Rp{tax.toLocaleString("id-ID")}
                </span>
              </div>
            )}

            <div className="double-line"></div>

            <div
              className={`receipt-total-final flex justify-between ${
                isMobile ? "text-lg" : "text-base"
              }`}
            >
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                TOTAL:
              </span>
              <span
                className="font-bold"
                style={{
                  fontFamily:
                    "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
                }}
              >
                Rp{totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="solid-line"></div>

          {/* Footer - FONT BESAR */}
          <div
            className={`receipt-footer ${isMobile ? "text-base" : "text-sm"}`}
          >
            <div
              className="font-bold"
              style={{
                fontFamily:
                  "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
              }}
            >
              Terima kasih atas kunjungan Anda!
            </div>

            <div
              className={`mt-3 ${isMobile ? "text-sm" : "text-xs"} font-bold`}
              style={{
                fontFamily:
                  "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
              }}
            >
              === STRUK PEMBAYARAN ===
            </div>
          </div>
        </div>

        {/* Tombol Kembali ke Dashboard - no container wrapper */}
        <div
          className={`max-w-md mx-auto mt-4 no-print ${isMobile ? "px-2" : ""}`}
        >
          <button
            onClick={handleBackToDashboard}
            disabled={isPrintMode}
            className={`w-full bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-bold disabled:opacity-50 shadow-lg ${
              isMobile ? "py-4 text-lg" : "py-3 text-base"
            }`}
            style={{
              fontFamily:
                "Roboto Condensed, Arial Narrow, Helvetica Condensed, Arial, sans-serif",
            }}
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
