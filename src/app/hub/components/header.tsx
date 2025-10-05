"use client";

import React from 'react';
import { Bell, UserCircle, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

// The header now accepts a user name and a function to handle logout
export const Header = ({ 
  userName, 
  toggleSidebar 
}: { 
  userName: string;
  toggleSidebar: () => void; 
}) => {

  const handleLogout = async () => {
    // Call the logout API route
    await fetch('/api/auth/logout', { method: 'POST' });
    // Redirect to login page after logout
    window.location.href = '/auth/login';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
      <button 
        onClick={toggleSidebar} 
        className="md:hidden text-gray-600 hover:text-blue-600"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden md:block">
        <h2 className="text-lg font-semibold">Welcome back, {userName}!</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-blue-600">
          <Bell className="h-6 w-6" />
        </button>
        {/* Simple Logout Button */}
        <motion.button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-600 hover:text-red-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Logout
        </motion.button>
        <UserCircle className="h-8 w-8 text-gray-500" />
      </div>
    </header>
  );
}
