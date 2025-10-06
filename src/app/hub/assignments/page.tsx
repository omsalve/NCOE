"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AssignmentWithDetails } from '../../api/hub/assignments/route'; // Import the type

// A helper function to determine the status
const getAssignmentStatus = (assignment: AssignmentWithDetails) => {
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);

  if (assignment.submissions && assignment.submissions.length > 0) {
    const submission = assignment.submissions[0];
    return submission.grade ? 'Graded' : 'Submitted';
  }
  if (dueDate < now) {
    return 'Past Due';
  }
  return 'Upcoming';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Upcoming': return 'text-yellow-600';
    case 'Submitted': return 'text-blue-600';
    case 'Graded': return 'text-green-600';
    case 'Past Due': return 'text-red-600';
    default: return 'text-gray-500';
  }
};


export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch('/api/hub/assignments');
        if (!res.ok) throw new Error('Failed to fetch assignments');
        const data = await res.json();
        setAssignments(data.assignments);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  if (isLoading) return <div className="p-8">Loading assignments...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

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

      <div className="space-y-3">
        {assignments.length > 0 ? (
          assignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            return (
              <motion.div
                key={assignment.id}
                variants={itemVariants}
                className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{assignment.title}</p>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${getStatusColor(status)}`}>
                    {status}
                  </span>
                  {status === 'Graded' && (
                     <p className="text-sm text-gray-500">
                       Grade: {assignment.submissions[0].grade}
                     </p>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.p variants={itemVariants} className="text-gray-500">No assignments found.</motion.p>
        )}
      </div>
    </motion.div>
  );
}