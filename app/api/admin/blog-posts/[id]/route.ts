import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';
import { revalidateTag } from 'next/cache';
import { verifyAuth } from '@/lib/auth';

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

// DELETE - Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }
    const { id } = await params;

    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    // Get the entry
    const entry = await environment.getEntry(id);

    // Unpublish if published
    if (entry.isPublished()) {
      await entry.unpublish();
    }

    // Delete the entry
    await entry.delete();

    // Revalidate cache
    await revalidateTag('blog-posts');
    await revalidateTag('contentful');

    const { revalidatePath } = await import('next/cache');
    await revalidatePath('/blog');

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
