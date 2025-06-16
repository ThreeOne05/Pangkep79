"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Jika sudah login, langsung redirect ke /dashboard
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("kasir")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/karyawan");
      if (!res.ok) throw new Error("Gagal koneksi ke server");
      const data = await res.json();
      // cari kasir yang usernamenya sama
      const kasir = data.find(
        (k) =>
          k.kasir &&
          k.kasir.username === username &&
          k.kasir.password === password
      );
      if (!kasir) {
        setError("Username atau password salah");
        setIsSubmitting(false);
        return;
      }
      localStorage.setItem(
        "kasir",
        JSON.stringify({ id: kasir._id, username })
      );
      router.push("/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-mono">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl px-8 py-10 border-2 border-blue-100">
        <div className="flex flex-col items-center mb-4">
          {/* Logo (optional, bisa ganti src-nya sesuai kebutuhan) */}
          <img
            src="/warung.ico"
            alt="Logo Warung"
            className="w-16 h-16 mb-2 drop-shadow-lg"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-700 mb-1 text-center drop-shadow">
            Login Kasir
          </h1>
          <span className="text-xs text-blue-800 font-semibold mb-1">
            Warung Pangkep 79
          </span>
        </div>
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 w-full font-semibold"
        >
          <div>
            <label className="block text-xs font-bold mb-1 text-blue-800">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-base focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
              placeholder="Username kasir"
              value={username}
              autoFocus
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-blue-800">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-base focus:ring-2 focus:ring-blue-300 bg-blue-50/40"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded px-2 py-1 text-center shadow">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-base shadow hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition active:scale-95 mt-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Memproses...</span>
            ) : (
              <>
                Login <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
