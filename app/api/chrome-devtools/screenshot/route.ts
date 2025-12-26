import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const defaultTimeout = parseInt(process.env.SCREENSHOT_TIMEOUT || '10000')
    const { url, timeout = defaultTimeout, selector, waitForSelector = false, fullPage = false } = await request.json()
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 })
    }
    
    console.log(`Taking screenshot of: ${url}`)
    
    // Use Chrome DevTools MCP to take screenshot
    const screenshot = await takeScreenshotWithDevTools(url, {
      timeout,
      selector,
      waitForSelector,
      fullPage
    })
    
    if (screenshot) {
      return NextResponse.json({
        success: true,
        screenshot: screenshot.toString('base64'),
        url,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to capture screenshot',
        url
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Chrome DevTools screenshot API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}

interface ScreenshotOptions {
  timeout: number
  selector?: string
  waitForSelector: boolean
  fullPage: boolean
}

async function takeScreenshotWithDevTools(url: string, options: ScreenshotOptions): Promise<Buffer | null> {
  const { timeout, selector, waitForSelector, fullPage } = options
  
  try {
    console.log(`Starting screenshot for: ${url}`)
    
    // Check preferred method from environment
    const preferredMethod = process.env.SCREENSHOT_METHOD || 'mcp'
    
    if (preferredMethod === 'playwright') {
      console.log('Using Playwright as preferred method')
      return await captureWithPlaywright(url, options)
    }
    
    // Default to MCP with Playwright fallback
    console.log('Attempting MCP first, with Playwright fallback')
    const screenshotResult = await captureWithMCP(url, options)
    
    return screenshotResult
    
  } catch (error) {
    console.error('Error in takeScreenshotWithDevTools:', error)
    return null
  }
}

// Actual Chrome DevTools MCP implementation
async function captureWithMCP(url: string, options: ScreenshotOptions): Promise<Buffer | null> {
  try {
    console.log(`Capturing screenshot with MCP for: ${url}`)
    
    // Check if MCP functions are available in the environment
    if (typeof (global as any).mcp_chrome_devtools_navigate_page === 'undefined' ||
        typeof (global as any).mcp_chrome_devtools_wait_for === 'undefined' ||
        typeof (global as any).mcp_chrome_devtools_take_screenshot === 'undefined') {
      console.log('MCP functions not available in this environment')
      
      // Try alternative screenshot method using Playwright if available
      return await captureWithPlaywright(url, options)
    }
    
    // Step 1: Navigate to the URL
    console.log('Step 1: Navigating to Amazon product page...')
    await (global as any).mcp_chrome_devtools_navigate_page({ url })
    
    // Step 2: Wait for product images to load
    if (options.waitForSelector && options.selector) {
      console.log(`Step 2: Waiting for selector: ${options.selector}`)
      await (global as any).mcp_chrome_devtools_wait_for({ 
        selector: options.selector,
        timeout: options.timeout
      })
    }
    
    // Step 3: Take screenshot
    console.log('Step 3: Taking screenshot...')
    const screenshot = await (global as any).mcp_chrome_devtools_take_screenshot({ 
      fullPage: options.fullPage 
    })
    
    console.log('Screenshot capture completed')
    return screenshot
    
  } catch (error) {
    console.error('MCP screenshot error:', error)
    // Fallback to Playwright if MCP fails
    return await captureWithPlaywright(url, options)
  }
}

// Fallback implementation using Playwright
async function captureWithPlaywright(url: string, options: ScreenshotOptions): Promise<Buffer | null> {
  let browser: import('playwright').Browser | null = null
  
  try {
    console.log('Attempting screenshot with Playwright fallback...')
    
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
    
    const page = await browser!.newPage({
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
    
    await browser!.close()
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
