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
    
    // Filter products with broken links
    const brokenLinkProducts = products
      .filter(p => p.linkValidationStatus === 'invalid')
      .map(({ id, title, affiliateUrl, linkValidationStatus, lastLinkCheck }) => ({
        id,
        title,
        affiliateUrl,
        linkValidationStatus,
        lastLinkCheck
      }));

    return NextResponse.json(brokenLinkProducts, { status: 200 });
  } catch (error) {
    console.error('Error fetching products with broken links:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products with broken links' 
    }, { status: 500 });
  }
}
