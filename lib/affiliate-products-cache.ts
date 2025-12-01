// Shared cache for affiliate products to ensure consistency across API endpoints
import { CuratedProduct } from './curated-catalog'

interface AffiliateProduct extends CuratedProduct {
  performance: {
    clicks: number
    conversions: number
    revenue: number
    conversionRate: number
    lastUpdated: string
  }
  status: 'active' | 'inactive' | 'pending'
  scheduledPromotions: any[]
}

// In-memory cache for affiliate products
let cachedProducts: AffiliateProduct[] = []
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCachedAffiliateProducts(): Promise<AffiliateProduct[]> {
  const now = Date.now()
  
  // Check if cache is still valid
  if (cachedProducts.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedProducts
  }
  
  // Generate new products
  try {
    const { generateUniqueProductsSync } = await import('./enhanced-product-database')
    const { FALLBACK_CURATED_CATALOG } = await import('./curated-catalog')
    
    let products: CuratedProduct[] = []
    
    try {
      // Try to generate unique products
      products = generateUniqueProductsSync(15)
      console.log(`Generated ${products.length} unique products for affiliate cache`)
    } catch (error) {
      console.warn('Failed to generate unique products for cache, using fallback catalog:', error)
      // Fallback to basic catalog
      products = FALLBACK_CURATED_CATALOG
    }
    
    // If no products from either source, use real Amazon catalog
    if (products.length === 0) {
      console.log('No products from enhanced database or fallback, using real Amazon catalog')
      try {
        // Import the real Amazon catalog function from the API route
        const response = await fetch('http://localhost:3002/api/curated-catalog')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.products && data.products.length > 0) {
            products = data.products
            console.log(`Loaded ${products.length} products from real Amazon catalog`)
          }
        }
      } catch (fetchError) {
        console.warn('Failed to fetch from curated catalog API, using static fallback')
        // Use the static real Amazon catalog as final fallback
        products = createStaticRealAmazonCatalog()
      }
    }
    
    // Add performance data and admin-specific fields to each product
    // No mock performance data - use real analytics data
    cachedProducts = products.map((product: CuratedProduct) => ({
      ...product,
      performance: {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: 'active' as const,
      scheduledPromotions: []
    }))
    
    cacheTimestamp = now
    console.log(`Cached ${cachedProducts.length} affiliate products`)
    
  } catch (error) {
    console.error('Error generating affiliate products cache:', error)
    // Return empty array if everything fails
    cachedProducts = []
  }
  
  return cachedProducts
}

export function findCachedProduct(id: string): AffiliateProduct | undefined {
  return cachedProducts.find(p => p.id === id)
}

export function updateCachedProduct(id: string, updates: Partial<AffiliateProduct>): AffiliateProduct | null {
  const index = cachedProducts.findIndex(p => p.id === id)
  if (index === -1) return null
  
  cachedProducts[index] = { ...cachedProducts[index], ...updates, id } // Ensure ID doesn't change
  return cachedProducts[index]
}

export function deleteCachedProduct(id: string): AffiliateProduct | null {
  const index = cachedProducts.findIndex(p => p.id === id)
  if (index === -1) return null
  
  const deletedProduct = cachedProducts[index]
  
  // Check if this is a core Amazon product (prevent deletion of essential products)
  if (deletedProduct.platform === 'amazon' && deletedProduct.id.startsWith('amazon-')) {
    throw new Error('Cannot delete core Amazon products. You can only edit them.')
  }
  
  cachedProducts.splice(index, 1)
  return deletedProduct
}

export function addCachedProduct(product: AffiliateProduct): void {
  cachedProducts.push(product)
}

export function clearCache(): void {
  cachedProducts = []
  cacheTimestamp = 0
}

// Static real Amazon catalog as final fallback
function createStaticRealAmazonCatalog(): CuratedProduct[] {
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG || 'goddesscare0d-20'
  
  const generateAffiliateLink = (asin: string) => {
    return `https://www.amazon.com/dp/${asin}?tag=${associateTag}&linkCode=as2&camp=1789&creative=9325`
  }

  return [
    {
      id: 'amazon-B01MYEZPC8',
      title: 'The Ordinary Hyaluronic Acid 2% + B5',
      description: 'A lightweight serum with multiple types of hyaluronic acid and vitamin B5 that provides multi-depth hydration for plumper, smoother skin.',
      price: 9.90,
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80',
      affiliateUrl: generateAffiliateLink('B01MYEZPC8'),
      category: 'Skincare',
      tags: ['hyaluronic-acid', 'serum', 'hydrating', 'affordable'],
      platform: 'amazon',
      commissionRate: 8,
      brandName: 'The Ordinary',
      rating: 4.3,
      reviewCount: 89420,
      isPopular: true,
      isTrending: true,
      isNewArrival: false,
      suitableFor: ['all-skin-types', 'dehydrated-skin'],
      ingredients: ['Hyaluronic Acid', 'Sodium Hyaluronate'],
      benefits: ['Deep hydration', 'Plumping', 'Smoothing'],
      priceRange: 'budget',
      availability: 'in-stock'
    },
    {
      id: 'amazon-B00SNM5US4',
      title: 'Olaplex No.3 Hair Perfector',
      description: 'A weekly at-home treatment that reduces breakage and visibly strengthens hair, improving its look and feel.',
      price: 30.00,
      imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
      affiliateUrl: generateAffiliateLink('B00SNM5US4'),
      category: 'Hair Care',
      tags: ['olaplex', 'hair-treatment', 'strengthening', 'professional'],
      platform: 'amazon',
      commissionRate: 8,
      brandName: 'Olaplex',
      rating: 4.3,
      reviewCount: 89234,
      isPopular: true,
      isTrending: false,
      isNewArrival: false,
      suitableFor: ['damaged-hair', 'chemically-treated', 'all-hair-types'],
      ingredients: ['Bis-Aminopropyl Diglycol Dimaleate'],
      benefits: ['Strengthening', 'Repair', 'Shine enhancement'],
      priceRange: 'mid-range',
      availability: 'in-stock'
    },
    {
      id: 'amazon-B00TTD9BRC',
      title: 'CeraVe Moisturizing Cream',
      description: 'Daily face and body moisturizer for dry skin with 3 essential ceramides and hyaluronic acid. Developed with dermatologists.',
      price: 18.48,
      imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80',
      affiliateUrl: generateAffiliateLink('B00TTD9BRC'),
      category: 'Skincare',
      tags: ['ceramides', 'moisturizer', 'dermatologist-recommended', 'fragrance-free'],
      platform: 'amazon',
      commissionRate: 8,
      brandName: 'CeraVe',
      rating: 4.6,
      reviewCount: 67891,
      isPopular: true,
      isTrending: false,
      isNewArrival: false,
      suitableFor: ['dry-skin', 'sensitive-skin', 'all-skin-types'],
      ingredients: ['Ceramides', 'Hyaluronic Acid', 'Dimethicone'],
      benefits: ['24-hour hydration', 'Barrier repair', 'Non-comedogenic'],
      priceRange: 'budget',
      availability: 'in-stock'
    },
    {
      id: 'amazon-B07WWC3T9Q',
      title: 'BAIMEI Jade Roller & Gua Sha Set - Rose Quartz',
      description: 'Premium jade roller and gua sha tools for facial massage, reducing puffiness, and promoting circulation with rose quartz stone.',
      price: 16.99,
      imageUrl: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format&q=80',
      affiliateUrl: generateAffiliateLink('B07WWC3T9Q'),
      category: 'Beauty Tools',
      tags: ['gua-sha', 'rose-quartz', 'facial-massage', 'lymphatic-drainage'],
      platform: 'amazon',
      commissionRate: 8,
      brandName: 'BAIMEI',
      rating: 4.2,
      reviewCount: 8934,
      isPopular: true,
      isTrending: true,
      isNewArrival: false,
      suitableFor: ['all-skin-types', 'puffiness', 'tension'],
      benefits: ['Lymphatic drainage', 'Improved circulation', 'Relaxation'],
      priceRange: 'budget',
      availability: 'in-stock'
    },
    {
      id: 'amazon-B00NLR1PX0',
      title: 'Vital Proteins Collagen Peptides',
      description: 'Unflavored collagen powder sourced from grass-fed, pasture-raised bovine. Supports healthy hair, skin, nails and joints.',
      price: 45.00,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80',
      affiliateUrl: generateAffiliateLink('B00NLR1PX0'),
      category: 'Wellness',
      tags: ['collagen', 'peptides', 'grass-fed', 'unflavored'],
      platform: 'amazon',
      commissionRate: 8,
      brandName: 'Vital Proteins',
      rating: 4.4,
      reviewCount: 45672,
      isPopular: true,
      isTrending: false,
      isNewArrival: false,
      suitableFor: ['health-conscious', 'beauty-focused'],
      ingredients: ['Collagen Peptides'],
      benefits: ['Skin elasticity', 'Hair strength', 'Nail health', 'Joint support'],
      priceRange: 'mid-range',
      availability: 'in-stock'
    },
    {
      id: 'amazon-B0048EZNR4',
      title: 'OGX Renewing Argan Oil of Morocco',
      description: 'Cold-pressed argan oil hair treatment that penetrates hair for shine, moisture and strengthening. Perfect for all hair types.',
      price: 8.99,
      imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
      affiliateUrl: generateAffiliateLink('B0048EZNR4'),
      category: 'Hair Care',
      tags: ['argan-oil', 'moroccan', 'cold-pressed', 'multi-purpose'],
      platform: 'amazon',
      commissionRate: 8,
      brandName: 'OGX',
      rating: 4.4,
      reviewCount: 45672,
      isPopular: true,
      isTrending: false,
      isNewArrival: false,
      suitableFor: ['dry-hair', 'damaged-hair', 'frizzy-hair', 'dry-skin'],
      ingredients: ['100% Pure Argan Oil', 'Vitamin E'],
      benefits: ['Deep nourishment', 'Shine enhancement', 'Frizz control', 'Moisturizing'],
      priceRange: 'mid-range',
      availability: 'in-stock'
    },
    {
      id: 'amazon-B0B3ZFBMVF',
      title: 'Neutrogena Hydro Boost Hydrating Face Wash',
      description: 'Fragrance-free hydrating facial cleanser with hyaluronic acid that gently removes makeup while locking in moisture for soft, supple skin.',
      price: 9.47,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&auto=format&q=80',
      affiliateUrl: generateAffiliateLink('B0B3ZFBMVF'),
      category: 'Skincare',
      tags: ['cleanser', 'hyaluronic-acid', 'gentle', 'makeup-remover'],
      platform: 'amazon',
      commissionRate: 8,
      brandName: 'Neutrogena',
      rating: 4.5,
      reviewCount: 23891,
      isPopular: true,
      isTrending: false,
      isNewArrival: false,
      suitableFor: ['all-skin-types', 'sensitive-skin'],
      ingredients: ['Hyaluronic Acid', 'Glycerin'],
      benefits: ['Gentle cleansing', 'Hydrating', 'Makeup removal'],
      priceRange: 'budget',
      availability: 'in-stock'
    },
    {
      id: 'amazon-B07XH54X3Q',
      title: 'Hair Vitamins Gummies - Biotin 5000 mcg',
      description: 'Delicious biotin gummies with 5000mcg biotin plus vitamins E, C, and zinc for healthy hair, skin, and nails.',
      price: 19.82,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80',
      affiliateUrl: generateAffiliateLink('B07XH54X3Q'),
      category: 'Wellness',
      tags: ['biotin', 'gummies', 'hair-growth', 'vitamins'],
      platform: 'amazon',
      commissionRate: 8,
      brandName: 'Vitamins Gummies',
      rating: 4.2,
      reviewCount: 28934,
      isPopular: true,
      isTrending: false,
      isNewArrival: false,
      suitableFor: ['hair-thinning', 'weak-nails', 'beauty-conscious'],
      ingredients: ['Biotin', 'Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
      benefits: ['Hair growth support', 'Nail strengthening', 'Skin health'],
      priceRange: 'budget',
      availability: 'in-stock'
    }
  ]
}

export { type AffiliateProduct }