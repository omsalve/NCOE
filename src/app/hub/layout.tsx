"use client";

import React, { useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Header } from './components/header';

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header userName="Student" toggleSidebar={toggleSidebar} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}