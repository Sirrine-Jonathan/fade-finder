import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { method, nextUrl } = request;

  const response = NextResponse.next();

  // Log server-side telemetry for API routes and page requests
  const duration = Date.now() - startTime;
  console.log(
    `[SERVER TELEMETRY] ${new Date().toISOString()} | ${method} ${nextUrl.pathname} ${response.status} - ${duration}ms`
  );

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/history/:path*'],
};
