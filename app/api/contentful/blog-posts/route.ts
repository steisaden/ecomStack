import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getBlogPosts } from '@/lib/contentful'

// Allow dynamic rendering for API route but with cache control
export const dynamic = 'force-dynamic'
// Set revalidation interval to 900 seconds (15 minutes) for blog posts
export const revalidate = 900

export async function GET(request: NextRequest) {
  try {
    // Check if cache bypass is requested
    const searchParams = request.nextUrl.searchParams;
    const bypassCache = searchParams.get('t') !== null;

    // When the admin dashboard asks for fresh data, clear cache tags first
    if (bypassCache) {
      await revalidateTag('blog-posts');
      await revalidateTag('contentful');
    }
    
    const blogPosts = await getBlogPosts()
    
    const response = NextResponse.json({
      success: true,
      items: blogPosts,
      total: blogPosts.length,
      timestamp: new Date().toISOString(),
      cached: !bypassCache
    })
    
    // If cache bypass requested, use no-cache headers
    if (bypassCache) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    } else {
      // Add caching headers for HTTP cache
      response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')
      response.headers.set('CDN-Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')
      response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')
    }
    
    return response
  } catch (error) {
    console.error('Blog posts API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog posts',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
