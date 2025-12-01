import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAuthState, updateAuthState, resetAuthState, incrementFailedAttempts, blockAuth } from '@/lib/auth-state';

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

    // Check credentials against environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    console.log('Environment check:', {
      hasAdminUsername: !!adminUsername,
      hasAdminPasswordHash: !!adminPasswordHash,
      adminUsername: adminUsername || 'NOT SET',
      passwordHashLength: adminPasswordHash ? adminPasswordHash.length : 0
    });

    if (!adminUsername || !adminPasswordHash) {
      console.error('Admin credentials not configured in environment variables');
      console.error('ADMIN_USERNAME:', adminUsername || 'NOT SET');
      console.error('ADMIN_PASSWORD_HASH:', adminPasswordHash ? 'SET' : 'NOT SET');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify username
    if (username !== adminUsername) {
      console.warn(`Failed login attempt with username: ${username}`);
      
      // Increment failed attempts
      incrementFailedAttempts();
      const authState = getAuthState();
      
      // Check if we should block
      if (authState.failedAttempts >= MAX_FAILED_ATTEMPTS) {
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
      
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password with timeout to prevent hanging
    let passwordMatch = false;
    try {
      const comparePromise = bcrypt.compare(password, adminPasswordHash);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Password verification timeout')), 10000)
      );
      
      passwordMatch = await Promise.race([comparePromise, timeoutPromise]) as boolean;
    } catch (error) {
      console.error('Password verification error:', error);
      console.warn(`Failed login attempt for user: ${username} - verification error`);
      
      // Increment failed attempts
      incrementFailedAttempts();
      const authState = getAuthState();
      
      // Check if we should block
      if (authState.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        blockAuth(BLOCK_DURATION);
        const authState = getAuthState();
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
      
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    if (!passwordMatch) {
      console.warn(`Failed login attempt for user: ${username} - password mismatch`);
      
      // Increment failed attempts
      incrementFailedAttempts();
      const authState = getAuthState();
      
      // Check if we should block
      if (authState.failedAttempts >= MAX_FAILED_ATTEMPTS) {
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
      
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
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

    const token = jwt.sign(
      { 
        userId: 'admin-user', // Required field for TokenPayload interface
        username: adminUsername,
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
        username: adminUsername,
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