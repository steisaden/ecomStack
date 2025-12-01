import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/unified-products'

export async function GET(request: NextRequest) {
  try {
    const products = await getAllProducts()
    
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300'
      }
    })
    
  } catch (error: any) {
    console.error('Error fetching products:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        message: error.message
      },
      { status: 500 }
    )
  }
}