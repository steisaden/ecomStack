import { NextResponse } from 'next/server';
import { updateAffiliateProduct } from '@/lib/affiliate-products';
import { productSyncService } from '@/lib/background/product-sync';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Authenticate admin user
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action } = await request.json();
    const productId = params.id;

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