import { NextRequest, NextResponse } from 'next/server';
import { RealTimeClickTrackingService, ClickEvent } from '@/lib/click-tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      sessionId, 
      elementId, 
      elementName, 
      elementType, 
      url, 
      referrer, 
      metadata,
      x,
      y,
      viewportWidth,
      viewportHeight
    } = body;

    if (!sessionId || !url) {
      return NextResponse.json(
        { 
          error: 'sessionId and url are required' 
        },
        { status: 400 }
      );
    }

    // Track the click event
    RealTimeClickTrackingService.trackClick({
      userId,
      sessionId,
      elementId,
      elementName,
      elementType: elementType || 'unknown',
      url,
      referrer,
      metadata,
      x,
      y,
      viewportWidth,
      viewportHeight
    });

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Click Tracking API POST error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to track click',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'realtime';
    const elementId = url.searchParams.get('elementId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const urlFilter = url.searchParams.get('url');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    let result;

    switch (action) {
      case 'element':
        if (!elementId) {
          return NextResponse.json(
            { 
              error: 'elementId is required for element analytics' 
            },
            { status: 400 }
          );
        }
        result = await RealTimeClickTrackingService.getElementAnalytics(
          elementId, 
          { startDate, endDate, url: urlFilter }
        );
        break;

      case 'recent':
        result = await RealTimeClickTrackingService.getRecentClicks(limit);
        break;

      case 'recommendations':
        result = await RealTimeClickTrackingService.generateClickRecommendations({
          startDate,
          endDate,
          url: urlFilter
        });
        break;

      case 'realtime':
      default:
        result = await RealTimeClickTrackingService.getRealTimeAnalytics({
          startDate,
          endDate,
          url: urlFilter
        });
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Click Tracking API GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get click analytics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}