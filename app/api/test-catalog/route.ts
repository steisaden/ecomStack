import { NextRequest, NextResponse } from 'next/server'
import { generateUniqueProductsSync } from '@/lib/enhanced-product-database'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing catalog generation...')
    
    // Test the sync product generation
    const products = generateUniqueProductsSync(5)
    
    return NextResponse.json({
      success: true,
      message: `Successfully generated ${products.length} test products`,
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        asin: p.affiliateUrl.match(/\/dp\/([A-Z0-9]{10})/)?.[1],
        imageUrl: p.imageUrl,
        category: p.category
      })),
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Test catalog error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { count = 3 } = await request.json()
    
    console.log(`Testing catalog generation with ${count} products...`)
    
    const products = generateUniqueProductsSync(count)
    
    return NextResponse.json({
      success: true,
      message: `Generated ${products.length} products successfully`,
      count: products.length,
      sampleProduct: products[0] ? {
        title: products[0].title,
        price: products[0].price,
        category: products[0].category,
        hasImage: !!products[0].imageUrl,
        hasAffiliateUrl: !!products[0].affiliateUrl
      } : null
    })
    
  } catch (error: any) {
    console.error('Test catalog POST error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}