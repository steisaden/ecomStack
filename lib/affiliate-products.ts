import { createClient } from 'contentful';
import { createClient as createManagementClient } from 'contentful-management';
import { unstable_cache } from 'next/cache';
import { ContentfulAffiliateProduct, AffiliateProduct } from './types';

// Conditional import for revalidateTag to avoid server component issues
const revalidateTag = (() => {
  try {
    // Only import revalidateTag in server environments
    if (typeof window === 'undefined') {
      return require('next/cache').revalidateTag;
    }
    return () => { }; // No-op for client-side
  } catch {
    return () => { }; // Fallback no-op
  }
})();

// Initialize Contentful client for reading
const client = createClient({
  space: (process.env.CONTENTFUL_SPACE_ID || '').trim(),
  accessToken: (process.env.CONTENTFUL_ACCESS_TOKEN || '').trim(),
  environment: (process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master').trim(),
});

// Initialize Contentful Management client for writing
const managementClient = createManagementClient({
  accessToken: (process.env.CONTENTFUL_MANAGEMENT_TOKEN || '').trim(),
});

// Cache the affiliate products fetch with a 30-minute duration
export const getCachedAffiliateProducts = unstable_cache(
  async (): Promise<AffiliateProduct[]> => {
    try {
      const entries = await client.getEntries<any>({
        content_type: 'affiliateProduct',
        limit: 1000, // Reasonable limit for affiliate products
        order: ['-sys.createdAt']
      });

      return entries.items.map(item => {
        const fields = item.fields as any;
        return {
          id: item.sys.id,
          title: fields.title || '',
          description: fields.description || '',
          price: fields.price ? Number(fields.price) : 0,
          imageUrl: fields.imageUrl || undefined,
          affiliateUrl: fields.affiliateUrl || '',
          category: fields.category || undefined,
          tags: Array.isArray(fields.tags) ? fields.tags : [],
          commissionRate: fields.commissionRate ? Number(fields.commissionRate) : 0,
          platform: fields.platform || 'custom',
          performance: fields.performance || {
            clicks: 0,
            conversions: 0,
            revenue: 0,
            conversionRate: 0,
            lastUpdated: new Date().toISOString()
          },
          status: fields.status || 'active',
          scheduledPromotions: Array.isArray(fields.scheduledPromotions) ? fields.scheduledPromotions : [],
          imageRefreshStatus: fields.imageRefreshStatus || 'current',
          linkValidationStatus: fields.linkValidationStatus || 'valid',
          lastImageRefresh: fields.lastImageRefresh || undefined,
          lastLinkCheck: fields.lastLinkCheck || undefined,
          needsReview: fields.needsReview || false,
        };
      });
    } catch (error) {
      console.error('Error fetching affiliate products:', error);
      return [];
    }
  },
  ['affiliate-products'],
  { revalidate: 1800 } // 30 minutes
);

// Get a single affiliate product by ID
export async function getAffiliateProductById(id: string): Promise<AffiliateProduct | null> {
  try {
    const entry = await client.getEntry<any>(id);

    if (!entry) {
      return null;
    }

    const fields = entry.fields as any;
    return {
      id: entry.sys.id,
      title: fields.title || '',
      description: fields.description || '',
      price: fields.price ? Number(fields.price) : 0,
      imageUrl: fields.imageUrl || undefined,
      affiliateUrl: fields.affiliateUrl || '',
      category: fields.category || undefined,
      tags: Array.isArray(fields.tags) ? fields.tags : [],
      commissionRate: fields.commissionRate ? Number(fields.commissionRate) : 0,
      platform: fields.platform || 'custom',
      performance: fields.performance || {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: fields.status || 'active',
      scheduledPromotions: Array.isArray(fields.scheduledPromotions) ? fields.scheduledPromotions : [],
      imageRefreshStatus: fields.imageRefreshStatus || 'current',
      linkValidationStatus: fields.linkValidationStatus || 'valid',
      lastImageRefresh: fields.lastImageRefresh || undefined,
      lastLinkCheck: fields.lastLinkCheck || undefined,
      needsReview: fields.needsReview || false,
    };
  } catch (error) {
    console.error('Error fetching affiliate product by ID:', error);
    return null;
  }
}

// Create a new affiliate product
export async function createAffiliateProduct(productData: Omit<AffiliateProduct, 'id' | 'performance' | 'status'>): Promise<AffiliateProduct | null> {
  try {
    // Validate required fields
    if (!productData.title || !productData.affiliateUrl) {
      throw new Error('Title and affiliate URL are required');
    }

    // Validate URL format
    try {
      new URL(productData.affiliateUrl);
      if (productData.imageUrl) {
        new URL(productData.imageUrl);
      }
    } catch (urlError) {
      throw new Error('Invalid URL format');
    }

    // Get space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    // Create new affiliate product entry with only essential fields first
    const essentialFields = {
      fields: {
        title: {
          'en-US': productData.title
        },
        description: {
          'en-US': productData.description || ''
        },
        price: {
          'en-US': productData.price || 0
        },
        imageUrl: {
          'en-US': productData.imageUrl || 'https://placehold.co/400x400?text=No+Image+Available'
        },
        affiliateUrl: {
          'en-US': productData.affiliateUrl
        },
        category: {
          'en-US': productData.category || ''
        },
        tags: {
          'en-US': Array.isArray(productData.tags) ? productData.tags : []
        },
        commissionRate: {
          'en-US': productData.commissionRate || 0
        },
        platform: {
          'en-US': productData.platform || 'custom'
        },
        performance: {
          'en-US': {
            clicks: 0,
            conversions: 0,
            revenue: 0,
            conversionRate: 0,
            lastUpdated: new Date().toISOString()
          }
        },
        status: {
          'en-US': 'active'
        },
        scheduledPromotions: {
          'en-US': Array.isArray(productData.scheduledPromotions) ? productData.scheduledPromotions : []
        }
      }
    };



    const newEntry = await environment.createEntry('affiliateProduct', essentialFields);

    const entryId = newEntry.sys.id;

    // Publish the entry
    await newEntry.publish();

    // Revalidate the cache
    revalidateTag('affiliate-products');
    revalidateTag('unified-products');

    // Return the created product
    const fields = newEntry.fields as any;
    return {
      id: newEntry.sys.id,
      title: fields.title?.['en-US'] || '',
      description: fields.description?.['en-US'] || '',
      price: fields.price?.['en-US'] ? Number(fields.price?.['en-US']) : 0,
      imageUrl: fields.imageUrl?.['en-US'] || undefined,
      affiliateUrl: fields.affiliateUrl?.['en-US'] || '',
      category: fields.category?.['en-US'] || undefined,
      tags: Array.isArray(fields.tags?.['en-US']) ? fields.tags?.['en-US'] : [],
      commissionRate: fields.commissionRate?.['en-US'] ? Number(fields.commissionRate?.['en-US']) : 0,
      platform: fields.platform?.['en-US'] || 'custom',
      performance: fields.performance?.['en-US'] || {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: fields.status?.['en-US'] || 'active',
      scheduledPromotions: Array.isArray(fields.scheduledPromotions?.['en-US']) ? fields.scheduledPromotions?.['en-US'] : [],
      imageRefreshStatus: fields.imageRefreshStatus?.['en-US'] || 'current',
      linkValidationStatus: fields.linkValidationStatus?.['en-US'] || 'valid',
      lastImageRefresh: fields.lastImageRefresh?.['en-US'] || undefined,
      lastLinkCheck: fields.lastLinkCheck?.['en-US'] || undefined,
      needsReview: fields.needsReview?.['en-US'] !== undefined ? fields.needsReview?.['en-US'] : false
    };
  } catch (error: any) {
    console.error('Error creating affiliate product:', error);
    throw new Error(`Failed to create affiliate product: ${error.message}`);
  }
}

// Update an existing affiliate product
export async function updateAffiliateProduct(id: string, productData: Partial<AffiliateProduct>): Promise<AffiliateProduct | null> {
  try {
    // Validate URL format if provided
    if (productData.affiliateUrl) {
      try {
        new URL(productData.affiliateUrl);
      } catch (urlError) {
        throw new Error('Invalid affiliate URL format');
      }
    }

    if (productData.imageUrl) {
      try {
        new URL(productData.imageUrl);
      } catch (urlError) {
        throw new Error('Invalid image URL format');
      }
    }

    // Get space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    // Get the existing entry
    const entry = await environment.getEntry(id);

    if (!entry) {
      throw new Error('Product not found');
    }

    // Update fields
    if (productData.title !== undefined) {
      entry.fields.title = { 'en-US': productData.title };
    }

    if (productData.description !== undefined) {
      entry.fields.description = { 'en-US': productData.description || '' };
    }

    if (productData.price !== undefined) {
      entry.fields.price = { 'en-US': productData.price || 0 };
    }

    if (productData.imageUrl !== undefined) {
      entry.fields.imageUrl = { 'en-US': productData.imageUrl || '' };
    }

    if (productData.affiliateUrl !== undefined) {
      entry.fields.affiliateUrl = { 'en-US': productData.affiliateUrl };
    }

    if (productData.category !== undefined) {
      entry.fields.category = { 'en-US': productData.category || '' };
    }

    if (productData.tags !== undefined) {
      entry.fields.tags = { 'en-US': Array.isArray(productData.tags) ? productData.tags : [] };
    }

    if (productData.commissionRate !== undefined) {
      entry.fields.commissionRate = { 'en-US': productData.commissionRate || 0 };
    }

    if (productData.platform !== undefined) {
      entry.fields.platform = { 'en-US': productData.platform || 'custom' };
    }

    if (productData.performance !== undefined) {
      entry.fields.performance = { 'en-US': productData.performance };
    }

    if (productData.status !== undefined) {
      entry.fields.status = { 'en-US': productData.status || 'active' };
    }

    if (productData.scheduledPromotions !== undefined) {
      entry.fields.scheduledPromotions = { 'en-US': Array.isArray(productData.scheduledPromotions) ? productData.scheduledPromotions : [] };
    }

    if (productData.imageRefreshStatus !== undefined) {
      entry.fields.imageRefreshStatus = { 'en-US': productData.imageRefreshStatus };
    }

    if (productData.linkValidationStatus !== undefined) {
      entry.fields.linkValidationStatus = { 'en-US': productData.linkValidationStatus };
    }

    if (productData.lastImageRefresh !== undefined) {
      entry.fields.lastImageRefresh = { 'en-US': productData.lastImageRefresh };
    }

    if (productData.lastLinkCheck !== undefined) {
      entry.fields.lastLinkCheck = { 'en-US': productData.lastLinkCheck };
    }

    if (productData.needsReview !== undefined) {
      entry.fields.needsReview = { 'en-US': productData.needsReview };
    }

    // Update and publish the entry
    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    // Revalidate the cache
    revalidateTag('affiliate-products');
    revalidateTag('unified-products');

    // Return the updated product
    const fields = updatedEntry.fields as any;
    return {
      id: updatedEntry.sys.id,
      title: fields.title?.['en-US'] || '',
      description: fields.description?.['en-US'] || '',
      price: fields.price?.['en-US'] ? Number(fields.price?.['en-US']) : 0,
      imageUrl: fields.imageUrl?.['en-US'] || undefined,
      affiliateUrl: fields.affiliateUrl?.['en-US'] || '',
      category: fields.category?.['en-US'] || undefined,
      tags: Array.isArray(fields.tags?.['en-US']) ? fields.tags?.['en-US'] : [],
      commissionRate: fields.commissionRate?.['en-US'] ? Number(fields.commissionRate?.['en-US']) : 0,
      platform: fields.platform?.['en-US'] || 'custom',
      performance: fields.performance?.['en-US'] || {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: fields.status?.['en-US'] || 'active',
      scheduledPromotions: Array.isArray(fields.scheduledPromotions?.['en-US']) ? fields.scheduledPromotions?.['en-US'] : [],
      imageRefreshStatus: fields.imageRefreshStatus?.['en-US'] || 'current',
      linkValidationStatus: fields.linkValidationStatus?.['en-US'] || 'valid',
      lastImageRefresh: fields.lastImageRefresh?.['en-US'] || undefined,
      lastLinkCheck: fields.lastLinkCheck?.['en-US'] || undefined,
      needsReview: fields.needsReview?.['en-US'] || false
    };
  } catch (error: any) {
    console.error('Error updating affiliate product:', error);
    throw new Error(`Failed to update affiliate product: ${error.message}`);
  }
}

// Delete an affiliate product (archive it)
export async function deleteAffiliateProduct(id: string): Promise<boolean> {
  try {
    // Get space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    // Get the existing entry
    const entry = await environment.getEntry(id);

    if (!entry) {
      throw new Error('Product not found');
    }

    // Unpublish and archive the entry
    if (entry.isPublished()) {
      await entry.unpublish();
    }
    await entry.archive();

    // Revalidate the cache
    revalidateTag('affiliate-products');
    revalidateTag('unified-products');

    return true;
  } catch (error: any) {
    console.error('Error deleting affiliate product:', error);
    throw new Error(`Failed to delete affiliate product: ${error.message}`);
  }
}

// Get performance metrics for affiliate products
export async function getAffiliateProductMetrics(): Promise<any> {
  try {
    const products = await getCachedAffiliateProducts();

    // Calculate metrics
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const totalRevenue = products.reduce((sum, p) => sum + (p.performance.revenue || 0), 0);
    const avgCommissionRate = totalProducts > 0
      ? products.reduce((sum, p) => sum + (p.commissionRate || 0), 0) / totalProducts
      : 0;

    // Top performing products (by revenue)
    const topPerforming = [...products]
      .sort((a, b) => (b.performance.revenue || 0) - (a.performance.revenue || 0))
      .slice(0, 5);

    // AI recommendations (simulated - in a real implementation, this would connect to an AI service)
    const recommendations = await generateAIRecommendations(products);

    return {
      totalProducts,
      activeProducts,
      totalRevenue,
      avgCommissionRate,
      topPerforming,
      recommendations
    };
  } catch (error: any) {
    console.error('Error fetching affiliate product metrics:', error);
    throw new Error(`Failed to fetch affiliate product metrics: ${error.message}`);
  }
}

// Simulated AI recommendation generator
async function generateAIRecommendations(products: AffiliateProduct[]) {
  // In a real implementation, this would connect to an AI service
  // For now, we'll generate simulated recommendations with realistic data

  const recommendations: any[] = [];

  // Calculate total revenue for use in recommendations
  const totalRevenue = products.reduce((sum, p) => sum + (p.performance.revenue || 0), 0);

  // 1. Low performance optimization recommendation
  const lowPerformers = products
    .filter(p => p.performance.revenue < 50 && p.performance.clicks > 10)
    .sort((a, b) => (a.performance.revenue - b.performance.revenue));

  if (lowPerformers.length > 0) {
    recommendations.push({
      productId: lowPerformers[0].id,
      title: 'Optimize Low Performer',
      reason: 'Low revenue despite high traffic. Consider adjusting pricing or promotion strategy.',
      confidence: 0.85,
      predictedPerformance: {
        clicks: Math.round(lowPerformers[0].performance.clicks * 1.2),
        conversions: Math.round(lowPerformers[0].performance.conversions * 1.5),
        revenue: Math.round(lowPerformers[0].performance.revenue * 2.5)
      },
      suggestedAction: 'optimize'
    });
  }

  // 2. High potential promotion recommendation
  const highPotential = products
    .filter(p => p.performance.clicks > 100 && p.performance.conversionRate < 2)
    .sort((a, b) => b.performance.clicks - a.performance.clicks);

  if (highPotential.length > 0) {
    recommendations.push({
      productId: highPotential[0].id,
      title: highPotential[0].title,
      reason: 'High traffic but low conversion rate suggests optimization opportunity.',
      confidence: 0.9,
      predictedPerformance: {
        clicks: highPotential[0].performance.clicks,
        conversions: Math.round(highPotential[0].performance.clicks * 0.05),
        revenue: Math.round(highPotential[0].performance.clicks * 0.05 * (typeof highPotential[0].price === 'number' ? highPotential[0].price : highPotential[0].price?.amount || 0))
      },
      suggestedAction: 'promote'
    });
  }

  // 3. Category gap recommendation
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  if (categories.length < 8) {
    const missingCategories = [
      'Skincare',
      'Hair Care',
      'Wellness',
      'Beauty Tools',
      'Organic Products',
      'Luxury Items',
      'Self-Care',
      'Accessories'
    ].filter(cat => !categories.includes(cat));

    if (missingCategories.length > 0) {
      const suggestedCategory = missingCategories[0];
      recommendations.push({
        productId: null,
        title: `Expand to ${suggestedCategory}`,
        reason: `Your product portfolio lacks ${suggestedCategory} products which are trending in your niche.`,
        confidence: 0.75,
        predictedPerformance: {
          clicks: 150,
          conversions: 30,
          revenue: 750
        },
        suggestedAction: 'add'
      });
    }
  }

  // 4. Seasonal recommendation
  const now = new Date();
  const month = now.getMonth();

  // Summer products (June-August)
  if (month >= 5 && month <= 7) {
    recommendations.push({
      productId: null,
      title: 'Summer Product Focus',
      reason: 'Summer season presents opportunities for sunscreen, swimwear, and outdoor beauty products.',
      confidence: 0.8,
      predictedPerformance: {
        clicks: 200,
        conversions: 40,
        revenue: 1200
      },
      suggestedAction: 'promote'
    });
  }

  // Holiday products (November-January)
  if (month >= 10 || month <= 0) {
    recommendations.push({
      productId: null,
      title: 'Holiday Gift Guide',
      reason: 'Holiday season is prime time for gift-related products and beauty sets.',
      confidence: 0.85,
      predictedPerformance: {
        clicks: 300,
        conversions: 75,
        revenue: 2000
      },
      suggestedAction: 'promote'
    });
  }

  // 5. Platform diversification recommendation
  const platforms = Array.from(new Set(products.map(p => p.platform)));
  if (platforms.length < 3) {
    const missingPlatforms = [
      'amazon',
      'shareasale',
      'cj'
    ].filter(platform => !platforms.includes(platform));

    if (missingPlatforms.length > 0) {
      const suggestedPlatform = missingPlatforms[0];
      recommendations.push({
        productId: null,
        title: `Diversify to ${suggestedPlatform}`,
        reason: `Expanding to ${suggestedPlatform} can increase your affiliate revenue potential.`,
        confidence: 0.7,
        predictedPerformance: {
          clicks: 100,
          conversions: 20,
          revenue: 500
        },
        suggestedAction: 'add'
      });
    }
  }

  // 6. Commission optimization recommendation
  const avgCommission = products.reduce((sum, p) => sum + (p.commissionRate || 0), 0) / (products.length || 1);
  if (avgCommission < 5) {
    recommendations.push({
      productId: null,
      title: 'Commission Rate Optimization',
      reason: 'Your average commission rate is below industry standard. Consider negotiating better rates.',
      confidence: 0.8,
      predictedPerformance: {
        clicks: 0,
        conversions: 0,
        revenue: Math.round(totalRevenue * 0.2) // 20% increase potential
      },
      suggestedAction: 'optimize'
    });
  }

  return recommendations;
}