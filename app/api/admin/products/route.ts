import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';
import { Product } from '@/lib/types';
import { revalidateTag } from 'next/cache';
import { verifyAuth } from '@/lib/auth';

// Initialize Contentful management client
const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }
    // Parse JSON payload
    const reqData = await request.json();
    const productData: Omit<Product, 'sys' | 'images'> = reqData.productData;
    const assetIds: any[] = reqData.assetIds || []; // Array of uploaded asset objects
    
    // Validate required fields
    if (!productData.title?.trim() || !productData.slug?.trim()) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }
    
    // Get the space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
    
    // Prepare fields for the new entry
    const fields: any = {
      title: {
        'en-US': productData.title
      },
      slug: {
        'en-US': productData.slug
      },
      description: {
        'en-US': {
          nodeType: 'document',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: productData.description || '',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        }
      },
      price: {
        'en-US': productData.price || 0
      },
      inStock: {
        'en-US': productData.inStock
      },
      isAffiliate: {
        'en-US': productData.isAffiliate || false
      },
    };
    
    // Add affiliate URL if applicable
    if (productData.isAffiliate && productData.affiliateUrl) {
      fields.affiliateUrl = {
        'en-US': productData.affiliateUrl
      };
    }
    
    // Add images if available
    if (assetIds.length > 0) {
      fields.images = {
        'en-US': assetIds.map(asset => ({
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: asset.sys.id
          }
        }))
      };
    }
    
    // Create the new entry
    const newEntry = await environment.createEntry('goddessCareProduct', {
      fields
    });
    
    // Publish the entry
    const publishedEntry = await newEntry.publish();
    
    // Revalidate the products cache to ensure the new product appears immediately
    // This uses the cache tags defined in the getProducts function
    revalidateTag('products');
    revalidateTag('contentful');
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: publishedEntry
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create product',
        details: error.toString ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
