// app/api/admin/affiliate-products/list/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const contentful = require('contentful');

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    // Initialize Contentful client
    const client = contentful.createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
      environment: process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    });

    // Fetch all affiliate products
    const entries = await client.getEntries({
      content_type: 'affiliateProduct',
      limit: 1000,
      order: '-sys.createdAt'
    });

    const products = entries.items.map((item: any) => ({
      id: item.sys.id,
      title: item.fields.title || '',
      description: item.fields.description || '',
      price: item.fields.price || 0,
      imageUrl: item.fields.imageUrl || '',
      affiliateUrl: item.fields.affiliateUrl || '',
      category: item.fields.category || '',
      tags: item.fields.tags || [],
      platform: item.fields.platform || 'Amazon',
      status: item.fields.status || 'active',
      commissionRate: item.fields.commissionRate || 0
    }));

    return NextResponse.json({
      success: true,
      products
    });

  } catch (error: any) {
    console.error('Error fetching affiliate products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
