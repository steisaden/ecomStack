import { NextRequest, NextResponse } from 'next/server';
import { AIRecommendationService } from '@/lib/ai-recommendations';
import { getProducts } from '@/lib/contentful';
import { enforceSameOrigin } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const originError = enforceSameOrigin(request);
    if (originError) return originError;

    const body = await request.json();
    const { productId, description } = body;

    if (!productId && !description) {
      return NextResponse.json(
        { 
          error: 'Either productId or description is required' 
        },
        { status: 400 }
      );
    }

    let product;
    let targetDescription = description;

    // If product ID is provided, fetch the product and use its description
    if (productId) {
      const products = await getProducts();
      product = products.find(p => p.sys.id === productId);
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      targetDescription = targetDescription || product.description;
    }

    if (!targetDescription) {
      return NextResponse.json(
        { error: 'No description provided for analysis' },
        { status: 400 }
      );
    }

    let result;
    
    if (product) {
      // If we have a product, analyze its description
      result = await AIRecommendationService.generateSentimentAnalyzedDescription(
        product,
        targetDescription
      );
    } else {
      // If we only have a description, create a temporary product object
      result = await AIRecommendationService.generateSentimentAnalyzedDescription(
        {
          sys: { id: 'temp' },
          title: 'Temporary Product',
          description: targetDescription,
          price: 0,
          images: [],
          inStock: true,
          isAffiliate: false,
          affiliateUrl: '',
          slug: '',
        },
        targetDescription
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Sentiment Analysis API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze sentiment',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const analyzeAll = url.searchParams.get('analyzeAll');
    
    if (analyzeAll === 'true') {
      // Analyze emotional impact for all products
      const products = await getProducts();
      const analysis = await AIRecommendationService.analyzeProductEmotionalImpact(products);
      
      return NextResponse.json({
        success: true,
        analyses: analysis,
        timestamp: new Date().toISOString()
      });
    } else if (productId) {
      // Analyze a specific product
      const products = await getProducts();
      const product = products.find(p => p.sys.id === productId);
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      const result = await AIRecommendationService.generateSentimentAnalyzedDescription(
        product
      );
      
      return NextResponse.json({
        success: true,
        productId,
        ...result,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'productId parameter is required for single product analysis or use analyzeAll=true for all products',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('AI Sentiment Analysis API GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze sentiment',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
