// app/api/amazon/products/batch/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { amazonPAAPIService } from '@/lib/amazon-paapi';
import { AmazonAPIError, AmazonAPIErrorType } from '@/lib/types/amazon';
import { authMiddleware } from '@/lib/auth-middleware';
import { amazonLogger } from '@/lib/amazon-logger';

const MAX_ASINS_PER_BATCH = 10;

export async function POST(request: NextRequest) {
  try {
    // Apply authentication middleware
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }

    const { asins } = await request.json();

    if (!Array.isArray(asins) || asins.length === 0) {
      return NextResponse.json(
        { error: 'Request body must contain an array of ASINs.' },
        { status: 400 }
      );
    }

    if (asins.length > MAX_ASINS_PER_BATCH) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ASINS_PER_BATCH} ASINs allowed per batch.` },
        { status: 400 }
      );
    }

    const validAsins: string[] = [];
    const failedAsins: { ASIN: string; error: string }[] = [];

    for (const asin of asins) {
      if (typeof asin !== 'string' || !amazonPAAPIService.validateASINFormat(asin)) {
        failedAsins.push({ ASIN: asin, error: 'Invalid ASIN format.' });
      } else {
        validAsins.push(amazonPAAPIService.sanitizeASIN(asin));
      }
    }

    if (validAsins.length === 0 && failedAsins.length > 0) {
      return NextResponse.json(
        { error: 'No valid ASINs provided.', failedASINs: failedAsins },
        { status: 400 }
      );
    }

    const products = await amazonPAAPIService.getProducts(validAsins);

    return NextResponse.json({ success: true, products, failedASINs });
  } catch (error: any) {
    amazonLogger.error('API Error fetching batch Amazon products:', error, { asinsCount: asins?.length });

    if (error instanceof AmazonAPIError) {
      switch (error.type) {
        case AmazonAPIErrorType.AuthenticationFailed:
          return NextResponse.json({ error: error.message }, { status: 403 });
        case AmazonAPIErrorType.RateLimitExceeded:
          return NextResponse.json({ error: error.message }, { status: 429 });
        case AmazonAPIErrorType.ServiceUnavailable:
          return NextResponse.json({ error: error.message }, { status: 503 });
        default:
          return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
