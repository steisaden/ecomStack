import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateAvailability } from '@/lib/availability';
import { enforceSameOrigin } from '@/lib/security';

// Force dynamic rendering for checkout API
export const dynamic = 'force-dynamic';

// Lazily initialize Stripe only when a key is present to support local dev without Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

export async function POST(request: NextRequest) {
  try {
    const originError = enforceSameOrigin(request);
    if (originError) return originError;

    const body = await request.json();

    // Support both legacy and new payload shapes
    const serviceId = body.serviceId;
    const serviceName = body.serviceName;
    const servicePrice = body.servicePrice;
    const selectedDate = body.selectedDate || body.date; // legacy support
    const selectedTime = body.selectedTime || body.time; // legacy support
    const customerInfo = body.customerInfo || body.customer || {
      name: body?.name,
      email: body?.email,
      phone: body?.phone,
      specialRequests: body?.specialRequests,
    };
    const addOns = body.addOns || (body.addOnIds ? (body.addOnIds as string[]).map((id: string) => ({ id, name: 'Add-on', description: '', price: 0 })) : []);
    const intake = body.intake || null;

    // Validate required fields
    if (!serviceId || !serviceName || !servicePrice || !selectedDate || !selectedTime || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Verify availability before creating checkout session
    const bookingDate = new Date(selectedDate);
    const dateStr = bookingDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const isAvailable = await validateAvailability(serviceId, dateStr, selectedTime);
    
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Selected time slot is no longer available' },
        { status: 409 }
      );
    }

    // Calculate total price
    const addOnTotal = addOns.reduce((total: number, addOn: any) => total + (addOn.price || 0), 0);
    const totalPrice = servicePrice + addOnTotal;

    // Create line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: serviceName,
            description: `Yoga session on ${bookingDate.toLocaleDateString()} at ${selectedTime}`,
          },
          unit_amount: servicePrice * 100, // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Add add-ons as separate line items
    addOns.forEach((addOn: any) => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: addOn.name,
            description: addOn.description,
          },
          unit_amount: (addOn.price || 0) * 100,
        },
        quantity: 1,
      });
    });

    // Generate booking reference
    const bookingReference = `YOGA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // If Stripe is not configured (e.g., local dev), return a mocked successful response
    if (!stripe) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
      const mockSessionId = 'mock_session_id';
      const sessionUrl = `${baseUrl}/yoga-booking/confirmation?session_id=${mockSessionId}&booking_ref=${bookingReference}`;

      // Simulate reserving the time slot
      console.log(`[DEV MOCK] Reservation created for ${serviceName} on ${selectedDate} at ${selectedTime} for ${customerInfo.email}`);

      return NextResponse.json({
        success: true,
        sessionId: mockSessionId,
        sessionUrl,
        bookingReference,
        mocked: true,
        // Echo back intake data so we can persist later if needed
        intake,
      });
    }

    // Create Stripe checkout session (production / when key is present)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const session = await (stripe as Stripe).checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/yoga-booking/confirmation?session_id={CHECKOUT_SESSION_ID}&booking_ref=${bookingReference}`,
      cancel_url: `${baseUrl}/yoga-booking`,
      customer_email: customerInfo.email,
      metadata: {
        type: 'yoga_booking',
        serviceId,
        serviceName,
        selectedDate: selectedDate,
        selectedTime,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        bookingReference,
        addOns: JSON.stringify(addOns),
        specialRequests: customerInfo.specialRequests || '',
        // Persist intake answers in metadata
        injuryHistory: intake?.injuryHistory || '',
        pregnancyStatus: intake?.pregnancyStatus || '',
        pregnancyWeeks: intake?.pregnancyWeeks || '',
        medications: intake?.medications || '',
        birthMonth: intake?.birthMonth || '',
        birthDay: intake?.birthDay || '',
        waiverSigned: body.waiverSigned ? 'Yes' : 'No',
        waiverFirstName: body.waiverFirstName || '',
        waiverLastName: body.waiverLastName || '',
      },
    });

    // Reserve the time slot temporarily (you might want to implement a more sophisticated reservation system)
    // For now, we'll just log the reservation
    console.log(`Temporary reservation created for ${serviceName} on ${selectedDate} at ${selectedTime} for ${customerInfo.email}`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: (session as any).url,
      bookingReference,
    });

  } catch (error) {
    console.error('Error creating yoga checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
