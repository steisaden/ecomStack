import { amazonAPI, AmazonProduct } from './amazon-api';
import { unstable_cache } from 'next/cache';
import { ENHANCED_SEARCH_TERMS } from './catalog-rotation'; // Import enhanced search terms
import { getProductImageUrl } from './amazon-images'; // Assuming this exists for image fallbacks

export interface CuratedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  affiliateUrl: string;
  category: string;
  tags: string[];
  platform: string;
  commissionRate: number;
  brandName: string;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  suitableFor: string[];
  ingredients?: string[];
  benefits: string[];
  priceRange: 'budget' | 'mid-range' | 'luxury';
  availability: 'in-stock' | 'out-of-stock' | 'limited';
  asin?: string;
  // New fields for ASIN validation and data fetching status
  asinValid?: boolean;
  lastValidated?: string;
  validationError?: string;
  lastFetched?: string;
  detailPageURL?: string;
}

// Get curated Amazon products for beauty/wellness
export const getCuratedAmazonProducts = unstable_cache(
  async (): Promise<CuratedProduct[]> => {
    const allProducts: CuratedProduct[] = [];
    const rotationId = new Date().toISOString(); // Unique ID for this rotation

    if (!amazonAPI.isConfigured()) {
      console.warn('Amazon API not configured, returning empty results for curated catalog');
      return [];
    }

    for (const { term, category, maxResults } of ENHANCED_SEARCH_TERMS) {
      try {
        const amazonProducts = await amazonAPI.searchProducts(term, 'Beauty', maxResults);

        const curatedProducts = amazonProducts.map((product, index) => {
          // Enhanced image selection with fallbacks
          const imageUrl = product.Images?.Primary?.Medium?.URL ||
            product.Images?.Primary?.Large?.URL ||
            getProductImageUrl({
              asin: product.ASIN,
              size: 'medium',
              fallbackUrl: `https://images.unsplash.com/photo-${1620916566398 + index}?w=400&h=400&fit=crop&auto=format&q=80`
            });

          return {
            id: `amazon-${product.ASIN}-${rotationId}`,
            title: product.ItemInfo?.Title?.DisplayValue || 'Amazon Product',
            description: product.ItemInfo?.Features?.DisplayValues?.join('. ') || '',
            price: product.Offers?.Listings?.[0]?.Price?.Amount || 0,
            imageUrl,
            affiliateUrl: amazonAPI.generateAffiliateLink(product.ASIN),
            category: category,
            tags: generateTagsFromProduct(product, category),
            platform: 'amazon',
            commissionRate: getCommissionRate(product.Offers?.Listings?.[0]?.Price?.Amount),
            brandName: product.ItemInfo?.ProductInfo?.Brand?.DisplayValue || extractBrandFromTitle(product.ItemInfo?.Title?.DisplayValue || ''),
            rating: product.CustomerReviews?.StarRating || 0,
            reviewCount: product.CustomerReviews?.Count || 0,
            isPopular: (product.CustomerReviews?.Count || 0) > 500,
            isTrending: (product.CustomerReviews?.StarRating || 0) > 4.5,
            isNewArrival: Math.random() > 0.8, // Add some randomness for freshness
            suitableFor: getSuitableFor(category, product.ItemInfo?.Title?.DisplayValue || ''),
            ingredients: extractIngredients(product.ItemInfo?.Features?.DisplayValues || []),
            benefits: getBenefits(category, product.ItemInfo?.Title?.DisplayValue || '', product.ItemInfo?.Features?.DisplayValues || []),
            priceRange: getPriceRange(product.Offers?.Listings?.[0]?.Price?.Amount),
            availability: 'in-stock' as const,
            asin: product.ASIN
          };
        });

        allProducts.push(...curatedProducts);
      } catch (error) {
        console.error(`Error fetching products for ${term}:`, error);
      }
    }

    // Remove duplicates by ASIN
    const uniqueProducts = allProducts.filter((product, index, self) =>
      index === self.findIndex(p => p.id.split('-')[1] === product.id.split('-')[1])
    );

    // Sort by rating and review count
    return uniqueProducts.sort((a, b) => {
      const scoreA = (a.rating || 0) * Math.log(a.reviewCount || 1);
      const scoreB = (b.rating || 0) * Math.log(b.reviewCount || 1);
      return scoreB - scoreA;
    });
  },
  ['amazon-curated-products'],
  { revalidate: 3600 } // Revalidate every 1 hour
);

// Generate relevant tags based on product and category
function generateTagsFromProduct(product: AmazonProduct, category: string): string[] {
  const tags: string[] = ['amazon'];
  const title = (product.ItemInfo?.Title?.DisplayValue || '').toLowerCase();
  const features = (product.ItemInfo?.Features?.DisplayValues || []).join(' ').toLowerCase();
  const text = `${title} ${features}`;

  // Category-specific tags
  if (category === 'Skincare') {
    if (text.includes('organic')) tags.push('organic');
    if (text.includes('natural')) tags.push('natural');
    if (text.includes('anti-aging') || text.includes('anti aging')) tags.push('anti-aging');
    if (text.includes('vitamin c')) tags.push('vitamin-c');
    if (text.includes('hyaluronic')) tags.push('hyaluronic-acid');
    if (text.includes('retinol')) tags.push('retinol');
    if (text.includes('moisturizing') || text.includes('hydrating')) tags.push('hydrating');
  }

  if (category === 'Hair Care') {
    if (text.includes('argan')) tags.push('argan-oil');
    if (text.includes('keratin')) tags.push('keratin');
    if (text.includes('sulfate free')) tags.push('sulfate-free');
    if (text.includes('repair')) tags.push('repair');
    if (text.includes('nourishing')) tags.push('nourishing');
  }

  if (category === 'Beauty Tools') {
    if (text.includes('jade')) tags.push('jade-roller');
    if (text.includes('gua sha')) tags.push('gua-sha');
    if (text.includes('led') || text.includes('light therapy')) tags.push('led-therapy');
  }

  if (category === 'Wellness') {
    if (text.includes('collagen')) tags.push('collagen');
    if (text.includes('biotin')) tags.push('biotin');
    if (text.includes('supplement')) tags.push('beauty-supplement');
  }

  // General tags
  if (text.includes('cruelty free')) tags.push('cruelty-free');
  if (text.includes('vegan')) tags.push('vegan');
  if (text.includes('paraben free')) tags.push('paraben-free');
  if (product.Offers?.Listings?.[0]?.Price?.Amount && product.Offers?.Listings?.[0]?.Price?.Amount < 20) tags.push('budget-friendly');
  if (product.CustomerReviews?.StarRating && product.CustomerReviews?.StarRating > 4.5) tags.push('highly-rated');

  return tags;
}

// Determine commission rate based on price
function getCommissionRate(price?: number): number {
  if (!price) return 4; // Default Amazon Associates rate

  if (price < 25) return 4;
  if (price < 50) return 6;
  if (price < 100) return 8;
  return 10;
}

// Determine price range
function getPriceRange(price?: number): 'budget' | 'mid-range' | 'luxury' {
  if (!price) return 'mid-range';

  if (price < 25) return 'budget';
  if (price < 75) return 'mid-range';
  return 'luxury';
}

function extractBrandFromTitle(title: string): string {
  const words = title.split(' ');
  if (words.length > 0) {
    return words[0];
  }
  return 'Amazon Brand';
}

function getSuitableFor(category: string, title: string): string[] {
  const suitable: string[] = [];
  const titleLower = title.toLowerCase();

  if (category === 'Skincare') {
    if (titleLower.includes('sensitive')) suitable.push('sensitive-skin');
    if (titleLower.includes('dry')) suitable.push('dry-skin');
    if (titleLower.includes('oily')) suitable.push('oily-skin');
    if (titleLower.includes('acne')) suitable.push('acne-prone');
    if (titleLower.includes('mature') || titleLower.includes('anti-aging')) suitable.push('mature-skin');
    if (suitable.length === 0) suitable.push('all-skin-types');
  }

  if (category === 'Hair Care') {
    if (titleLower.includes('dry')) suitable.push('dry-hair');
    if (titleLower.includes('damaged')) suitable.push('damaged-hair');
    if (titleLower.includes('color') || titleLower.includes('colored')) suitable.push('color-treated');
    if (titleLower.includes('curly')) suitable.push('curly-hair');
    if (titleLower.includes('fine')) suitable.push('fine-hair');
    if (suitable.length === 0) suitable.push('all-hair-types');
  }

  if (category === 'Beauty Tools') {
    suitable.push('all-skin-types');
  }

  if (category === 'Wellness') {
    suitable.push('health-conscious', 'beauty-focused');
  }

  return suitable;
}

function extractIngredients(features: string[]): string[] {
  const ingredients: string[] = [];
  const featuresText = features.join(' ').toLowerCase();

  const commonIngredients = [
    'hyaluronic acid', 'vitamin c', 'vitamin e', 'retinol', 'niacinamide',
    'salicylic acid', 'glycolic acid', 'peptides', 'ceramides', 'argan oil',
    'jojoba oil', 'rosehip oil', 'coconut oil', 'shea butter', 'aloe vera',
    'collagen', 'biotin', 'keratin'
  ];

  for (const ingredient of commonIngredients) {
    if (featuresText.includes(ingredient)) {
      ingredients.push(ingredient.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '));
    }
  }

  return ingredients;
}

function getBenefits(category: string, title: string, features: string[]): string[] {
  const benefits: string[] = [];
  const text = `${title} ${features.join(' ')}`.toLowerCase();

  if (category === 'Skincare') {
    if (text.includes('moistur') || text.includes('hydrat')) benefits.push('Hydrating');
    if (text.includes('anti-aging') || text.includes('wrinkle')) benefits.push('Anti-aging');
    if (text.includes('bright') || text.includes('vitamin c')) benefits.push('Brightening');
    if (text.includes('repair') || text.includes('healing')) benefits.push('Repairing');
    if (text.includes('sooth') || text.includes('calm')) benefits.push('Soothing');
  }

  if (category === 'Hair Care') {
    if (text.includes('repair') || text.includes('restor')) benefits.push('Repair');
    if (text.includes('moistur') || text.includes('nourish')) benefits.push('Nourishing');
    if (text.includes('shine') || text.includes('gloss')) benefits.push('Shine enhancement');
    if (text.includes('strength') || text.includes('fortif')) benefits.push('Strengthening');
  }

  if (category === 'Beauty Tools') {
    benefits.push('Improved circulation', 'Relaxation', 'Lymphatic drainage');
  }

  if (category === 'Wellness') {
    benefits.push('Beauty support', 'Nutritional boost', 'Overall wellness');
  }

  return benefits.length > 0 ? benefits : ['Beauty enhancement'];
}