// app/api/admin/yoga-services/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth-middleware';
import { revalidateTag } from 'next/cache';

const contentful = require('contentful');
const contentfulManagement = require('contentful-management');

export async function GET(request: NextRequest) {
  try {
    // Apply authentication middleware
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }

    // Initialize Contentful client
    const client = contentful.createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
      environment: process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    });

    // Fetch all yoga services
    // Use the content type ID from env or default to the known ID
    const contentTypeId = process.env.CONTENTFUL_YOGA_SERVICE_CT_ID || '3wJlmm15QcXhlzv6eAME8F';
    
    let entries;
    try {
      entries = await client.getEntries({
        content_type: contentTypeId,
        limit: 1000,
        order: '-sys.createdAt' // Order by creation date instead
      });
    } catch (contentTypeError: any) {
      // If content type doesn't exist, return empty array
      if (contentTypeError.message?.includes('Unknown content type')) {
        console.warn('yogaService content type does not exist in Contentful');
        return NextResponse.json({
          success: true,
          services: [],
          message: 'Content type not found. Please create the yogaService content type in Contentful.'
        });
      }
      throw contentTypeError;
    }

    const services = entries.items.map((item: any) => ({
      id: item.sys.id,
      name: item.fields.name || '',
      description: item.fields.description || '',
      price: item.fields.price || 0,
      duration: item.fields.duration || 60,
      category: item.fields.category || 'Private Session',
      includedAmenities: item.fields.includedAmenities || [],
      luxuryFeatures: item.fields.luxuryFeatures || [],
      imageUrl: item.fields.image?.fields?.file?.url ? `https:${item.fields.image.fields.file.url}` : '',
      displayOrder: item.fields.displayOrder || 0,
      slug: item.fields.slug || ''
    }));

    return NextResponse.json({
      success: true,
      services
    });

  } catch (error: any) {
    console.error('Error fetching yoga services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply authentication middleware
    const authResponse = await authMiddleware(request);
    if (authResponse instanceof NextResponse) {
      return authResponse;
    }

    const body = await request.json();
    const { name, description, price, duration, category, includedAmenities, luxuryFeatures, imageUrl, displayOrder, slug } = body;

    // Validate required fields
    if (!name || !description || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price' },
        { status: 400 }
      );
    }

    // Initialize Contentful Management client
    const client = contentfulManagement.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    );

    // Create the yoga service entry
    const contentTypeId = process.env.CONTENTFUL_YOGA_SERVICE_CT_ID || '3wJlmm15QcXhlzv6eAME8F';
    const entry = await environment.createEntry(contentTypeId, {
      fields: {
        name: { 'en-US': name },
        slug: { 'en-US': slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        description: { 'en-US': description },
        price: { 'en-US': price },
        duration: { 'en-US': duration || 60 },
        category: { 'en-US': category || 'Private Session' },
        includedAmenities: { 'en-US': includedAmenities || [] },
        luxuryFeatures: { 'en-US': luxuryFeatures || [] },
        displayOrder: { 'en-US': displayOrder || 0 }
      }
    });

    // Publish the entry
    await entry.publish();

    // Revalidate caches
    revalidateTag('yoga-services');

    return NextResponse.json({
      success: true,
      data: {
        id: entry.sys.id,
        name
      }
    });

  } catch (error: any) {
    console.error('Error creating yoga service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}
