import { NextRequest, NextResponse } from 'next/server';
import { resetAuthState } from '@/lib/auth-state';

// Force dynamic rendering for authentication API
export const dynamic = 'force-dynamic';

// This function directly resets the blocked status
export async function POST(request: NextRequest) {
  try {
    // Reset the auth state
    const newState = resetAuthState();
    console.log('Authentication status reset successfully');
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Authentication status reset successfully',
      authState: newState
    });
  } catch (error) {
    console.error('Auth reset API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}