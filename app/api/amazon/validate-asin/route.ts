// app/api/amazon/validate-asin/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { amazonPAAPIService } from '@/lib/amazon-paapi';
import { AmazonAPIError, AmazonAPIErrorType } from '@/lib/types/amazon';
import { authMiddleware } from '@/lib/auth-middleware';
import { amazonLogger } from '@/lib/amazon-logger';

export async function POST(request: NextRequest) {
  let asinValue: string | undefined;
  try {
    // Apply authentication middleware
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }

    const { asin } = await request.json();
    asinValue = asin;

    if (typeof asin !== 'string' || !asin) {
      return NextResponse.json(
        { error: 'Request body must contain an ASIN string.' },
        { status: 400 }
      );
    }

    const sanitizedAsin = amazonPAAPIService.sanitizeASIN(asin);

    if (!amazonPAAPIService.validateASINFormat(sanitizedAsin)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid ASIN format.' },
        { status: 400 }
      );
    }

    const validationResult = await amazonPAAPIService.validateASIN(sanitizedAsin);

    return NextResponse.json({ success: true, ...validationResult });
  } catch (error: any) {
    amazonLogger.error('API Error validating Amazon ASIN:', error, { asin: asinValue });

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
