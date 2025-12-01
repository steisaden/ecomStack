import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';

// Initialize Contentful management client
const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    // Parse form data for file upload
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }
    
    // Get the space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
    
    // Read the file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Create an asset
    const newAsset = await environment.createAssetFromFiles({
      fields: {
        title: {
          'en-US': file.name
        },
        description: {
          'en-US': `Image for ${file.name}`
        },
        file: {
          'en-US': {
            contentType: file.type,
            fileName: file.name,
            file: fileBuffer
          }
        }
      }
    });
    
    // Process the asset (upload the file)
    const processedAsset = await newAsset.processForAllLocales();
    
    // Publish the asset
    const publishedAsset = await processedAsset.publish();
    
    return NextResponse.json({
      success: true,
      asset: publishedAsset
    });
  } catch (error: any) {
    console.error('Error uploading asset:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload asset',
        details: error.toString ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}