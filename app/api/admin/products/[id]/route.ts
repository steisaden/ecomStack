import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';
import { revalidateTag } from 'next/cache';
import { verifyAuth } from '@/lib/auth';

// Initialize Contentful management client
const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }
    const { id } = await params;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get the space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    // Get the entry
    const entry = await environment.getEntry(id);

    try {
      // First, try to unpublish the entry if it's published
      await entry.unpublish();
    } catch (unpublishError) {
      console.log('Entry was not published or unpublish failed:', unpublishError);
      // Continue with deletion even if unpublish fails
    }

    try {
      // Then, try to archive the entry (alternative to delete)
      await entry.archive();
    } catch (archiveError) {
      console.log('Archive failed, proceeding to delete:', archiveError);
    }

    // Finally, delete the entry
    await entry.delete();

    // Revalidate the products cache to ensure the product disappears immediately
    revalidateTag('products');
    revalidateTag('contentful');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to delete product',
        details: error.toString ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }
    const { id } = await params;
    const { archived } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get the space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    // Get the entry
    const entry = await environment.getEntry(id);

    // Update the inStock field to simulate archiving
    // In a real implementation, you might want to add a dedicated 'archived' field
    entry.fields.inStock = {
      'en-US': !archived // Set to false when archiving
    };

    // Update the entry
    const updatedEntry = await entry.update();

    // Publish the entry
    const publishedEntry = await updatedEntry.publish();

    // Revalidate the products cache to ensure the product status updates immediately
    revalidateTag('products');
    revalidateTag('contentful');

    return NextResponse.json({
      success: true,
      message: archived ? 'Product archived successfully' : 'Product unarchived successfully',
      product: publishedEntry
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to update product',
        details: error.toString ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
