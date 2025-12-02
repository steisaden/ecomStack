import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAuthState, updateAuthState, resetAuthState, incrementFailedAttempts, blockAuth } from '@/lib/auth-state';
import { verifyAdminCredentials } from '@/lib/admin-user-store';

// Force dynamic rendering for authentication API
export const dynamic = 'force-dynamic';

// Maximum failed attempts before blocking
const MAX_FAILED_ATTEMPTS = 5;
// Block duration in seconds
const BLOCK_DURATION = 1800; // 30 minutes

export async function POST(request: NextRequest) {
  try {
    // Check if account is blocked
    const authState = getAuthState();
    if (authState.blocked) {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = authState.retryAfter - currentTime;
      
      if (remainingTime > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Too many failed attempts. Account temporarily blocked.',
            retryAfter: remainingTime,
            blocked: true
          },
          { status: 429 }
        );
      } else {
        // Reset block if time has expired
        updateAuthState({
          blocked: false,
          retryAfter: 0
        });
      }
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
      console.warn(`Failed login attempt for user: ${username} via ${verification.source}`);
      
      incrementFailedAttempts();
      const currentAuthState = getAuthState();
      
      if (currentAuthState.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        blockAuth(BLOCK_DURATION);
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Too many failed attempts. Account temporarily blocked.',
            retryAfter: BLOCK_DURATION,
            blocked: true
          },
          { status: 429 }
        );
      }
      
      const status = verification.error === 'Admin credentials are not configured' ? 500 : 401;
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid credentials' },
        { status }
      );
    }
    
    // Reset failed attempts on successful login
    resetAuthState();

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
