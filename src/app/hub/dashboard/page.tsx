import React from 'react';

// This is the main page a user sees after logging in.
// We'll fetch user-specific data here.

// Placeholder components for demonstration
const UpcomingScheduleCard = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <h3 className="font-bold text-lg mb-4 text-blue-600 dark:text-blue-400">Upcoming Classes</h3>
    <ul className="space-y-3">
      <li className="flex justify-between items-center">
        <div>
          <p className="font-semibold">CS101: Intro to Computer Science</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">10:00 AM - 11:30 AM</p>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Room 201</span>
      </li>
      <li className="flex justify-between items-center">
        <div>
          <p className="font-semibold">MA203: Linear Algebra</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">1:00 PM - 2:30 PM</p>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Room 305</span>
      </li>
    </ul>
  </div>
);

const DueAssignmentsCard = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400">Assignments Due Soon</h3>
        <ul className="space-y-3">
          <li className="flex justify-between items-center">
            <div>
              <p className="font-semibold">CS101: Essay 1</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">The Impact of AI</p>
            </div>
            <span className="text-sm font-medium text-red-500 dark:text-red-400">Due: Tomorrow</span>
          </li>
          <li className="flex justify-between items-center">
            <div>
              <p className="font-semibold">MA203: Problem Set 2</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Matrix Operations</p>
            </div>
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Due: 3 days</span>
          </li>
        </ul>
    </div>
);


export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      
      {/* Grid for dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingScheduleCard />
        <DueAssignmentsCard />
        {/* We can add more cards here like "Recent Grades", "Announcements" etc. */}
      </div>
    </div>
  );
}
