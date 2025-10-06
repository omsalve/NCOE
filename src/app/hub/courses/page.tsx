"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, User } from 'lucide-react';
import { CourseWithFaculty } from '../../api/hub/courses/route'; // Import the type

export default function CoursesPage() {
  const [coursesData, setCoursesData] = useState<CourseWithFaculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/hub/courses');
        if (!res.ok) {
          throw new Error('Failed to fetch course data');
        }
        const data = await res.json();
        setCoursesData(data.courses);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

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

  if (isLoading) {
    return <div className="p-8">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6 text-gray-900">
        Your Courses
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesData.map((course) => (
          <motion.div
            key={course.code}
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <Book className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="font-bold text-lg text-blue-700">{course.code}</p>
                  <p className="font-semibold text-gray-800">{course.name}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-4">
                <User className="w-4 h-4 mr-2" />
                <span>{course.faculty?.user?.name || 'Not Assigned'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}