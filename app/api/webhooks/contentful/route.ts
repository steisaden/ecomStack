import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import crypto from 'crypto'

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-contentful-signature')
    
    // Verify webhook signature if secret is configured
    if (process.env.CONTENTFUL_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.CONTENTFUL_WEBHOOK_SECRET)
        .update(body)
        .digest('base64')
      
      if (signature !== expectedSignature) {
        console.warn('Invalid Contentful webhook signature')
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Parse the webhook payload
    const payload = JSON.parse(body)
    const { sys } = payload
    
    if (!sys) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    // Log the webhook event
    console.log(`Contentful webhook received: ${sys.type} for ${sys.contentType?.sys?.id || 'unknown'}`)

    // Revalidate relevant caches based on content type
    const contentTypeId = sys.contentType?.sys?.id
    const tags = ['contentful-data']

    if (contentTypeId === 'goddessCareProduct') {
      tags.push('products', 'dashboard-stats')
    } else if (contentTypeId === 'testBlog') {
      tags.push('blog-posts', 'dashboard-stats')
    } else if (contentTypeId === 'globalSettings') {
      tags.push('global-settings', 'navigation')
    } else if (contentTypeId === 'yogaService') {
      // Revalidate yoga services cache
      tags.push('yoga-services')
    } else if (contentTypeId === 'addOnExperience') {
      // Revalidate add-on experiences cache
      tags.push('add-on-experiences')
    }

    // Revalidate all relevant tags
    for (const tag of tags) {
      try {
        await revalidateTag(tag)
        console.log(`Revalidated cache tag: ${tag}`)
      } catch (error) {
        console.error(`Failed to revalidate tag ${tag}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      revalidatedTags: tags,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Contentful webhook error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    message: 'Contentful webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}