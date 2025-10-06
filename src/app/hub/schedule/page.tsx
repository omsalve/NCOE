"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User } from 'lucide-react';

// This interface now expects the nested course object
interface Lecture {
  id: number;
  dateTime: string;
  course: {
    name: string;
    code: string;
  };
  faculty: {
    user: {
      name: string;
    };
  };
  location?: string; // You can add a location field to your schema later
}

// Helper function to group lectures by day
const groupLecturesByDay = (lectures: Lecture[]) => {
  const days: { [key: string]: Lecture[] } = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
    Friday: [], Saturday: [], Sunday: [],
  };
  lectures.forEach(lecture => {
    const dayName = new Date(lecture.dateTime).toLocaleString('en-US', { weekday: 'long' });
    if (days[dayName]) {
      days[dayName].push(lecture);
    }
  });
  return days;
};

export default function SchedulePage() {
  const [scheduleData, setScheduleData] = useState<Record<string, Lecture[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/hub/schedule');
        if (!res.ok) throw new Error('Failed to fetch schedule data');
        const data = await res.json();
        setScheduleData(groupLecturesByDay(data.lectures));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  if (isLoading) return <div className="p-8">Loading your schedule...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

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
                classes.map((cls) => (
                  <div key={cls.id} className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{cls.course.code}: {cls.course.name}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{new Date(cls.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <User className="w-4 h-4 mr-2" />
                        <span>{cls.faculty.user.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{cls.location || 'TBA'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No classes scheduled for {day}.</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}