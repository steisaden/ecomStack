import { NextRequest, NextResponse } from 'next/server';
import { PriceTrendService } from '@/lib/price-trend-analysis';
import { getProducts } from '@/lib/contentful';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const timeRange = url.searchParams.get('timeRange') as '7d' | '30d' | '90d' | '1y' || '30d';
    const action = url.searchParams.get('action') || 'trends'; // 'trends', 'comparison', 'recommendations'
    
    if (!productId) {
      return NextResponse.json(
        { 
          error: 'productId parameter is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Get the product to use its information
    const products = await getProducts();
    const product = products.find(p => p.sys.id === productId);
    
    if (!product) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    let result;
    
    switch (action) {
      case 'comparison':
        result = await PriceTrendService.getPriceComparison(
          productId,
          product.title,
          product.category?.name || 'general'
        );
        break;
        
      case 'recommendations':
        result = await PriceTrendService.getPriceRecommendations(
          productId,
          product.price || 0
        );
        break;
        
      case 'trends':
      default:
        result = await PriceTrendService.getPriceTrends(
          productId,
          product.title,
          timeRange
        );
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Price Trend Analysis API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze price trends',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST endpoint for price recommendations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, currentPrice } = body;

    if (!productId) {
      return NextResponse.json(
        { 
          error: 'productId is required' 
        },
        { status: 400 }
      );
    }

    const recommendedPrice = await PriceTrendService.getPriceRecommendations(
      productId,
      currentPrice || 0
    );

    return NextResponse.json({
      success: true,
      data: recommendedPrice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Price Recommendation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate price recommendations',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}