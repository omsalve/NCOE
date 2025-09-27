"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AtSign, Lock, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Effect to redirect user if they are already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/hub/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sign in the user with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // On success, the effect above will handle the redirect.
      // We can also push them directly.
      router.push('/hub/dashboard');
    } catch (err: any) {
      // Provide a user-friendly error message
      setError("Failed to sign in. Please check your email and password.");
      console.error("Firebase Auth Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // While the auth state is loading, or if the user is logged in, don't show the form
  if (loading || user) {
    return (
        <div className="flex items-center justify-center h-screen w-screen bg-white">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700">NESCOE Hub</h1>
            <p className="text-gray-500 mt-2">Welcome back! Please sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                 <AlertCircle className="w-5 h-5 mr-2"/>
                <span className="block sm:inline">{error}</span>
              </motion.div>
            )}
            
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><AtSign className="h-5 w-5 text-gray-400" /></div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Signing In...' : <> <LogIn className="w-5 h-5 mr-2" /> Sign In </>}
              </motion.button>
            </div>
          </form>

           <p className="mt-8 text-center text-sm text-gray-600">
            Having trouble?{' '}
            <Link href="#" className="font-semibold text-yellow-600 hover:text-yellow-700 hover:underline">
              Contact Admin
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

