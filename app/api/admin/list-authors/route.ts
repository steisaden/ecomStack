import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
    
    // Get all entries and filter for Author content type
    const allEntries = await environment.getEntries({
      limit: 1000
    });
    
    // Find entries that look like authors (have a 'name' field)
    const authors = allEntries.items
      .filter(entry => entry.fields.name && entry.fields.name['en-US'])
      .map(entry => ({
        id: entry.sys.id,
        contentType: entry.sys.contentType?.sys.id,
        name: entry.fields.name?.['en-US'],
        bio: entry.fields.bio?.['en-US'] ? 'Has bio' : 'No bio',
        published: entry.isPublished(),
        archived: entry.isArchived(),
        createdAt: entry.sys.createdAt
      }));
    
    return NextResponse.json({
      success: true,
      count: authors.length,
      authors: authors
    });
  } catch (error: any) {
    console.error('Error listing authors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list authors' },
      { status: 500 }
    );
  }
}
