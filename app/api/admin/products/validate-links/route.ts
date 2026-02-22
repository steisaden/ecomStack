import { NextResponse } from 'next/server';
import { productSyncService } from '@/lib/background/product-sync';
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
    // Schedule link validation for all products
    const jobId = await productSyncService.scheduleLinkValidation();
    
    return NextResponse.json({ 
      message: 'Link validation scheduled for all products',
      jobId
    }, { status: 200 });
  } catch (error) {
    console.error('Error scheduling link validation:', error);
    return NextResponse.json({ 
      error: 'Failed to schedule link validation' 
    }, { status: 500 });
  }
}
