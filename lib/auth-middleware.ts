// lib/auth-middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { defaultRateLimiter } from './rate-limiter'; // Assuming defaultRateLimiter is suitable for IP-based limiting

// In-memory store for IP-based rate limiting (for demonstration purposes)
const ipRateLimitStore = new Map<string, number[]>();
const WINDOW_SIZE_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function getIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return request.ip || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = ipRateLimitStore.get(ip) || [];

  // Filter out requests older than the window
  const recentRequests = requests.filter(timestamp => now - timestamp < WINDOW_SIZE_MS);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recentRequests.push(now);
  ipRateLimitStore.set(ip, recentRequests);
  return false;
}

export async function authMiddleware(request: NextRequest): Promise<NextResponse | void> {
  // Development bypass for localhost
  if (process.env.NODE_ENV === 'development') {
    const host = request.headers.get('host');
    if (host?.includes('localhost') || host?.includes('127.0.0.1')) {
      console.log('🔓 Development mode: Bypassing auth for localhost');
      return; // Allow the request to proceed
    }
  }

  const ip = getIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    console.log('❌ No auth token found in cookies');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: string };

    if (decoded.role !== 'admin' && decoded.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Attach user info to request if needed by subsequent handlers
    // (Next.js doesn't directly support modifying request object in middleware like Express)
    // For now, we'll just let it pass if authorized.
    return; // Allow the request to proceed
  } catch (error) {
    // Use console.error here since this is auth middleware, not Amazon-specific
    // In production, this should use a general logger
    console.error('JWT verification failed:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
