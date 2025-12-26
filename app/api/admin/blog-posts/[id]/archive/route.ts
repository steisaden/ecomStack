import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';
import { revalidateTag } from 'next/cache';

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

// PUT - Archive/Unarchive a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { archived } = await request.json();

    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    // Get the entry
    let entry = await environment.getEntry(id);

    if (archived) {
      // Unpublish before archiving
      if (entry.isPublished()) {
        entry = await entry.unpublish();
      }
      // Archive the entry
      await entry.archive();
    } else {
      // Unarchive the entry
      await entry.unarchive();
    }

    // Revalidate cache
    await revalidateTag('blog-posts');
    await revalidateTag('contentful');

    const { revalidatePath } = await import('next/cache');
    await revalidatePath('/blog');

    return NextResponse.json({
      success: true,
      message: archived ? 'Blog post archived successfully' : 'Blog post unarchived successfully'
    });
  } catch (error: any) {
    console.error('Error archiving/unarchiving blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to archive/unarchive blog post' },
      { status: 500 }
    );
  }
}
