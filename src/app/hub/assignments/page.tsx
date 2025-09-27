"use client";

import React from 'react';
import { motion } from 'framer-motion';

const assignmentsData = {
  'CS101: Intro to CS': [
    { title: 'Essay 1: The Impact of AI', due: 'Tomorrow', status: 'Upcoming' },
    { title: 'Lab 2: Sorting Algorithms', due: '5 days', status: 'Upcoming' },
  ],
  'MA203: Linear Algebra': [
    { title: 'Problem Set 2', due: '3 days', status: 'Upcoming' },
    { title: 'Problem Set 1', due: 'Last week', status: 'Graded' },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export default function AssignmentsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'text-yellow-600';
      case 'Graded': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6 text-gray-900">
        Assignments
      </motion.h1>

      <div className="space-y-8">
        {Object.entries(assignmentsData).map(([course, assignments]) => (
          <motion.div key={course} variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b-2 border-blue-200 pb-2">{course}</h2>
            <div className="space-y-3">
              {assignments.map((assignment, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{assignment.title}</p>
                    <p className="text-sm text-gray-500">Due: {assignment.due}</p>
                  </div>
                  <span className={`text-sm font-bold ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
    