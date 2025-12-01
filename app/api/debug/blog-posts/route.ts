import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful';

export async function GET(request: NextRequest) {
  try {
    const client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
      environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
    });

    // Fetch directly from Contentful without any caching
    const entries = await client.getEntries({
      content_type: process.env.CONTENTFUL_BLOG_CT_ID || 'testBlog',
      order: ['-sys.createdAt'] as any,
      limit: 10
    });

    return NextResponse.json({
      success: true,
      count: entries.items.length,
      posts: entries.items.map((item: any) => ({
        id: item.sys.id,
        title: item.fields.title,
        slug: item.fields.slug,
        createdAt: item.sys.createdAt,
        publishedVersion: item.sys.publishedVersion
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
