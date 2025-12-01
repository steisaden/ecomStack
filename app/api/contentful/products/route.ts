import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/contentful'
import { performanceMonitor } from '@/lib/performance'

// Set to static generation for better caching
export const dynamic = 'force-static'
// Set revalidation interval to 30 seconds for more frequent updates
export const revalidate = 30

export async function GET(request: NextRequest) {
  const stopTimer = performanceMonitor.startTimer('api-products-get')
  
  try {
    // ✅ REUSE existing function - DO NOT recreate
    const products = await getProducts()
    
    // ✅ FOLLOW existing response pattern
    const response = NextResponse.json({
      success: true,
      items: products,
      total: products.length,
      timestamp: new Date().toISOString()
    })
    
    // Add more aggressive caching headers for HTTP cache
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=150')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=150')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=150')
    response.headers.set('Content-Type', 'application/json')
    // Add performance header
    const metrics = performanceMonitor.getMetrics('api-products-get')
    if (metrics) {
      response.headers.set('X-Response-Time', `${metrics.avg.toFixed(2)}ms`)
    }
    
    stopTimer()
    return response
  } catch (error) {
    stopTimer()
    // ✅ COPY error pattern from app/api/auth/route.ts
    console.error('Products API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
