import { NextRequest, NextResponse } from 'next/server';
import { adminUserExists, createAdminUser } from '@/lib/admin-user-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = (body?.username || '').trim();
    const password = body?.password || '';

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    if (await adminUserExists()) {
      return NextResponse.json({ success: false, error: 'Admin account already exists' }, { status: 400 });
    }

    const result = await createAdminUser(username, password);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Unable to create admin user' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      username: username,
      recoveryCode: result.recoveryCode,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
