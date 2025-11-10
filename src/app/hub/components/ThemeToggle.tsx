"use client";

import { useTheme } from "../components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <motion.button
      onClick={() => setTheme(nextTheme)}
      className="relative p-2 rounded-md border border-gray-300 dark:border-gray-700 
                 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 
                 transition-all"
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-5 h-5" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-5 h-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
