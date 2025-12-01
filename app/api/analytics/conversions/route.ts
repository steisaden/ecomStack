import { NextRequest, NextResponse } from 'next/server';
import { ConversionTrackingService, TrackingEvent } from '@/lib/conversion-tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, userId, sessionId, productId, metadata, url, referrer } = body;

    if (!eventType || !sessionId) {
      return NextResponse.json(
        { 
          error: 'eventType and sessionId are required' 
        },
        { status: 400 }
      );
    }

    // Track the event
    ConversionTrackingService.trackEvent({
      eventType,
      userId,
      sessionId,
      productId,
      metadata,
      url,
      referrer
    });

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Conversion Tracking API POST error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to track event',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'funnel';
    const userId = url.searchParams.get('userId');
    const productId = url.searchParams.get('productId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const includeDemoData = url.searchParams.get('includeDemoData') === 'true';
    
    let result;

    switch (action) {
      case 'userJourney':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required for user journey analysis' },
            { status: 400 }
          );
        }
        result = await ConversionTrackingService.getUserJourney(userId);
        break;

      case 'topProducts':
        result = await ConversionTrackingService.getTopConvertingProducts({
          startDate,
          endDate
        });
        break;

      case 'funnel':
      default:
        result = await ConversionTrackingService.analyzeConversionFunnel({
          userId,
          productId,
          startDate,
          endDate,
          includeDemoData
        });
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Conversion Tracking API GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze conversion data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}