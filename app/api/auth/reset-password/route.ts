import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/admin-user-store';

export const dynamic = 'force-dynamic';

import { rateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `reset_pw_${ip}`;

    // Check rate limit (5 attempts per 60 minutes)
    const rateLimit = await rateLimiter.checkLimit(rateLimitKey, 5, 3600);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed attempts. Please try again later.',
          retryAfter: rateLimit.resetIn
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const token = body?.token || '';
    const recoveryCode = body?.recoveryCode || '';
    const newPassword = body?.newPassword || '';

    if (!newPassword) {
      return NextResponse.json({ success: false, error: 'New password is required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const result = await resetPassword({ token, recoveryCode, newPassword });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Password reset failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
