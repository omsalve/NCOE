// src/app/hub/components/header.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Bell, UserCircle, Menu } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

export const Header = ({
  userName,
  toggleSidebar,
}: {
  userName: string;
  toggleSidebar: () => void;
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-300">
      {/* Sidebar toggle button (mobile only) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Welcome text */}
      <div className="hidden md:flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Welcome back, {userName}!
        </h2>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
          <Bell className="h-6 w-6" />
        </button>

        <motion.button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Logout
        </motion.button>

        <UserCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
      </div>
    </header>
  );
};
