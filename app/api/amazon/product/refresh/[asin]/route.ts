// app/api/amazon/product/refresh/[asin]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { amazonPAAPIService } from '@/lib/amazon-paapi';
import { cacheManager } from '@/lib/cache-manager';
import { AmazonAPIError, AmazonAPIErrorType } from '@/lib/types/amazon';
import { verifyAuth } from '@/lib/auth';
import { amazonLogger } from '@/lib/amazon-logger';

export async function POST(
  request: NextRequest,
  context: { params: { asin: string } }
) {
  try {
    const { asin } = context.params;
    // Apply authentication middleware
    const auth = await verifyAuth(request);

    // Validate ASIN format
    if (!amazonPAAPIService.validateASINFormat(asin)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ASIN format.' },
        { status: 400 }
      );
    }

    const sanitizedAsin = amazonPAAPIService.sanitizeASIN(asin);

    // Invalidate cache to force fresh fetch
    const cacheKey = `amazon-product-${sanitizedAsin}`;
    cacheManager.invalidate(cacheKey);
    amazonLogger.info(`Cache invalidated for product ${sanitizedAsin}`, { asin: sanitizedAsin });

    // Fetch fresh data
    const result = await amazonPAAPIService.getProduct(sanitizedAsin);

    if (!result) {
      return NextResponse.json(
        { success: false, error: `Product with ASIN ${sanitizedAsin} not found.` },
        { status: 404 }
      );
    }

    amazonLogger.info(`Product ${sanitizedAsin} refreshed successfully`, { asin: sanitizedAsin });

    return NextResponse.json({
      success: true,
      data: result.product,
      cached: false, // Always false for refresh
      message: `Product ${sanitizedAsin} refreshed from Amazon`
    });
  } catch (error: any) {
    amazonLogger.error('API Error refreshing Amazon product:', error);

    if (error instanceof AmazonAPIError) {
      switch (error.type) {
        case AmazonAPIErrorType.InvalidASIN:
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        case AmazonAPIErrorType.AuthenticationFailed:
          return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        case AmazonAPIErrorType.RateLimitExceeded:
          return NextResponse.json({ success: false, error: error.message }, { status: 429 });
        case AmazonAPIErrorType.ServiceUnavailable:
          return NextResponse.json({ success: false, error: error.message }, { status: 503 });
        default:
          return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
