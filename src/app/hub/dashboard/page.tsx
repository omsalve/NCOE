"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Assignment, Lecture, Course } from '@prisma/client';

// Define more specific types for our data
type UpcomingLecture = Lecture & { course: Pick<Course, 'code' | 'name'> };
type DueAssignment = Assignment;

const CardSkeleton = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
    <div className={`h-6 w-1/2 bg-gray-200 rounded mb-6`}></div>
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const UpcomingScheduleCard = ({ lectures }: { lectures: UpcomingLecture[] }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg h-full">
    <h3 className="font-bold text-lg mb-4 text-blue-700">Upcoming Classes</h3>
    <ul className="space-y-4">
      {lectures.length > 0 ? lectures.map(lecture => (
        <li key={lecture.id}>
          <p className="font-semibold text-gray-800">{lecture.course.code}: {lecture.course.name}</p>
          <p className="text-sm text-gray-500">
            {new Date(lecture.dateTime).toLocaleDateString(undefined, { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        </li>
      )) : <p className="text-sm text-gray-500 pt-4">No upcoming classes. Enjoy the break!</p>}
    </ul>
  </div>
);

const DueAssignmentsCard = ({ assignments }: { assignments: DueAssignment[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
        <h3 className="font-bold text-lg mb-4 text-yellow-800">Assignments Due Soon</h3>
        <ul className="space-y-4">
        {assignments.length > 0 ? assignments.map(assignment => (
          <li key={assignment.id} className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800">{assignment.title}</p>
              <p className="text-sm text-gray-500">{assignment.description}</p>
            </div>
            <span className="text-sm font-medium text-yellow-600 shrink-0 ml-4">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
          </li>
        )) : <p className="text-sm text-gray-500 pt-4">No assignments due soon. Great job!</p>}
        </ul>
    </div>
);

export default function DashboardPage() {
  const [lectures, setLectures] = useState<UpcomingLecture[]>([]);
  const [assignments, setAssignments] = useState<DueAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lecturesRes, assignmentsRes] = await Promise.all([
          fetch('/api/hub/dashboard/upcoming-lectures'),
          fetch('/api/hub/dashboard/due-assignments'),
        ]);
        const lecturesData = await lecturesRes.json();
        const assignmentsData = await assignmentsRes.json();
        setLectures(lecturesData.lectures || []);
        setAssignments(assignmentsData.assignments || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton title="Upcoming Classes" />
            <CardSkeleton title="Assignments Due Soon" />
          </>
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <UpcomingScheduleCard lectures={lectures} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <DueAssignmentsCard assignments={assignments} />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}

