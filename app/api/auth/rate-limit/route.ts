import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const ip = String(body?.ip || 'unknown');
    const scope = String(body?.scope || 'auth');
    const limit = Number(body?.limit || 5);
    const windowSeconds = Number(body?.windowSeconds || 900);

    const key = `auth:${scope}:${ip}`;
    const result = await rateLimiter.checkLimit(key, limit, windowSeconds);

    return NextResponse.json({
      success: result.success,
      remaining: result.remaining,
      resetIn: result.resetIn
    });
  } catch (error) {
    console.error('Rate limit API error:', error);
    return NextResponse.json(
      { success: false, error: 'Rate limiting unavailable' },
      { status: 503 }
    );
  }
}
