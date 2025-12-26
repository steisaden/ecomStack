
import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/contentful';
import { createClient } from 'contentful-management';
import { revalidateTag } from 'next/cache';

// Allow dynamic rendering for API route but with cache control
export const dynamic = 'force-dynamic'
// Set revalidation interval to 1800 seconds (30 minutes) for product details
export const revalidate = 1800

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, product });

    // Add caching headers for HTTP cache - longer cache for individual products
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');

    return response;
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;
  try {
    const productData = await request.json();
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
    const entry = await environment.getEntry(productData.sys.id);

    // Update fields
    entry.fields.title['en-US'] = productData.title;
    entry.fields.price['en-US'] = productData.price;
    entry.fields.description['en-US'] = {
      nodeType: 'document',
      content: [
        {
          nodeType: 'paragraph',
          content: [
            {
              nodeType: 'text',
              value: productData.description,
              marks: [],
              data: {},
            },
          ],
          data: {},
        },
      ],
      data: {},
    };

    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    // Revalidate the products cache to ensure the updated product appears immediately
    revalidateTag('products');
    revalidateTag('contentful');

    return NextResponse.json({ success: true, product: updatedEntry });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
      },
      { status: 500 }
    );
  }
}
