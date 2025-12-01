import { NextResponse } from 'next/server';
import { productSyncService } from '@/lib/background/product-sync';

export async function POST(request: Request) {
  // Authenticate admin user
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productIds, action } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Valid product IDs array is required' }, { status: 400 });
    }

    let responseMessage = '';
    const jobIds: string[] = [];

    for (const productId of productIds) {
      let jobId;
      switch (action) {
        case 'refresh_image':
          jobId = await productSyncService.scheduleImageRefresh(productId);
          break;
        case 'validate_link':
          jobId = await productSyncService.scheduleLinkValidation(productId);
          break;
        default:
          return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
      }
      jobIds.push(jobId);
    }

    return NextResponse.json({ 
      message: `${action.replace('_', ' ')} scheduled for ${productIds.length} products`,
      jobIds
    }, { status: 200 });
  } catch (error) {
    console.error('Error scheduling bulk refresh:', error);
    return NextResponse.json({ 
      error: 'Failed to schedule bulk refresh' 
    }, { status: 500 });
  }
}