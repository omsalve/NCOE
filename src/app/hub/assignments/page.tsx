"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AssignmentWithDetails } from '@/app/api/hub/assignments/route'; // Corrected import path
import { SubmissionModal } from '../components/SubmissionModel'; // Corrected import path
import { Upload } from 'lucide-react';

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
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null);

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

  const handleSubmissionSuccess = (assignmentId: number) => {
    setAssignments(prev =>
      prev.map(asmnt => {
        if (asmnt.id === assignmentId) {
          // Create a mock submission that matches the required type
          const mockSubmission = {
            id: Date.now(), // Use a temporary unique ID
            assignmentId: assignmentId,
            studentId: 0, // This will be set correctly on the server
            fileUrl: '', // This isn't needed for the status update
            submittedAt: new Date(),
            grade: null,
          };
          return { ...asmnt, submissions: [mockSubmission] };
        }
        return asmnt;
      })
    );
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  if (isLoading) return <div className="p-8">Loading assignments...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <SubmissionModal 
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onSubmissionSuccess={handleSubmissionSuccess}
      />

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
              const isSubmittable = status === 'Upcoming' || status === 'Past Due';

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
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-bold ${getStatusColor(status)}`}>
                      {status}
                      {status === 'Graded' && assignment.submissions[0]?.grade && `: ${assignment.submissions[0].grade}`}
                    </span>
                    {isSubmittable && (
                      <button 
                        onClick={() => setSelectedAssignment(assignment)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 flex items-center"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Submit
                      </button>
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
    </>
  );
}