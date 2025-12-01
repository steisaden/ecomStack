import { NextRequest, NextResponse } from 'next/server';
import { extractProductImageFromAmazon } from '@/lib/amazon-image-extractor';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get('asin');

  if (!asin) {
    return NextResponse.json(
      { error: 'ASIN parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Apply authentication middleware if needed
    // (uncomment the following lines if authentication is required)
    /*
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }
    */

    const result = await extractProductImageFromAmazon(asin);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          imageUrl: null
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      title: result.title,
      price: result.price
    });
  } catch (error: any) {
    console.error('Error in Amazon image scraping API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during Amazon image scraping',
        imageUrl: null
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply authentication middleware if needed
    // (uncomment the following lines if authentication is required)
    /*
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }
    */

    const body = await request.json();
    const { asin } = body;

    if (!asin) {
      return NextResponse.json(
        { error: 'ASIN is required in request body' },
        { status: 400 }
      );
    }

    const result = await extractProductImageFromAmazon(asin);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          imageUrl: null
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      title: result.title,
      price: result.price
    });
  } catch (error: any) {
    console.error('Error in Amazon image scraping API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during Amazon image scraping',
        imageUrl: null
      },
      { status: 500 }
    );
  }
}