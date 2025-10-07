"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, User, PlusCircle } from 'lucide-react';
import { Role } from '@prisma/client';
import { CourseWithFaculty } from '@/app/api/hub/courses/route';
import { AddLectureForm } from '../components/AddLectureForm';

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
  location?: string | null;
}

const groupLecturesByDay = (lectures: Lecture[]) => {
  const days: Record<string, Lecture[]> = {
    'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [],
    'Friday': [], 'Saturday': [], 'Sunday': [],
  };
  lectures.forEach(lecture => {
    const dayName = new Date(lecture.dateTime).toLocaleString('en-US', { weekday: 'long' });
    if (days[dayName]) {
      days[dayName].push(lecture);
    }
  });
  // Sort lectures within each day by time
  for (const day in days) {
    days[day].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }
  return days;
};

export default function SchedulePage() {
  const [scheduleData, setScheduleData] = useState<Record<string, Lecture[]>>({});
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [professorCourses, setProfessorCourses] = useState<CourseWithFaculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingLectureToDay, setAddingLectureToDay] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, sessionRes] = await Promise.all([
          fetch('/api/hub/schedule'),
          fetch('/api/session'),
        ]);

        if (!scheduleRes.ok) throw new Error('Failed to fetch schedule data');
        if (!sessionRes.ok) throw new Error('Failed to fetch user session');
        
        const scheduleJson = await scheduleRes.json();
        const sessionJson = await sessionRes.json();
        const role = sessionJson.session?.role || null;

        setScheduleData(groupLecturesByDay(scheduleJson.lectures));
        setUserRole(role);

        // If user is a professor, fetch their courses for the "Add Lecture" form
        if (role === Role.PROFESSOR || role === Role.HOD) {
          const coursesRes = await fetch('/api/hub/courses');
          if (coursesRes.ok) {
            const coursesJson = await coursesRes.json();
            setProfessorCourses(coursesJson.courses);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddLecture = async (newLectureData: { courseId: number; dateTime: string; location?: string }) => {
    const res = await fetch('/api/hub/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLectureData),
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || 'Failed to create lecture.');
    }

    const { lecture: newLecture } = await res.json();
    
    // Update local state to show new lecture immediately
    setScheduleData(prevData => {
      const dayName = new Date(newLecture.dateTime).toLocaleString('en-US', { weekday: 'long' });
      const updatedDayLectures = [...(prevData[dayName] || []), newLecture];
      updatedDayLectures.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      return { ...prevData, [dayName]: updatedDayLectures };
    });

    setAddingLectureToDay(null); // Close form on success
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  if (isLoading) return <div className="p-8">Loading your schedule...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const isProfessorOrHod = userRole === Role.PROFESSOR || userRole === Role.HOD;

  return (
    <motion.div className="max-w-7xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6 text-gray-900">
        Weekly Schedule
      </motion.h1>

      <div className="space-y-8">
        {Object.entries(scheduleData).map(([day, classes]) => (
          <motion.div key={day} variants={itemVariants}>
            <div className="flex justify-between items-center mb-4 border-b-2 border-blue-200 pb-2">
              <h2 className="text-2xl font-semibold text-blue-700">{day}</h2>
              {isProfessorOrHod && (
                <button
                  onClick={() => setAddingLectureToDay(addingLectureToDay === day ? null : day)}
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add Lecture
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {addingLectureToDay === day && (
                <AddLectureForm
                  courses={professorCourses}
                  day={day}
                  onAddLecture={handleAddLecture}
                  onCancel={() => setAddingLectureToDay(null)}
                />
              )}
            </AnimatePresence>

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
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm font-medium text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{cls.location || 'TBA'}</span>
                        </div>
                        {isProfessorOrHod && (
                            <Link href={`/hub/attendance/${cls.id}`}>
                                <button className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                                    Take Attendance
                                </button>
                            </Link>
                        )}
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