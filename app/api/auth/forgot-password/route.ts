import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/admin-user-store';
import { emailService } from '@/lib/email-service';
import { rateLimiter } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `forgot_pw_${ip}`;

    // Check rate limit (3 attempts per 60 minutes) - stricter than login
    const rateLimit = await rateLimiter.checkLimit(rateLimitKey, 3, 3600);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimit.resetIn
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const username = (body?.username || '').trim();

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const result = await requestPasswordReset(username);

    // Always return success even if user not found (security best practice)
    // But for this single-user admin system, specific errors might be helpful if the owner messes up.
    // Given the user asked for "Production Recommendations", we should prioritize security.

    if (result.success && result.resetToken) {
      // Send email
      const sent = await emailService.sendPasswordResetEmail(
        // In a real app we'd look up the user's email.
        // Here, we'll assume the business email is the admin's email for this single-user system
        // OR currently the system doesn't store an email for the admin user, just username/password.
        // We will default to the business email env var as the recipient since it's the site owner.
        process.env.BUSINESS_EMAIL || 'goddesshairandbodycare@gmail.com',
        result.resetToken
      );

      if (!sent) {
        console.error('Failed to send password reset email');
        // We might return an error here if email fails, so the user knows to check usage logs or config
        return NextResponse.json({ success: false, error: 'Failed to send reset email. Check server logs.' }, { status: 500 });
      }
    } else {
      // If user not found, we just wait a bit to mimic processing time (simple timing attack mitigation)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Do NOT return the token
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset email has been sent.'
    });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
