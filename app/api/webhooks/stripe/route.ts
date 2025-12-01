import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { emailService, SaleConfirmationData, YogaBookingData } from '@/lib/email-service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleSuccessfulPayment(session)
      break
    
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded:', paymentIntent.id)
      break
    
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing successful payment:', session.id)
    
    // Retrieve full session details with line items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'line_items.data.price.product']
    })

    const customerEmail = session.customer_email || session.customer_details?.email
    const customerName = session.customer_details?.name || 'Customer'
    
    if (!customerEmail) {
      console.error('No customer email found in session')
      return
    }

    // Check if this is a yoga booking or regular product sale
    const isYogaBooking = session.metadata?.type === 'yoga_booking'
    
    if (isYogaBooking) {
      await handleYogaBookingConfirmation(fullSession, customerEmail, customerName)
    } else {
      await handleSaleConfirmation(fullSession, customerEmail, customerName)
    }
    
  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handleSaleConfirmation(
  session: Stripe.Checkout.Session, 
  customerEmail: string, 
  customerName: string
) {
  try {
    const lineItems = session.line_items?.data || []
    
    const items = lineItems.map(item => ({
      name: (item.price?.product as any)?.name || item.description || 'Product',
      price: (item.price?.unit_amount || 0) / 100, // Convert from cents
      quantity: item.quantity || 1
    }))

    const total = (session.amount_total || 0) / 100 // Convert from cents
    
    const saleData: SaleConfirmationData = {
      orderId: session.id,
      customerName,
      customerEmail,
      items,
      total,
      paymentMethod: 'Credit Card',
      shippingAddress: session.shipping_details ? 
        `${session.shipping_details.address?.line1}, ${session.shipping_details.address?.city}, ${session.shipping_details.address?.state} ${session.shipping_details.address?.postal_code}` 
        : undefined
    }

    // Send notification to business
    const businessNotificationSent = await emailService.sendSaleConfirmation(saleData)
    console.log('Business sale notification sent:', businessNotificationSent)

    // Send confirmation to customer
    const customerConfirmationSent = await emailService.sendCustomerConfirmation('sale', customerEmail, saleData)
    console.log('Customer sale confirmation sent:', customerConfirmationSent)

  } catch (error) {
    console.error('Error handling sale confirmation:', error)
  }
}

async function handleYogaBookingConfirmation(
  session: Stripe.Checkout.Session,
  customerEmail: string,
  customerName: string
) {
  try {
    const metadata = session.metadata || {}
    
    const addOns = metadata.addOns ? JSON.parse(metadata.addOns) : []
    const total = (session.amount_total || 0) / 100 // Convert from cents
    
    const bookingData: YogaBookingData = {
      bookingId: metadata.bookingReference || session.id,
      customerName,
      customerEmail,
      phone: metadata.customerPhone,
      service: metadata.serviceName || 'Yoga Session',
      date: metadata.selectedDate || 'TBD',
      time: metadata.selectedTime || 'TBD',
      addOns: addOns.map((addOn: any) => addOn.name),
      specialRequests: metadata.specialRequests,
      totalPrice: total
    }

    // Send notification to business
    const businessNotificationSent = await emailService.sendYogaBookingNotification(bookingData)
    console.log('Business yoga notification sent:', businessNotificationSent)

    // Send confirmation to customer
    const customerConfirmationSent = await emailService.sendCustomerConfirmation('yoga', customerEmail, bookingData)
    console.log('Customer yoga confirmation sent:', customerConfirmationSent)

    // Log booking details for record keeping
    console.log('Yoga booking confirmed:', {
      bookingId: bookingData.bookingId,
      service: bookingData.service,
      date: bookingData.date,
      time: bookingData.time,
      customer: customerName,
      email: customerEmail,
      total: total
    })

  } catch (error) {
    console.error('Error handling yoga booking confirmation:', error)
  }
}