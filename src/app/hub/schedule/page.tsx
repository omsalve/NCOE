"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';

const scheduleData = {
  Monday: [
    { time: '10:00 - 11:30', course: 'CS101: Intro to CS', location: 'Room 201' },
    { time: '13:00 - 14:30', course: 'MA203: Linear Algebra', location: 'Room 305' },
  ],
  Tuesday: [{ time: '11:00 - 12:30', course: 'PHY101: Physics I', location: 'Lab 3' }],
  Wednesday: [
    { time: '10:00 - 11:30', course: 'CS101: Intro to CS', location: 'Room 201' },
  ],
  Thursday: [{ time: '14:00 - 15:30', course: 'ENG101: English Comp', location: 'Room 110' }],
  Friday: [
    { time: '13:00 - 14:30', course: 'MA203: Linear Algebra', location: 'Room 305' },
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

export default function SchedulePage() {
  return (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6 text-gray-900">
        Weekly Schedule
      </motion.h1>

      <div className="space-y-8">
        {Object.entries(scheduleData).map(([day, classes]) => (
          <motion.div key={day} variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b-2 border-blue-200 pb-2">{day}</h2>
            <div className="space-y-4">
              {classes.length > 0 ? (
                classes.map((cls, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{cls.course}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{cls.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{cls.location}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No classes scheduled.</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
