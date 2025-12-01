import { NextResponse } from 'next/server';

// In-memory store for temporary holds
// In production, this should be replaced with a database
const temporaryHolds = new Map<string, { expiry: Date }>();

const HOLD_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function POST(request: Request) {
  try {
    const { serviceId, date, time } = await request.json();

    if (!serviceId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const holdKey = `${serviceId}-${date}-${time}`;
    
    // Check if slot is already held
    const existingHold = temporaryHolds.get(holdKey);
    if (existingHold && existingHold.expiry > new Date()) {
      return NextResponse.json(
        { error: 'Time slot is already held' },
        { status: 409 }
      );
    }

    // Create new hold
    const expiry = new Date(Date.now() + HOLD_DURATION);
    temporaryHolds.set(holdKey, { expiry });

    // Clean up expired holds
    for (const [key, hold] of temporaryHolds.entries()) {
      if (hold.expiry <= new Date()) {
        temporaryHolds.delete(key);
      }
    }

    return NextResponse.json({
      holdKey,
      expiry: expiry.toISOString()
    });
  } catch (error) {
    console.error('Error creating hold:', error);
    return NextResponse.json(
      { error: 'Failed to create hold' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { serviceId, date, time } = await request.json();

    if (!serviceId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const holdKey = `${serviceId}-${date}-${time}`;
    temporaryHolds.delete(holdKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error releasing hold:', error);
    return NextResponse.json(
      { error: 'Failed to release hold' },
      { status: 500 }
    );
  }
}