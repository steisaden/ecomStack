import { NextResponse } from 'next/server';
import { productSyncService } from '@/lib/background/product-sync';

export async function POST(request: Request) {
  // Authenticate admin user
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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