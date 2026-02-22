import { NextRequest, NextResponse } from 'next/server'
import { captureProductScreenshot, queueScreenshot } from '@/lib/product-screenshot'
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
    const { asin, affiliateUrl, async = false } = await request.json()
    
    if (!asin || !affiliateUrl) {
      return NextResponse.json({
        success: false,
        error: 'ASIN and affiliate URL are required'
      }, { status: 400 })
    }
    
    // Validate ASIN format
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid ASIN format'
      }, { status: 400 })
    }
    
    if (async) {
      // Queue for async processing
      queueScreenshot({ asin, affiliateUrl })
      
      return NextResponse.json({
        success: true,
        message: 'Screenshot queued for processing',
        asin,
        status: 'queued'
      })
    } else {
      // Take screenshot immediately
      const result = await captureProductScreenshot({ asin, affiliateUrl })
      
      return NextResponse.json({
        success: result.success,
        asin,
        imagePath: result.imagePath,
        localUrl: result.localUrl,
        error: result.error,
        status: result.success ? 'completed' : 'failed'
      })
    }
    
  } catch (error: any) {
    console.error('Screenshot API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
    )
  }
  const { searchParams } = new URL(request.url)
  const asin = searchParams.get('asin')
  
  if (!asin) {
    return NextResponse.json({
      success: false,
      error: 'ASIN parameter is required'
    }, { status: 400 })
  }
  
  // Check if screenshot exists
  const { existsSync } = await import('fs')
  const { join } = await import('path')
  
  const filepath = join(process.cwd(), 'public', 'product-images', `${asin}.png`)
  const exists = existsSync(filepath)
  
  return NextResponse.json({
    success: true,
    asin,
    exists,
    localUrl: exists ? `/product-images/${asin}.png` : null,
    status: exists ? 'available' : 'not_found'
  })
}
