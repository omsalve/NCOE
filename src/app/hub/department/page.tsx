"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap } from 'lucide-react';
import { User as UserType, Student, Faculty } from '@prisma/client';

type StudentWithDetails = UserType & { student: Student | null };
type FacultyWithDetails = UserType & { faculty: Faculty | null };

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function DepartmentPage() {
  const [departmentName, setDepartmentName] = useState<string>('');
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [faculty, setFaculty] = useState<FacultyWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'faculty'>('students');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hub/department');
        if (!res.ok) {
          throw new Error('You are not authorized to view this page.');
        }
        const data = await res.json();
        setDepartmentName(data.departmentName);
        setStudents(data.students);
        setFaculty(data.faculty);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message :

