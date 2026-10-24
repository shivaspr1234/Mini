"use client";

import React from "react";
import ThemeToggle from "./ThemeToggle";
import { useAppContext } from "./AppProvider";

const Navbar = () => {

  const { loggedIn, setLoggedIn } = useAppContext();
  // ==========================================
  // LOGOUT FUNCTION
  // ==========================================
  const handleLogout = () => {
    try {
      // ------------------------------------------
      // Student login data remove
      // ------------------------------------------
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // ------------------------------------------
      // Alumni login data remove
      // ------------------------------------------
      localStorage.removeItem("alumni");
      sessionStorage.removeItem("alumni");

      // ------------------------------------------
      // Logout ke baad Login page par redirect
      // ------------------------------------------
      window.location.href = "/login";

      // ------------------------------------------
      // Update the loggedIn state to false
      // ------------------------------------------
      setLoggedIn(false);
      
    } catch (error) {
      console.error("Logout error:", error);

      // Agar kisi reason se storage error aaye
      // tab bhi login page par bhej denge
      window.location.href = "/login";
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white text-gray-600 transition-colors duration-300 dark:border-gray-800 dark:bg-slate-950 dark:text-gray-300">
      <div className="container mx-auto flex flex-wrap items-center p-5 md:flex-row">

        {/* ==========================================
            LOGO
        ========================================== */}
        <a
          href="/"
          className="mb-4 flex items-center font-medium text-gray-900 dark:text-white md:mb-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-10 w-10 rounded-full bg-indigo-500 p-2 text-white"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>

          <span className="ml-3 text-xl font-bold">
            ANP
          </span>
        </a>

        {/* ==========================================
            NAVIGATION
        ========================================== */}
        <nav className="flex flex-wrap items-center justify-center text-base md:ml-auto">

          <a
            href="/"
            className="mr-5 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Home
          </a>

          <a
            href="about"
            className="mr-5 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            About
          </a>

          <a
            href="services"
            className="mr-5 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Services
          </a>

          <a
            href="/signup"
            className="mr-5 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Signup
          </a>

        </nav>

        {/* ==========================================
            LOGOUT BUTTON
        ========================================== */}
        {
          loggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/20 md:ml-4 md:mt-0"
            >
              Logout

              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="ml-2 h-4 w-4"
                viewBox="0 0 24 24"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-7" />
              </svg>
            </button>
          )
        }

        {/* ==========================================
            THEME TOGGLE
        ========================================== */}
        <div className="mt-4 md:ml-4 md:mt-0">
          <ThemeToggle />
        </div>

      </div>
    </header>
  );
};

export default Navbar;