import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyAuth } from '@/lib/auth'

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const starting_after = searchParams.get('starting_after') || undefined

    const paymentIntents = await stripe.paymentIntents.list({
      limit,
      starting_after,
    });

    return NextResponse.json({
      success: true,
      items: paymentIntents.data,
      has_more: paymentIntents.has_more,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Stripe orders API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Stripe orders',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
