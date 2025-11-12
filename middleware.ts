import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session token
  const sessionToken = request.cookies.get('authjs.session-token') ||
                      request.cookies.get('__Secure-authjs.session-token');
  const isLoggedIn = !!sessionToken;

  // Public routes
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/api/auth');

  // Protected game routes
  const isProtectedRoute = pathname.startsWith('/home') ||
    pathname.startsWith('/cards') ||
    pathname.startsWith('/deck') ||
    pathname.startsWith('/gacha') ||
    pathname.startsWith('/battle') ||
    pathname.startsWith('/quest') ||
    pathname.startsWith('/friends') ||
    pathname.startsWith('/ranking');

  // Redirect to login if not authenticated and trying to access protected route
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if authenticated and trying to access auth pages
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

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
