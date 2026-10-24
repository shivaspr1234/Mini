import "./globals.css";

import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import SiteInteractions from "@/components/SiteInteractions";
import { ThemeProvider } from "../components/ThemeProvider";

import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/components/AppProvider";

export const metadata = {
  title: "Alumni Networking Portal | ANP",
  description:
    "Connect students and alumni, explore career opportunities, attend events, and build professional relationships.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-white">
        <ThemeProvider>
          <AppProvider>
            <Navbar />

            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: "12px",
                  padding: "14px 16px",
                  fontSize: "14px",
                },
              }}
            />

            <SiteInteractions />

            <main className="flex-1">{children}</main>

            <Footer />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}