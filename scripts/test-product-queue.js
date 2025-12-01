#!/usr/bin/env node

/**
 * Test script for product screenshot queue functionality
 * Tests the queue processing for multiple Amazon ASINs
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testProductScreenshotQueue() {
  const apiUrl = 'http://localhost:3000/api/screenshot-product';
  
  // Test ASINs from your product database
  const testASINs = [
    'B00JEEYNOW',
    'B00NR1YQK4', 
    'B00CMBRE0A'
  ];
  
  console.log('Testing product screenshot queue...');
  console.log(`Testing ${testASINs.length} ASINs`);
  
  for (const asin of testASINs) {
    try {
      console.log(`\nQueueing screenshot for ASIN: ${asin}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asin: asin,
          affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=goddesscare0d-20&linkCode=as2&camp=1789&creative=9325`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${asin}: ${result.message || 'Queued successfully'}`);
        if (result.localUrl) {
          console.log(`   Screenshot URL: ${result.localUrl}`);
        }
      } else {
        console.log(`❌ ${asin}: ${result.error || 'Failed'}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ${asin}: Test failed with error:`, error.message);
    }
  }
  
  console.log('\nQueue test completed. Check server logs for processing details.');
}

// Run the test
testProductScreenshotQueue();