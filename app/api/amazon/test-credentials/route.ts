// app/api/amazon/test-credentials/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { amazonConfig } from '@/lib/config/amazon-config';

export async function GET(request: NextRequest) {
  // Development only endpoint
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const credentials = amazonConfig.credentials;
    
    return NextResponse.json({
      configured: amazonConfig.isConfigured,
      valid: amazonConfig.isValid,
      credentials: {
        accessKey: credentials.accessKey ? `${credentials.accessKey.substring(0, 4)}...${credentials.accessKey.substring(credentials.accessKey.length - 4)}` : 'NOT SET',
        secretKey: credentials.secretKey ? `${credentials.secretKey.substring(0, 4)}...${credentials.secretKey.substring(credentials.secretKey.length - 4)}` : 'NOT SET',
        partnerTag: credentials.partnerTag || 'NOT SET',
      },
      env: {
        AMAZON_ACCESS_KEY: process.env.AMAZON_ACCESS_KEY ? 'SET' : 'NOT SET',
        AMAZON_SECRET_KEY: process.env.AMAZON_SECRET_KEY ? 'SET' : 'NOT SET',
        AMAZON_ASSOCIATE_TAG: process.env.AMAZON_ASSOCIATE_TAG ? 'SET' : 'NOT SET',
        AMAZON_USE_MOCK_DATA: process.env.AMAZON_USE_MOCK_DATA,
        NODE_ENV: process.env.NODE_ENV,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      configured: false
    }, { status: 500 });
  }
}
