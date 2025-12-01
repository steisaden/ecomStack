import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getCuratedAmazonProducts } from '@/lib/amazon-curated-catalog';

export async function POST(request: NextRequest) {
  try {
    console.log('Refreshing catalog with new products from Amazon...');

    // Revalidate cache tags to ensure fresh data
    revalidateTag('curated-catalog');
    revalidateTag('amazon-products');
    revalidateTag('amazon-curated-products');

    // Fetch fresh products from Amazon
    const newProducts = await getCuratedAmazonProducts();

    return NextResponse.json({
      success: true,
      message: `Successfully refreshed catalog with ${newProducts.length} products from Amazon.`,
      products: newProducts,
      count: newProducts.length,
      source: 'amazon-api',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error refreshing curated catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh curated catalog',
        message: error.message || 'An error occurred while refreshing the curated catalog',
      },
      { status: 500 }
    );
  }
}