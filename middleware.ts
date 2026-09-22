import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const userIdCookie = req.cookies.get('goeuro_user_id')?.value;
  const isAuthenticated = !!userIdCookie;

  // 2. Public routes that do not require authentication (Public Corporate Site, Inquiry, Meetings)
  if (pathname === '/' || pathname === '/inquiry' || pathname.startsWith('/meeting/')) {
    return NextResponse.next();
  }

  // 3. Login page handling
  if (pathname === '/login') {
    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 5. Protected pages (dashboard, tasks, marketing, leads, cases, knowledge, settings)
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
