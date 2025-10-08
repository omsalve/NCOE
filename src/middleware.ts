import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/session';

// Force the middleware to run on the Node.js runtime
export const runtime = 'nodejs';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = await getSession();

  // If the user is trying to access the hub but has no session,
  // redirect them to the login page.
  if (request.nextUrl.pathname.startsWith('/hub') && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If the user is logged in and tries to visit the login page or landing page,
  // redirect them to their dashboard.
  if (session && (request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/hub/dashboard', request.url));
  }

  // Continue with the request if none of the above conditions are met
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
