import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PaymentProvider } from "./context/PaymentContext";
import ToggleTheme from "./components/ToggleTheme";
import RequireAuth from "./components/RequireAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Warung Pangkep 79",
  icons: {
    icon: "/warung.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="min-h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-transparent text-slate-900 transition-colors duration-300`}
      >
        <ToggleTheme />
        <PaymentProvider>
          <RequireAuth>
            <div className="relative z-10 min-h-screen">{children}</div>
          </RequireAuth>
        </PaymentProvider>
      </body>
    </html>
  );
}
