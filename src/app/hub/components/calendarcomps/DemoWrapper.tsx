'use client';

import React from "react";
import { useSnack } from "./SnackProvider";

// const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function DemoWrapper() {
  // const { createSnack } = useSnack();

  // Event handler for calendar interactions (currently unused)
  // const onClickHandler = (day: number, month: number, year: number) => {
  //   const snackMessage = `Clicked on ${monthNames[month]} ${day}, ${year}`
  //   createSnack(snackMessage, 'success');
  // }

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col gap-4 px-4 pt-4 items-center justify-center">
      <div className="relative h-full overflow-auto mt-20">
      </div>
    </div>
  );
}