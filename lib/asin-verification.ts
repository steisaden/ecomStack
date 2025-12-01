import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { scrapeAmazonProduct } from './amazon-scraper'

export interface ASINVerificationResult {
  asin: string
  isValid: boolean
  productExists: boolean
  title?: string
  price?: number
  imageUrl?: string
  thumbnailSaved?: boolean
  localImagePath?: string
  error?: string
}

export interface ProductValidationResult {
  asin: string
  valid: boolean
  title: string
  price: number
  brand: string
  category: string
  imageUrl: string
  thumbnailPath: string
  affiliateUrl: string
  lastVerified: string
}

// Directory for storing Amazon product thumbnails
const THUMBNAILS_DIR = join(process.cwd(), 'public', 'amazon-thumbnails')

// Ensure thumbnails directory exists
if (!existsSync(THUMBNAILS_DIR)) {
  mkdirSync(THUMBNAILS_DIR, { recursive: true })
}

/**
 * Verify ASIN and capture product information from Amazon
 */
export async function verifyASINAndCaptureInfo(asin: string): Promise<ASINVerificationResult> {
  try {
    console.log(`Verifying ASIN: ${asin}`)
    
    // Basic ASIN format validation
    if (!isValidASINFormat(asin)) {
      return {
        asin,
        isValid: false,
        productExists: false,
        error: 'Invalid ASIN format'
      }
    }
    
    // Check if product exists on Amazon and capture info
    const productInfo = await checkAmazonProduct(asin)
    
    if (!productInfo.exists) {
      return {
        asin,
        isValid: false,
        productExists: false,
        error: 'Product not found on Amazon'
      }
    }
    
    // Save thumbnail image if available
    let thumbnailSaved = false
    let localImagePath: string | undefined
    
    if (productInfo.imageUrl) {
      const thumbnailResult = await saveProductThumbnail(asin, productInfo.imageUrl)
      thumbnailSaved = thumbnailResult.success
      localImagePath = thumbnailResult.localPath
    }
    
    return {
      asin,
      isValid: true,
      productExists: true,
      title: productInfo.title,
      price: productInfo.price,
      imageUrl: productInfo.imageUrl,
      thumbnailSaved,
      localImagePath
    }
    
  } catch (error: any) {
    console.error(`Error verifying ASIN ${asin}:`, error)
    return {
      asin,
      isValid: false,
      productExists: false,
      error: error.message
    }
  }
}

/**
 * Validate ASIN format
 */
function isValidASINFormat(asin: string): boolean {
  return /^[A-Z0-9]{10}$/.test(asin)
}

/**
 * Check if product exists on Amazon and get basic info
 */
async function checkAmazonProduct(asin: string): Promise<{
  exists: boolean
  title?: string
  price?: number
  imageUrl?: string
}> {
  try {
    // Use Amazon scraper to get product information
    const productInfo = await scrapeAmazonProduct(asin)
    
    return {
      exists: productInfo.exists,
      title: productInfo.title,
      price: productInfo.price,
      imageUrl: productInfo.imageUrl
    }
    
  } catch (error) {
    console.error(`Error checking Amazon product ${asin}:`, error)
    return { exists: false }
  }
}



/**
 * Save Amazon product thumbnail locally
 */
async function saveProductThumbnail(asin: string, imageUrl: string): Promise<{
  success: boolean
  localPath?: string
  error?: string
}> {
  try {
    const filename = `${asin}.jpg`
    const filepath = join(THUMBNAILS_DIR, filename)
    const localPath = `/amazon-thumbnails/${filename}`
    
    // Check if thumbnail already exists
    if (existsSync(filepath)) {
      return {
        success: true,
        localPath
      }
    }
    
    console.log(`Downloading thumbnail for ${asin} from: ${imageUrl}`)
    
    // Download image from Amazon
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    
    // Save to local file system
    writeFileSync(filepath, Buffer.from(imageBuffer))
    
    console.log(`Thumbnail saved for ${asin}: ${filepath}`)
    
    return {
      success: true,
      localPath
    }
    
  } catch (error: any) {
    console.error(`Error saving thumbnail for ${asin}:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Batch verify multiple ASINs
 */
export async function batchVerifyASINs(asins: string[]): Promise<ASINVerificationResult[]> {
  console.log(`Batch verifying ${asins.length} ASINs...`)
  
  const results: ASINVerificationResult[] = []
  
  // Process ASINs in batches to avoid overwhelming Amazon
  const batchSize = 3
  for (let i = 0; i < asins.length; i += batchSize) {
    const batch = asins.slice(i, i + batchSize)
    
    const batchResults = await Promise.all(
      batch.map(asin => verifyASINAndCaptureInfo(asin))
    )
    
    results.push(...batchResults)
    
    // Small delay between batches
    if (i + batchSize < asins.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  const validCount = results.filter(r => r.isValid).length
  console.log(`Batch verification complete: ${validCount}/${asins.length} valid ASINs`)
  
  return results
}

/**
 * Get local thumbnail path for ASIN
 */
export function getLocalThumbnailPath(asin: string): string | null {
  const filename = `${asin}.jpg`
  const filepath = join(THUMBNAILS_DIR, filename)
  
  if (existsSync(filepath)) {
    return `/amazon-thumbnails/${filename}`
  }
  
  return null
}

/**
 * Validate product before adding to curated list
 */
export async function validateProductForCuration(asin: string, affiliateUrl: string): Promise<ProductValidationResult | null> {
  try {
    const verification = await verifyASINAndCaptureInfo(asin)
    
    if (!verification.isValid || !verification.productExists) {
      console.log(`Product ${asin} failed validation:`, verification.error)
      return null
    }
    
    const associateTag = process.env.AMAZON_ASSOCIATE_TAG || 'goddesscare0d-20'
    const validAffiliateUrl = `https://www.amazon.com/dp/${asin}?tag=${associateTag}&linkCode=as2&camp=1789&creative=9325`
    
    return {
      asin,
      valid: true,
      title: verification.title || 'Amazon Product',
      price: verification.price || 0,
      brand: extractBrandFromTitle(verification.title || ''),
      category: 'Beauty',
      imageUrl: verification.localImagePath || verification.imageUrl || '',
      thumbnailPath: verification.localImagePath || '',
      affiliateUrl: validAffiliateUrl,
      lastVerified: new Date().toISOString()
    }
    
  } catch (error: any) {
    console.error(`Error validating product ${asin}:`, error)
    return null
  }
}

/**
 * Extract brand name from product title
 */
function extractBrandFromTitle(title: string): string {
  const words = title.split(' ')
  return words[0] || 'Amazon'
}