import { NextRequest, NextResponse } from 'next/server';
import { AIRecommendationService } from '@/lib/ai-recommendations';
import { getProducts } from '@/lib/contentful';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userPreferences,
      productId // Optional: for product-specific recommendations
    } = body;

    // Get all products if not provided
    const products = await getProducts();
    
    let recommendations;
    
    if (productId) {
      // Generate recommendations based on a specific product (similar products)
      const targetProduct = products.find(p => p.sys.id === productId);
      if (!targetProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      // Create preferences based on the target product for similar recommendations
      const similarProductPreferences = {
        categories: targetProduct.category ? [targetProduct.category.name] : [],
        keywords: [targetProduct.title, ...targetProduct.description.split(' ').slice(0, 5)],
      };
      
      recommendations = await AIRecommendationService.generateRecommendations(
        similarProductPreferences,
        products.filter(p => p.sys.id !== productId) // Exclude the target product
      );
    } else {
      // Generate personalized recommendations based on user preferences
      recommendations = await AIRecommendationService.generateRecommendations(
        userPreferences,
        products
      );
    }

    return NextResponse.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Recommendations API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
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
    
    // Get all products
    const products = await getProducts();
    
    if (productId) {
      // Get recommendations for a specific product (similar products)
      const targetProduct = products.find(p => p.sys.id === productId);
      if (!targetProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      // Create preferences based on the target product for similar recommendations
      const similarProductPreferences = {
        categories: targetProduct.category ? [targetProduct.category.name] : [],
        keywords: [targetProduct.title, ...targetProduct.description.split(' ').slice(0, 5)],
      };
      
      const recommendations = await AIRecommendationService.generateRecommendations(
        similarProductPreferences,
        products.filter(p => p.sys.id !== productId) // Exclude the target product
      );
      
      return NextResponse.json({
        success: true,
        recommendations,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'productId parameter is required for GET requests',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('AI Recommendations API GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}