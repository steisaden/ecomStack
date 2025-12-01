import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/auth';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refresh-token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Attempt to refresh the token
    const refreshResult = await AuthenticationService.refreshToken(refreshToken);
    
    if (!refreshResult.success || !refreshResult.token) {
      // Clear invalid cookies
      const response = NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
      
      response.cookies.delete('auth-token');
      response.cookies.delete('refresh-token');
      
      return response;
    }

    // Set new access token cookie
    const response = NextResponse.json({
      success: true,
      expiresAt: refreshResult.expiresAt,
    });

    response.cookies.set('auth-token', refreshResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Token refresh API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}