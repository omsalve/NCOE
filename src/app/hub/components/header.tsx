"use client";

import React from 'react';
import { Bell, UserCircle, Menu } from 'lucide-react';

// The header now accepts a function to toggle the sidebar on mobile.
export const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
    // In a real app, we'd fetch the user's name from an Auth context
    const userName = "Jane Doe"; 

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
            {/* Mobile menu button - now functional */}
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
                <button className="text-gray-600 hover:text-blue-600">
                    <Bell className="h-6 w-6" />
                </button>
                <button className="flex items-center space-x-2">
                    <UserCircle className="h-8 w-8 text-gray-500" />
                </button>
            </div>
        </header>
    )
}

