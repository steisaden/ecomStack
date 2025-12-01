import { getAvailability, updateAllAvailability } from '@/lib/availability';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const dateParam = searchParams.get('date');

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const serviceAvailability = await getAvailability(serviceId);

    // If a specific date is requested, return only that date's slots
    if (dateParam) {
      const requestedDate = new Date(dateParam);
      const dateKey = requestedDate.toISOString().split('T')[0];
      
      const dayAvailability = serviceAvailability[dateKey] || {};
      const availableSlots = Object.keys(dayAvailability).filter(
        time => dayAvailability[time] === 'available'
      );

      return NextResponse.json({
        success: true,
        data: {
          date: dateKey,
          availableSlots: availableSlots.sort(),
        },
      });
    }

    // Otherwise return all availability for the service
    return NextResponse.json({
      success: true,
      data: serviceAvailability,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceIds, date, timeSlots, action, dateRange } = body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { error: 'Service IDs array is required' },
        { status: 400 }
      );
    }

    if ((!date && !dateRange) || !timeSlots || !action) {
      return NextResponse.json(
        { error: 'Date or date range, time slots, and action are required' },
        { status: 400 }
      );
    }

    const allAvailability = await getAvailability();

    const datesToUpdate: string[] = [];
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      datesToUpdate.push(dateObj.toISOString().split('T')[0]);
    } else if (dateRange && dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return NextResponse.json({ error: 'Invalid date range format' }, { status: 400 });
      }
      for (let d = from; d <= to; d.setDate(d.getDate() + 1)) {
        datesToUpdate.push(new Date(d).toISOString().split('T')[0]);
      }
    }

    for (const serviceId of serviceIds) {
      if (!allAvailability[serviceId]) {
        allAvailability[serviceId] = {};
      }

      for (const updateDateStr of datesToUpdate) {
        if (!allAvailability[serviceId][updateDateStr]) {
          allAvailability[serviceId][updateDateStr] = {};
        }

        timeSlots.forEach((timeSlot: string) => {
          if (action === 'add') {
            allAvailability[serviceId][updateDateStr][timeSlot] = 'available';
          } else if (action === 'remove') {
            delete allAvailability[serviceId][updateDateStr][timeSlot];
          }
        });
      }
    }
    
    await updateAllAvailability(allAvailability);

    // Revalidate the cache for each service
    serviceIds.forEach(id => revalidateTag(`availability-${id}`));
    revalidateTag('availability-all');


    return NextResponse.json({
      success: true,
      data: {
        serviceIds,
        dates: datesToUpdate,
        updated: timeSlots,
        action,
      },
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}