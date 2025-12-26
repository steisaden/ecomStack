import { NextRequest, NextResponse } from 'next/server';
import { getAvailability } from '@/lib/availability';

export async function GET(request: NextRequest) {
  try {
    const availability = await getAvailability();
    
    return NextResponse.json({
      success: true,
      message: 'Availability data retrieved successfully',
      data: availability,
      totalDates: Object.keys(availability).length,
      dates: Object.keys(availability).sort()
    });
  } catch (error) {
    console.error('Error in test availability endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve availability data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
