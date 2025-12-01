import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    const authorId = process.env.CONTENTFUL_DEFAULT_AUTHOR_ID || '3o3tGzvtvsUk9dNmJvvtK9';
    
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
    
    try {
      const author = await environment.getEntry(authorId);
      
      return NextResponse.json({
        success: true,
        author: {
          id: author.sys.id,
          name: author.fields.name?.['en-US'],
          published: author.isPublished(),
          archived: author.isArchived(),
          version: author.sys.version
        }
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: 'Author not found',
        details: error.message,
        authorId
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error checking author:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check author' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorId = process.env.CONTENTFUL_DEFAULT_AUTHOR_ID || '3o3tGzvtvsUk9dNmJvvtK9';
    
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
    
    try {
      let author = await environment.getEntry(authorId);
      
      // If archived, unarchive
      if (author.isArchived()) {
        author = await author.unarchive();
      }
      
      // If not published, publish
      if (!author.isPublished()) {
        author = await author.publish();
      }
      
      return NextResponse.json({
        success: true,
        message: 'Author is now published and ready',
        author: {
          id: author.sys.id,
          name: author.fields.name?.['en-US'],
          published: author.isPublished()
        }
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: 'Author not found',
        details: error.message,
        authorId
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error fixing author:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix author' },
      { status: 500 }
    );
  }
}
