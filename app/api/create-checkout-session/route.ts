import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { enforceSameOrigin } from '@/lib/security'

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const originError = enforceSameOrigin(request)
    if (originError) return originError

    const requestBody = await request.json()
    let cartItems = requestBody.cartItems
    let product = requestBody.product  // Support direct product checkout

    // Handle both cart items and direct product checkout
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      // cart-based checkout
    } else if (product) {
      // direct product checkout - convert to cartItems format
      cartItems = [{
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      }]
    } else {
      return NextResponse.json(
        { error: 'Missing required cart information' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: item.price, // Price is already in cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/products`,
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
