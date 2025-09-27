"use client";

import React from "react";
import { SnackProvider } from "../components/calendarcomps/SnackProvider";
import DemoWrapper from "../components/calendarcomps/DemoWrapper";

export default function CalendarPage() {
  return (
    <SnackProvider>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Academic Calendar
      </h1>
      <DemoWrapper />
    </SnackProvider>
  );
}