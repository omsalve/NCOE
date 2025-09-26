"use client";

import React from 'react';
import Link from 'next/link';
import { LogIn, UserPlus, CheckCircle, Calendar, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// This is the main landing page component for the NESCOE Hub.
export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    // 60% White: Applied to the main background for a clean, spacious feel.
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto flex justify-between items-center h-16 px-6">
          {/* 30% Blue: Used for the primary branding text. */}
          <h1 className="text-2xl font-bold text-blue-700">NESCOE Hub</h1>
          <nav>
            <Link 
              href="/auth/login" 
              className="px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-white py-20 md:py-32">
          <motion.div 
            className="container mx-auto text-center px-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Your Campus, <span className="text-blue-700">Connected.</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              The official hub for NESCOE students and faculty. Access your schedule, assignments, and campus updates all in one place.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/auth/login"
                  // 30% Blue: The primary call-to-action button.
                  className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Login to Your Account
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <motion.section 
          className="py-20 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-6">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900">Everything You Need to Succeed</h3>
              <p className="mt-2 text-gray-600">Core features designed for campus life.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div variants={itemVariants} className="p-8 bg-white rounded-xl shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-blue-600 bg-blue-100 rounded-full">
                  <Calendar className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Personalized Schedule</h4>
                <p className="text-gray-600">Never miss a class with a clear, up-to-date view of your daily schedule.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="p-8 bg-white rounded-xl shadow-lg">
                 <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-yellow-800 bg-yellow-100 rounded-full">
                   <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Assignment Tracking</h4>
                <p className="text-gray-600">Stay on top of deadlines with assignment due dates and submission details.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="p-8 bg-white rounded-xl shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-blue-600 bg-blue-100 rounded-full">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Attendance Records</h4>
                <p className="text-gray-600">Keep track of your attendance for all courses throughout the semester.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto text-center px-6">
          <p>&copy; {new Date().getFullYear()} NESCOE. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

