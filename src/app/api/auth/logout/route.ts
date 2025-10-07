import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out successfully' });

  // Clear the session cookie by setting its value to empty and expiring it
  res.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  return res;
}

