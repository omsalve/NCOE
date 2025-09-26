"use client";

import React from 'react';
import { Bell, UserCircle, Menu } from 'lucide-react';

// Using `export const` ensures this is a named export, which matches
// the `import { Header }` statement in your layout file.
export const Header = () => {
    // In a real app, we'd fetch the user's name from an Auth context
    const userName = "Jane Doe"; 

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0">
            {/* Mobile menu button */}
            <button className="md:hidden text-gray-600 dark:text-gray-300">
                <Menu className="h-6 w-6" />
            </button>

            {/* Placeholder for search or page title */}
            <div className="hidden md:block">
                <h2 className="text-lg font-semibold">Welcome back, {userName}!</h2>
            </div>
            
            <div className="flex items-center space-x-4">
                <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <Bell className="h-6 w-6" />
                </button>
                <button className="flex items-center space-x-2">
                    <UserCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </button>
            </div>
        </header>
    )
}
