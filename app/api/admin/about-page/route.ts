import { NextRequest, NextResponse } from 'next/server'
import { getAboutContent } from '@/lib/contentful'
import { createClient } from 'contentful-management'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      )
    }
    const aboutContent = await getAboutContent()

    if (!aboutContent) {
      return NextResponse.json(
        { error: 'About page content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      title: aboutContent.title,
      mainContent: aboutContent.mainContent,
      mission: aboutContent.mission,
      vision: aboutContent.vision,
      image: aboutContent.image
    })
  } catch (error) {
    console.error('Error fetching about content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      )
    }

    if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
      return NextResponse.json(
        { error: 'Contentful Management API token not configured' },
        { status: 500 }
      )
    }

    const { title, mainContent, mission, vision } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const managementClient = createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    })

    const spaceId = process.env.CONTENTFUL_SPACE_ID!
    const environmentId = process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'

    const space = await managementClient.getSpace(spaceId)
    const environment = await space.getEnvironment(environmentId)

    // Attempt to get the About page entry. 
    // Uses the generic 'about' slug assumption per existing upload-image route
    const entries = await environment.getEntries({ 'fields.slug': 'en-US', limit: 1 })
    // The previous implementation assumed the slug is 'about', let's stick to doing exactly what the image upload does:
    const aboutEntry = await environment.getEntry('about').catch(async () => {
      // If direct ID 'about' fails, query by slug.
      const queryResult = await environment.getEntries({ 'fields.slug': 'about', limit: 1 })
      return queryResult.items[0]
    })

    if (!aboutEntry) {
      return NextResponse.json(
        { error: 'Could not find the About page entry in Contentful' },
        { status: 404 }
      )
    }

    // Update simple text fields
    aboutEntry.fields.title = { 'en-US': title }

    if (mission) {
      aboutEntry.fields.mission = { 'en-US': mission }
    } else {
      delete aboutEntry.fields.mission
    }

    if (vision) {
      aboutEntry.fields.vision = { 'en-US': vision }
    } else {
      delete aboutEntry.fields.vision
    }

    // Construct basic Rich Text Document for mainContent
    if (mainContent) {
      // Split by newlines and create a paragraph for each to preserve basic formatting
      const paragraphs = mainContent.split('\n').filter((p: string) => p.trim() !== '')
      aboutEntry.fields.content = {
        'en-US': {
          nodeType: 'document',
          data: {},
          content: paragraphs.length > 0 ? paragraphs.map((p: string) => ({
            nodeType: 'paragraph',
            data: {},
            content: [{ nodeType: 'text', value: p, marks: [], data: {} }]
          })) : [{
            nodeType: 'paragraph',
            data: {},
            content: [{ nodeType: 'text', value: mainContent, marks: [], data: {} }]
          }]
        }
      }
    } else {
      // Don't wipe it out completely if it's empty during a save, or do? Let's wipe.
      delete aboutEntry.fields.content
    }

    const updatedEntry = await aboutEntry.update()
    await updatedEntry.publish()

    return NextResponse.json({ success: true, message: 'About page updated successfully' })
  } catch (error: any) {
    console.error('Error updating about content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update about content' },
      { status: 500 }
    )
  }
}
