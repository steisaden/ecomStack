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
