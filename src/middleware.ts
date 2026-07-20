import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const startTime = performance.now();
  const { method, nextUrl } = request;
  const pathname = nextUrl.pathname;

  const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = cookieToken ? await verifySessionToken(cookieToken) : null;

  console.log(`[Middleware] Path: ${pathname} | Cookie: ${cookieToken ? 'PRESENT' : 'MISSING'} | Session: ${session ? session.role : 'NULL'}`);

  // 1. Protection for API Admin routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
  }

  // 2. Protection for Admin UI routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!session || session.role !== 'ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protection for Provider private UI routes (/providers/profile/private, /providers/settings)
  if (
    pathname.startsWith('/providers/profile/private') ||
    pathname.startsWith('/providers/settings')
  ) {
    if (!session || (session.role !== 'BARBER' && session.role !== 'ADMIN')) {
      const loginUrl = new URL('/providers/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Protection for Client UI routes (/profile, /history, /booking)
  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/booking')
  ) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Log server-side request telemetry
  const duration = performance.now() - startTime;
  logger.http(method, pathname, response.status, duration);

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/admin/:path*',
    '/providers/profile/private/:path*',
    '/providers/settings/:path*',
    '/profile/:path*',
    '/history/:path*',
    '/booking/:path*',
  ],
};
