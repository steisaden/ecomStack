import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyAdminCredentials } from '@/lib/admin-user-store';
import { rateLimiter } from '@/lib/rate-limiter';

// Force dynamic rendering for authentication API
export const dynamic = 'force-dynamic';

// Maximum failed attempts before blocking
const MAX_FAILED_ATTEMPTS = 5;
// Block duration in seconds
const BLOCK_DURATION = 1800; // 30 minutes

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `login_${ip}`;

    // Check rate limit (5 attempts per 30 minutes)
    const rateLimit = await rateLimiter.checkLimit(rateLimitKey, 5, 1800);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many failed attempts. Account temporarily blocked.',
          retryAfter: rateLimit.resetIn,
          blocked: true
        },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const verification = await verifyAdminCredentials(username, password);
    if (!verification.valid) {
      console.warn(`Failed login attempt for user: ${username} via ${verification.source} (IP: ${ip})`);

      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login


    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const authenticatedUsername = verification.user?.username || username.trim();
    const token = jwt.sign(
      {
        userId: `admin-${authenticatedUsername}`,
        username: authenticatedUsername,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      jwtSecret,
      {
        expiresIn: '24h',
        issuer: 'goddess-admin',
        audience: 'goddess-admin-users'
      }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        username: authenticatedUsername,
        role: 'admin'
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    console.log(`Successful login for user: ${username}`);
    return response;

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
