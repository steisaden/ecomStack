import { NextResponse } from 'next/server';
import { productSyncService } from '@/lib/background/product-sync';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
    );
  }

  try {
    const productId = params.id;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Schedule link validation for specific product
    const jobId = await productSyncService.scheduleLinkValidation(productId);

    return NextResponse.json({
      message: 'Link validation scheduled for product',
      jobId
    }, { status: 200 });
  } catch (error) {
    console.error('Error scheduling link validation for product:', error);
    return NextResponse.json({
      error: 'Failed to schedule link validation for product'
    }, { status: 500 });
  }
}
