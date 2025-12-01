import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    // Return the default author since author content type doesn't exist in Contentful
    const defaultAuthor = {
      id: process.env.CONTENTFUL_DEFAULT_AUTHOR_ID || '3o3tGzvtvsUk9dNmJvvtK9',
      name: 'Goddess Care Team'
    };
    
    return NextResponse.json({
      success: true,
      authors: [defaultAuthor]
    });
  } catch (error: any) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}
