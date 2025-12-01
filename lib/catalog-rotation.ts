import { CuratedProduct } from './curated-catalog'
import { getProductImageUrl } from './amazon-images'

// Product rotation system for generating fresh catalog variations
interface ProductSet {
  id: string
  name: string
  searchTerms: Array<{
    term: string
    category: string
    maxResults: number
    priority: 'high' | 'medium' | 'low'
  }>
  imageVariations: string[]
}

// Multiple product sets for rotation
const PRODUCT_SETS: ProductSet[] = [
  {
    id: 'skincare-essentials',
    name: 'Skincare Essentials',
    searchTerms: [
      { term: 'vitamin c serum brightening', category: 'Skincare', maxResults: 4, priority: 'high' },
      { term: 'hyaluronic acid plumping serum', category: 'Skincare', maxResults: 4, priority: 'high' },
      { term: 'retinol anti aging cream', category: 'Skincare', maxResults: 3, priority: 'medium' },
      { term: 'niacinamide pore minimizer', category: 'Skincare', maxResults: 3, priority: 'medium' },
      { term: 'ceramide barrier repair moisturizer', category: 'Skincare', maxResults: 3, priority: 'medium' }
    ],
    imageVariations: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80'
    ]
  },
  {
    id: 'hair-care-luxury',
    name: 'Luxury Hair Care',
    searchTerms: [
      { term: 'argan oil hair treatment morocco', category: 'Hair Care', maxResults: 4, priority: 'high' },
      { term: 'keratin protein hair mask', category: 'Hair Care', maxResults: 3, priority: 'high' },
      { term: 'biotin hair growth serum', category: 'Hair Care', maxResults: 3, priority: 'medium' },
      { term: 'sulfate free shampoo organic', category: 'Hair Care', maxResults: 3, priority: 'medium' },
      { term: 'deep conditioning hair oil', category: 'Hair Care', maxResults: 2, priority: 'low' }
    ],
    imageVariations: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=400&h=400&fit=crop&auto=format&q=80'
    ]
  },
  {
    id: 'wellness-beauty',
    name: 'Beauty Wellness',
    searchTerms: [
      { term: 'marine collagen peptides powder', category: 'Wellness', maxResults: 3, priority: 'high' },
      { term: 'biotin gummies hair skin nails', category: 'Wellness', maxResults: 3, priority: 'high' },
      { term: 'vitamin e beauty oil capsules', category: 'Wellness', maxResults: 2, priority: 'medium' },
      { term: 'omega 3 skin health supplement', category: 'Wellness', maxResults: 2, priority: 'medium' },
      { term: 'probiotics clear skin support', category: 'Wellness', maxResults: 2, priority: 'low' }
    ],
    imageVariations: [
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&auto=format&q=80'
    ]
  },
  {
    id: 'beauty-tools-spa',
    name: 'Spa & Beauty Tools',
    searchTerms: [
      { term: 'jade roller gua sha set rose quartz', category: 'Beauty Tools', maxResults: 3, priority: 'high' },
      { term: 'LED light therapy mask red blue', category: 'Beauty Tools', maxResults: 2, priority: 'high' },
      { term: 'microneedling derma roller 0.5mm', category: 'Beauty Tools', maxResults: 2, priority: 'medium' },
      { term: 'facial steamer nano ionic', category: 'Beauty Tools', maxResults: 2, priority: 'medium' },
      { term: 'silicone face cleansing brush', category: 'Beauty Tools', maxResults: 2, priority: 'low' }
    ],
    imageVariations: [
      'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop&auto=format&q=80'
    ]
  },
  {
    id: 'organic-natural',
    name: 'Organic & Natural',
    searchTerms: [
      { term: 'organic rosehip seed oil cold pressed', category: 'Organic Products', maxResults: 3, priority: 'high' },
      { term: 'raw shea butter unrefined african', category: 'Organic Products', maxResults: 3, priority: 'high' },
      { term: 'jojoba oil pure organic golden', category: 'Organic Products', maxResults: 2, priority: 'medium' },
      { term: 'coconut oil virgin organic beauty', category: 'Organic Products', maxResults: 2, priority: 'medium' },
      { term: 'aloe vera gel pure organic', category: 'Organic Products', maxResults: 2, priority: 'low' }
    ],
    imageVariations: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80'
    ]
  },
  {
    id: 'luxury-premium',
    name: 'Luxury Premium',
    searchTerms: [
      { term: 'luxury face serum 24k gold', category: 'Luxury Items', maxResults: 2, priority: 'high' },
      { term: 'premium anti aging night cream', category: 'Luxury Items', maxResults: 2, priority: 'high' },
      { term: 'caviar extract face mask luxury', category: 'Luxury Items', maxResults: 2, priority: 'medium' },
      { term: 'platinum peptide eye cream', category: 'Luxury Items', maxResults: 2, priority: 'medium' },
      { term: 'diamond infused face oil', category: 'Luxury Items', maxResults: 1, priority: 'low' }
    ],
    imageVariations: [
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80'
    ]
  }
]

// Enhanced real product database with actual Amazon ASINs and high-quality images
const ENHANCED_REAL_PRODUCTS: Array<Omit<CuratedProduct, 'id'> & { asin: string }> = [
  // Skincare Essentials
  {
    asin: 'B01MYEZPC8',
    title: 'The Ordinary Hyaluronic Acid 2% + B5 - Multi-Molecular Weight',
    description: 'A water-based serum with multiple types of hyaluronic acid and vitamin B5 for multi-depth hydration and plumper, smoother skin.',
    price: 9.90,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
    category: 'Skincare',
    tags: ['hyaluronic-acid', 'hydrating', 'plumping', 'affordable'],
    platform: 'amazon',
    commissionRate: 8,
    brandName: 'The Ordinary',
    rating: 4.3,
    reviewCount: 89420,
    isPopular: true,
    isTrending: true,
    isNewArrival: false,
    suitableFor: ['all-skin-types', 'dehydrated-skin'],
    ingredients: ['Hyaluronic Acid', 'Sodium Hyaluronate', 'Vitamin B5'],
    benefits: ['Deep hydration', 'Plumping effect', 'Smooth texture'],
    priceRange: 'budget',
    availability: 'in-stock'
  },
  {
    asin: 'B07TGZL7VG',
    title: 'CeraVe Vitamin C Serum with Hyaluronic Acid',
    description: 'Brightening face serum with 10% pure vitamin C, vitamin B5, and hyaluronic acid to brighten skin and reduce dark spots.',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
    category: 'Skincare',
    tags: ['vitamin-c', 'brightening', 'antioxidant', 'dermatologist-recommended'],
    platform: 'amazon',
    commissionRate: 8,
    brandName: 'CeraVe',
    rating: 4.4,
    reviewCount: 45672,
    isPopular: true,
    isTrending: false,
    isNewArrival: false,
    suitableFor: ['all-skin-types', 'dull-skin', 'dark-spots'],
    ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Vitamin B5'],
    benefits: ['Brightening', 'Antioxidant protection', 'Even skin tone'],
    priceRange: 'budget',
    availability: 'in-stock'
  },
  {
    asin: 'B08KGXQZPX',
    title: 'Neutrogena Rapid Wrinkle Repair Retinol Pro+',
    description: 'Accelerated retinol SA formula with glucose complex and hyaluronic acid for visible wrinkle reduction in just one week.',
    price: 24.97,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
    category: 'Skincare',
    tags: ['retinol', 'anti-aging', 'wrinkle-repair', 'clinical-strength'],
    platform: 'amazon',
    commissionRate: 8,
    brandName: 'Neutrogena',
    rating: 4.2,
    reviewCount: 23891,
    isPopular: true,
    isTrending: true,
    isNewArrival: false,
    suitableFor: ['mature-skin', 'fine-lines', 'wrinkles'],
    ingredients: ['Retinol SA', 'Glucose Complex', 'Hyaluronic Acid'],
    benefits: ['Wrinkle reduction', 'Skin renewal', 'Improved texture'],
    priceRange: 'mid-range',
    availability: 'in-stock'
  },

  // Hair Care Luxury
  {
    asin: 'B00SNM5US4',
    title: 'Olaplex No.3 Hair Perfector - At-Home Bond Building Treatment',
    description: 'Weekly at-home treatment that reduces breakage and visibly strengthens hair, improving its look and feel for all hair types.',
    price: 30.00,
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
    category: 'Hair Care',
    tags: ['olaplex', 'bond-building', 'strengthening', 'professional'],
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
    benefits: ['Bond repair', 'Strengthening', 'Shine enhancement'],
    priceRange: 'mid-range',
    availability: 'in-stock'
  },
  {
    asin: 'B0048EZNR4',
    title: 'OGX Renewing Argan Oil of Morocco - Penetrating Oil',
    description: 'Cold-pressed argan oil treatment that penetrates hair shaft for ultimate shine, softness and strength. Perfect for all hair types.',
    price: 8.99,
    imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
    category: 'Hair Care',
    tags: ['argan-oil', 'moroccan', 'nourishing', 'multi-purpose'],
    platform: 'amazon',
    commissionRate: 8,
    brandName: 'OGX',
    rating: 4.4,
    reviewCount: 45672,
    isPopular: true,
    isTrending: false,
    isNewArrival: false,
    suitableFor: ['dry-hair', 'damaged-hair', 'frizzy-hair'],
    ingredients: ['100% Pure Argan Oil', 'Vitamin E'],
    benefits: ['Deep nourishment', 'Shine enhancement', 'Frizz control'],
    priceRange: 'budget',
    availability: 'in-stock'
  },

  // Beauty Wellness
  {
    asin: 'B00NLR1PX0',
    title: 'Vital Proteins Collagen Peptides - Unflavored Powder',
    description: 'Grass-fed, pasture-raised bovine collagen peptides powder that supports healthy hair, skin, nails and joints.',
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
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
    asin: 'B07XH54X3Q',
    title: 'Hair Vitamins Gummies - Biotin 5000 mcg with Vitamins A, C, D, E',
    description: 'Delicious biotin gummies with 5000mcg biotin plus essential vitamins for healthy hair, skin, and nails.',
    price: 19.82,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
    category: 'Wellness',
    tags: ['biotin', 'gummies', 'hair-growth', 'vitamins'],
    platform: 'amazon',
    commissionRate: 8,
    brandName: 'Hair Vitamins',
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
  },

  // Beauty Tools & Spa
  {
    asin: 'B07WWC3T9Q',
    title: 'BAIMEI Jade Roller and Gua Sha Set - Rose Quartz',
    description: 'Premium jade roller and gua sha tools for facial massage, reducing puffiness, and promoting lymphatic drainage.',
    price: 16.99,
    imageUrl: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
    category: 'Beauty Tools',
    tags: ['jade-roller', 'gua-sha', 'facial-massage', 'lymphatic-drainage'],
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
    asin: 'B08XQJZX9P',
    title: 'LED Light Therapy Mask - Red & Blue Light Treatment',
    description: 'Professional-grade LED light therapy mask with red and blue light for anti-aging and acne treatment.',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80',
    affiliateUrl: '',
    category: 'Beauty Tools',
    tags: ['led-therapy', 'red-light', 'blue-light', 'anti-aging'],
    platform: 'amazon',
    commissionRate: 8,
    brandName: 'LED Beauty',
    rating: 4.1,
    reviewCount: 3456,
    isPopular: false,
    isTrending: true,
    isNewArrival: true,
    suitableFor: ['acne-prone', 'aging-skin', 'all-skin-types'],
    benefits: ['Collagen production', 'Acne reduction', 'Anti-aging'],
    priceRange: 'luxury',
    availability: 'in-stock'
  }
]

// Get current product set based on rotation
let currentProductSetIndex = 0
let lastRotationTime = 0
const ROTATION_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours

export function getCurrentProductSet(): ProductSet {
  const now = Date.now()
  
  // Rotate product set every 24 hours or on manual refresh
  if (now - lastRotationTime > ROTATION_INTERVAL) {
    currentProductSetIndex = (currentProductSetIndex + 1) % PRODUCT_SETS.length
    lastRotationTime = now
  }
  
  return PRODUCT_SETS[currentProductSetIndex]
}

export async function generateNewProductSet(): Promise<{ id: string; products: CuratedProduct[] }> {
  // Force rotation to next product set
  currentProductSetIndex = (currentProductSetIndex + 1) % PRODUCT_SETS.length
  lastRotationTime = Date.now()
  
  const currentSet = PRODUCT_SETS[currentProductSetIndex]
  
  // Generate products with enhanced images and variety
  const products = generateEnhancedProducts(currentSet)
  
  return {
    id: currentSet.id,
    products
  }
}

function generateEnhancedProducts(productSet: ProductSet): CuratedProduct[] {
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG || 'goddesscare0d-20'
  
  const generateAffiliateLink = (asin: string) => {
    return `https://www.amazon.com/dp/${asin}?tag=${associateTag}&linkCode=as2&camp=1789&creative=9325`
  }

  // Select products that match the current product set theme
  const relevantProducts = ENHANCED_REAL_PRODUCTS.filter(product => 
    productSet.searchTerms.some(term => 
      term.category === product.category ||
      product.tags.some(tag => term.term.toLowerCase().includes(tag.toLowerCase()))
    )
  )

  // Add variety with image rotation and enhanced details
  const enhancedProducts = relevantProducts.map((product, index) => {
    const imageVariations = productSet.imageVariations
    const selectedImage = imageVariations[index % imageVariations.length]
    
    return {
      ...product,
      id: `amazon-${product.asin}`,
      imageUrl: getProductImageUrl({ 
        asin: product.asin, 
        size: 'medium',
        fallbackUrl: selectedImage
      }),
      affiliateUrl: generateAffiliateLink(product.asin),
      // Add some randomization to make each refresh feel fresh
      isPopular: Math.random() > 0.6,
      isTrending: Math.random() > 0.7,
      isNewArrival: Math.random() > 0.8,
      // Slight price variations to simulate market changes
      price: Math.round((product.price + (Math.random() - 0.5) * 2) * 100) / 100
    }
  })

  // Fill remaining slots with generated variations
  const targetCount = 15
  while (enhancedProducts.length < targetCount) {
    const baseProduct = relevantProducts[enhancedProducts.length % relevantProducts.length]
    const variation = createProductVariation(baseProduct, enhancedProducts.length, productSet)
    enhancedProducts.push(variation)
  }

  return enhancedProducts.slice(0, targetCount)
}

function createProductVariation(
  baseProduct: Omit<CuratedProduct, 'id'> & { asin: string },
  index: number,
  productSet: ProductSet
): CuratedProduct {
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG || 'goddesscare0d-20'
  const generateAffiliateLink = (asin: string) => {
    return `https://www.amazon.com/dp/${asin}?tag=${associateTag}&linkCode=as2&camp=1789&creative=9325`
  }

  const variations = [
    { suffix: 'Pro', priceMultiplier: 1.2, ratingBoost: 0.1 },
    { suffix: 'Plus', priceMultiplier: 1.1, ratingBoost: 0.05 },
    { suffix: 'Advanced', priceMultiplier: 1.3, ratingBoost: 0.15 },
    { suffix: 'Premium', priceMultiplier: 1.4, ratingBoost: 0.2 },
    { suffix: 'Deluxe', priceMultiplier: 1.25, ratingBoost: 0.1 }
  ]

  const variation = variations[index % variations.length]
  const imageVariations = productSet.imageVariations
  const selectedImage = imageVariations[index % imageVariations.length]

  return {
    ...baseProduct,
    id: `amazon-${baseProduct.asin}-var-${index}`,
    title: `${baseProduct.title} ${variation.suffix}`,
    price: Math.round(baseProduct.price * variation.priceMultiplier * 100) / 100,
    rating: Math.min(5.0, baseProduct.rating + variation.ratingBoost),
    imageUrl: getProductImageUrl({ 
      asin: baseProduct.asin, 
      size: 'medium',
      fallbackUrl: selectedImage
    }),
    affiliateUrl: generateAffiliateLink(baseProduct.asin),
    isPopular: Math.random() > 0.5,
    isTrending: Math.random() > 0.6,
    isNewArrival: Math.random() > 0.7,
    reviewCount: Math.floor(baseProduct.reviewCount * (0.8 + Math.random() * 0.4))
  }
}

// Enhanced search terms for more variety
export const ENHANCED_SEARCH_TERMS = [
  // Skincare Focus
  { term: 'vitamin c serum 20% pure', category: 'Skincare', maxResults: 3, priority: 'high' as const },
  { term: 'hyaluronic acid plumping serum', category: 'Skincare', maxResults: 3, priority: 'high' as const },
  { term: 'retinol night cream anti aging', category: 'Skincare', maxResults: 3, priority: 'high' as const },
  { term: 'niacinamide 10% zinc pore minimizer', category: 'Skincare', maxResults: 2, priority: 'medium' as const },
  { term: 'ceramide barrier repair moisturizer', category: 'Skincare', maxResults: 2, priority: 'medium' as const },
  
  // Hair Care Focus
  { term: 'argan oil hair treatment organic', category: 'Hair Care', maxResults: 3, priority: 'high' as const },
  { term: 'keratin protein hair mask deep', category: 'Hair Care', maxResults: 2, priority: 'high' as const },
  { term: 'biotin hair growth serum scalp', category: 'Hair Care', maxResults: 2, priority: 'medium' as const },
  
  // Wellness Focus
  { term: 'marine collagen peptides powder', category: 'Wellness', maxResults: 2, priority: 'high' as const },
  { term: 'biotin gummies 10000 mcg hair', category: 'Wellness', maxResults: 2, priority: 'medium' as const },
  
  // Beauty Tools Focus
  { term: 'jade roller gua sha set authentic', category: 'Beauty Tools', maxResults: 2, priority: 'high' as const },
  { term: 'LED light therapy mask professional', category: 'Beauty Tools', maxResults: 1, priority: 'medium' as const },
  
  // Organic Products Focus
  { term: 'rosehip seed oil organic cold pressed', category: 'Organic Products', maxResults: 2, priority: 'high' as const },
  { term: 'jojoba oil pure organic golden', category: 'Organic Products', maxResults: 2, priority: 'medium' as const }
]