"use client";
import { useState, useEffect } from "react";
import useDarkMode from "../../hooks/useDarkMode";

function getDayMonthText(dateObj) {
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const dayName = days[dateObj.getDay()];
  const tgl = String(dateObj.getDate()).padStart(2, "0");
  const monthName = months[dateObj.getMonth()];
  return `${dayName}, ${tgl} ${monthName}`;
}

function formatRupiah(num) {
  if (typeof num === "number") num = num.toString();
  return num.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function parseRupiah(val) {
  return Number(val.replace(/\./g, "").replace(/[^0-9]/g, ""));
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 bg-black/30 pointer-events-auto transition">
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[98vh] overflow-y-auto border border-gray-200 pointer-events-auto transition-all">
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-red-500 text-2xl font-bold w-9 h-9 flex items-center justify-center bg-gray-100/70 hover:bg-red-100 rounded-full transition"
          onClick={onClose}
          aria-label="Tutup modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function AnalisisPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    boxName: "",
    incomes: [{ date: "", name: "", total: "" }],
    useExpenses: false,
    expenses: [{ date: "", name: "", price: "" }],
  });
  const [modalIdx, setModalIdx] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isDark = useDarkMode();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchBoxes() {
      setLoading(true);
      const res = await fetch("/api/analisis");
      const data = await res.json();
      setBoxes(data);
      setLoading(false);
    }
    fetchBoxes();
  }, []);

  // Handler boxName
  const handleBoxNameChange = (e) => {
    setForm((prev) => ({
      ...prev,
      boxName: e.target.value,
    }));
  };

  // Handler pemasukan
  const handleIncomeChange = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      incomes: prev.incomes.map((inc, i) =>
        i === idx
          ? {
              ...inc,
              [field]: field === "total" ? formatRupiah(value) : value,
            }
          : inc
      ),
    }));
  };
  const addIncomeLine = () => {
    setForm((prev) => ({
      ...prev,
      incomes: [...prev.incomes, { date: "", name: "", total: "" }],
    }));
  };
  const removeIncomeLine = (idx) => {
    setForm((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((_, i) => i !== idx),
    }));
  };

  // Handler pengeluaran
  const handleExpenseChange = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e, i) =>
        i === idx
          ? { ...e, [field]: field === "price" ? formatRupiah(value) : value }
          : e
      ),
    }));
  };
  const addExpenseLine = () => {
    setForm((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { date: "", name: "", price: "" }],
    }));
  };
  const removeExpenseLine = (idx) => {
    setForm((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== idx),
    }));
  };

  const openForm = () => {
    setForm({
      boxName: "",
      incomes: [{ date: "", name: "", total: "" }],
      useExpenses: false,
      expenses: [{ date: "", name: "", price: "" }],
    });
    setShowForm(true);
  };

  // Preview saldo di form sebelum submit
  const previewBalance = () => {
    const totalIncome = form.incomes.reduce(
      (sum, inc) => sum + (parseRupiah(inc.total) || 0),
      0
    );
    const totalExpense = form.useExpenses
      ? form.expenses.reduce(
          (sum, exp) => sum + (parseRupiah(exp.price) || 0),
          0
        )
      : 0;
    return totalIncome - totalExpense;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validasi income lengkap
    const cleanIncomes = form.incomes.filter(
      (inc) =>
        inc.date && inc.name && inc.total && !isNaN(parseRupiah(inc.total))
    );
    let cleanExpenses = [];
    if (form.useExpenses) {
      cleanExpenses = form.expenses.filter(
        (exp) =>
          exp.date && exp.name && exp.price && !isNaN(parseRupiah(exp.price))
      );
    }

    const payload = {
      boxName: form.boxName,
      incomes: cleanIncomes.map((inc) => ({
        date: inc.date,
        name: inc.name,
        total: parseRupiah(inc.total) || 0,
      })),
      expenses: cleanExpenses.map((exp) => ({
        date: exp.date,
        name: exp.name,
        price: parseRupiah(exp.price) || 0,
      })),
    };
    const res = await fetch("/api/analisis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const newBox = await res.json();
      setBoxes([newBox, ...boxes]);
      setShowForm(false);
      setForm({
        boxName: "",
        incomes: [{ date: "", name: "", total: "" }],
        useExpenses: false,
        expenses: [{ date: "", name: "", price: "" }],
      });
    }
    setSubmitting(false);
  };

  const handleDeleteBox = async (id) => {
    const res = await fetch(`/api/analisis/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBoxes((prev) => prev.filter((box) => box._id !== id));
    }
  };

  // Hitung saldo: total semua income - total semua expense
  const calculateBalance = (box) => {
    const totalIncome = (box.incomes || []).reduce(
      (sum, inc) => sum + (inc.total || 0),
      0
    );
    const totalExpense = (box.expenses || []).reduce(
      (sum, exp) => sum + (exp.price || 0),
      0
    );
    return totalIncome - totalExpense;
  };

  return (
    <div className={`min-h-screen ${isMobile ? "py-2 px-1" : "py-8 px-4"}`}>
      <div className={`${isMobile ? "max-w-full" : "max-w-7xl"} mx-auto`}>
        {/* Header */}
        <div className={`text-center ${isMobile ? "mb-2" : "mb-8"}`}>
          <h1
            className={`font-bold ${
              isMobile ? "text-sm mb-0.5" : "text-3xl mb-2"
            } ${isDark ? "text-gray-100" : "text-gray-800"}`}
          >
            Analisis Keuangan
          </h1>
        </div>
        {/* Action Buttons */}
        <div
          className={`flex gap-2 justify-center ${isMobile ? "mb-2" : "mb-8"}`}
        >
          <button
            onClick={openForm}
            className={`bg-gradient-to-tr from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg shadow font-medium transition-all ${
              isMobile ? "px-2 py-1 text-xs" : "px-4 py-2 text-base"
            }`}
          >
            + Tambah
          </button>
          <button
            onClick={() => setIsDeleteMode((v) => !v)}
            className={`rounded-lg shadow font-medium transition-all ${
              isMobile ? "px-2 py-1 text-xs" : "px-4 py-2 text-base"
            } ${
              isDeleteMode
                ? "bg-gray-200 text-gray-700 border border-red-200"
                : "bg-gradient-to-tr from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
            }`}
          >
            {isDeleteMode ? "Batal" : "Hapus"}
          </button>
        </div>

        {/* Form Modal */}
        <Modal open={showForm} onClose={() => setShowForm(false)}>
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 ${isMobile ? "mt-2" : "mt-4"}`}
          >
            <div className="text-center">
              <h2
                className={`font-bold text-gray-800 ${
                  isMobile ? "text-base mb-2" : "text-xl mb-3"
                }`}
              >
                Tambah Analisis Keuangan
              </h2>
            </div>
            {/* INPUT NAMA BOX */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1 text-base">
                Nama Box
              </label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full text-base focus:outline-none"
                placeholder="Contoh: Analisis Minggu 1"
                value={form.boxName}
                onChange={handleBoxNameChange}
                required
              />
            </div>
            {/* INPUT PEMASUKAN */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 text-base">
                Pemasukan
              </h3>
              <div className="space-y-3">
                {form.incomes.map((inc, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-2 md:items-center bg-gradient-to-tr from-green-50 via-green-100 to-lime-50 rounded border border-green-200 p-2"
                  >
                    <input
                      type="date"
                      className="border rounded px-2 py-1 focus:outline-none md:w-40 w-full text-sm"
                      value={inc.date}
                      onChange={(e) =>
                        handleIncomeChange(idx, "date", e.target.value)
                      }
                      required
                    />
                    <input
                      type="text"
                      className="border rounded px-2 py-1 flex-1 focus:outline-none text-sm"
                      placeholder="Nama pendapatan"
                      value={inc.name}
                      onChange={(e) =>
                        handleIncomeChange(idx, "name", e.target.value)
                      }
                      required
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-base md:text-lg">
                        =
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="border rounded px-2 py-1 text-right focus:outline-none w-24 text-sm"
                        placeholder="0"
                        value={inc.total}
                        onChange={(e) =>
                          handleIncomeChange(idx, "total", e.target.value)
                        }
                        required
                      />
                    </div>
                    {form.incomes.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500 hover:bg-red-100 w-7 h-7 rounded-full text-lg font-bold flex items-center justify-center"
                        onClick={() => removeIncomeLine(idx)}
                        title="Hapus pemasukan"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full mt-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-semibold py-2 transition"
                onClick={addIncomeLine}
              >
                + Pemasukan
              </button>
            </div>
            {/* OPSIONALKAN PENGELUARAN */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
                <input
                  type="checkbox"
                  checked={form.useExpenses}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      useExpenses: e.target.checked,
                      expenses: e.target.checked
                        ? prev.expenses
                        : [{ date: "", name: "", price: "" }],
                    }))
                  }
                  className="accent-pink-500"
                />
                <span className="font-semibold text-pink-600 text-base">
                  Aktifkan Pengeluaran
                </span>
              </label>
              {form.useExpenses && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 mb-2 text-base">
                    Pengeluaran
                  </h3>
                  {form.expenses.map((exp, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col md:flex-row gap-2 md:items-center bg-gradient-to-tr from-red-50 via-red-100 to-pink-50 rounded border border-red-200 p-2"
                    >
                      <input
                        type="date"
                        className="border rounded px-2 py-1 focus:outline-none md:w-40 w-full text-sm"
                        value={exp.date}
                        onChange={(e) =>
                          handleExpenseChange(idx, "date", e.target.value)
                        }
                        required
                      />
                      <input
                        type="text"
                        className="border rounded px-2 py-1 flex-1 focus:outline-none text-sm"
                        placeholder="Nama pengeluaran"
                        value={exp.name}
                        onChange={(e) =>
                          handleExpenseChange(idx, "name", e.target.value)
                        }
                        required
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-base md:text-lg">
                          =
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="border rounded px-2 py-1 text-right focus:outline-none w-24 text-sm"
                          placeholder="0"
                          value={exp.price}
                          onChange={(e) =>
                            handleExpenseChange(idx, "price", e.target.value)
                          }
                          required
                        />
                      </div>
                      {form.expenses.length > 1 && (
                        <button
                          type="button"
                          className="text-red-500 hover:bg-red-100 w-7 h-7 rounded-full text-lg font-bold flex items-center justify-center"
                          onClick={() => removeExpenseLine(idx)}
                          title="Hapus pengeluaran"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="w-full mt-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold py-2 transition"
                    onClick={addExpenseLine}
                  >
                    + Pengeluaran
                  </button>
                </div>
              )}
            </div>
            {/* SALDO PREVIEW */}
            <div className="bg-gray-50 rounded-xl p-2 border flex justify-between items-center my-2">
              <span className="font-bold text-gray-800">Saldo Saat Ini:</span>
              <span
                className={`font-bold ${
                  previewBalance() >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                Rp {Math.abs(previewBalance()).toLocaleString("id-ID")}
                {previewBalance() < 0 ? " (Defisit)" : ""}
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-tr from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:bg-gray-400 text-white rounded font-bold py-3 text-lg transition"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </Modal>
        {/* ... (rest of the code, grid dan modal detail tetap) ... */}
        {loading ? (
          <div
            className={`flex items-center justify-center ${
              isMobile ? "py-4" : "py-12"
            }`}
          >
            <div
              className={`animate-spin rounded-full border-b-2 border-blue-500 ${
                isMobile ? "h-4 w-4" : "h-8 w-8"
              }`}
            ></div>
            <p
              className={`ml-2 text-gray-600 ${
                isMobile ? "text-xs" : "text-sm"
              }`}
            >
              Memuat...
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-3 ${
              isMobile
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {boxes.map((box) => {
              const balance = calculateBalance(box);
              const isProfit = balance >= 0;
              return (
                <div
                  key={box._id}
                  className={`relative bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-md border border-indigo-100 hover:shadow-lg cursor-pointer transition-all ${
                    isMobile ? "p-2" : "p-5"
                  }`}
                  onClick={() =>
                    !isDeleteMode &&
                    setModalIdx(boxes.findIndex((b) => b._id === box._id))
                  }
                >
                  {/* Box Name */}
                  <div className="font-semibold text-indigo-600 text-center mb-1 truncate">
                    {box.boxName || "-"}
                  </div>
                  {/* Date Badge: tampilkan tanggal income pertama */}
                  <div
                    className={`bg-gradient-to-tr from-blue-500 to-indigo-500 text-white text-center rounded-lg mb-1 shadow ${
                      isMobile ? "px-1 py-0.5" : "px-3 py-1"
                    }`}
                  >
                    <div
                      className={`font-medium ${
                        isMobile ? "text-[8px]" : "text-xs"
                      }`}
                    >
                      {box.incomes && box.incomes[0] && box.incomes[0].date
                        ? getDayMonthText(new Date(box.incomes[0].date))
                        : "-"}
                    </div>
                  </div>
                  <div className={`space-y-0.5 ${isMobile ? "mb-1" : "mb-2"}`}>
                    <div
                      className={`flex justify-between ${
                        isMobile ? "text-[8px]" : "text-xs"
                      }`}
                    >
                      <span className="text-gray-600">Masuk</span>
                      <span className="text-green-600 font-semibold">
                        {box.incomes?.length || 0}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between ${
                        isMobile ? "text-[8px]" : "text-xs"
                      }`}
                    >
                      <span className="text-gray-600">Keluar</span>
                      <span className="text-red-600 font-semibold">
                        {box.expenses?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-1 mt-1">
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-gray-700 font-medium ${
                          isMobile ? "text-[8px]" : "text-xs"
                        }`}
                      >
                        Saldo
                      </span>
                      <span
                        className={`font-bold ${
                          isMobile ? "text-[8px]" : "text-xs"
                        } ${isProfit ? "text-green-600" : "text-red-600"}`}
                      >
                        {balance >= 0 ? "" : "-"}
                        {Math.abs(balance) >= 1000000
                          ? `${(Math.abs(balance) / 1000000).toFixed(1)}jt`
                          : Math.abs(balance) >= 1000
                          ? `${(Math.abs(balance) / 1000).toFixed(0)}rb`
                          : Math.abs(balance).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {isDeleteMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBox(box._id);
                      }}
                      className={`absolute bg-gradient-to-tr from-red-500 to-pink-500 text-white rounded-full ${
                        isMobile
                          ? "top-1 right-1 w-4 h-4 text-[10px]"
                          : "top-2 right-2 w-6 h-6 text-base"
                      } flex items-center justify-center shadow`}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        <Modal open={modalIdx !== null} onClose={() => setModalIdx(null)}>
          {modalIdx !== null && boxes[modalIdx] && (
            <div className={`space-y-2 ${isMobile ? "mt-4" : "mt-6"}`}>
              <div className="text-center border-b pb-1 mb-1">
                <h2
                  className={`font-bold text-gray-800 ${
                    isMobile ? "text-xs" : "text-lg"
                  }`}
                >
                  Detail Transaksi
                </h2>
                <div className="text-indigo-600 font-semibold text-base mt-2 mb-1">
                  {boxes[modalIdx].boxName || "-"}
                </div>
              </div>
              <div className="space-y-1">
                <h3
                  className={`font-semibold text-gray-800 ${
                    isMobile ? "text-[9px]" : "text-xs"
                  }`}
                >
                  Pemasukan
                </h3>
                <div className="bg-green-50 rounded-xl p-2 border border-green-200">
                  {boxes[modalIdx].incomes.map((inc, i) => (
                    <div
                      key={i}
                      className={`flex flex-col border-b border-green-100 last:border-b-0 ${
                        isMobile ? "text-[9px] pb-1" : "text-xs pb-2"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-700 truncate flex-1">
                          {inc.name}
                        </span>
                        <span className="text-green-600 font-medium ml-1">
                          {inc.total >= 1000000
                            ? `${(inc.total / 1000000).toFixed(1)}jt`
                            : inc.total >= 1000
                            ? `${(inc.total / 1000).toFixed(0)}rb`
                            : inc.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-blue-500 text-[10px]">
                        {inc.date ? getDayMonthText(new Date(inc.date)) : "-"}
                      </div>
                    </div>
                  ))}
                  <div
                    className={`flex justify-between pt-1 mt-1 border-t font-bold ${
                      isMobile ? "text-[9px]" : "text-xs"
                    }`}
                  >
                    <span className="text-gray-800">Total:</span>
                    <span className="text-green-600">
                      {boxes[modalIdx].incomes
                        .reduce((sum, inc) => sum + inc.total, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h3
                  className={`font-semibold text-gray-800 ${
                    isMobile ? "text-[9px]" : "text-xs"
                  }`}
                >
                  Pengeluaran
                </h3>
                <div className="bg-red-50 rounded-xl p-2 border border-red-200">
                  {boxes[modalIdx].expenses.map((exp, i) => (
                    <div
                      key={i}
                      className={`flex flex-col border-b border-red-100 last:border-b-0 ${
                        isMobile ? "text-[9px] pb-1" : "text-xs pb-2"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-700 truncate flex-1">
                          {exp.name}
                        </span>
                        <span className="text-red-600 font-medium ml-1">
                          {exp.price >= 1000000
                            ? `${(exp.price / 1000000).toFixed(1)}jt`
                            : exp.price >= 1000
                            ? `${(exp.price / 1000).toFixed(0)}rb`
                            : exp.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-pink-500 text-[10px]">
                        {exp.date ? getDayMonthText(new Date(exp.date)) : "-"}
                      </div>
                    </div>
                  ))}
                  <div
                    className={`flex justify-between pt-1 mt-1 border-t font-bold ${
                      isMobile ? "text-[9px]" : "text-xs"
                    }`}
                  >
                    <span className="text-gray-800">Total:</span>
                    <span className="text-red-600">
                      {boxes[modalIdx].expenses
                        .reduce((sum, exp) => sum + exp.price, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-tr from-gray-50 via-blue-50 to-indigo-50 rounded-xl p-2 border">
                <div className="flex justify-between items-center">
                  <span
                    className={`font-bold text-gray-800 ${
                      isMobile ? "text-[9px]" : "text-base"
                    }`}
                  >
                    Saldo:
                  </span>
                  <span
                    className={`font-bold ${isMobile ? "text-xs" : "text-lg"} ${
                      calculateBalance(boxes[modalIdx]) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Rp
                    {Math.abs(calculateBalance(boxes[modalIdx])).toLocaleString(
                      "id-ID"
                    )}
                  </span>
                </div>
                {calculateBalance(boxes[modalIdx]) < 0 && (
                  <p
                    className={`text-red-500 mt-1 text-center ${
                      isMobile ? "text-[8px]" : "text-xs"
                    }`}
                  >
                    Defisit
                  </p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
