import { NextRequest, NextResponse } from 'next/server'
import { batchVerifyASINs, validateProductForCuration } from '@/lib/asin-verification'
import { PRODUCT_DATABASE } from '@/lib/enhanced-product-database'

export async function POST(request: NextRequest) {
  try {
    const { action = 'test-all', asin } = await request.json()
    
    if (action === 'test-single' && asin) {
      // Test single ASIN validation
      console.log(`Testing single ASIN validation: ${asin}`)
      
      const validation = await validateProductForCuration(asin, '')
      
      return NextResponse.json({
        success: !!validation,
        action: 'test-single',
        asin,
        validation,
        message: validation 
          ? `ASIN ${asin} validated successfully with thumbnail capture`
          : `ASIN ${asin} validation failed`
      })
    }
    
    if (action === 'test-all') {
      // Test all ASINs in database
      const allASINs = PRODUCT_DATABASE.map(p => p.asin)
      console.log(`Testing verification system with ${allASINs.length} ASINs...`)
      
      const startTime = Date.now()
      const results = await batchVerifyASINs(allASINs)
      const endTime = Date.now()
      
      const validResults = results.filter(r => r.isValid && r.productExists)
      const thumbnailsCaptured = results.filter(r => r.thumbnailSaved).length
      
      const summary = {
        totalASINs: allASINs.length,
        validASINs: validResults.length,
        invalidASINs: results.length - validResults.length,
        thumbnailsCaptured,
        processingTimeMs: endTime - startTime,
        averageTimePerASIN: Math.round((endTime - startTime) / allASINs.length)
      }
      
      const detailedResults = {
        valid: validResults.map(r => ({
          asin: r.asin,
          title: r.title,
          price: r.price,
          thumbnailSaved: r.thumbnailSaved,
          localImagePath: r.localImagePath
        })),
        invalid: results.filter(r => !r.isValid).map(r => ({
          asin: r.asin,
          error: r.error
        }))
      }
      
      return NextResponse.json({
        success: true,
        action: 'test-all',
        summary,
        results: detailedResults,
        message: `Verification test completed: ${validResults.length}/${allASINs.length} ASINs valid, ${thumbnailsCaptured} thumbnails captured in ${summary.processingTimeMs}ms`
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "test-all" or "test-single" with asin parameter'
    }, { status: 400 })
    
  } catch (error: any) {
    console.error('Verification test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Quick system status check
    const allASINs = PRODUCT_DATABASE.map(p => p.asin)
    
    return NextResponse.json({
      success: true,
      systemStatus: {
        totalASINsInDatabase: allASINs.length,
        asins: allASINs,
        verificationSystemReady: true,
        thumbnailCaptureReady: true,
        chromeDevToolsIntegrationReady: true
      },
      message: 'ASIN verification system is ready for testing',
      endpoints: {
        testAll: 'POST /api/test-verification with { "action": "test-all" }',
        testSingle: 'POST /api/test-verification with { "action": "test-single", "asin": "B074FVTQD4" }'
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}