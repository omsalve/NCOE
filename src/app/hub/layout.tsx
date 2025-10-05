"use client";

import React from 'react';
import { Bell, UserCircle, Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

// The header now accepts userName and a function to toggle the sidebar.
export const Header = ({ userName, toggleSidebar }: { userName: string; toggleSidebar: () => void }) => {
  const router = useRouter();

  const handleLogout = async () => {
    // Call the logout API route
    await fetch('/api/auth/logout', { method: 'POST' });
    // Redirect to the login page and refresh the application state
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar} 
        className="md:hidden text-gray-600 hover:text-blue-600"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Welcome message, hidden on mobile */}
      <div className="hidden md:block">
        <h2 className="text-lg font-semibold">Welcome back, {userName}!</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-blue-600" aria-label="Notifications">
          <Bell className="h-6 w-6" />
        </button>
        <button className="text-gray-600 hover:text-red-600" onClick={handleLogout} aria-label="Logout">
          <LogOut className="h-6 w-6" />
        </button>
        <button className="flex items-center space-x-2" aria-label="User profile">
          <UserCircle className="h-8 w-8 text-gray-500" />
        </button>
      </div>
    </header>
  );
};

