"use client";

import { useTheme } from "./ThemeProvider";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      className="
        relative
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        border
        border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-900
        text-slate-700
        shadow-sm
        transition-all
        duration-300
        hover:scale-105
        hover:bg-slate-100
        dark:border-slate-700
        dark:bg-slate-900
        dark:text-yellow-300
        dark:hover:bg-slate-800
      "
    >
      {theme === "light" ? (
        <span className="text-xl">🌙</span>
      ) : (
        <span className="text-xl">☀️</span>
      )}
    </button>
  );
};

export default ThemeToggle;