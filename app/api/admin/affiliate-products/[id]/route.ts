// app/api/admin/affiliate-products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { revalidateTag } from 'next/cache';

const contentful = require('contentful-management');

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { title, description, price, imageUrl, affiliateUrl, category } = body;

    // Initialize Contentful Management client
    const client = contentful.createClient({
      accessToken: (process.env.CONTENTFUL_MANAGEMENT_TOKEN || '').trim()
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    );

    // Get the entry
    const entry = await environment.getEntry(id);

    // Update fields
    entry.fields.title = { 'en-US': title };
    entry.fields.description = { 'en-US': description };
    entry.fields.price = { 'en-US': price };
    entry.fields.imageUrl = { 'en-US': imageUrl || '' };
    entry.fields.affiliateUrl = { 'en-US': affiliateUrl };
    entry.fields.category = { 'en-US': category || 'Beauty & Personal Care' };

    // Save and publish
    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    // Revalidate caches
    revalidateTag('affiliate-products');
    revalidateTag('unified-products');
    revalidateTag('products');

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEntry.sys.id,
        title
      }
    });

  } catch (error: any) {
    console.error('Error updating affiliate product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Initialize Contentful Management client
    const client = contentful.createClient({
      accessToken: (process.env.CONTENTFUL_MANAGEMENT_TOKEN || '').trim()
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    );

    // Get the entry
    const entry = await environment.getEntry(id);

    // Update status
    entry.fields.status = { 'en-US': status };

    // Save and publish
    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    // Revalidate caches
    revalidateTag('affiliate-products');
    revalidateTag('unified-products');
    revalidateTag('products');

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEntry.sys.id,
        status
      }
    });

  } catch (error: any) {
    console.error('Error archiving affiliate product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to archive product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    // Initialize Contentful Management client
    const client = contentful.createClient({
      accessToken: (process.env.CONTENTFUL_MANAGEMENT_TOKEN || '').trim()
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    );

    // Get the entry
    const entry = await environment.getEntry(id);

    // Unpublish first
    if (entry.isPublished()) {
      await entry.unpublish();
    }

    // Delete the entry
    await entry.delete();

    // Revalidate caches
    revalidateTag('affiliate-products');
    revalidateTag('unified-products');
    revalidateTag('products');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting affiliate product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
