import { getProducts } from './contentful'
import { getCachedAffiliateProducts } from './affiliate-products'
import { validateProducts, type ValidatedProduct } from './product-validation'
import { Product, AffiliateProduct } from './types'
import { unstable_cache } from 'next/cache'

// Create real Amazon products as fallback when no affiliate products exist
function createRealAmazonFallback() {
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG || 'goddesscare0d-20'

  const generateAffiliateLink = (asin: string) => {
    return `https://www.amazon.com/dp/${asin}?tag=${associateTag}&linkCode=as2&camp=1789&creative=9325`
  }

  const realProducts = [
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
      availability: 'in-stock',
      performance: {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: 'active' as const,
      scheduledPromotions: []
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
      availability: 'in-stock',
      performance: {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: 'active' as const,
      scheduledPromotions: []
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
      availability: 'in-stock',
      performance: {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: 'active' as const,
      scheduledPromotions: []
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
      ingredients: [],
      benefits: ['Lymphatic drainage', 'Improved circulation', 'Relaxation'],
      priceRange: 'budget',
      availability: 'in-stock',
      performance: {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: 'active' as const,
      scheduledPromotions: []
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
      availability: 'in-stock',
      performance: {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString()
      },
      status: 'active' as const,
      scheduledPromotions: []
    }
  ]

  return realProducts
}

// Transform validated affiliate product to match Product interface
function transformValidatedAffiliateToProduct(validatedProduct: ValidatedProduct): Product {
  return {
    sys: { id: validatedProduct.sys.id },
    title: validatedProduct.title,
    description: validatedProduct.description,
    price: validatedProduct.price,
    images: validatedProduct.thumbnailUrl ? [{
      url: validatedProduct.thumbnailUrl,
      title: validatedProduct.title,
      description: `Image for ${validatedProduct.title}`,
      width: 400,
      height: 400,
      contentType: 'image/jpeg'
    }] : validatedProduct.images || [],
    category: validatedProduct.category,
    inStock: validatedProduct.inStock,
    isAffiliate: validatedProduct.isAffiliate,
    affiliateUrl: validatedProduct.affiliateUrl,
    slug: validatedProduct.slug
  }
}

// Transform regular product to include validation info
function transformRegularProduct(product: Product): Product {
  return {
    ...product,
    // Regular products are considered "validated" by default
    // since they come from Contentful and are curated
  }
}

// Get all products (regular + affiliate products)
export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    try {
      console.log('Fetching unified products (regular + affiliate)...')

      // Fetch regular products from Contentful
      const regularProducts = await getProducts()
      console.log(`Found ${regularProducts.length} regular products`)

      // Fetch affiliate products
      const affiliateProducts = await getCachedAffiliateProducts()
      console.log(`Found ${affiliateProducts.length} affiliate products`)

      // Validate regular products to ensure they have proper images and data
      const validatedRegularProducts = await validateProducts(regularProducts)
      console.log(`${validatedRegularProducts.length} regular products passed validation`)

      // Transform validated regular products
      const transformedRegularProducts = validatedRegularProducts.map(vp => ({
        ...vp,
        // Ensure regular products have proper image URLs
        images: vp.images && vp.images.length > 0 ? vp.images :
          vp.thumbnailUrl ? [{
            url: vp.thumbnailUrl,
            title: vp.title,
            description: `Image for ${vp.title}`,
            width: 400,
            height: 400,
            contentType: 'image/jpeg'
          }] : []
      }))

      // Transform affiliate products to Product format
      const transformedAffiliateProducts = affiliateProducts.map(ap => ({
        sys: { id: ap.id },
        title: ap.title,
        description: ap.description,
        price: typeof ap.price === 'number' ? ap.price : (ap.price?.amount || 0),
        images: ap.imageUrl ? [{
          url: ap.imageUrl,
          title: ap.title,
          description: `Image for ${ap.title}`,
          width: 400,
          height: 400,
          contentType: 'image/jpeg'
        }] : [],
        category: { name: ap.category || 'Uncategorized', slug: ap.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized' },
        inStock: ap.status === 'active',
        isAffiliate: true,
        affiliateUrl: ap.affiliateUrl,
        slug: ap.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }))

      // Combine and sort all products
      const allProducts = [...transformedRegularProducts, ...transformedAffiliateProducts]
        .sort((a, b) => a.title.localeCompare(b.title))

      console.log(`Total unified products: ${allProducts.length} (${transformedRegularProducts.length} regular, ${transformedAffiliateProducts.length} affiliate)`)
      return allProducts

    } catch (error) {
      console.error('Error fetching unified products:', error)
      // Fallback to regular products only
      try {
        const regularProducts = await getProducts()
        console.log(`Fallback: returning ${regularProducts.length} regular products only`)
        return regularProducts
      } catch (fallbackError) {
        console.error('Error fetching fallback products:', fallbackError)
        return []
      }
    }
  },
  ['unified-products'],
  {
    revalidate: 600, // 10 minutes (shorter cache for better validation updates)
    tags: ['products', 'unified-products', 'validated-products']
  }
)

// Get products by category (regular products only)
export const getProductsByCategory = unstable_cache(
  async (categorySlug: string): Promise<Product[]> => {
    try {
      const allProducts = await getAllProducts()
      return allProducts.filter(product =>
        product.category?.slug === categorySlug
      )
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  },
  ['products-by-category'],
  {
    revalidate: 900,
    tags: ['products', 'categories']
  }
)

// Get a single product by slug (regular products only)
export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const allProducts = await getAllProducts()
      return allProducts.find(product => product.slug === slug) || null
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      return null
    }
  },
  ['product-by-slug'],
  {
    revalidate: 900,
    tags: ['products']
  }
)

// Get featured products (regular only)
export const getFeaturedProducts = unstable_cache(
  async (limit: number = 6): Promise<Product[]> => {
    try {
      const allProducts = await getAllProducts()

      // Only include regular products in featured products
      const regularProducts = allProducts.filter(p => !p.isAffiliate && p.inStock)

      const featured = regularProducts
        .slice(0, limit)

      return featured
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  },
  ['featured-products'],
  {
    revalidate: 1800, // 30 minutes
    tags: ['products', 'featured']
  }
)

// Search products (regular products only)
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const allProducts = await getAllProducts()
    const searchTerm = query.toLowerCase().trim()

    if (!searchTerm) return allProducts

    return allProducts.filter(product =>
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category?.name.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

// Get product statistics
export const getProductStats = unstable_cache(
  async () => {
    try {
      const allProducts = await getAllProducts()

      const stats = {
        total: allProducts.length,
        regular: allProducts.filter(p => !p.isAffiliate).length,
        affiliate: allProducts.filter(p => p.isAffiliate).length,
        inStock: allProducts.filter(p => p.inStock).length,
        outOfStock: allProducts.filter(p => !p.inStock).length,
        categories: Array.from(new Set(
          allProducts
            .map(p => p.category?.name)
            .filter(Boolean)
        )).length
      }

      return stats
    } catch (error) {
      console.error('Error fetching product stats:', error)
      return {
        total: 0,
        regular: 0,
        affiliate: 0,
        inStock: 0,
        outOfStock: 0,
        categories: 0
      }
    }
  },
  ['product-stats'],
  {
    revalidate: 1800,
    tags: ['products', 'stats']
  }
)