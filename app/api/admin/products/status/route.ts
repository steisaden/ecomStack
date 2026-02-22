import { NextResponse } from 'next/server';
import { getCachedAffiliateProducts } from '@/lib/affiliate-products';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
    );
  }

  try {
    const products = await getCachedAffiliateProducts();
    
    // Calculate status summary
    const statusSummary = {
      totalProducts: products.length,
      currentImage: products.filter(p => p.imageRefreshStatus === 'current').length,
      outdatedImage: products.filter(p => p.imageRefreshStatus === 'outdated').length,
      failedImage: products.filter(p => p.imageRefreshStatus === 'failed').length,
      validLinks: products.filter(p => p.linkValidationStatus === 'valid').length,
      invalidLinks: products.filter(p => p.linkValidationStatus === 'invalid').length,
      checkingLinks: products.filter(p => p.linkValidationStatus === 'checking').length,
      needsReview: products.filter(p => p.needsReview).length,
    };

    return NextResponse.json(statusSummary, { status: 200 });
  } catch (error) {
    console.error('Error fetching product status summary:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch product status summary' 
    }, { status: 500 });
  }
}
