import { NextRequest, NextResponse } from 'next/server';
import { ROITrackingService } from '@/lib/roi-tracking';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'product';
    const productId = url.searchParams.get('productId');
    const startDate = url.searchParams.get('startDate') || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago
    const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const interval = url.searchParams.get('interval') as 'daily' | 'weekly' | 'monthly' || 'weekly';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { 
          error: 'startDate and endDate are required parameters',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'allProducts':
        result = await ROITrackingService.getAllProductsROI({
          start: startDate,
          end: endDate
        });
        break;

      case 'topPerformers':
        result = await ROITrackingService.getTopROIPerformers({
          start: startDate,
          end: endDate
        }, limit);
        break;

      case 'trend':
        if (!productId) {
          return NextResponse.json(
            { 
              error: 'productId is required for trend analysis',
              timestamp: new Date().toISOString()
            },
            { status: 400 }
          );
        }
        result = await ROITrackingService.getProductPerformanceTrend(
          productId,
          { start: startDate, end: endDate },
          interval
        );
        break;

      case 'recommendations':
        result = await ROITrackingService.generateROIRecommendations({
          start: startDate,
          end: endDate
        });
        break;

      case 'product':
      default:
        if (!productId) {
          return NextResponse.json(
            { 
              error: 'productId is required for single product analysis',
              timestamp: new Date().toISOString()
            },
            { status: 400 }
          );
        }
        
        // Default costs for simulation (in a real app, these would come from your data)
        const defaultCosts = {
          marketingSpend: 500,
          inventoryCost: 300,
          operationalCosts: 100,
          otherCosts: 50
        };
        
        result = await ROITrackingService.calculateProductROI(
          productId,
          { start: startDate, end: endDate },
          defaultCosts
        );
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ROI Tracking API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze ROI data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST endpoint for calculating ROI with custom costs
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }
    const body = await request.json();
    const { productId, timeRange, costs } = body;

    if (!productId || !timeRange?.start || !timeRange?.end || !costs) {
      return NextResponse.json(
        { 
          error: 'productId, timeRange (with start and end), and costs are required' 
        },
        { status: 400 }
      );
    }

    const roiData = await ROITrackingService.calculateProductROI(
      productId,
      timeRange,
      costs
    );

    return NextResponse.json({
      success: true,
      data: roiData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ROI Tracking API POST error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to calculate ROI',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
