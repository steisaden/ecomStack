import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      endpoints: {
        catalog: '/api/curated-catalog',
        refresh: '/api/curated-catalog/refresh',
        testCatalog: '/api/test-catalog',
        verifyAsin: '/api/verify-asin'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}