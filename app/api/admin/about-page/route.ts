import { NextRequest, NextResponse } from 'next/server'
import { getAboutContent } from '@/lib/contentful'

export async function GET(request: NextRequest) {
  try {
    const aboutContent = await getAboutContent()
    
    if (!aboutContent) {
      return NextResponse.json(
        { error: 'About page content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      title: aboutContent.title,
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
