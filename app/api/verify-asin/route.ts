import { NextRequest, NextResponse } from 'next/server'
import { verifyASINAndCaptureInfo, batchVerifyASINs, validateProductForCuration } from '@/lib/asin-verification'

export async function POST(request: NextRequest) {
  try {
    const { asin, asins, action = 'verify' } = await request.json()
    
    if (action === 'batch' && asins && Array.isArray(asins)) {
      // Batch verification
      const results = await batchVerifyASINs(asins)
      const validResults = results.filter(r => r.isValid)
      
      return NextResponse.json({
        success: true,
        action: 'batch_verify',
        totalASINs: asins.length,
        validASINs: validResults.length,
        invalidASINs: results.length - validResults.length,
        results,
        summary: {
          valid: validResults.map(r => ({
            asin: r.asin,
            title: r.title,
            price: r.price,
            thumbnailSaved: r.thumbnailSaved
          })),
          invalid: results.filter(r => !r.isValid).map(r => ({
            asin: r.asin,
            error: r.error
          }))
        }
      })
    }
    
    if (action === 'validate' && asin) {
      // Validate for curation
      const affiliateUrl = `https://www.amazon.com/dp/${asin}`
      const validation = await validateProductForCuration(asin, affiliateUrl)
      
      if (validation) {
        return NextResponse.json({
          success: true,
          action: 'validate',
          asin,
          product: validation,
          message: `Product ${asin} validated and ready for curation`
        })
      } else {
        return NextResponse.json({
          success: false,
          action: 'validate',
          asin,
          error: 'Product validation failed'
        }, { status: 400 })
      }
    }
    
    if (asin) {
      // Single ASIN verification
      const result = await verifyASINAndCaptureInfo(asin)
      
      return NextResponse.json({
        success: result.isValid,
        action: 'verify',
        asin,
        result,
        message: result.isValid 
          ? `ASIN ${asin} verified successfully${result.thumbnailSaved ? ' with thumbnail saved' : ''}`
          : `ASIN ${asin} verification failed: ${result.error}`
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Missing required parameters. Provide "asin" for single verification or "asins" array for batch verification'
    }, { status: 400 })
    
  } catch (error: any) {
    console.error('ASIN verification API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const asin = searchParams.get('asin')
  
  if (!asin) {
    return NextResponse.json({
      success: false,
      error: 'ASIN parameter is required'
    }, { status: 400 })
  }
  
  try {
    // Quick verification check
    const result = await verifyASINAndCaptureInfo(asin)
    
    return NextResponse.json({
      success: result.isValid,
      asin,
      valid: result.isValid,
      exists: result.productExists,
      title: result.title,
      price: result.price,
      thumbnailSaved: result.thumbnailSaved,
      localImagePath: result.localImagePath,
      error: result.error
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}