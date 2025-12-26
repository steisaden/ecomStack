// app/api/admin/yoga-services/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth-middleware';
import { revalidateTag } from 'next/cache';

const contentful = require('contentful-management');

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Apply authentication middleware
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }

    const body = await request.json();
    const { name, description, price, duration, category, includedAmenities, luxuryFeatures, imageUrl, displayOrder, slug } = body;

    // Initialize Contentful Management client
    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    );

    // Get the entry
    const entry = await environment.getEntry(id);

    // Update fields
    entry.fields.name = { 'en-US': name };
    entry.fields.slug = { 'en-US': slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
    entry.fields.description = { 'en-US': description };
    entry.fields.price = { 'en-US': price };
    entry.fields.duration = { 'en-US': duration || 60 };
    entry.fields.category = { 'en-US': category || 'Private Session' };
    entry.fields.includedAmenities = { 'en-US': includedAmenities || [] };
    entry.fields.luxuryFeatures = { 'en-US': luxuryFeatures || [] };
    entry.fields.displayOrder = { 'en-US': displayOrder || 0 };

    // Save and publish
    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    // Revalidate caches
    revalidateTag('yoga-services');

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEntry.sys.id,
        name
      }
    });

  } catch (error: any) {
    console.error('Error updating yoga service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
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
    // Apply authentication middleware
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }

    // Initialize Contentful Management client
    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
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
    revalidateTag('yoga-services');

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting yoga service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service' },
      { status: 500 }
    );
  }
}
