import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Authenticate admin user
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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