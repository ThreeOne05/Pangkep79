import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PaymentProvider } from "./context/PaymentContext";
import { BubbleBackground } from "./components/BubbleBackground";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-purple-200 to-purple-300 dark:bg-gradient-to-br dark:from-purple-900 dark:to-purple-950 transition-colors duration-500 min-h-full relative`}
      >
        <ToggleTheme />
        <BubbleBackground />
        <PaymentProvider>
          <RequireAuth>
            <div className="relative z-10 min-h-screen">{children}</div>
          </RequireAuth>
        </PaymentProvider>
      </body>
    </html>
  );
}
