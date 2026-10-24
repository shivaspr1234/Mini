"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export default function SiteInteractions() {
  const [showTopButton, setShowTopButton] = useState(false);
  const [toast, setToast] = useState(null);

  const toastTimerRef = useRef(null);

  // =========================================================
  // SHOW TOAST MESSAGE
  // =========================================================
  const showMessage = useCallback((message) => {
    setToast(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  // =========================================================
  // BACK TO TOP BUTTON
  // =========================================================
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =========================================================
  // GLOBAL BUTTON INTERACTIONS
  // =========================================================
  useEffect(() => {
    const handleButtonClick = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest("button");

      if (!button) {
        return;
      }

      // =====================================================
      // IMPORTANT:
      // Do NOT handle real connection buttons here.
      // The actual Connect API/page will handle them.
      // =====================================================
      if (button.dataset.connectionButton === "true") {
        return;
      }

      const buttonText = button.textContent?.trim().toLowerCase();

      if (!buttonText) {
        return;
      }

      // =====================================================
      // VIEW PROFILE
      // =====================================================
      if (buttonText.includes("view profile")) {
        showMessage("Profile preview will open here.");
        return;
      }

      // =====================================================
      // REGISTER
      // =====================================================
      if (buttonText.includes("register")) {
        showMessage("You have been registered for this event.");
        return;
      }

      // =====================================================
      // FIND A MENTOR
      // =====================================================
      if (buttonText.includes("find a mentor")) {
        showMessage("Finding the best mentor for you...");
        return;
      }

      // =====================================================
      // CREATE PROFILE
      // =====================================================
      if (buttonText.includes("create your profile")) {
        showMessage("Profile creation page is ready.");
        return;
      }
    };

    document.addEventListener("click", handleButtonClick);

    return () => {
      document.removeEventListener("click", handleButtonClick);
    };
  }, [showMessage]);

  // =========================================================
  // CLEAR TOAST TIMER
  // =========================================================
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // =========================================================
  // SCROLL TO TOP
  // =========================================================
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <>
      {/* =====================================================
          CUSTOM TOAST
      ====================================================== */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-[9999] w-[calc(100%-3rem)] max-w-sm sm:w-auto"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white shadow-2xl animate-[slideIn_0.3s_ease-out]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
              ✓
            </div>

            <p className="text-sm font-medium">
              {toast}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          BACK TO TOP BUTTON
      ====================================================== */}
      {showTopButton && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-5 right-5 z-[9998] flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-xl font-bold text-white shadow-xl shadow-purple-300/40 transition duration-300 hover:-translate-y-1 hover:bg-purple-700 hover:shadow-2xl dark:shadow-purple-950/40"
        >
          ↑
        </button>
      )}

      {/* =====================================================
          GLOBAL STYLES
      ====================================================== */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );
}