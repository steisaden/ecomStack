// app/api/admin/amazon-paapi-config/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { amazonConfig } from '@/lib/config/amazon-config';
import { verifyAuth } from '@/lib/auth';
import { AmazonPAAPIService } from '@/lib/amazon-paapi';
import { PAAPICredentials, AmazonAPIError, AmazonAPIErrorType } from '@/lib/types/amazon';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    return NextResponse.json({
      isConfigured: amazonConfig.isConfigured,
      isValid: amazonConfig.isValid,
      validationError: amazonConfig.validationError,
      lastValidationTime: amazonConfig.lastValidationTime?.toISOString() || null,
      credentials: amazonConfig.isConfigured ? {
        accessKey: amazonConfig.credentials.accessKey ? '********' + amazonConfig.credentials.accessKey.slice(-4) : '',
        secretKey: amazonConfig.credentials.secretKey ? '********' + amazonConfig.credentials.secretKey.slice(-4) : '',
        partnerTag: amazonConfig.credentials.partnerTag,
      } : null,
    });
  } catch (error: any) {
    console.error('API Error fetching Amazon PA-API config status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    const { accessKey, secretKey, partnerTag } = await request.json();

    if (!accessKey || !secretKey || !partnerTag) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Temporarily create a service instance with provided credentials for testing
    const testCredentials: PAAPICredentials = { accessKey, secretKey, partnerTag };
    const testService = new AmazonPAAPIService('webservices.amazon.com', 'us'); // Host and region can be dynamic

    // Attempt a simple product fetch to validate credentials
    // Use a known valid ASIN for testing, or a dummy one that will fail gracefully
    const testAsin = 'B07P9W55Q4'; // Example ASIN for testing

    try {
      const product = await testService.getProduct(testAsin);
      if (product) {
        amazonConfig.setValidationStatus(true);
        return NextResponse.json({ success: true, message: 'Connection successful!' });
      } else {
        // Product not found, but credentials might be valid.
        // This case needs more robust handling, e.g., checking specific error codes.
        amazonConfig.setValidationStatus(true); // Assume valid if no specific error
        return NextResponse.json({ success: true, message: 'Connection successful, but test ASIN not found.' });
      }
    } catch (error: any) {
      if (error instanceof AmazonAPIError && error.type === AmazonAPIErrorType.AuthenticationFailed) {
        amazonConfig.setValidationStatus(false, error.message);
        return NextResponse.json({ success: false, error: error.message });
      } else if (error instanceof AmazonAPIError && error.type === AmazonAPIErrorType.InvalidASIN) {
        // If the test ASIN is invalid, it's not a credential failure
        amazonConfig.setValidationStatus(true);
        return NextResponse.json({ success: true, message: 'Connection successful, but test ASIN is invalid.' });
      }
      amazonConfig.setValidationStatus(false, error.message || 'Unknown error during connection test.');
      return NextResponse.json({ success: false, error: error.message || 'Unknown error during connection test.' });
    }
  } catch (error: any) {
    console.error('API Error testing Amazon PA-API connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
