import { CacheStrategy } from './types';

// Define different caching strategies for various data types

export const PRODUCT_CACHE_STRATEGIES = {
  // Image URL caching (24-hour TTL)
  imageUrl: {
    key: (asin: string) => `product:image:${asin}`,
    ttl: 24 * 60 * 60, // 24 hours
    tags: ['product', 'image']
  } as CacheStrategy,

  // Link validation caching (6-hour TTL for valid links, 1-hour for invalid)
  linkValidation: {
    key: (url: string) => `link:validation:${url}`,
    ttl: (isValid: boolean) => isValid ? 6 * 60 * 60 : 1 * 60 * 60, // 6 hours valid, 1 hour invalid
    tags: ['link', 'validation']
  } as CacheStrategy,

  // Product data caching (1-hour TTL)
  productData: {
    key: (asin: string) => `product:data:${asin}`,
    ttl: 60 * 60, // 1 hour
    tags: ['product', 'data']
  } as CacheStrategy,

  // Admin dashboard data caching (5-minute TTL)
  dashboardData: {
    key: (section: string) => `dashboard:${section}`,
    ttl: 5 * 60, // 5 minutes
    tags: ['dashboard']
  } as CacheStrategy,
  
  // Product status summary caching (10-minute TTL)
  productStatus: {
    key: () => 'product:status:summary',
    ttl: 10 * 60, // 10 minutes
    tags: ['product', 'status']
  } as CacheStrategy,

  // Job status list caching (1-minute TTL)
  jobStatusList: {
    key: () => 'job:status:list',
    ttl: 60, // 1 minute
    tags: ['job', 'status']
  } as CacheStrategy
};

export type ProductCacheStrategy = keyof typeof PRODUCT_CACHE_STRATEGIES;