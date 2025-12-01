import { NextRequest, NextResponse } from 'next/server';
import { amazonAPI } from '@/lib/amazon-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords');
    const searchIndex = searchParams.get('searchIndex') || 'Beauty';
    const itemCount = parseInt(searchParams.get('itemCount') || '10');

    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      );
    }

    if (!amazonAPI.isConfigured()) {
      return NextResponse.json(
        { error: 'Amazon API not configured' },
        { status: 503 }
      );
    }

    const products = await amazonAPI.searchProducts(keywords, searchIndex, itemCount);
    
    // Convert to our affiliate product format
    const affiliateProducts = products.map(product => 
      amazonAPI.convertToAffiliateProduct(product)
    ).filter(product => product !== null);

    return NextResponse.json({
      success: true,
      products: affiliateProducts,
      count: affiliateProducts.length
    });

  } catch (error: any) {
    console.error('Amazon search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search Amazon products', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, searchIndex = 'Beauty', itemCount = 10 } = body;

    if (!keywords) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Keywords are required',
          products: [],
          count: 0
        },
        { status: 400 }
      );
    }

    if (!amazonAPI.isConfigured()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Amazon API not configured. Please add your Amazon Associates credentials to the environment variables.',
          products: [],
          count: 0,
          configurationRequired: true
        },
        { status: 200 } // Return 200 so the frontend can handle it gracefully
      );
    }

    try {
      const products = await amazonAPI.searchProducts(keywords, searchIndex, itemCount);
      
      // Convert to our affiliate product format
      const affiliateProducts = products.map(product => 
        amazonAPI.convertToAffiliateProduct(product)
      ).filter(product => product !== null);

      return NextResponse.json({
        success: true,
        products: affiliateProducts,
        count: affiliateProducts.length,
        message: affiliateProducts.length > 0 
          ? `Found ${affiliateProducts.length} products for "${keywords}"`
          : `No products found for "${keywords}". Try different search terms.`
      });

    } catch (apiError: any) {
      console.error('Amazon API error:', apiError);
      
      // Return a user-friendly error response
      let errorMessage = 'Amazon API request failed';
      
      if (apiError.message.includes('authentication failed')) {
        errorMessage = 'Amazon API authentication failed. Please check your credentials and ensure your Amazon Associates account has API access approved.';
      } else if (apiError.message.includes('rate limit')) {
        errorMessage = 'Amazon API rate limit exceeded. Please try again in a few minutes.';
      } else if (apiError.message.includes('403')) {
        errorMessage = 'Amazon API access denied. Please verify your credentials and API permissions.';
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        products: [],
        count: 0,
        details: apiError.message
      }, { status: 200 }); // Return 200 so frontend can handle gracefully
    }

  } catch (error: any) {
    console.error('Amazon search API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search Amazon products', 
        details: error.message,
        products: [],
        count: 0
      },
      { status: 500 }
    );
  }
}