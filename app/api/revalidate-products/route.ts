import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Revalidate all product-related caches
    revalidateTag('products')
    revalidateTag('affiliate-products')
    revalidateTag('unified-products')
    revalidateTag('featured-products')
    revalidateTag('product-stats')

    return NextResponse.json({
      success: true,
      message: 'Product caches revalidated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error revalidating product caches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revalidate caches' },
      { status: 500 }
    )
  }
}