// app/api/admin/affiliate-products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth-middleware';
import { revalidateTag } from 'next/cache';

const contentful = require('contentful-management');

export async function POST(request: NextRequest) {
  try {
    // Apply authentication middleware
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }

    const body = await request.json();
    const { asin, title, brand, price, imageUrl, affiliateUrl, features } = body;

    // Validate required fields
    if (!title || !affiliateUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, affiliateUrl' },
        { status: 400 }
      );
    }

    // Build description from brand and features
    let description = '';
    if (brand) {
      description = `Brand: ${brand}\n\n`;
    }
    if (features && features.length > 0) {
      description += features.join('\n');
    }
    if (!description) {
      description = title; // Fallback to title if no other description
    }

    // Initialize Contentful Management client
    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    );

    // Create the affiliate product entry with correct fields
    const entry = await environment.createEntry('affiliateProduct', {
      fields: {
        title: { 'en-US': title },
        description: { 'en-US': description },
        price: { 'en-US': price || 0 },
        imageUrl: { 'en-US': imageUrl || '' },
        affiliateUrl: { 'en-US': affiliateUrl },
        platform: { 'en-US': 'Amazon' },
        status: { 'en-US': 'active' },
        commissionRate: { 'en-US': 0 }, // Default commission rate
        category: { 'en-US': 'Beauty & Personal Care' }, // Default category
        tags: { 'en-US': [asin] } // Store ASIN in tags for reference
      }
    });

    // Publish the entry
    await entry.publish();

    // Revalidate caches so new product appears immediately
    revalidateTag('affiliate-products');
    revalidateTag('unified-products');
    revalidateTag('products');

    return NextResponse.json({
      success: true,
      data: {
        id: entry.sys.id,
        asin,
        title
      }
    });

  } catch (error: any) {
    console.error('Error creating affiliate product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
