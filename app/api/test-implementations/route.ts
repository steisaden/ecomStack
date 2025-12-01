import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { AIRecommendationService } from '@/lib/ai-recommendations';
import { PriceTrendService } from '@/lib/price-trend-analysis';
import { ConversionTrackingService } from '@/lib/conversion-tracking';
import { ROITrackingService } from '@/lib/roi-tracking';
import { RealTimeClickTrackingService } from '@/lib/click-tracking';
import { getProducts } from '../../../lib/contentful';

/**
 * Comprehensive test endpoint to verify all new implementations
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const test = url.searchParams.get('test') || 'all';
    
    let results: any = {};
    
    // Test AI Recommendation Service
    if (test === 'all' || test === 'ai') {
      console.log('Testing AI Recommendation Service...');
      try {
        const products = await getProducts();
        const sampleProduct = products[0];
        
        if (sampleProduct) {
          const recommendations = await AIRecommendationService.generateRecommendations({
            categories: [sampleProduct.category?.name || 'general'],
            priceRange: { min: 10, max: 100 },
            keywords: [sampleProduct.title]
          }, [sampleProduct]);
          
          const sentimentAnalysis = await AIRecommendationService.generateSentimentAnalyzedDescription(
            sampleProduct
          );
          
          results.ai = {
            success: true,
            recommendationsCount: recommendations.length,
            sentimentAnalysis: sentimentAnalysis.sentimentLabel
          };
        } else {
          results.ai = {
            success: false,
            error: 'No products available for AI testing'
          };
        }
      } catch (error) {
        results.ai = {
          success: false,
          error: error instanceof Error ? error.message : 'AI service test failed'
        };
      }
    }
    
    // Test Price Trend Service
    if (test === 'all' || test === 'price') {
      console.log('Testing Price Trend Service...');
      try {
        const sampleResult = await PriceTrendService.getPriceTrends(
          'test-product-123',
          'Test Product',
          '30d'
        );
        
        const comparisonResult = await PriceTrendService.getPriceComparison(
          'test-product-123',
          'Test Product',
          'test-category'
        );
        
        const recommendationResult = await PriceTrendService.getPriceRecommendations(
          'test-product-123',
          29.99
        );
        
        results.priceTrend = {
          success: true,
          trendAnalysis: sampleResult.trend,
          comparisonAvailable: comparisonResult.competitorPrices.length > 0,
          recommendation: recommendationResult.recommendedPrice
        };
      } catch (error) {
        results.priceTrend = {
          success: false,
          error: error instanceof Error ? error.message : 'Price trend service test failed'
        };
      }
    }
    
    // Test Conversion Tracking Service
    if (test === 'all' || test === 'conversion') {
      console.log('Testing Conversion Tracking Service...');
      try {
        // Track a sample event
        ConversionTrackingService.trackEvent({
          eventType: 'page_view',
          userId: 'test-user-123',
          sessionId: 'test-session-123',
          url: '/test-page'
        });
        
        ConversionTrackingService.trackEvent({
          eventType: 'product_view',
          userId: 'test-user-123',
          sessionId: 'test-session-123',
          productId: 'test-product-123',
          url: '/products/test'
        });
        
        // Analyze conversion funnel
        const funnelAnalysis = await ConversionTrackingService.analyzeConversionFunnel({
          includeDemoData: true
        });
        
        results.conversionTracking = {
          success: true,
          funnelSteps: funnelAnalysis.funnelSteps.length,
          conversionRate: funnelAnalysis.conversionRate
        };
      } catch (error) {
        results.conversionTracking = {
          success: false,
          error: error instanceof Error ? error.message : 'Conversion tracking test failed'
        };
      }
    }
    
    // Test ROI Tracking Service
    if (test === 'all' || test === 'roi') {
      console.log('Testing ROI Tracking Service...');
      try {
        const testTimeRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        };
        
        const roiResult = await ROITrackingService.calculateProductROI(
          'test-product-123',
          testTimeRange,
          {
            marketingSpend: 500,
            inventoryCost: 300,
            operationalCosts: 100,
            otherCosts: 50
          }
        );
        
        const allProductsROI = await ROITrackingService.getAllProductsROI(testTimeRange);
        
        results.roiTracking = {
          success: true,
          sampleROIPercentage: roiResult.roiPercentage,
          productsAnalyzed: allProductsROI.length
        };
      } catch (error) {
        results.roiTracking = {
          success: false,
          error: error instanceof Error ? error.message : 'ROI tracking test failed'
        };
      }
    }
    
    // Test Click Tracking Service
    if (test === 'all' || test === 'clicks') {
      console.log('Testing Click Tracking Service...');
      try {
        // Track a sample click
        RealTimeClickTrackingService.trackClick({
          sessionId: 'test-session-123',
          elementId: 'test-button',
          elementName: 'Test Button',
          elementType: 'button',
          url: '/test-page',
          x: 100,
          y: 200
        });
        
        // Get real-time analytics
        const analytics = await RealTimeClickTrackingService.getRealTimeAnalytics();
        
        // Get element analytics
        const elementAnalytics = await RealTimeClickTrackingService.getElementAnalytics('test-button');
        
        results.clickTracking = {
          success: true,
          totalClicks: analytics.totalClicks,
          uniqueElements: analytics.topClickElements.length,
          elementClicks: elementAnalytics.totalClicks
        };
      } catch (error) {
        results.clickTracking = {
          success: false,
          error: error instanceof Error ? error.message : 'Click tracking test failed'
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      testResults: results,
      timestamp: new Date().toISOString(),
      summary: {
        testsRun: Object.keys(results).length,
        passed: Object.values(results).filter((r: any) => r.success).length,
        allPassed: Object.values(results).every((r: any) => r.success)
      }
    });
  } catch (error) {
    console.error('Comprehensive Test API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Comprehensive test failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test, config } = body;
    
    // Allow running specific tests with custom configuration
    let result;
    
    switch (test) {
      case 'ai-recommendations':
        result = await AIRecommendationService.generateRecommendations(
          config.userPreferences || {},
          config.products || []
        );
        break;
        
      case 'sentiment-analysis':
        // Create a mock product for testing
        const mockProduct = {
          sys: { id: config.productId || 'test-123' },
          title: config.title || 'Test Product',
          description: config.description || 'This is a test product description',
          price: config.price || 29.99,
          images: [],
          inStock: true,
          isAffiliate: false,
          affiliateUrl: '',
          slug: 'test-product',
        };
        result = await AIRecommendationService.generateSentimentAnalyzedDescription(
          mockProduct,
          config.description
        );
        break;
        
      case 'price-trends':
        result = await PriceTrendService.getPriceTrends(
          config.productId || 'test-123',
          config.productName || 'Test Product',
          config.timeRange || '30d'
        );
        break;
        
      case 'conversion-funnel':
        result = await ConversionTrackingService.analyzeConversionFunnel(
          config.options || {}
        );
        break;
        
      case 'roi-calculation':
        result = await ROITrackingService.calculateProductROI(
          config.productId || 'test-123',
          config.timeRange || {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          config.costs || {
            marketingSpend: 500,
            inventoryCost: 300,
            operationalCosts: 100,
            otherCosts: 50
          }
        );
        break;
        
      case 'click-tracking':
        RealTimeClickTrackingService.trackClick(config.clickData);
        result = await RealTimeClickTrackingService.getRealTimeAnalytics();
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid test specified' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      testData: result,
      testType: test,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Comprehensive Test API POST error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test execution failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}