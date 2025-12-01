import { NextRequest, NextResponse } from 'next/server';
import { getSocialMediaSettings } from '@/lib/contentful';
import { ContentfulSocialMediaSettings } from '@/lib/types';
import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { createClient } from 'contentful-management';

// Cache the social media settings fetch with a 1-hour duration
const getCachedSocialMediaSettings = unstable_cache(
  async () => {
    try {
      const settings = await getSocialMediaSettings();
      return settings;
    } catch (error) {
      console.error('Error fetching social media settings:', error);
      return null;
    }
  },
  ['social-media-settings'],
  { revalidate: 3600 } // 1 hour
);

export async function GET() {
  try {
    const settings = await getCachedSocialMediaSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error in GET /api/admin/social-media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social media settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { settings } = await request.json();
    
    // Validate URL formats if provided
    const urlFields = ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok', 'patreon'];
    for (const field of urlFields) {
      if (settings[field]) {
        try {
          new URL(settings[field]);
        } catch (urlError) {
          return NextResponse.json(
            { success: false, error: `Invalid URL format for ${field}` },
            { status: 400 }
          );
        }
      }
    }
    
    // Create a new management client
    const client = createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    });
    
    // Get the space and environment
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID || 'master');
    
    // Try to find existing social media settings entry
    const entries = await environment.getEntries({
      content_type: 'socialMediaSettings',
      limit: 1
    });
    
    let entryId: string;
    
    if (entries.items.length > 0) {
      // Update existing entry
      entryId = entries.items[0].sys.id;
      // Get the existing entry and update its fields
      const entry = await environment.getEntry(entryId);
      entry.fields = {
        instagram: {
          'en-US': settings.instagram || ''
        },
        facebook: {
          'en-US': settings.facebook || ''
        },
        twitter: {
          'en-US': settings.twitter || ''
        },
        linkedin: {
          'en-US': settings.linkedin || ''
        },
        youtube: {
          'en-US': settings.youtube || ''
        },
        tiktok: {
          'en-US': settings.tiktok || ''
        },
        patreon: {
          'en-US': settings.patreon || ''
        }
      };
      await entry.update();
    } else {
      // Create new entry
      const newEntry = await environment.createEntry('socialMediaSettings', {
        fields: {
          instagram: {
            'en-US': settings.instagram || ''
          },
          facebook: {
            'en-US': settings.facebook || ''
          },
          twitter: {
            'en-US': settings.twitter || ''
          },
          linkedin: {
            'en-US': settings.linkedin || ''
          },
          youtube: {
            'en-US': settings.youtube || ''
          },
          tiktok: {
            'en-US': settings.tiktok || ''
          },
          patreon: {
            'en-US': settings.patreon || ''
          }
        }
      });
      entryId = newEntry.sys.id;
    }
    
    // Publish the entry
    const entry = await environment.getEntry(entryId);
    await entry.publish();
    
    // Revalidate the cache
    revalidateTag('social-media-settings');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Social media settings updated successfully',
      settings: {
        instagram: settings.instagram || undefined,
        facebook: settings.facebook || undefined,
        twitter: settings.twitter || undefined,
        linkedin: settings.linkedin || undefined,
        youtube: settings.youtube || undefined,
        tiktok: settings.tiktok || undefined,
        patreon: settings.patreon || undefined,
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/social-media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update social media settings' },
      { status: 500 }
    );
  }
}