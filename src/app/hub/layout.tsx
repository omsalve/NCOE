import React from 'react';

// This is a server component in Next.js 13+
// It correctly imports the named exports for Header and Sidebar.
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* The Header component is rendered here. The error occurs if the import fails. */}
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Page content will be injected here */}
          {children}
        </main>
      </div>
    </div>
  );
}

