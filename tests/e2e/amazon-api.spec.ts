// tests/e2e/amazon-api.spec.ts
// Focused E2E tests for Amazon API endpoints

import { test, expect } from '@playwright/test';

const VALID_ASIN = 'B07P9W55Q4';
const INVALID_ASIN_FORMAT = 'INVALID';
const NON_EXISTENT_ASIN = 'B000000000';

test.describe('Amazon API Endpoints E2E', () => {
  
  test.describe('GET /api/amazon/product/[asin]', () => {
    
    test('should return product data for valid ASIN', async ({ request }) => {
      const response = await request.get(`/api/amazon/product/${VALID_ASIN}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.asin).toBe(VALID_ASIN);
      expect(data.data.title).toBeDefined();
      expect(data.data.imageUrl).toBeDefined();
      expect(data.cached).toBeDefined();
    });

    test('should return 400 for invalid ASIN format', async ({ request }) => {
      const response = await request.get(`/api/amazon/product/${INVALID_ASIN_FORMAT}`);
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Invalid ASIN format');
    });

    test('should return 404 for non-existent ASIN', async ({ request }) => {
      const response = await request.get(`/api/amazon/product/${NON_EXISTENT_ASIN}`);
      
      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    test('should indicate cache status', async ({ request }) => {
      // First request (not cached)
      const response1 = await request.get(`/api/amazon/product/${VALID_ASIN}`);
      const data1 = await response1.json();
      
      // Second request (should be cached)
      const response2 = await request.get(`/api/amazon/product/${VALID_ASIN}`);
      const data2 = await response2.json();
      
      expect(data2.cached).toBe(true);
    });
  });

  test.describe('POST /api/amazon/products/batch', () => {
    
    test('should fetch multiple products', async ({ request }) => {
      const asins = ['B07P9W55Q4', 'B08N5WRWNW'];
      
      const response = await request.post('/api/amazon/products/batch', {
        data: { asins }
      });
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.products).toBeDefined();
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThan(0);
    });

    test('should handle mixed valid and invalid ASINs', async ({ request }) => {
      const asins = ['B07P9W55Q4', INVALID_ASIN_FORMAT, NON_EXISTENT_ASIN];
      
      const response = await request.post('/api/amazon/products/batch', {
        data: { asins }
      });
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.products).toBeDefined();
      expect(data.failedASINs).toBeDefined();
      expect(data.failedASINs.length).toBeGreaterThan(0);
    });

    test('should reject more than 10 ASINs', async ({ request }) => {
      const asins = Array(15).fill(VALID_ASIN);
      
      const response = await request.post('/api/amazon/products/batch', {
        data: { asins }
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Maximum 10 ASINs');
    });

    test('should reject empty ASIN array', async ({ request }) => {
      const response = await request.post('/api/amazon/products/batch', {
        data: { asins: [] }
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  test.describe('POST /api/amazon/validate-asin', () => {
    
    test('should validate correct ASIN format', async ({ request }) => {
      const response = await request.post('/api/amazon/validate-asin', {
        data: { asin: VALID_ASIN }
      });
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.valid).toBe(true);
      expect(data.exists).toBeDefined();
    });

    test('should reject invalid ASIN format', async ({ request }) => {
      const response = await request.post('/api/amazon/validate-asin', {
        data: { asin: INVALID_ASIN_FORMAT }
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error).toContain('Invalid ASIN format');
    });

    test('should detect non-existent ASIN', async ({ request }) => {
      const response = await request.post('/api/amazon/validate-asin', {
        data: { asin: NON_EXISTENT_ASIN }
      });
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.valid).toBe(true);
      expect(data.exists).toBe(false);
    });
  });

  test.describe('POST /api/amazon/product/refresh/[asin]', () => {
    
    test('should refresh product data', async ({ request }) => {
      const response = await request.post(`/api/amazon/product/refresh/${VALID_ASIN}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.cached).toBe(false); // Should always be false for refresh
      expect(data.message).toContain('refreshed');
    });

    test('should return 400 for invalid ASIN', async ({ request }) => {
      const response = await request.post(`/api/amazon/product/refresh/${INVALID_ASIN_FORMAT}`);
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid ASIN format');
    });
  });

  test.describe('Error Handling', () => {
    
    test('should handle rate limiting', async ({ request }) => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill(null).map(() => 
        request.get(`/api/amazon/product/${VALID_ASIN}`)
      );
      
      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(r => r.status() === 429);
      
      if (rateLimited) {
        const rateLimitedResponse = responses.find(r => r.status() === 429);
        const data = await rateLimitedResponse!.json();
        expect(data.error).toBeDefined();
      }
    });

    test('should return proper error for missing ASIN', async ({ request }) => {
      const response = await request.post('/api/amazon/validate-asin', {
        data: {}
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('ASIN');
    });
  });

  test.describe('Response Format Consistency', () => {
    
    test('all success responses should have consistent structure', async ({ request }) => {
      const response = await request.get(`/api/amazon/product/${VALID_ASIN}`);
      const data = await response.json();
      
      // Verify consistent response structure
      expect(data).toHaveProperty('success');
      expect(typeof data.success).toBe('boolean');
      
      if (data.success) {
        expect(data).toHaveProperty('data');
      } else {
        expect(data).toHaveProperty('error');
      }
    });

    test('all error responses should have consistent structure', async ({ request }) => {
      const response = await request.get(`/api/amazon/product/${INVALID_ASIN_FORMAT}`);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });
});
