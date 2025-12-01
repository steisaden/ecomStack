#!/usr/bin/env node

/**
 * Test script for screenshot functionality
 * Tests both MCP and Playwright fallback methods
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testScreenshot() {
  const testUrl = 'https://www.amazon.com/dp/B00JEEYNOW?tag=goddesscare0d-20&linkCode=as2&camp=1789&creative=9325';
  const apiUrl = 'http://localhost:3000/api/chrome-devtools/screenshot';
  
  console.log('Testing screenshot functionality...');
  console.log(`Target URL: ${testUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl,
        timeout: 15000,
        selector: '#landingImage, #imgTagWrapperId img, .a-dynamic-image, [data-a-image-name="landingImage"]',
        waitForSelector: true,
        fullPage: false
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Screenshot captured successfully!');
      console.log(`Screenshot size: ${result.screenshot.length} characters (base64)`);
      console.log(`Timestamp: ${result.timestamp}`);
    } else {
      console.log('❌ Screenshot failed:');
      console.log(`Error: ${result.error}`);
      console.log(`Message: ${result.message || 'No additional message'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testScreenshot();