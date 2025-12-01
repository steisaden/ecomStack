import { NextRequest, NextResponse } from 'next/server';
import { amazonAPI } from '@/lib/amazon-api';

export async function GET(request: NextRequest) {
  try {
    const testResult = await amazonAPI.testConnection();
    
    return NextResponse.json({
      configured: amazonAPI.isConfigured(),
      region: process.env.AMAZON_REGION,
      host: process.env.AMAZON_HOST,
      associateTag: process.env.AMAZON_ASSOCIATE_TAG ? 'Set' : 'Not set',
      mockDataEnabled: process.env.AMAZON_USE_MOCK_DATA === 'true',
      connectionTest: testResult
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to test Amazon API connection',
        details: error.message 
      },
      { status: 500 }
    );
  }
}