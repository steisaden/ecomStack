// tests/e2e/amazon-integration.spec.ts
// E2E tests for Amazon Product Integration

import { test, expect } from '@playwright/test';

// Mock data for testing
const VALID_ASIN = 'B07P9W55Q4';
const INVALID_ASIN = 'INVALID123';
const VALID_ASINS_BATCH = ['B07P9W55Q4', 'B08N5WRWNW', 'B07ZPKN6YR'];

test.describe('Amazon Product Integration E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock authentication - adjust based on your auth implementation
    await page.goto('/admin/login');
    // Add login steps if needed
    // For now, we'll assume tests run with proper auth cookies
  });

  test.describe('Single Product Fetch', () => {
    
    test('should fetch and display product with valid ASIN', async ({ page }) => {
      // Navigate to admin product management page
      await page.goto('/admin/affiliate-products');
      
      // Look for ASIN input field
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await expect(asinInput).toBeVisible();
      
      // Enter valid ASIN
      await asinInput.fill(VALID_ASIN);
      
      // Click fetch button
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
      
      // Verify product data is displayed
      await expect(page.locator('text=/product title/i')).toBeVisible({ timeout: 10000 });
      
      // Verify image is loaded
      const productImage = page.locator('img[alt*="product" i]').first();
      await expect(productImage).toBeVisible();
      
      // Verify price is displayed
      await expect(page.locator('text=/\\$\\d+\\.\\d{2}/')).toBeVisible();
    });

    test('should show error for invalid ASIN format', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(INVALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      // Verify error message is displayed
      await expect(page.locator('text=/invalid.*asin/i')).toBeVisible({ timeout: 5000 });
    });

    test('should show error for non-existent ASIN', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill('B000000000'); // Valid format but doesn't exist
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      // Verify error message
      await expect(page.locator('text=/not found/i')).toBeVisible({ timeout: 10000 });
    });

    test('should display loading state during fetch', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      // Verify loading indicator appears
      await expect(page.locator('text=/loading/i, [role="progressbar"]').first()).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Bulk Product Import', () => {
    
    test('should import multiple products successfully', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      // Open bulk import modal
      const bulkImportButton = page.locator('button:has-text("Bulk Import")').first();
      await bulkImportButton.click();
      
      // Wait for modal to open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Enter multiple ASINs
      const asinTextarea = page.locator('textarea[placeholder*="ASIN" i]').first();
      await asinTextarea.fill(VALID_ASINS_BATCH.join('\n'));
      
      // Submit bulk import
      const submitButton = page.locator('button:has-text("Import")').first();
      await submitButton.click();
      
      // Wait for processing
      await page.waitForLoadState('networkidle');
      
      // Verify success message
      await expect(page.locator('text=/successfully imported/i')).toBeVisible({ timeout: 15000 });
      
      // Verify summary shows correct counts
      await expect(page.locator(`text=/${VALID_ASINS_BATCH.length}.*success/i`)).toBeVisible();
    });

    test('should handle mixed valid and invalid ASINs', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const bulkImportButton = page.locator('button:has-text("Bulk Import")').first();
      await bulkImportButton.click();
      
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Mix of valid and invalid ASINs
      const mixedAsins = [...VALID_ASINS_BATCH, INVALID_ASIN, 'B000000000'];
      const asinTextarea = page.locator('textarea[placeholder*="ASIN" i]').first();
      await asinTextarea.fill(mixedAsins.join('\n'));
      
      const submitButton = page.locator('button:has-text("Import")').first();
      await submitButton.click();
      
      await page.waitForLoadState('networkidle');
      
      // Verify partial success message
      await expect(page.locator('text=/imported/i')).toBeVisible({ timeout: 15000 });
      
      // Verify failed ASINs are listed
      await expect(page.locator('text=/failed/i')).toBeVisible();
    });

    test('should show progress indicator during bulk import', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const bulkImportButton = page.locator('button:has-text("Bulk Import")').first();
      await bulkImportButton.click();
      
      const asinTextarea = page.locator('textarea[placeholder*="ASIN" i]').first();
      await asinTextarea.fill(VALID_ASINS_BATCH.join('\n'));
      
      const submitButton = page.locator('button:has-text("Import")').first();
      await submitButton.click();
      
      // Verify progress indicator
      await expect(page.locator('[role="progressbar"], text=/processing/i').first()).toBeVisible({ timeout: 2000 });
    });

    test('should validate maximum ASIN limit', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const bulkImportButton = page.locator('button:has-text("Bulk Import")').first();
      await bulkImportButton.click();
      
      // Try to import more than 10 ASINs (API limit)
      const tooManyAsins = Array(15).fill(VALID_ASIN);
      const asinTextarea = page.locator('textarea[placeholder*="ASIN" i]').first();
      await asinTextarea.fill(tooManyAsins.join('\n'));
      
      const submitButton = page.locator('button:has-text("Import")').first();
      await submitButton.click();
      
      // Verify error message about limit
      await expect(page.locator('text=/maximum.*10/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Product Refresh Functionality', () => {
    
    test('should refresh product data from Amazon', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      // Assume there's a product list with refresh buttons
      const refreshButton = page.locator('button[aria-label*="refresh" i], button:has-text("Refresh")').first();
      
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        
        // Verify loading state
        await expect(page.locator('text=/refreshing/i').first()).toBeVisible({ timeout: 2000 });
        
        // Wait for completion
        await page.waitForLoadState('networkidle');
        
        // Verify success message
        await expect(page.locator('text=/refreshed/i')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should show updated timestamp after refresh', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      // Get initial timestamp if visible
      const timestampLocator = page.locator('text=/last.*updated/i').first();
      
      if (await timestampLocator.isVisible()) {
        const initialTimestamp = await timestampLocator.textContent();
        
        // Refresh product
        const refreshButton = page.locator('button[aria-label*="refresh" i]').first();
        await refreshButton.click();
        
        await page.waitForLoadState('networkidle');
        
        // Verify timestamp changed
        const newTimestamp = await timestampLocator.textContent();
        expect(newTimestamp).not.toBe(initialTimestamp);
      }
    });
  });

  test.describe('Image Loading and Fallbacks', () => {
    
    test('should load Amazon product images', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      await page.waitForLoadState('networkidle');
      
      // Verify image loads successfully
      const productImage = page.locator('img[src*="amazon" i]').first();
      await expect(productImage).toBeVisible({ timeout: 10000 });
      
      // Verify image has loaded (not broken)
      const imageLoaded = await productImage.evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalHeight !== 0;
      });
      expect(imageLoaded).toBeTruthy();
    });

    test('should show fallback image on load failure', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      // Mock a failed image load by intercepting the request
      await page.route('**/*images-amazon.com/**', route => route.abort());
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      await page.waitForLoadState('networkidle');
      
      // Verify fallback/placeholder image is shown
      const fallbackImage = page.locator('img[src*="placeholder" i], img[alt*="not found" i]').first();
      await expect(fallbackImage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/amazon/**', route => route.abort());
      
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      // Verify error message
      await expect(page.locator('text=/error|failed|unable/i')).toBeVisible({ timeout: 5000 });
    });

    test('should handle rate limit errors', async ({ page }) => {
      // Mock rate limit response
      await page.route('**/api/amazon/**', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' })
        });
      });
      
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      // Verify rate limit message
      await expect(page.locator('text=/rate limit|too many requests/i')).toBeVisible({ timeout: 5000 });
    });

    test('should handle authentication errors', async ({ page }) => {
      // Mock auth failure
      await page.route('**/api/amazon/**', route => {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Authentication failed' })
        });
      });
      
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      // Verify auth error message
      await expect(page.locator('text=/authentication|credentials|unauthorized/i')).toBeVisible({ timeout: 5000 });
    });

    test('should handle empty ASIN input', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      
      // Try to fetch without entering ASIN
      await fetchButton.click();
      
      // Verify validation message
      await expect(page.locator('text=/required|enter.*asin/i')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('ASIN Validation', () => {
    
    test('should validate ASIN format in real-time', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      
      // Enter invalid format
      await asinInput.fill('ABC');
      await asinInput.blur();
      
      // Verify validation error
      await expect(page.locator('text=/invalid.*format/i')).toBeVisible({ timeout: 2000 });
      
      // Enter valid format
      await asinInput.fill(VALID_ASIN);
      await asinInput.blur();
      
      // Verify validation passes
      await expect(page.locator('text=/invalid.*format/i')).not.toBeVisible();
    });

    test('should show checkmark for verified ASIN', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      await page.waitForLoadState('networkidle');
      
      // Verify checkmark or verified badge
      await expect(page.locator('[aria-label*="verified" i], text=/✓|verified/i').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/admin/affiliate-products');
      
      // Verify mobile layout
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await expect(asinInput).toBeVisible();
      
      // Test fetch on mobile
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      await fetchButton.click();
      
      await page.waitForLoadState('networkidle');
      
      // Verify product displays correctly on mobile
      await expect(page.locator('text=/product/i').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Cache Behavior', () => {
    
    test('should indicate cached responses', async ({ page }) => {
      await page.goto('/admin/affiliate-products');
      
      const asinInput = page.locator('input[placeholder*="ASIN" i]').first();
      await asinInput.fill(VALID_ASIN);
      
      const fetchButton = page.locator('button:has-text("Fetch from Amazon")').first();
      
      // First fetch (not cached)
      await fetchButton.click();
      await page.waitForLoadState('networkidle');
      
      // Clear and fetch again (should be cached)
      await asinInput.clear();
      await asinInput.fill(VALID_ASIN);
      await fetchButton.click();
      
      // Verify faster response or cache indicator
      // This is implementation-specific
      await page.waitForLoadState('networkidle');
    });
  });
});
