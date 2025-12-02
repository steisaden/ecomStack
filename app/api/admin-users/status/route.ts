import { NextResponse } from 'next/server';
import { adminUserExists, getAdminUsername } from '@/lib/admin-user-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const configured = await adminUserExists();
    const username = configured ? await getAdminUsername() : null;

    return NextResponse.json({
      configured,
      username,
    });
  } catch (error) {
    console.error('Error checking admin user status:', error);
    return NextResponse.json({ configured: false, error: 'Unable to read admin user status' }, { status: 500 });
  }
}
