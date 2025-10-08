// src/app/hub/assignments/[assignmentId]/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Define the types for our data based on the API response
interface Submission {
  id: number;
  fileUrl: string;
  submittedAt: string;
  grade: number | null;
  student: {
    user: {
      name: string;
    };
  };
}

// Main component for viewing assignment submissions
export default function AssignmentSubmissionsPage({ params }: { params: { assignmentId: string } }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/hub/assignments/${params.assignmentId}/submissions`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch submissions');
        }
        const data = await res.json();
        setSubmissions(data.submissions);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [params.assignmentId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (isLoading) {
    return <div className="p-8">Loading submissions...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6 text-gray-900">
        Assignment Submissions
      </motion.h1>

      <div className="bg-white rounded-xl shadow-lg">
        <ul className="divide-y divide-gray-200">
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <motion.li
                key={submission.id}
                variants={itemVariants}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <User className="w-6 h-6 mr-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800">{submission.student.user.name}</p>
                    <p className="text-sm text-gray-500">
                      Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                    <FileText className="w-4 h-4 mr-1" />
                    View Submission
                  </Link>
                  <div className="flex items-center">
                    {submission.grade ? (
                      <span className="flex items-center text-sm font-semibold text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Graded: {submission.grade}
                      </span>
                    ) : (
                      // Placeholder for grading input
                      <span className="text-sm text-gray-500">Not Graded</span>
                    )}
                  </div>
                </div>
              </motion.li>
            ))
          ) : (
            <motion.p variants={itemVariants} className="p-6 text-center text-gray-500">
              No submissions yet for this assignment.
            </motion.p>
          )}
        </ul>
      </div>
    </motion.div>
  );
}