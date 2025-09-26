"use client";

import React from 'react';
import { Home, Calendar, BookOpen, CheckSquare, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Assignments', href: '/assignments', icon: CheckSquare },
    { name: 'Grades', href: '/grades', icon: BarChart2 },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        // 60% White: The main background of the sidebar.
        <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
            <div className="h-16 flex items-center justify-center border-b border-gray-200">
                {/* 30% Blue: The primary brand color for the title. */}
                <h1 className="text-2xl font-bold text-blue-700">NESCOE Hub</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                    // 30% Blue: Used for the active link state.
                                    ? 'bg-blue-100 text-blue-700'
                                    // 10% Yellow: Used for the hover state accent.
                                    : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-800'
                            }`}
                        >
                            <link.icon className="h-5 w-5 mr-3" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

