import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      )
    }
    // Revalidate all product-related caches
    revalidateTag('products')
    revalidateTag('affiliate-products')
    revalidateTag('unified-products')
    revalidateTag('validated-products')
    
    // Get fresh unified products
    const { getAllProducts } = await import('@/lib/unified-products')
    const products = await getAllProducts()
    
    return NextResponse.json({
      success: true,
      message: 'Products refreshed successfully',
      products,
      count: products.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Error refreshing products:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh products',
        message: error.message
      },
      { status: 500 }
    )
  }
}
