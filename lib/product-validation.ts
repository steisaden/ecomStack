import { existsSync } from 'fs'
import { join } from 'path'
import { Product } from './types'

export interface ValidationResult {
  isValid: boolean
  hasImage: boolean
  hasValidUrl: boolean
  hasRequiredFields: boolean
  imagePath?: string
  imageUrl?: string
  errors: string[]
}

export interface ValidatedProduct extends Product {
  validation: ValidationResult
  thumbnailUrl: string
}

/**
 * Validate a single product for display in curated section
 */
export async function validateProduct(product: Product): Promise<ValidationResult> {
  const errors: string[] = []
  let hasImage = false
  let hasValidUrl = false
  let hasRequiredFields = false
  let imagePath: string | undefined
  let imageUrl: string | undefined

  // Check required fields
  if (!product.title || !product.description || !product.price) {
    errors.push('Missing required fields (title, description, or price)')
  } else {
    hasRequiredFields = true
  }

  // Check for thumbnail image
  const thumbnailResult = await checkProductThumbnail(product)
  hasImage = thumbnailResult.exists
  imagePath = thumbnailResult.path
  imageUrl = thumbnailResult.url

  if (!hasImage) {
    errors.push('No thumbnail image available')
  }

  // Check affiliate URL if it exists
  if (product.affiliateUrl) {
    const urlResult = await validateAffiliateUrl(product.affiliateUrl)
    hasValidUrl = urlResult.isValid
    
    if (!hasValidUrl) {
      errors.push(`Invalid affiliate URL: ${urlResult.error}`)
    }
  } else if (product.isAffiliate) {
    errors.push('Product marked as affiliate but no affiliate URL provided')
    hasValidUrl = false
  } else {
    // Non-affiliate products don't need URL validation
    hasValidUrl = true
  }

  const isValid = hasRequiredFields && hasImage && hasValidUrl

  return {
    isValid,
    hasImage,
    hasValidUrl,
    hasRequiredFields,
    imagePath,
    imageUrl,
    errors
  }
}

/**
 * Check if product has a thumbnail image available
 */
async function checkProductThumbnail(product: Product): Promise<{
  exists: boolean
  path?: string
  url?: string
}> {
  // Check Contentful images first
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images[0]
    if (primaryImage.url) {
      // Verify the Contentful image is accessible
      try {
        const response = await fetch(primaryImage.url, { method: 'HEAD' })
        if (response.ok) {
          return {
            exists: true,
            url: primaryImage.url
          }
        }
      } catch (error) {
        console.warn(`Contentful image not accessible: ${primaryImage.url}`)
      }
    }
  }

  // Check for local screenshot if it's an affiliate product
  if (product.isAffiliate && product.affiliateUrl) {
    const asin = extractASINFromUrl(product.affiliateUrl)
    if (asin) {
      const screenshotPath = join(process.cwd(), 'public', 'product-images', `${asin}.png`)
      if (existsSync(screenshotPath)) {
        return {
          exists: true,
          path: screenshotPath,
          url: `/product-images/${asin}.png`
        }
      }
    }
  }

  // Check for generic product image based on product ID
  const genericImagePath = join(process.cwd(), 'public', 'product-images', `${product.sys.id}.png`)
  if (existsSync(genericImagePath)) {
    return {
      exists: true,
      path: genericImagePath,
      url: `/product-images/${product.sys.id}.png`
    }
  }

  return { exists: false }
}

/**
 * Validate affiliate URL functionality
 */
async function validateAffiliateUrl(url: string): Promise<{
  isValid: boolean
  error?: string
}> {
  try {
    // Basic URL format validation
    const urlObj = new URL(url)
    
    // Check if it's a valid domain
    if (!urlObj.hostname) {
      return { isValid: false, error: 'Invalid URL format' }
    }

    // For Amazon URLs, check for required affiliate parameters
    if (urlObj.hostname.includes('amazon.')) {
      const hasTag = urlObj.searchParams.has('tag')
      const hasLinkCode = urlObj.searchParams.has('linkCode')
      
      if (!hasTag) {
        return { isValid: false, error: 'Missing affiliate tag parameter' }
      }
      
      if (!hasLinkCode) {
        return { isValid: false, error: 'Missing linkCode parameter' }
      }

      // Verify the tag matches the expected associate tag
      const expectedTag = process.env.AMAZON_ASSOCIATE_TAG
      if (expectedTag && urlObj.searchParams.get('tag') !== expectedTag) {
        return { isValid: false, error: 'Affiliate tag does not match expected associate tag' }
      }
    }

    // For production, you might want to make an actual HTTP request to verify the URL
    // For now, we'll just validate the format
    return { isValid: true }

  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

/**
 * Extract ASIN from Amazon URL
 */
function extractASINFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/dp\/([A-Z0-9]{10})/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

/**
 * Validate multiple products and return only valid ones
 */
export async function validateProducts(products: Product[]): Promise<ValidatedProduct[]> {
  const validatedProducts: ValidatedProduct[] = []

  for (const product of products) {
    try {
      const validation = await validateProduct(product)
      
      // Only include products that pass validation
      if (validation.isValid) {
        const thumbnailUrl = validation.imageUrl || 
                           (product.images?.[0]?.url) || 
                           '/images/placeholder-product.jpg'

        validatedProducts.push({
          ...product,
          validation,
          thumbnailUrl
        })
      } else {
        console.log(`Product ${product.title} failed validation:`, validation.errors)
      }
    } catch (error) {
      console.error(`Error validating product ${product.title}:`, error)
    }
  }

  return validatedProducts
}

/**
 * Get validation summary for admin dashboard
 */
export async function getValidationSummary(products: Product[]): Promise<{
  total: number
  valid: number
  invalid: number
  missingImages: number
  invalidUrls: number
  missingFields: number
  validationRate: number
}> {
  let valid = 0
  let missingImages = 0
  let invalidUrls = 0
  let missingFields = 0

  for (const product of products) {
    const validation = await validateProduct(product)
    
    if (validation.isValid) {
      valid++
    }
    
    if (!validation.hasImage) {
      missingImages++
    }
    
    if (!validation.hasValidUrl) {
      invalidUrls++
    }
    
    if (!validation.hasRequiredFields) {
      missingFields++
    }
  }

  const total = products.length
  const invalid = total - valid
  const validationRate = total > 0 ? (valid / total) * 100 : 0

  return {
    total,
    valid,
    invalid,
    missingImages,
    invalidUrls,
    missingFields,
    validationRate: Math.round(validationRate * 100) / 100
  }
}