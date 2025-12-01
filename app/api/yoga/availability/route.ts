import { NextResponse } from 'next/server';
import { getServiceAvailability } from '@/lib/yoga/availability';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!serviceId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const availability = await getServiceAvailability(
      serviceId,
      new Date(startDate),
      new Date(endDate)
    );
    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching service availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
