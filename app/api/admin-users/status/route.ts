import { NextRequest, NextResponse } from 'next/server';
import { adminUserExists } from '@/lib/admin-user-store';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const configured = await adminUserExists();
    if (configured) {
      const auth = await verifyAuth(request);
      if (!auth.success) {
        return NextResponse.json(
          { error: auth.error || 'Unauthorized' },
          { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
        );
      }
    }

    return NextResponse.json({
      configured,
    });
  } catch (error) {
    console.error('Error checking admin user status:', error);
    return NextResponse.json({ configured: false, error: 'Unable to read admin user status' }, { status: 500 });
  }
}
