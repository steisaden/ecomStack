import { NextRequest, NextResponse } from 'next/server'
import { generateUniqueProducts } from '@/lib/enhanced-product-database'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing product generation...')
    
    // Generate a few test products
    const testProducts = generateUniqueProducts(5)
    
    // Test each product's affiliate link and image
    const productTests = testProducts.map(product => {
      const asin = extractASINFromUrl(product.affiliateUrl)
      
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        asin,
        affiliateUrl: product.affiliateUrl,
        imageUrl: product.imageUrl,
        category: product.category,
        brandName: product.brandName,
        linkValid: asin ? asin.length === 10 : false,
        imageValid: product.imageUrl.startsWith('https://'),
        hasWorkingASIN: asin && /^[A-Z0-9]{10}$/.test(asin)
      }
    })
    
    const validLinks = productTests.filter(p => p.linkValid && p.hasWorkingASIN).length
    const validImages = productTests.filter(p => p.imageValid).length
    
    return NextResponse.json({
      success: true,
      message: `Generated ${testProducts.length} test products`,
      summary: {
        totalProducts: testProducts.length,
        validLinks,
        validImages,
        allLinksValid: validLinks === testProducts.length,
        allImagesValid: validImages === testProducts.length
      },
      products: productTests,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Product test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

function extractASINFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/dp\/([A-Z0-9]{10})/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}