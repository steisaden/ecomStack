
import { createClient } from 'contentful';
import { unstable_cache } from 'next/cache';
import { YogaService, AddOnExperience } from './types';

// Determine if Contentful is configured
const HAS_CONTENTFUL = Boolean(process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN);

// Development fallback data to enable local QA without Contentful
export const DEV_YOGA_SERVICES: YogaService[] = [
  {
    sys: { id: 'dev-private-yoga' },
    name: 'Private Yoga Session',
    description: 'A personalized one-on-one yoga session tailored to your goals and experience level.',
    price: 150,
    duration: 60,
    category: 'Private',
    includedAmenities: ['Mat', 'Blocks', 'Water'],
    luxuryFeatures: ['Aromatherapy', 'Ambient Music'],
    image: undefined,
    displayOrder: 1,
    slug: 'private-yoga',
  },
  {
    sys: { id: 'dev-group-yoga' },
    name: 'Small Group Yoga',
    description: 'Share the experience with friends or family in a small group setting (up to 4 people).',
    price: 220,
    duration: 75,
    category: 'Group',
    includedAmenities: ['Mats', 'Straps', 'Blocks'],
    luxuryFeatures: ['Candlelight', 'Sound Bath (closing)'],
    image: undefined,
    displayOrder: 2,
    slug: 'small-group-yoga',
  },
];

const DEV_ADD_ONS: AddOnExperience[] = [
  {
    sys: { id: 'addon-meditation' },
    name: 'Meditation Session',
    description: 'Guided meditation to deepen relaxation and mental clarity.',
    price: 25,
    applicableServices: ['All Services'],
    image: undefined,
  },
  {
    sys: { id: 'addon-aroma' },
    name: 'Aromatherapy Upgrade',
    description: 'Premium essential oils to elevate your practice experience.',
    price: 15,
    applicableServices: ['Private Yoga Session'],
    image: undefined,
  },
];

// Initialize Contentful client only when configured
let client: ReturnType<typeof createClient> | null = null;
if (HAS_CONTENTFUL) {
  client = createClient({
    space: (process.env.CONTENTFUL_SPACE_ID || '').trim(),
    accessToken: (process.env.CONTENTFUL_ACCESS_TOKEN || '').trim(),
    environment: (process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master').trim(),
  });
}

// Allow explicit overrides via env when spaces contain duplicate content types
const YOGA_CT_OVERRIDE = process.env.CONTENTFUL_YOGA_SERVICE_CT_ID;
const ADDON_CT_OVERRIDE = process.env.CONTENTFUL_ADDON_EXPERIENCE_CT_ID;

// Dynamically resolve Contentful content type IDs (CDA) with caching
export const getYogaContentTypeIds = unstable_cache(
  async () => {
    // If in dev without Contentful, short-circuit with defaults
    if (!HAS_CONTENTFUL) {
      return {
        yogaService: 'yogaService',
        addOnExperience: 'addOnExperience',
      } as const;
    }

    // If overrides are provided, trust them immediately
    if (YOGA_CT_OVERRIDE || ADDON_CT_OVERRIDE) {
      return {
        yogaService: (YOGA_CT_OVERRIDE || 'yogaService') as string,
        addOnExperience: (ADDON_CT_OVERRIDE || 'addOnExperience') as string,
      } as const;
    }

    try {
      const types = await client!.getContentTypes();
      const items = types.items || [];

      // Select the best matching content type by preferred ID/name; if duplicates exist,
      // pick the candidate that actually has entries in CDA (total > 0); otherwise fallback
      const pickBest = async (preferredId: string, displayName: string) => {
        const nameLc = displayName.toLowerCase();
        const candidates = items.filter((t: any) =>
          t?.sys?.id === preferredId || String(t?.name || '').toLowerCase() === nameLc
        );

        // If we found candidates, preferentially choose the one with published entries
        let bestId: string | null = null;
        let bestTotal = -1;
        for (const cand of candidates) {
          const id = cand?.sys?.id;
          if (!id) continue;
          try {
            const res = await client!.getEntries({ content_type: id, limit: 1 });
            const total = typeof res.total === 'number' ? res.total : 0;
            if (total > bestTotal) {
              bestTotal = total;
              bestId = id;
            }
          } catch {
            // ignore and continue
          }
        }

        if (bestId) return bestId;

        // No candidates with entries: keep original behavior
        const byId = items.find((t: any) => t?.sys?.id === preferredId);
        if (byId) return byId.sys.id;
        const byName = items.find(
          (t: any) => String(t?.name || '').toLowerCase() === nameLc
        );
        if (byName) return byName.sys.id;
        return preferredId; // final fallback
      };

      return {
        yogaService: await pickBest('yogaService', 'Yoga Service'),
        addOnExperience: await pickBest('addOnExperience', 'Add-On Experience'),
      } as const;
    } catch (e) {
      // On any error, fall back to preferred IDs
      return {
        yogaService: 'yogaService',
        addOnExperience: 'addOnExperience',
      } as const;
    }
  },
  ['yoga-content-type-ids-v2'],
  { tags: ['contentful', 'content-types'], revalidate: 21600 }
);

function transformYogaService(item: any): YogaService {
  return {
    sys: { id: item.sys.id },
    name: item.fields.name || '',
    description: item.fields.description || '',
    price: item.fields.price || 0,
    duration: item.fields.duration || 0,
    category: item.fields.category || '',
    includedAmenities: item.fields.includedAmenities || [],
    luxuryFeatures: item.fields.luxuryFeatures || [],
    image: item.fields.image ? {
      url: item.fields.image.fields.file.url.startsWith('//') ? `https:${item.fields.image.fields.file.url}` : item.fields.image.fields.file.url,
      title: item.fields.image.fields.title,
      description: item.fields.image.fields.description,
      width: item.fields.image.fields.file.details.image?.width,
      height: item.fields.image.fields.file.details.image?.height,
      contentType: item.fields.image.fields.file.contentType
    } : undefined,
    displayOrder: item.fields.displayOrder || 0,
    slug: item.fields.slug || '',
  };
}

function transformAddOnExperience(item: any): AddOnExperience {
  return {
    sys: { id: item.sys.id },
    name: item.fields.name || '',
    description: item.fields.description || '',
    price: item.fields.price || 0,
    applicableServices: item.fields.applicableServices || [],
    image: item.fields.image ? {
      url: item.fields.image.fields.file.url.startsWith('//') ? `https:${item.fields.image.fields.file.url}` : item.fields.image.fields.file.url,
      title: item.fields.image.fields.title,
      description: item.fields.image.fields.description,
      width: item.fields.image.fields.file.details.image?.width,
      height: item.fields.image.fields.file.details.image?.height,
      contentType: item.fields.image.fields.file.contentType
    } : undefined,
  };
}

export async function getYogaServices(): Promise<YogaService[]> {
  // Dev fallback when Contentful is not configured
  if (!HAS_CONTENTFUL) {
    return DEV_YOGA_SERVICES;
  }
  try {
    const ids = await getYogaContentTypeIds();
    const entries = await client!.getEntries({
      content_type: ids.yogaService,
      order: ['fields.displayOrder'],
    });
    // Fallback to dev data when Contentful has no entries
    if (!entries.items || entries.items.length === 0) {
      return DEV_YOGA_SERVICES;
    }
    return entries.items.map(transformYogaService);
  } catch (error) {
    console.error('Error fetching yoga services:', error);
    // On error, use dev fallback so pages still render during local QA
    return DEV_YOGA_SERVICES;
  }
}

export async function getYogaServiceBySlug(slug: string): Promise<YogaService | null> {
  return unstable_cache(
    async () => {
      // Dev fallback when Contentful is not configured
      if (!HAS_CONTENTFUL) {
        return DEV_YOGA_SERVICES.find(s => s.slug === slug) || null;
      }
      try {
        const ids = await getYogaContentTypeIds();
        const entries = await client!.getEntries({
          content_type: ids.yogaService,
          'fields.slug': slug,
          limit: 1,
        });
        if (!entries.items || entries.items.length === 0) {
          // Fallback to dev data when Contentful has no matching item
          return DEV_YOGA_SERVICES.find(s => s.slug === slug) || null;
        }
        return transformYogaService(entries.items[0]);
      } catch (error) {
        console.error(`Error fetching yoga service by slug ${slug}:`, error);
        // On error, use dev fallback
        return DEV_YOGA_SERVICES.find(s => s.slug === slug) || null;
      }
    },
    [`yoga-service-v2-${slug}`],
    {
      tags: ['yoga-services', `yoga-service-${slug}`],
      revalidate: 3600, // 1 hour
    }
  )();
}

export async function getAddOnExperiences(): Promise<AddOnExperience[]> {
  return unstable_cache(
    async () => {
      // Dev fallback when Contentful is not configured
      if (!HAS_CONTENTFUL) {
        return DEV_ADD_ONS;
      }
      try {
        const ids = await getYogaContentTypeIds();
        const entries = await client!.getEntries({
          content_type: ids.addOnExperience,
        });
        // Fallback to dev data when Contentful has no entries
        if (!entries.items || entries.items.length === 0) {
          return DEV_ADD_ONS;
        }
        return entries.items.map(transformAddOnExperience);
      } catch (error) {
        console.error('Error fetching add-on experiences:', error);
        // On error, use dev fallback so pages still render during local QA
        return DEV_ADD_ONS;
      }
    },
    ['add-on-experiences-v2'],
    {
      tags: ['yoga-addons'],
      revalidate: 3600, // 1 hour
    }
  )();
}
