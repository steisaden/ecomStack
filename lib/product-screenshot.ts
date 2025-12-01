import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface ScreenshotOptions {
  asin: string
  affiliateUrl: string
  timeout?: number
  retries?: number
}

export interface ScreenshotResult {
  success: boolean
  imagePath?: string
  localUrl?: string
  error?: string
}

// Directory to store product screenshots
const SCREENSHOTS_DIR = join(process.cwd(), 'public', 'product-images')

// Ensure screenshots directory exists
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

/**
 * Take a screenshot of an Amazon product page using Chrome DevTools
 */
export async function captureProductScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
  const { asin, affiliateUrl, timeout = 10000, retries = 2 } = options
  
  // Check if we already have a screenshot for this ASIN
  const filename = `${asin}.png`
  const filepath = join(SCREENSHOTS_DIR, filename)
  const localUrl = `/product-images/${filename}`
  
  if (existsSync(filepath)) {
    console.log(`Screenshot already exists for ASIN: ${asin}`)
    return {
      success: true,
      imagePath: filepath,
      localUrl
    }
  }

  let attempt = 0
  while (attempt < retries) {
    try {
      console.log(`Taking screenshot for ASIN: ${asin} (attempt ${attempt + 1}/${retries})`)
      
      // Use Chrome DevTools MCP to take screenshot
      const screenshot = await takeAmazonProductScreenshot(affiliateUrl, timeout)
      
      if (screenshot) {
        // Save screenshot to local directory
        writeFileSync(filepath, screenshot)
        
        console.log(`Screenshot saved for ASIN: ${asin}`)
        return {
          success: true,
          imagePath: filepath,
          localUrl
        }
      }
      
      throw new Error('Screenshot capture returned null')
      
    } catch (error: any) {
      console.error(`Screenshot attempt ${attempt + 1} failed for ASIN ${asin}:`, error.message)
      attempt++
      
      if (attempt < retries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
  
  return {
    success: false,
    error: `Failed to capture screenshot after ${retries} attempts`
  }
}

/**
 * Use Chrome DevTools MCP to navigate to Amazon page and take screenshot
 */
async function takeAmazonProductScreenshot(url: string, timeout: number): Promise<Buffer | null> {
  try {
    console.log(`Taking screenshot of Amazon product: ${url}`)
    
    // Call the screenshot function directly instead of making HTTP request
    const screenshot = await takeScreenshotWithPlaywright(url, {
      timeout,
      selector: '#landingImage, #imgTagWrapperId img, .a-dynamic-image, [data-a-image-name="landingImage"]',
      waitForSelector: true,
      fullPage: false
    })
    
    return screenshot
    
  } catch (error) {
    console.error('Chrome DevTools screenshot error:', error)
    return null
  }
}

/**
 * Direct Playwright screenshot implementation
 */
async function takeScreenshotWithPlaywright(url: string, options: {
  timeout: number
  selector?: string
  waitForSelector: boolean
  fullPage: boolean
}): Promise<Buffer | null> {
  let browser = null
  
  try {
    console.log('Attempting screenshot with Playwright...')
    
    // Dynamic import to avoid issues if playwright is not installed
    const { chromium } = await import('playwright')
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage({
      viewport: { width: 1200, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    // Set a shorter timeout for navigation
    const navigationTimeout = Math.min(options.timeout, 10000)
    
    console.log(`Navigating to: ${url}`)
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: navigationTimeout 
    })
    
    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000)
    
    // Try to wait for specific selector if provided, but don't fail if not found
    if (options.waitForSelector && options.selector) {
      try {
        console.log(`Waiting for selector: ${options.selector}`)
        await page.waitForSelector(options.selector, { timeout: 5000 })
        console.log('Selector found successfully')
      } catch (selectorError) {
        console.log('Selector not found, proceeding with screenshot anyway')
        // Continue with screenshot even if selector not found
      }
    }
    
    // Additional wait for images to load
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const images = Array.from(document.querySelectorAll('img'))
        let loadedImages = 0
        
        if (images.length === 0) {
          resolve(true)
          return
        }
        
        const checkComplete = () => {
          loadedImages++
          if (loadedImages >= images.length) {
            resolve(true)
          }
        }
        
        images.forEach(img => {
          if (img.complete) {
            checkComplete()
          } else {
            img.onload = checkComplete
            img.onerror = checkComplete
          }
        })
        
        // Timeout after 3 seconds
        setTimeout(() => resolve(true), 3000)
      })
    })
    
    console.log('Taking screenshot...')
    
    // Take screenshot
    const screenshot = await page.screenshot({
      fullPage: options.fullPage,
      type: 'png'
    })
    
    await browser.close()
    browser = null
    
    console.log('Playwright screenshot completed successfully')
    return Buffer.from(screenshot)
    
  } catch (error) {
    console.error('Playwright screenshot error:', error)
    
    // Ensure browser is closed even on error
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
    
    return null
  }
}

/**
 * Get cached screenshot URL or placeholder
 */
export function getProductScreenshotUrl(asin: string): string {
  const filename = `${asin}.png`
  const filepath = join(SCREENSHOTS_DIR, filename)
  const localUrl = `/product-images/${filename}`
  
  if (existsSync(filepath)) {
    return localUrl
  }
  
  // Return placeholder while screenshot is being taken
  return `/api/placeholder-image?asin=${asin}`
}

/**
 * Queue screenshot capture for async processing
 */
const screenshotQueue: ScreenshotOptions[] = []
let isProcessingQueue = false

export function queueScreenshot(options: ScreenshotOptions): void {
  // Check if already in queue or already exists
  const exists = screenshotQueue.some(item => item.asin === options.asin) ||
                 existsSync(join(SCREENSHOTS_DIR, `${options.asin}.png`))
  
  if (!exists) {
    screenshotQueue.push(options)
    processScreenshotQueue()
  }
}

async function processScreenshotQueue(): Promise<void> {
  if (isProcessingQueue || screenshotQueue.length === 0) {
    return
  }
  
  isProcessingQueue = true
  
  try {
    while (screenshotQueue.length > 0) {
      const options = screenshotQueue.shift()
      if (options) {
        await captureProductScreenshot(options)
        // Small delay between screenshots to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  } catch (error) {
    console.error('Error processing screenshot queue:', error)
  } finally {
    isProcessingQueue = false
  }
}

/**
 * Clean up old screenshots (optional maintenance function)
 */
export function cleanupOldScreenshots(maxAgeHours: number = 24 * 7): void {
  // Implementation for cleaning up screenshots older than specified hours
  // This helps manage disk space
  console.log(`Would clean up screenshots older than ${maxAgeHours} hours`)
}