/**
 * Amazon Product Image Helper
 * 
 * This module provides utilities for fetching and displaying Amazon product images
 * in a way that respects Amazon's terms of service and provides fallback options.
 */

export interface AmazonImageOptions {
  asin: string;
  size?: 'small' | 'medium' | 'large';
  fallbackUrl?: string;
}

/**
 * Generate Amazon product image URL using their standard format
 * Note: These URLs may not always work due to Amazon's image protection
 */
export function generateAmazonImageUrl(asin: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizeMap = {
    small: '_SL160_',
    medium: '_SL300_',
    large: '_SL500_'
  };
  
  // Amazon's standard image URL format (may not always work)
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.${sizeMap[size]}.jpg`;
}

/**
 * Get product image with enhanced fallback options and variety
 */
export function getProductImageUrl(options: AmazonImageOptions): string {
  const { asin, size = 'medium', fallbackUrl } = options;
  
  // Try Amazon image first (may work for some products)
  const amazonUrl = generateAmazonImageUrl(asin, size);
  
  // Use fallback URL if provided (from rotation system)
  if (fallbackUrl) {
    return optimizeImageUrl(fallbackUrl);
  }
  
  // Return an enhanced placeholder that matches the product category
  return getEnhancedProductPlaceholder(asin);
}

/**
 * Enhanced placeholder system with more variety and better categorization
 */
function getEnhancedProductPlaceholder(asin: string): string {
  // Enhanced mapping with multiple images per category for variety
  const enhancedPlaceholderMap: Record<string, string[]> = {
    // Skincare serums and treatments
    'B01MYEZPC8': [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    'B07TGZL7VG': [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    'B08KGXQZPX': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    
    // Hair care products
    'B00SNM5US4': [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    'B0048EZNR4': [
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    
    // Moisturizers and creams
    'B00TTD9BRC': [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    'B0B3ZFBMVF': [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    
    // Beauty tools
    'B07WWC3T9Q': [
      'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    'B08XQJZX9P': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    
    // Supplements and wellness
    'B00NLR1PX0': [
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    'B07XH54X3Q': [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&auto=format&q=80'
    ]
  };
  
  const images = enhancedPlaceholderMap[asin];
  if (images && images.length > 0) {
    // Use time-based selection for consistent but rotating images
    const index = Math.floor(Date.now() / (1000 * 60 * 60 * 6)) % images.length; // Change every 6 hours
    return optimizeImageUrl(images[index]);
  }
  
  // Fallback to category-based placeholder
  return getCategoryPlaceholder(asin);
}

/**
 * Category-based placeholder selection
 */
function getCategoryPlaceholder(asin: string): string {
  // Determine category from ASIN patterns or use generic beauty image
  const categoryImages = {
    skincare: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    haircare: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    tools: [
      'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80'
    ],
    wellness: [
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80'
    ]
  };
  
  // Simple category detection based on ASIN or use random selection
  const allImages = Object.values(categoryImages).flat();
  const index = Math.floor(Date.now() / (1000 * 60 * 60 * 12)) % allImages.length; // Change every 12 hours
  
  return optimizeImageUrl(allImages[index]);
}

/**
 * Try to fetch real Amazon product images using various methods
 */
export async function tryFetchRealAmazonImage(asin: string, size: 'small' | 'medium' | 'large' = 'medium'): Promise<string | null> {
  // Method 1: Try standard Amazon image URL
  const standardUrl = generateAmazonImageUrl(asin, size);
  
  try {
    const response = await fetch(standardUrl, { method: 'HEAD' });
    if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
      return standardUrl;
    }
  } catch (error) {
    // Silently fail and try next method
  }
  
  // Method 2: Try alternative Amazon image formats
  const alternativeFormats = [
    `https://m.media-amazon.com/images/I/${asin}.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX300_SY300_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._AC_SL1500_.jpg`
  ];
  
  for (const url of alternativeFormats) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        return url;
      }
    } catch (error) {
      // Continue to next format
    }
  }
  
  return null;
}

/**
 * Enhanced image fetching with real Amazon image attempts
 */
export async function getEnhancedProductImageUrl(options: AmazonImageOptions): Promise<string> {
  const { asin, size = 'medium', fallbackUrl } = options;
  
  // Try to get real Amazon image first
  const realImage = await tryFetchRealAmazonImage(asin, size);
  if (realImage) {
    return realImage;
  }
  
  // Fall back to standard method
  return getProductImageUrl(options);
}

/**
 * Future enhancement: Fetch real Amazon images via API
 * This would require Amazon Product Advertising API setup
 */
export async function fetchAmazonProductImage(asin: string): Promise<string | null> {
  // TODO: Implement Amazon Product Advertising API integration
  // This would require:
  // 1. Amazon Associates account with API access
  // 2. AWS credentials
  // 3. Product Advertising API SDK
  
  return null;
}

/**
 * Image optimization for better performance
 */
export function optimizeImageUrl(url: string, width: number = 400, height: number = 400): string {
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&h=${height}&fit=crop&auto=format&q=80`;
  }
  
  return url;
}