import { NextResponse } from 'next/server';
import { getCachedAffiliateProducts } from '@/lib/affiliate-products';

export async function GET(request: Request) {
  // Authenticate admin user
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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