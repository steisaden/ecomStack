import { NextRequest, NextResponse } from 'next/server';
import { amazonAPI } from '@/lib/amazon-api';
import { getCuratedAmazonProducts, CuratedProduct } from '@/lib/amazon-curated-catalog'; // Import the new function and interface
import { getProductImageUrl } from '@/lib/amazon-images'; // Keep if still used elsewhere, otherwise remove
import { getCurrentProductSet, generateNewProductSet, ENHANCED_SEARCH_TERMS } from '@/lib/catalog-rotation'; // Keep if still used elsewhere, otherwise remove

export async function GET(request: NextRequest) {
  try {
    // Get curated catalog (now fetches real Amazon catalog)
    const catalog = await getCuratedAmazonProducts();

    const message = catalog.length > 0
      ? `Loaded ${catalog.length} real Amazon products with verified affiliate links!`
      : 'No products available. Please check your Amazon API configuration.';

    return NextResponse.json({
      success: true,
      products: catalog,
      count: catalog.length,
      source: catalog.length > 0 ? 'real-amazon-products' : 'empty',
      message,
      timestamp: new Date().toISOString(),
      verifiedASINs: true
    });

  } catch (error: any) {
    console.error('Curated catalog API error:', error);

    // Fallback to an empty array or a minimal static set if there's an error
    return NextResponse.json(
      {
        success: false,
        products: [],
        count: 0,
        source: 'error-fallback',
        message: `Failed to load curated catalog: ${error.message || 'Unknown error'}. Please check Amazon API configuration.`
      },
      { status: 500 }
    );
  }
}