import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export function middleware(request: NextRequest) {
  const startTime = performance.now();
  const { method, nextUrl } = request;

  const response = NextResponse.next();

  // Log server-side request telemetry
  const duration = performance.now() - startTime;
  logger.http(method, nextUrl.pathname, response.status, duration);

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/history/:path*'],
};
