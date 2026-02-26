// app/api/admin/affiliate-products/list/route.ts
// Lists affiliate products from Contentful.
// Primary source: dedicated 'affiliateProduct' content type entries.
// Fallback source: 'goddessCareProduct' entries that have isAffiliate=true.

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const contentful = require('contentful');

function buildClient() {
  return contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
    environment:
      process.env.CONTENTFUL_ENVIRONMENT ||
      process.env.CONTENTFUL_ENVIRONMENT_ID ||
      'master',
  });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    const client = buildClient();

    // ── 1. Try dedicated affiliateProduct content type ──────────────────────
    try {
      const entries = await client.getEntries({
        content_type: 'affiliateProduct',
        limit: 1000,
        order: '-sys.createdAt',
      });

      if (entries.items.length > 0) {
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
          commissionRate: item.fields.commissionRate || 0,
          source: 'affiliateProduct',
        }));

        return NextResponse.json({ success: true, products, source: 'affiliateProduct' });
      }
    } catch (_) {
      // Content type may not exist — fall through to catalog fallback
    }

    // ── 2. Fall back to goddessCareProduct entries with isAffiliate=true ─────
    const catalogEntries = await client.getEntries({
      content_type: 'goddessCareProduct',
      'fields.isAffiliate': true,
      limit: 1000,
      order: '-sys.createdAt',
    });

    const products = catalogEntries.items.map((item: any) => {
      const images: any[] = item.fields.images || [];
      const imageUrl = images[0]?.fields?.file?.url
        ? (images[0].fields.file.url.startsWith('//')
          ? `https:${images[0].fields.file.url}`
          : images[0].fields.file.url)
        : '';

      // Safely extract description text from rich text or plain string
      let description = '';
      const rawDesc = item.fields.description;
      if (typeof rawDesc === 'string') {
        description = rawDesc;
      } else if (rawDesc?.content) {
        description = rawDesc.content
          .filter((n: any) => n.nodeType === 'paragraph' && n.content)
          .map((n: any) =>
            n.content.filter((t: any) => t.value).map((t: any) => t.value).join('')
          )
          .join(' ')
          .trim();
      }

      return {
        id: item.sys.id,
        title: item.fields.title || '',
        description,
        price: item.fields.price || 0,
        imageUrl,
        affiliateUrl: item.fields.affiliateUrl || '',
        category: item.fields.category?.fields?.name || '',
        tags: [],
        platform: 'catalog',
        status: item.fields.inStock !== false ? 'active' : 'inactive',
        slug: item.fields.slug || '',
        source: 'goddessCareProduct',
      };
    });

    return NextResponse.json({
      success: true,
      products,
      source: 'goddessCareProduct',
      note: products.length === 0
        ? 'No affiliate products found. Add products in Contentful with isAffiliate=true, or use the Add Amazon Product feature.'
        : undefined,
    });
  } catch (error: any) {
    console.error('Error fetching affiliate products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
