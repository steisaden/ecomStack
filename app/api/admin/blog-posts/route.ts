import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';
import { BlogPost } from '@/lib/types';
import { revalidateTag } from 'next/cache';

// Initialize Contentful management client
const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    // Parse JSON payload
    const reqData = await request.json();
    const blogPostData: Omit<BlogPost, 'sys' | 'content'> = reqData.blogPostData;
    const assetIds: any[] = reqData.assetIds || []; // Array of uploaded asset objects
    const authorName: string = reqData.authorName || 'Goddess Care Team';
    
    // Validate required fields
    if (!blogPostData.title?.trim() || !blogPostData.slug?.trim()) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }
    
    // Get the space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
    
    // Use the default author ID from environment variables and ensure it's published
    const authorId = process.env.CONTENTFUL_DEFAULT_AUTHOR_ID || '3o3tGzvtvsUk9dNmJvvtK9';
    
    // Ensure the author entry is published and resolvable
    try {
      let authorEntry = await environment.getEntry(authorId);
      
      // If archived, unarchive it
      if (authorEntry.isArchived()) {
        authorEntry = await authorEntry.unarchive();
      }
      
      // If not published, publish it
      if (!authorEntry.isPublished()) {
        authorEntry = await authorEntry.publish();
      }
    } catch (authorError: any) {
      console.error('Error ensuring author is published:', authorError);
      return NextResponse.json(
        { 
          error: 'Author entry not found or cannot be published',
          details: `The default author (ID: ${authorId}) does not exist or cannot be accessed. Please check your CONTENTFUL_DEFAULT_AUTHOR_ID environment variable.`
        },
        { status: 400 }
      );
    }
    
    // Prepare fields for the new entry
    const toRichText = (text: string) => ({
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: text || '',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    })

    const fields: any = {
      title: {
        'en-US': blogPostData.title
      },
      slug: {
        'en-US': blogPostData.slug
      },
      // Contentful expects RichText for excerpt, so wrap plain text
      excerpt: {
        'en-US': toRichText(blogPostData.excerpt || '')
      },
      author: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: authorId
          }
        }
      },
      content: {
        'en-US': blogPostData.content || toRichText('')
      },
      publishedAt: {
        'en-US': blogPostData.publishedAt || new Date().toISOString()
      },
      tags: {
        'en-US': blogPostData.tags || []
      },
    };
    
    // Add featured image if available
    if (assetIds.length > 0) {
      fields.featuredImage = {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: assetIds[0].sys.id
          }
        }
      };
    }
    
    // Add categories if available
    if (blogPostData.categories && blogPostData.categories.length > 0) {
      fields.categories = {
        'en-US': blogPostData.categories.map((category: any) => ({
          sys: {
            type: 'Link',
            linkType: 'Entry', // This would need to be a category entry in Contentful
            id: category.id || 'placeholder-category-id' // You'd need to handle category creation separately
          }
        }))
      };
    }
    
    // Create the new entry using the correct content type ID
    const blogContentTypeId = process.env.CONTENTFUL_BLOG_CT_ID || '1Pv2TzWmGiYqK6QNKB59aY';
    const newEntry = await environment.createEntry(blogContentTypeId, {
      fields
    });
    
    console.log('Created blog entry:', newEntry.sys.id);
    
    // Publish the entry
    const publishedEntry = await newEntry.publish();
    
    console.log('Published blog entry:', publishedEntry.sys.id, 'with version:', publishedEntry.sys.publishedVersion);
    
    // Revalidate the blog posts cache to ensure the new post appears immediately
    // This uses the cache tags defined in the getBlogPosts function
    await revalidateTag('blog-posts');
    await revalidateTag('contentful');
    
    // Also revalidate the blog page path
    const { revalidatePath } = await import('next/cache');
    await revalidatePath('/blog');
    await revalidatePath(`/blog/${blogPostData.slug}`);
    await revalidatePath('/api/contentful/blog-posts');
    
    console.log('Cache tags and paths revalidated for blog-posts');
    
    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      blogPost: {
        id: publishedEntry.sys.id,
        title: publishedEntry.fields.title['en-US'],
        slug: publishedEntry.fields.slug['en-US'],
        publishedVersion: publishedEntry.sys.publishedVersion
      }
    });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create blog post',
        details: error.toString ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
