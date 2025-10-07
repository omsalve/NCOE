"use client";

import React from 'react';
import { Home, Calendar, BookOpen, CheckSquare, BarChart2, BookMarked, X, CheckSquare2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const navLinks = [
    { name: 'Dashboard', href: '/hub/dashboard', icon: Home },
    { name: 'Schedule', href: '/hub/schedule', icon: Calendar },
    { name: 'Courses', href: '/hub/courses', icon: BookOpen },
    { name: 'Assignments', href: '/hub/assignments', icon: CheckSquare },
    { name: 'Academic Calendar', href: '/hub/calendar', icon: BookMarked },
    { name: 'Grades', href: '/hub/grades', icon: BarChart2 },
    { name: 'Attendance', href: '/hub/attendance', icon: CheckSquare2}
];

const sidebarVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const linkContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } }
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void; }) => {
    const pathname = usePathname();

    const NavContent = () => (
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <motion.div key={link.name} variants={linkVariants}>
              <Link
                href={link.href}
                onClick={toggle} // Close sidebar on link click for mobile
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-800'
                }`}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    );

    return (
      <>
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
            <div className="h-16 flex items-center justify-center border-b border-gray-200">
                <h1 className="text-2xl font-bold text-blue-700">NESCOE Hub</h1>
            </div>
            <motion.div
              variants={linkContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <NavContent />
            </motion.div>
        </aside>

        {/* --- MOBILE SIDEBAR (BURGER MENU) --- */}
        <AnimatePresence>
          {isOpen && [
            // Backdrop
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggle}
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />,

            // Menu
            <motion.aside
                key="menu"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed top-0 left-0 h-full w-64 bg-white z-40 flex flex-col md:hidden"
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-blue-700">NESCOE Hub</h1>
                    <button onClick={toggle} className="p-1" aria-label="Close sidebar">
                    <X className="h-6 w-6 text-gray-600"/>
                    </button>
                </div>
                <motion.div
                    variants={linkContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <NavContent />
                </motion.div>
            </motion.aside>
          ]}
        </AnimatePresence>
      </>
    );
};

