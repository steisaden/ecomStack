import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { name, bio } = await request.json();
    
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
    
    // Create the author entry
    const authorEntry = await environment.createEntry('author', {
      fields: {
        name: {
          'en-US': name || 'Default Author'
        },
        bio: {
          'en-US': bio || 'Content creator at Goddess Hair & Beauty'
        }
      }
    });
    
    // Publish the author entry
    const publishedAuthor = await authorEntry.publish();
    
    return NextResponse.json({
      success: true,
      author: {
        id: publishedAuthor.sys.id,
        name: publishedAuthor.fields.name['en-US'],
        bio: publishedAuthor.fields.bio['en-US']
      }
    });
  } catch (error: any) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create author',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
