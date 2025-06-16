"use client";
import { useRouter } from "next/navigation";
import {
  XCircleIcon,
  ArrowLeftCircleIcon,
  TrashIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/solid";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import useDarkMode from "../hooks/useDarkMode";

export const PaymentSidebar = ({
  isOpen,
  toggleSidebar,
  selectedProducts,
  onRemoveProduct,
  onClearProducts,
}) => {
  const [includeTax, setIncludeTax] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentKasir, setCurrentKasir] = useState(null);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [cashInput, setCashInput] = useState("");
  const isDark = useDarkMode();
  const router = useRouter();

  // Get current kasir from localStorage
  useEffect(() => {
    const kasirData = localStorage.getItem("kasir");
    if (kasirData) {
      try {
        const kasir = JSON.parse(kasirData);
        setCurrentKasir(kasir);
      } catch (error) {
        setCurrentKasir({ username: "ThreeOne05" });
      }
    } else {
      setCurrentKasir({ username: "ThreeOne05" });
    }
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const subtotal = selectedProducts.reduce(
    (sum, product) => sum + (product.price ?? 0) * (product.quantity ?? 1),
    0
  );
  const tax = Math.round(subtotal * 0.1);
  const totalPrice = includeTax ? subtotal + tax : subtotal;

  const toggleTax = () => setIncludeTax(!includeTax);

  // Format number to rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  // Parse rupiah format to number
  const parseRupiah = (rupiahString) => {
    return parseInt(rupiahString.replace(/\./g, "")) || 0;
  };

  // Handle cash input change - Only numbers
  const handleCashInput = (value) => {
    const numericOnly = value.replace(/[^0-9]/g, "");

    if (numericOnly === "") {
      setCashInput("");
      setCashAmount(0);
      return;
    }

    const number = parseInt(numericOnly);
    const formatted = formatRupiah(number);
    setCashInput(formatted);
    setCashAmount(number);
  };

  // Prevent non-numeric input
  const handleKeyDown = (e) => {
    if (
      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      return;
    }
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  // Handle paste event to ensure only numbers
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const numericOnly = paste.replace(/[^0-9]/g, "");
    handleCashInput(numericOnly);
  };

  // Calculate change
  const calculateChange = () => {
    const cash =
      typeof cashAmount === "number" ? cashAmount : parseRupiah(cashAmount);
    return cash - totalPrice;
  };

  // Open cash modal
  const openCashModal = () => {
    setShowCashModal(true);
    setCashInput("");
    setCashAmount(0);
  };

  // Open QRIS modal
  const openQrisModal = () => {
    setShowQrisModal(true);
  };

  // Close cash modal
  const closeCashModal = () => {
    setShowCashModal(false);
    setCashInput("");
    setCashAmount(0);
  };

  // Close QRIS modal
  const closeQrisModal = () => {
    setShowQrisModal(false);
  };

  // Handle cash confirm
  const handleCashConfirm = () => {
    const cash =
      typeof cashAmount === "number" ? cashAmount : parseRupiah(cashAmount);
    if (cash >= totalPrice) {
      setShowCashModal(false);
      handlePayment("cash", cash);
    }
  };

  // Handle QRIS confirm
  const handleQrisConfirm = () => {
    setShowQrisModal(false);
    handlePayment("qris", totalPrice);
  };

  // --- Kirim total, date, paymentMethod ke API ---
  const handlePayment = async (paymentMethod = "cash", paidAmount = null) => {
    if (isProcessing || selectedProducts.length === 0) return;

    try {
      setIsProcessing(true);

      // Waktu Makassar (WITA - UTC+8)
      const now = new Date();
      const makassarTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Makassar" })
      );

      // Format data untuk API dengan waktu Makassar
      const transactionData = {
        items: selectedProducts.map((product) => ({
          name: product.name || "Produk",
          price: product.price || 0,
          quantity: product.quantity || 1,
        })),
        kasir: currentKasir?.username || "ThreeOne05",
        paymentMethod: paymentMethod,
        includeTax: includeTax,
        tax: includeTax ? tax : 0,
        paidAmount: paidAmount || totalPrice,
        change:
          paymentMethod === "cash"
            ? paidAmount
              ? paidAmount - totalPrice
              : 0
            : 0,
        total: totalPrice,
        date: makassarTime.toISOString(),
      };

      // Kirim ke API
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create transaction");
      }

      // Simpan ke localStorage untuk halaman nota
      const notaData = {
        products: selectedProducts,
        subtotal,
        tax: includeTax ? tax : 0,
        includeTax: includeTax,
        total: totalPrice,
        paidAmount: paidAmount || totalPrice,
        change:
          paymentMethod === "cash"
            ? paidAmount
              ? paidAmount - totalPrice
              : 0
            : 0,
        date: makassarTime.toISOString(),
        id: result.transaction.transactionId || result.transaction._id,
        _id: result.transaction._id,
        paymentMethod: paymentMethod,
      };

      const kasirData = {
        username: currentKasir?.username || "ThreeOne05",
      };

      localStorage.setItem("notaProducts", JSON.stringify(notaData));
      localStorage.setItem("kasir", JSON.stringify(kasirData));

      setShowNotif(true);

      if (onClearProducts) onClearProducts();
      setCashAmount(0);
      setCashInput("");

      // Trigger refresh event untuk halaman pemasukan
      window.dispatchEvent(
        new CustomEvent("transactionCreated", {
          detail: {
            transaction: result.transaction,
            makassarTime: makassarTime.toISOString(),
            total: totalPrice,
          },
        })
      );

      setTimeout(() => {
        setShowNotif(false);
        router.push("/nota");
      }, 1500);
    } catch (error) {
      alert("Terjadi kesalahan saat memproses pembayaran: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  // --- END PENTING ---

  const sidebarBg = isDark
    ? "bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900"
    : "bg-gradient-to-br from-purple-100 via-white to-pink-100";
  const borderStyle = isDark
    ? "border-l-4 border-pink-400/40"
    : "border-l-4 border-purple-400/30";
  const sidebarText = isDark ? "text-pink-100" : "text-purple-800";
  const shadow = isDark ? "shadow-purple-950/40" : "shadow-purple-200/40";

  return (
    <>
      {/* Backdrop untuk mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Cash Modal */}
      {showCashModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`bg-white rounded-2xl shadow-2xl ${
              isMobile ? "w-full max-w-sm" : "w-96"
            } p-6`}
          >
            <div className="text-center mb-4">
              <BanknotesIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Input Tunai
              </h3>
              <p className="text-sm text-gray-600">
                Total:{" "}
                <span className="font-semibold text-blue-600">
                  Rp{totalPrice.toLocaleString()}
                </span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Uang Tunai (Hanya Angka)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={cashInput}
                  onChange={(e) => handleCashInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  autoFocus
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                * Hanya dapat menginput angka 0-9
              </p>
            </div>
            {cashAmount > 0 && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  calculateChange() >= 0
                    ? "bg-green-100 border border-green-200"
                    : "bg-red-100 border border-red-200"
                }`}
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {calculateChange() >= 0 ? "Kembalian:" : "Kurang:"}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      calculateChange() >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Rp{Math.abs(calculateChange()).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                totalPrice,
                Math.ceil(totalPrice / 10000) * 10000,
                Math.ceil(totalPrice / 20000) * 20000,
                Math.ceil(totalPrice / 50000) * 50000,
              ]
                .filter((amount, index, self) => self.indexOf(amount) === index)
                .map((amount, index) => (
                  <button
                    key={index}
                    onClick={() => handleCashInput(amount.toString())}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Rp{amount.toLocaleString()}
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={closeCashModal}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCashConfirm}
                disabled={
                  !cashAmount || cashAmount === 0 || calculateChange() < 0
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  !cashAmount || cashAmount === 0 || calculateChange() < 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS Modal (tanpa gambar, hanya tombol saja) */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`bg-white rounded-2xl shadow-2xl ${
              isMobile ? "w-full max-w-sm" : "w-96"
            } p-6`}
          >
            <div className="text-center mb-4">
              <QrCodeIcon className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Pembayaran QRIS
              </h3>
              <p className="text-sm text-gray-600">
                Silakan lakukan pembayaran QRIS sesuai nominal berikut:
                <br />
                <span className="font-semibold text-blue-600">
                  Rp{totalPrice.toLocaleString()}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Setelah pembayaran QRIS berhasil, klik tombol di bawah.
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeQrisModal}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleQrisConfirm}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors bg-purple-500 text-white hover:bg-purple-600"
              >
                Selesai Bayar QRIS
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`
          ${sidebarBg} ${sidebarText} ${borderStyle} ${shadow}
          fixed z-40 h-10/12 flex flex-col
          transition-all duration-500
          ${
            isOpen
              ? "translate-x-0 opacity-100"
              : `${
                  isMobile ? "translate-x-full" : "translate-x-[240px]"
                } opacity-0 pointer-events-none`
          }
          shadow-xl
          ${
            isMobile
              ? "top-0 right-0 w-80 rounded-l-xl px-2 py-2 gap-1"
              : "top-20 right-0 w-60 rounded-l-2xl px-3 py-4 gap-3"
          }
        `}
        style={{
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Header dengan info kasir */}
        <div
          className={`flex-shrink-0 flex flex-col ${
            isMobile ? "mb-2" : "mb-3"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-bold select-none ${
                isMobile ? "text-sm" : "text-lg"
              }`}
            >
              Bayar
            </span>
            <button
              onClick={toggleSidebar}
              className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
              disabled={isProcessing}
            >
              <XCircleIcon
                className={`text-pink-300 ${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
              />
            </button>
          </div>
          <div
            className={`${
              isMobile ? "text-[10px]" : "text-xs"
            } opacity-70 mt-1`}
          >
            Kasir: {currentKasir?.username || "ThreeOne05"}
          </div>
        </div>

        {/* Products List */}
        <div
          className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200/60 ${
            isMobile ? "max-h-44" : "max-h-60"
          }`}
        >
          {selectedProducts.length > 0 ? (
            <ul className={`flex flex-col ${isMobile ? "gap-1" : "gap-2"}`}>
              {selectedProducts.map((product, index) => (
                <li
                  key={`${product.id}-${index}`}
                  className={`flex justify-between items-center transition-all rounded border
                    ${isMobile ? "px-2 py-1" : "px-3 py-2"}
                    ${
                      isDark
                        ? "bg-purple-900/40 border-pink-900/30"
                        : "bg-purple-100/70 border-purple-200/50"
                    }
                    ${isProcessing ? "opacity-50" : ""}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        isMobile ? "text-xs leading-3" : "text-sm"
                      }`}
                    >
                      {product.name}
                    </p>
                    <p
                      className={`${
                        isMobile ? "text-[10px] leading-3" : "text-xs"
                      } ${isDark ? "text-pink-200" : "text-purple-600"}`}
                    >
                      {product.quantity ?? 1}×Rp
                      {(product.price ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                    <p
                      className={`font-semibold ${
                        isMobile ? "text-[10px]" : "text-xs"
                      }`}
                    >
                      Rp
                      {(
                        (product.price ?? 0) * (product.quantity ?? 1)
                      ).toLocaleString()}
                    </p>
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="p-0.5 hover:bg-pink-100/50 rounded transition-colors"
                      disabled={isProcessing}
                    >
                      <TrashIcon
                        className={`text-red-400 ${
                          isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                        }`}
                      />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div
              className={`flex items-center justify-center opacity-60 ${
                isMobile ? "h-16" : "h-20"
              }`}
            >
              <p className={`${isMobile ? "text-[10px]" : "text-xs"}`}>
                Kosong
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`space-y-2 border-t pt-2 ${isMobile ? "border-t" : ""}`}
        >
          <div className="flex gap-1">
            <button
              onClick={toggleTax}
              disabled={isProcessing}
              className={`flex-1 rounded font-medium transition-all duration-200 ${
                isMobile ? "py-1 px-2 text-[10px]" : "py-1.5 px-2 text-xs"
              } ${
                includeTax
                  ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                  : "bg-white/60 text-purple-800 hover:bg-purple-200 border"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {includeTax ? "✓ +Pajak 10%" : "+ Pajak 10%"}
            </button>

            <button
              onClick={openCashModal}
              disabled={isProcessing || selectedProducts.length === 0}
              className={`flex-1 rounded font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                isMobile ? "py-1 px-2 text-[10px]" : "py-1.5 px-2 text-xs"
              } ${
                isProcessing || selectedProducts.length === 0
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-500 text-white hover:bg-green-600 shadow-sm"
              }`}
            >
              <BanknotesIcon
                className={`${isMobile ? "w-2.5 h-2.5" : "w-3 h-3"}`}
              />
              Tunai
            </button>

            <button
              onClick={openQrisModal}
              disabled={isProcessing || selectedProducts.length === 0}
              className={`flex-1 rounded font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                isMobile ? "py-1 px-2 text-[10px]" : "py-1.5 px-2 text-xs"
              } ${
                isProcessing || selectedProducts.length === 0
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-purple-500 text-white hover:bg-purple-600 shadow-sm"
              }`}
            >
              <QrCodeIcon
                className={`${isMobile ? "w-2.5 h-2.5" : "w-3 h-3"}`}
              />
              QRIS
            </button>
          </div>
          <div
            className={`space-y-1 rounded ${
              isMobile ? "px-2 py-1" : "px-3 py-2"
            } ${isDark ? "bg-purple-900/40" : "bg-purple-100/70"}`}
          >
            <div
              className={`flex justify-between ${
                isMobile ? "text-[10px]" : "text-xs"
              }`}
            >
              <span className="opacity-80">Sub:</span>
              <span className="font-medium">Rp{subtotal.toLocaleString()}</span>
            </div>
            {includeTax && (
              <div
                className={`flex justify-between ${
                  isMobile ? "text-[10px]" : "text-xs"
                }`}
              >
                <span className="opacity-80">Pajak:</span>
                <span className="font-medium">Rp{tax.toLocaleString()}</span>
              </div>
            )}
            <div
              className={`flex justify-between font-bold border-t border-white/20 pt-1 ${
                isMobile ? "text-xs" : "text-sm"
              }`}
            >
              <span>Total:</span>
              <span className="text-blue-400">
                Rp{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            className={`w-full rounded font-semibold transition-colors duration-200 shadow-lg ${
              isMobile ? "py-1.5 px-2 text-xs" : "py-2 px-3 text-sm"
            } ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : selectedProducts.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
            }`}
            disabled={selectedProducts.length === 0 || isProcessing}
            onClick={() => handlePayment("cash")}
          >
            {isProcessing ? "Memproses..." : "Bayar Pas"}
          </button>
        </div>
      </div>
      {showNotif && (
        <div
          className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-1 font-semibold animate-bounce ${
            isMobile ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
          }`}
        >
          <CheckCircleIcon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
          Pembayaran Berhasil!
        </div>
      )}

      {/* Toggle Button - Desktop Only */}
      {!isMobile && (
        <button
          className={`
            fixed top-20 p-1.5 z-50 transition-all
            ${isOpen ? "right-60" : "right-0"}
          `}
          onClick={toggleSidebar}
          disabled={isProcessing}
        >
          {isOpen ? (
            <XCircleIcon className="w-6 h-6 text-pink-400 bg-white/80 rounded-full shadow hover:scale-110 transition-all" />
          ) : (
            <ArrowLeftCircleIcon className="w-6 h-6 text-purple-600 bg-white/80 rounded-full shadow hover:scale-110 transition-all" />
          )}
        </button>
      )}

      {/* Mobile Toggle Button */}
      {isMobile && !isOpen && (
        <button
          className="fixed bottom-4 right-4 p-2 z-50 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all"
          onClick={toggleSidebar}
          disabled={isProcessing}
        >
          <ArrowLeftCircleIcon className="w-4 h-4" />
        </button>
      )}
    </>
  );
};
