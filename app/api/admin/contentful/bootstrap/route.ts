// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'contentful-management';

export async function POST(request: NextRequest) {
  try {
    // Get Contentful management client
    const client = createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    // Define the content types we need
    const contentTypes = [
      // Goddess Care Product content type
      {
        sys: { id: 'goddessCareProduct' },
        name: 'Goddess Care Product',
        description: 'Product information for Goddess Care Co',
        displayField: 'title',
        fields: [
          { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
          { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
          { id: 'description', name: 'Description', type: 'RichText', required: false, localized: false },
          { id: 'price', name: 'Price', type: 'Number', required: false, localized: false },
          { id: 'images', name: 'Images', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Asset' } },
          { id: 'category', name: 'Category', type: 'Link', required: false, localized: false, linkType: 'Entry' },
          { id: 'inStock', name: 'In Stock', type: 'Boolean', required: false, localized: false },
          { id: 'isAffiliate', name: 'Is Affiliate Product', type: 'Boolean', required: false, localized: false },
          { id: 'affiliateUrl', name: 'Affiliate URL', type: 'Symbol', required: false, localized: false },
        ]
      },
      // Affiliate Product content type
      {
        sys: { id: 'affiliateProduct' },
        name: 'Affiliate Product',
        description: 'Affiliate product information with tracking and validation',
        displayField: 'title',
        fields: [
          { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
          { id: 'description', name: 'Description', type: 'Text', required: false, localized: false },
          { id: 'price', name: 'Price', type: 'Number', required: false, localized: false },
          { id: 'imageUrl', name: 'Image URL', type: 'Symbol', required: false, localized: false },
          { id: 'affiliateUrl', name: 'Affiliate URL', type: 'Symbol', required: true, localized: false },
          { id: 'category', name: 'Category', type: 'Symbol', required: false, localized: false },
          { id: 'tags', name: 'Tags', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
          { id: 'commissionRate', name: 'Commission Rate', type: 'Number', required: false, localized: false },
          { id: 'platform', name: 'Platform', type: 'Symbol', required: false, localized: false, defaultValue: { 'en-US': 'custom' } },
          { id: 'performance', name: 'Performance', type: 'Object', required: false, localized: false },
          { id: 'status', name: 'Status', type: 'Symbol', required: false, localized: false, defaultValue: { 'en-US': 'active' }, validations: [{ in: ['active', 'inactive', 'pending'] }] },
          { id: 'scheduledPromotions', name: 'Scheduled Promotions', type: 'Array', required: false, localized: false, items: { type: 'Object' } },
          { id: 'imageRefreshStatus', name: 'Image Refresh Status', type: 'Symbol', required: false, localized: false, defaultValue: { 'en-US': 'current' }, validations: [{ in: ['current', 'needs_refresh', 'refreshing'] }] },
          { id: 'linkValidationStatus', name: 'Link Validation Status', type: 'Symbol', required: false, localized: false, defaultValue: { 'en-US': 'valid' }, validations: [{ in: ['valid', 'invalid', 'checking'] }] },
          { id: 'lastImageRefresh', name: 'Last Image Refresh', type: 'Symbol', required: false, localized: false }, // Using Symbol for ISO string date
          { id: 'lastLinkCheck', name: 'Last Link Check', type: 'Symbol', required: false, localized: false }, // Using Symbol for ISO string date
          { id: 'needsReview', name: 'Needs Review', type: 'Boolean', required: false, localized: false, defaultValue: { 'en-US': false } },
        ]
      },
      // Blog post content type
      {
        sys: { id: 'testBlog' },
        name: 'Blog Post',
        description: 'Blog posts for the website',
        displayField: 'title',
        fields: [
          { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
          { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
          { id: 'excerpt', name: 'Excerpt', type: 'RichText', required: false, localized: false },
          { id: 'content', name: 'Content', type: 'RichText', required: true, localized: false },
          { id: 'featuredImage', name: 'Featured Image', type: 'Link', required: false, localized: false, linkType: 'Asset' },
          { id: 'author', name: 'Author', type: 'Link', required: true, localized: false, linkType: 'Entry' },
          { id: 'categories', name: 'Categories', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry' } },
          { id: 'tags', name: 'Tags', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
          { id: 'publishedAt', name: 'Published At', type: 'Date', required: false, localized: false },
          { id: 'views', name: 'Views', type: 'Integer', required: false, localized: false },
          { id: 'likes', name: 'Likes', type: 'Integer', required: false, localized: false },
        ]
      },
      // Category content type
      {
        sys: { id: 'category' },
        name: 'Category',
        description: 'Category for products and blog posts',
        displayField: 'name',
        fields: [
          { id: 'name', name: 'Name', type: 'Symbol', required: true, localized: false },
          { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
        ]
      },
      // Author content type
      {
        sys: { id: 'author' },
        name: 'Author',
        description: 'Blog post authors',
        displayField: 'name',
        fields: [
          { id: 'name', name: 'Name', type: 'Symbol', required: true, localized: false },
          { id: 'avatar', name: 'Avatar', type: 'Link', required: false, localized: false, linkType: 'Asset' },
          { id: 'bio', name: 'Bio', type: 'RichText', required: false, localized: false },
        ]
      },
      {
        sys: { id: 'yogaAvailability' },
        name: 'Yoga Availability',
        description: 'Availability per service per date',
        displayField: 'serviceId',
        fields: [
          { id: 'serviceId', name: 'Service ID', type: 'Symbol', required: true, localized: false },
          { id: 'date', name: 'Date', type: 'Date', required: true, localized: false },
          { id: 'timeSlots', name: 'Time Slots', type: 'Object', required: true, localized: false },
        ]
      }
    ];

    const results: Array<{ id: string; status: string; error?: string }> = [];

    for (const contentTypeDef of contentTypes) {
      try {
        // Check if content type already exists
        let contentType;
        try {
          contentType = await environment.getContentType(contentTypeDef.sys.id);
          results.push({ id: contentTypeDef.sys.id, status: 'already exists' });
        } catch (error: any) {
          // If getting the content type fails, it means it doesn't exist
          // Contentful SDK can return different error formats depending on version
          const isNotFound =
            error.sys?.id === 'notResolvable' ||
            error.status === 404 ||
            (error.message && typeof error.message === 'string' && error.message.includes('The resource could not be found')) ||
            (error.message && typeof error.message === 'string' && error.message.includes('404'));

          if (isNotFound) {
            // Create the content type
            contentType = await environment.createContentTypeWithId(contentTypeDef.sys.id, {
              name: contentTypeDef.name,
              description: contentTypeDef.description,
              displayField: contentTypeDef.displayField,
              fields: contentTypeDef.fields
            });

            // Publish the content type after creation
            await contentType.publish();
            results.push({ id: contentTypeDef.sys.id, status: 'created' });
          } else {
            throw error;
          }
        }
      } catch (error: any) {
        console.error(`Error processing content type ${contentTypeDef.sys.id}:`, error);
        results.push({ id: contentTypeDef.sys.id, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Content types processing completed',
      results
    });

  } catch (error: any) {
    console.error('Error in bootstrap process:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
