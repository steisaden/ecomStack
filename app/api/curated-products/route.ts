import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/contentful'
import { validateProducts, getValidationSummary } from '@/lib/product-validation'
import { unstable_cache } from 'next/cache'
import { verifyAuth } from '@/lib/auth'

// Cache validated products for 10 minutes to avoid repeated validation
const getCachedValidatedProducts = unstable_cache(
  async () => {
    console.log('Fetching and validating products...')
    
    // Get products from Contentful
    const products = await getProducts()
    
    if (products.length === 0) {
      console.log('No products found in Contentful')
      return {
        products: [],
        summary: {
          total: 0,
          valid: 0,
          invalid: 0,
          missingImages: 0,
          invalidUrls: 0,
          missingFields: 0,
          validationRate: 0
        }
      }
    }

    console.log(`Found ${products.length} products, validating...`)
    
    // Validate products
    const validatedProducts = await validateProducts(products)
    const summary = await getValidationSummary(products)
    
    console.log(`Validation complete: ${validatedProducts.length}/${products.length} products passed validation`)
    
    return {
      products: validatedProducts,
      summary
    }
  },
  ['validated-products'],
  { revalidate: 600 } // 10 minutes
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeSummary = searchParams.get('summary') === 'true'
    
    const result = await getCachedValidatedProducts()
    
    const response: any = {
      success: true,
      products: result.products,
      count: result.products.length,
      timestamp: new Date().toISOString()
    }
    
    if (includeSummary) {
      response.validation = result.summary
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('Error fetching curated products:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch curated products',
        message: error.message,
        products: [],
        count: 0
      },
      { status: 500 }
    )
  }
}

// POST endpoint to trigger validation refresh
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      )
    }
    // This will force a refresh of the cached validation
    const { revalidateTag } = await import('next/cache')
    revalidateTag('validated-products')
    
    // Get fresh validated products
    const result = await getCachedValidatedProducts()
    
    return NextResponse.json({
      success: true,
      message: 'Product validation refreshed',
      products: result.products,
      count: result.products.length,
      validation: result.summary,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Error refreshing product validation:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh product validation',
        message: error.message
      },
      { status: 500 }
    )
  }
}
