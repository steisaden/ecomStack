// app/api/amazon/product/[asin]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { amazonPAAPIService } from '@/lib/amazon-paapi';
import { AmazonAPIError, AmazonAPIErrorType } from '@/lib/types/amazon';
import { authMiddleware } from '@/lib/auth-middleware';
import { amazonLogger } from '@/lib/amazon-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { asin: string } }
) {
  try {
    const allowPublic = process.env.AMAZON_API_ALLOW_PUBLIC === 'true';
    const serviceKey = request.headers.get('x-service-key');
    const expectedServiceKey = process.env.SERVICE_API_KEY;

    // Apply authentication middleware
    if (!allowPublic) {
      // If a service key is provided and matches, skip cookie-based auth
      if (!(expectedServiceKey && serviceKey && serviceKey === expectedServiceKey)) {
        const authResponse = await authMiddleware(request);
        if (authResponse instanceof NextResponse) {
          return authResponse;
        }
      }
    }

    const { asin } = params;

    // Validate ASIN format
    if (!amazonPAAPIService.validateASINFormat(asin)) {
      return NextResponse.json(
        { error: 'Invalid ASIN format.' },
        { status: 400 }
      );
    }

    const sanitizedAsin = amazonPAAPIService.sanitizeASIN(asin);

    const result = await amazonPAAPIService.getProduct(sanitizedAsin);

    if (!result) {
      return NextResponse.json(
        { success: false, error: `Product with ASIN ${sanitizedAsin} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: result.product,
      cached: result.cached
    });
  } catch (error: any) {
    // Log the full error with stack trace for debugging
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      type: error.type,
      name: error.name,
      asin: params.asin
    });
    
    amazonLogger.error('API Error fetching single Amazon product:', error, { asin: params.asin });

    if (error instanceof AmazonAPIError) {
      switch (error.type) {
        case AmazonAPIErrorType.InvalidASIN:
          return NextResponse.json({ error: error.message }, { status: 400 });
        case AmazonAPIErrorType.AuthenticationFailed:
          return NextResponse.json({ error: error.message }, { status: 403 });
        case AmazonAPIErrorType.RateLimitExceeded:
          return NextResponse.json({ error: error.message }, { status: 429 });
        case AmazonAPIErrorType.ServiceUnavailable:
          return NextResponse.json({ error: error.message }, { status: 503 });
        default:
          return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
          );
      }
    }

    // Return the actual error message for debugging
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
