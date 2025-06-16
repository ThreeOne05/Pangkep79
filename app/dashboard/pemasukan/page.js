"use client";
import { useState, useEffect } from "react";
import { ChartPieIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";

export default function AnalyticsPage() {
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [resetLoading, setResetLoading] = useState({
    today: false,
    month: false,
  });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [currentKasir, setCurrentKasir] = useState(null);

  // Ambil kasir dari localStorage (login)
  useEffect(() => {
    const kasirData = localStorage.getItem("kasir");
    if (kasirData) {
      try {
        const kasir = JSON.parse(kasirData);
        setCurrentKasir(kasir.username);
      } catch (error) {
        setCurrentKasir(null);
      }
    } else {
      setCurrentKasir(null);
    }
  }, []);

  const fetchToday = async () => {
    const res = await fetch("/api/transactions/hariini", { cache: "no-store" });
    const data = await res.json();
    setTodayTotal(data.total || 0);
  };

  const fetchMonth = async () => {
    const res = await fetch("/api/transactions/bulanini", {
      cache: "no-store",
    });
    const data = await res.json();
    setMonthTotal(data.total || 0);
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions?limit=100", {
        cache: "no-store",
      });
      if (!res.ok) {
        setTransactions([]);
        return;
      }
      const data = await res.json();
      if (data.success) setTransactions(data.data);
      else setTransactions([]);
    } catch (err) {
      setTransactions([]);
    }
  };

  const fetchAll = async () => {
    setFetchLoading(true);
    await Promise.all([fetchToday(), fetchMonth(), fetchTransactions()]);
    setFetchLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const handler = () => fetchAll();
    window.addEventListener("transactionCreated", handler);
    return () => window.removeEventListener("transactionCreated", handler);
  }, []);

  const handleReset = async (type) => {
    setResetLoading((prev) => ({ ...prev, [type]: true }));
    await fetch(
      `/api/transactions/${type === "today" ? "hariini" : "bulanini"}`,
      { method: "POST" }
    );
    setResetLoading((prev) => ({ ...prev, [type]: false }));
    fetchAll();
  };

  // Perubahan: hanya fetchTransactions agar penghasilan hari/bulan tidak turun saat hapus transaksi
  const handleDeleteTransaction = async (t, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteLoading(t._id);
    try {
      await fetch(`/api/transactions/${t._id}`, { method: "DELETE" });
      setDeleteLoading(null);
      fetchTransactions(); // hanya refresh histori
    } catch {
      setDeleteLoading(null);
    }
  };

  const handlePrintNota = (transaksi) => {
    localStorage.setItem(
      "notaProducts",
      JSON.stringify({
        products: transaksi.items,
        subtotal: transaksi.subtotal ?? transaksi.total,
        tax: transaksi.tax || 0,
        includeTax: transaksi.includeTax || false,
        total: transaksi.total,
        paidAmount: transaksi.paidAmount || transaksi.total,
        change: transaksi.change || 0,
        date: transaksi.date,
        id: transaksi.transactionId || transaksi._id,
        _id: transaksi._id,
        paymentMethod: transaksi.paymentMethod || "cash", // <-- Tambahan penting
      })
    );
    localStorage.setItem(
      "kasir",
      JSON.stringify({ username: transaksi.kasir })
    );
    window.location.href = "/nota";
  };

  if (fetchLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat data pemasukan...</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex items-center space-x-2 mb-6">
        <span className="inline-flex items-center justify-center bg-gradient-to-tr from-pink-400 to-purple-600 rounded-xl p-2.5 shadow-lg">
          <ChartPieIcon className="w-6 h-6 text-white drop-shadow" />
        </span>
        <h1 className="text-2xl font-bold text-gray-800 drop-shadow">
          Pemasukan
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Penghasilan Hari Ini */}
        <div className="relative bg-white border border-pink-200 shadow-xl rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 font-medium">Penghasilan Hari Ini</p>
            </div>
            <button
              onClick={() => handleReset("today")}
              disabled={resetLoading.today}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                resetLoading.today
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700"
              }`}
              title="Reset penghasilan hari ini"
            >
              {resetLoading.today ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowPathIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-2xl font-bold mt-2 drop-shadow transition text-green-600">
            Rp{todayTotal.toLocaleString()}
          </p>
        </div>

        {/* Penghasilan Bulan Ini */}
        <div className="relative bg-white border border-blue-200 shadow-xl rounded-2xl p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 font-medium">Penghasilan Bulan Ini</p>
            </div>
            <button
              onClick={() => handleReset("month")}
              disabled={resetLoading.month}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                resetLoading.month
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700"
              }`}
              title="Reset penghasilan bulan ini"
            >
              {resetLoading.month ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowPathIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-2xl font-bold mt-2 drop-shadow transition text-blue-600">
            Rp{monthTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-purple-800 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-gradient-to-tr from-pink-400 to-purple-600 rounded-full" />
            Histori Transaksi
          </h2>
        </div>
        {transactions.length === 0 ? (
          <p className="text-gray-400">Belum ada transaksi.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t, index) => (
              <div
                key={t._id}
                className="border border-gray-100 rounded-lg overflow-hidden"
              >
                <div
                  className="py-2 px-3 flex justify-between items-center cursor-pointer transition-all hover:bg-purple-50/40"
                  onClick={() =>
                    setExpandedTransaction((prev) =>
                      prev === index ? null : index
                    )
                  }
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-semibold text-gray-700 text-sm">
                      Rp{(t.total || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(t.date).toLocaleDateString("id-ID", {
                        timeZone: "Asia/Makassar",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WITA
                    </span>
                    {/* Tampilkan kasir hanya jika ada */}
                    {t.kasir && (
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        {t.kasir}
                      </span>
                    )}
                    {/* Label pajak atau tanpaPajak */}
                    {t.includeTax === true || (t.tax && t.tax > 0) ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                        +Pajak
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                        tanpaPajak
                      </span>
                    )}
                    {/* Tampilkan jenis pembayaran */}
                    {t.paymentMethod && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          t.paymentMethod === "qris"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.paymentMethod === "qris"
                          ? "QRIS"
                          : t.paymentMethod === "cash"
                          ? "Tunai"
                          : t.paymentMethod}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDeleteTransaction(t, e)}
                      disabled={deleteLoading === t._id}
                      className={`p-1 rounded transition-colors ${
                        deleteLoading === t._id
                          ? "bg-gray-200 cursor-not-allowed"
                          : "hover:bg-red-100 text-red-500 hover:text-red-700"
                      }`}
                      title="Hapus transaksi"
                    >
                      {deleteLoading === t._id ? (
                        <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <TrashIcon className="w-3 h-3" />
                      )}
                    </button>
                    {expandedTransaction === index ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                {expandedTransaction === index && (
                  <div className="px-3 pb-3 bg-gray-50/50 border-t border-gray-100">
                    <div className="mt-2">
                      <div className="bg-white p-2 rounded border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Detail Produk & Total:
                        </h4>
                        {t.items &&
                        Array.isArray(t.items) &&
                        t.items.length > 0 ? (
                          <div className="space-y-1 mb-2">
                            {t.items.map((item, itemIndex) => (
                              <div
                                key={`${item._id || item.name}-${itemIndex}`}
                                className="flex justify-between items-center text-xs"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-gray-800 block truncate">
                                    {item.name}
                                  </span>
                                  <span className="text-gray-500">
                                    {item.quantity} x Rp
                                    {(item.price || 0).toLocaleString()}
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-700 ml-2">
                                  Rp
                                  {(
                                    item.subtotal || item.price * item.quantity
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mb-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">
                                Transaksi Legacy
                              </span>
                              <span className="font-semibold">
                                Rp{(t.total || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="text-xs space-y-1">
                          {t.includeTax === true || (t.tax && t.tax > 0) ? (
                            <>
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>
                                  Rp
                                  {(
                                    t.subtotal ||
                                    t.total ||
                                    0
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pajak (10%):</span>
                                <span>Rp{(t.tax || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-semibold text-sm border-t pt-1">
                                <span>TOTAL:</span>
                                <span>Rp{(t.total || 0).toLocaleString()}</span>
                              </div>
                              {/* Kasir detail */}
                              {t.kasir && (
                                <div className="flex justify-between">
                                  <span>Kasir:</span>
                                  <span>{t.kasir}</span>
                                </div>
                              )}
                              {/* Jenis Pembayaran detail */}
                              {t.paymentMethod && (
                                <div className="flex justify-between">
                                  <span>Pembayaran:</span>
                                  <span>
                                    {t.paymentMethod === "qris"
                                      ? "QRIS"
                                      : t.paymentMethod === "cash"
                                      ? "Tunai"
                                      : t.paymentMethod}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between font-semibold text-sm border-t pt-1">
                                <span>TOTAL:</span>
                                <span>Rp{(t.total || 0).toLocaleString()}</span>
                              </div>
                              {t.kasir && (
                                <div className="flex justify-between">
                                  <span>Kasir:</span>
                                  <span>{t.kasir}</span>
                                </div>
                              )}
                              {/* Jenis Pembayaran detail */}
                              {t.paymentMethod && (
                                <div className="flex justify-between">
                                  <span>Pembayaran:</span>
                                  <span>
                                    {t.paymentMethod === "qris"
                                      ? "QRIS"
                                      : t.paymentMethod === "cash"
                                      ? "Tunai"
                                      : t.paymentMethod}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => handlePrintNota(t)}
                          className="mt-3 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 9V2h12v7M6 18v4h12v-4M6 14v4M18 14v4M6 14h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2z"
                            />
                          </svg>
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
