"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Re-styled card for upcoming classes to match the NESCOE theme
const UpcomingScheduleCard = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="font-bold text-lg mb-4 text-blue-700">Upcoming Classes</h3>
    <ul className="space-y-4">
      <li className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">CS101: Intro to Computer Science</p>
          <p className="text-sm text-gray-500">10:00 AM - 11:30 AM</p>
        </div>
        <span className="text-sm font-medium text-gray-700">Room 201</span>
      </li>
      <li className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">MA203: Linear Algebra</p>
          <p className="text-sm text-gray-500">1:00 PM - 2:30 PM</p>
        </div>
        <span className="text-sm font-medium text-gray-700">Room 305</span>
      </li>
    </ul>
  </div>
);

// Re-styled card for due assignments using the yellow accent color
const DueAssignmentsCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="font-bold text-lg mb-4 text-yellow-800">Assignments Due Soon</h3>
        <ul className="space-y-4">
          <li className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">CS101: Essay 1</p>
              <p className="text-sm text-gray-500">The Impact of AI</p>
            </div>
            <span className="text-sm font-medium text-yellow-600">Due: Tomorrow</span>
          </li>
          <li className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">MA203: Problem Set 2</p>
              <p className="text-sm text-gray-500">Matrix Operations</p>
            </div>
            <span className="text-sm font-medium text-gray-600">Due: 3 days</span>
          </li>
        </ul>
    </div>
);

export default function DashboardPage() {
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
    <motion.div 
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6 text-gray-900">
        Your Dashboard
      </motion.h1>
      
      {/* Grid for dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
            <UpcomingScheduleCard />
        </motion.div>
        <motion.div variants={itemVariants}>
            <DueAssignmentsCard />
        </motion.div>
        {/* We can add more cards here like "Recent Grades", "Announcements" etc. */}
      </div>
    </motion.div>
  );
}
