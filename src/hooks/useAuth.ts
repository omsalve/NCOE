"use client";

import { useContext } from 'react';
// This is a re-export of the useAuth hook from the context file.
// In a larger app, this helps keep imports clean and consistent.
// For this project, it's good practice.
import { useAuth as useAuthFromContext } from '@/context/AuthContext';

export const useAuth = () => {
  return useAuthFromContext();
};
