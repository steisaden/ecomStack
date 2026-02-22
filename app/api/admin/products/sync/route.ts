import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
    );
  }

  try {
    // Trigger full product sync
    // In a real implementation, this would schedule a background job
    console.log('Full product sync initiated');

    return NextResponse.json({ 
      message: 'Full product sync initiated successfully',
      jobId: 'job-full-sync-' + Date.now()
    }, { status: 200 });
  } catch (error) {
    console.error('Error initiating full product sync:', error);
    return NextResponse.json({ 
      error: 'Failed to initiate full product sync' 
    }, { status: 500 });
  }
}
