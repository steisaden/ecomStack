import { NextRequest, NextResponse } from 'next/server';
import { updateAffiliateProduct } from '@/lib/affiliate-products';
import { productSyncService } from '@/lib/background/product-sync';
import { verifyAuth } from '@/lib/auth';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
    );
  }

  try {
    const { action } = await request.json();
    const productId = context.params.id;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let responseMessage = '';
    let jobId;

    switch (action) {
      case 'refresh_image':
        jobId = await productSyncService.scheduleImageRefresh(productId);
        responseMessage = 'Image refresh scheduled successfully';
        break;
      case 'validate_link':
        jobId = await productSyncService.scheduleLinkValidation(productId);
        responseMessage = 'Link validation scheduled successfully';
        break;
      case 'refresh_product':
        // In a real implementation, this would refresh all product data from source
        jobId = await productSyncService.scheduleImageRefresh(productId);
        responseMessage = 'Product refresh scheduled successfully';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }

    return NextResponse.json({
      message: responseMessage,
      jobId
    }, { status: 200 });
  } catch (error) {
    console.error('Error refreshing individual product:', error);
    return NextResponse.json({
      error: 'Failed to refresh individual product'
    }, { status: 500 });
  }
}
