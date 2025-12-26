// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { AffiliateProduct } from '@/lib/types'

interface BulkAffiliateProductData {
  title: string
  description: string
  price: number
  affiliateUrl: string
  category?: string
  tags: string[]
  commissionRate: number
  platform: string
  imageUrl?: string
  brandName?: string
  rating?: number
  reviewCount?: number
  isPopular?: boolean
  isTrending?: boolean
  isNewArrival?: boolean
}

interface BulkUploadResult {
  success: boolean
  processed: number
  errors: string[]
  created: number
}

// In-memory storage for demo purposes
// In production, this would be stored in a database
let affiliateProducts: AffiliateProduct[] = []

export async function POST(request: NextRequest) {
  try {
    // Check authentication using the same method as other admin APIs
    const authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No auth token' },
        { status: 401 }
      )
    }

    // Verify the auth token matches the expected value
    const expectedToken = process.env.AUTH_TOKEN
    if (!expectedToken || authToken !== expectedToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    const { products }: { products: BulkAffiliateProductData[] } = await request.json()

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No products provided' },
        { status: 400 }
      )
    }

    const result: BulkUploadResult = {
      success: true,
      processed: 0,
      errors: [],
      created: 0
    }

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      result.processed++

      try {
        // Validate required fields
        if (!product.title || !product.affiliateUrl || !product.price) {
          result.errors.push(`Product ${i + 1}: Missing required fields (title, affiliateUrl, price)`)
          continue
        }

        // Validate URL format
        try {
          new URL(product.affiliateUrl)
        } catch {
          result.errors.push(`Product ${i + 1}: Invalid affiliate URL format`)
          continue
        }

        // Create new affiliate product
        const priceNumber = parseFloat(product.price.toString()) || 0;
        const newProduct: AffiliateProduct = {
          id: `bulk-${Date.now()}-${i}`,
          title: product.title,
          description: product.description || '',
          asin: product.asin || '',
          price: {
            amount: priceNumber,
            currency: 'USD',
            displayAmount: `$${priceNumber.toFixed(2)}`
          },
          imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80',
          affiliateUrl: product.affiliateUrl,
          category: product.category || 'Beauty',
          tags: Array.isArray(product.tags) ? product.tags : [],
          commissionRate: parseFloat(product.commissionRate?.toString() || '5'),
          platform: product.platform || 'custom',
          performance: {
            clicks: 0,
            conversions: 0,
            revenue: 0,
            conversionRate: 0,
            lastUpdated: new Date().toISOString()
          },
          status: 'active',
          scheduledPromotions: [],
          imageRefreshStatus: 'outdated',
          linkValidationStatus: 'checking',
          needsReview: false
        }

        affiliateProducts.push(newProduct)
        result.created++
        
        console.log(`Successfully created affiliate product: ${product.title}`)

      } catch (error) {
        console.error(`Error creating affiliate product ${i + 1}:`, error)
        result.errors.push(`Product ${i + 1} (${product.title}): ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Determine overall success
    result.success = result.created > 0

    return NextResponse.json(result)

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error',
        processed: 0,
        errors: ['Server error occurred'],
        created: 0
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
