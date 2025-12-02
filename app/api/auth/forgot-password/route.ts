import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/admin-user-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = (body?.username || '').trim();

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const result = await requestPasswordReset(username);
    if (!result.success) {
      const status = result.error?.includes('not been set up') ? 400 : 404;
      return NextResponse.json({ success: false, error: result.error || 'Unable to create reset token' }, { status });
    }

    // Return the reset token directly so the customer can use it right away.
    return NextResponse.json({
      success: true,
      resetToken: result.resetToken,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
