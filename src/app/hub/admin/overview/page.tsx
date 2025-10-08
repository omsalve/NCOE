// src/app/hub/admin/overview/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Briefcase, Percent } from 'lucide-react';

// Define types for our data
interface Stats {
  studentCount: number;
  facultyCount: number;
  departmentCount: number;
  overallAttendance: number;
}
interface Department {
  id: number;
  name: string;
  hod: string;
  studentCount: number;
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
  <div className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 ${color}`}>
    {icon}
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium opacity-80">{label}</p>
    </div>
  </div>
);

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hub/admin/overview', { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch overview data.');
        }
        const data = await res.json();
        setStats(data.stats);
        setDepartments(data.departments);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (isLoading) return <div className="p-8">Loading College Overview...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-8 text-gray-900">
        Admin Overview
      </motion.h1>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
            icon={<Users className="w-10 h-10"/>} 
            label="Total Students" 
            value={stats?.studentCount ?? 0}
            color="bg-blue-500 text-white"
        />
        <StatCard 
            icon={<GraduationCap className="w-10 h-10"/>} 
            label="Total Faculty" 
            value={stats?.facultyCount ?? 0}
            color="bg-green-500 text-white"
        />
        <StatCard 
            icon={<Briefcase className="w-10 h-10"/>} 
            label="Departments" 
            value={stats?.departmentCount ?? 0}
            color="bg-yellow-500 text-white"
        />
        <StatCard 
            icon={<Percent className="w-10 h-10"/>} 
            label="Overall Attendance" 
            value={`${stats?.overallAttendance ?? 0}%`}
            color="bg-purple-500 text-white"
        />
      </motion.div>

      {/* Department List */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Departments</h2>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {departments.map(dept => (
              <li key={dept.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg text-gray-800">{dept.name}</p>
                  <p className="text-sm text-gray-500">HOD: {dept.hod}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{dept.studentCount}</p>
                  <p className="text-sm text-gray-500">Students</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
