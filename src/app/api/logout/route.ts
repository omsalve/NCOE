import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' });

  // Clear the session cookie by setting its value to empty and maxAge to 0
  res.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire the cookie immediately
    path: '/',
  });

  return res;
}

