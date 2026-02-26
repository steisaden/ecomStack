import { CacheService, CacheValue } from './types';
import { PRODUCT_CACHE_STRATEGIES, ProductCacheStrategy } from './strategies';

// Simple in-memory cache implementation as fallback
class MemoryCache {
  private store: Map<string, { value: any; expiry: number | null }> = new Map();

  async get<T = CacheValue>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T = CacheValue>(key: string, value: T, ttl?: number): Promise<boolean> {
    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    this.store.set(key, { value, expiry });
    return true;
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const item = this.store.get(key);
    if (!item) return false;

    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  async clear(): Promise<boolean> {
    this.store.clear();
    return true;
  }

  async keys(pattern?: string): Promise<string[]> {
    if (!pattern) {
      return Array.from(this.store.keys());
    }

    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async flush(): Promise<boolean> {
    this.store.clear();
    return true;
  }
}

// Redis cache implementation
class RedisCache {
  private client: any; // In a real implementation, this would be a Redis client
  private connected = false;

  constructor() {
    // Note: In a real implementation, you would initialize the Redis client here
    // this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    // For this implementation, we'll simulate Redis functionality
    console.log('Redis cache service initialized (simulated)');
    this.connected = true;
  }

  async get<T = CacheValue>(key: string): Promise<T | null> {
    // Simulate Redis get operation
    if (!this.connected) {
      throw new Error('Redis client not connected');
    }

    // In a real implementation:
    // const value = await this.client.get(key);
    // return value ? JSON.parse(value) : null;

    // For simulation, we'll use a temporary store
    const store = (global as any)._redisStore || {};
    const item = store[key];

    if (!item) return null;

    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      delete store[key];
      (global as any)._redisStore = store;
      return null;
    }

    return item.value as T;
  }

  async set<T = CacheValue>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Redis client not connected');
    }

    // In a real implementation:
    // const stringValue = JSON.stringify(value);
    // if (ttl) {
    //   await this.client.setex(key, ttl, stringValue);
    // } else {
    //   await this.client.set(key, stringValue);
    // }

    // For simulation
    const store = (global as any)._redisStore || {};
    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    store[key] = { value, expiry };
    (global as any)._redisStore = store;

    return true;
  }

  async delete(key: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Redis client not connected');
    }

    // In a real implementation:
    // return await this.client.del(key) > 0;

    // For simulation
    const store = (global as any)._redisStore || {};
    const result = delete store[key];
    (global as any)._redisStore = store;
    return result;
  }

  async has(key: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Redis client not connected');
    }

    // In a real implementation:
    // return (await this.client.exists(key)) === 1;

    // For simulation
    const store = (global as any)._redisStore || {};
    const item = store[key];

    if (!item) return false;

    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      delete store[key];
      (global as any)._redisStore = store;
      return false;
    }

    return true;
  }

  async clear(): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Redis client not connected');
    }

    // In a real implementation:
    // await this.client.flushdb();

    // For simulation
    (global as any)._redisStore = {};
    return true;
  }

  async keys(pattern = '*'): Promise<string[]> {
    if (!this.connected) {
      throw new Error('Redis client not connected');
    }

    // In a real implementation:
    // return await this.client.keys(pattern);

    // For simulation
    const store = (global as any)._redisStore || {};
    const allKeys = Object.keys(store);

    if (pattern === '*') return allKeys;

    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return allKeys.filter(key => regex.test(key));
  }

  async flush(): Promise<boolean> {
    return this.clear();
  }

  async healthCheck(): Promise<boolean> {
    return this.connected;
  }
}

export class CacheServiceImplementation implements CacheService {
  private redisCache: RedisCache;
  private memoryCache: MemoryCache;
  private useRedis: boolean;

  constructor() {
    // Check if Redis is configured
    this.useRedis = !!process.env.REDIS_URL;

    this.redisCache = new RedisCache();
    this.memoryCache = new MemoryCache();
  }

  private async getCache<T = CacheValue>(key: string): Promise<T | null> {
    if (this.useRedis) {
      try {
        return await this.redisCache.get<T>(key);
      } catch (error) {
        console.warn('Redis error, falling back to memory cache:', error);
        return await this.memoryCache.get<T>(key);
      }
    } else {
      return await this.memoryCache.get<T>(key);
    }
  }

  private async setCache<T = CacheValue>(key: string, value: T, ttl?: number): Promise<boolean> {
    let redisSuccess = true;
    let memorySuccess = true;

    if (this.useRedis) {
      try {
        await this.redisCache.set<T>(key, value, ttl);
      } catch (error) {
        console.warn('Redis set error, using memory cache:', error);
        redisSuccess = false;
      }
    }

    if (redisSuccess || !this.useRedis) {
      memorySuccess = await this.memoryCache.set<T>(key, value, ttl);
    }

    return redisSuccess && memorySuccess;
  }

  private async deleteCache(key: string): Promise<boolean> {
    let redisSuccess = true;
    let memorySuccess = true;

    if (this.useRedis) {
      try {
        await this.redisCache.delete(key);
      } catch (error) {
        console.warn('Redis delete error:', error);
        redisSuccess = false;
      }
    }

    memorySuccess = await this.memoryCache.delete(key);

    return redisSuccess && memorySuccess;
  }

  private async hasCache(key: string): Promise<boolean> {
    // Check Redis first if available
    if (this.useRedis) {
      try {
        return await this.redisCache.has(key);
      } catch (error) {
        console.warn('Redis has error, checking memory cache:', error);
      }
    }

    // Fall back to memory cache
    return await this.memoryCache.has(key);
  }

  async get<T = CacheValue>(key: string): Promise<T | null> {
    return await this.getCache<T>(key);
  }

  async set<T = CacheValue>(key: string, value: T, ttl?: number): Promise<boolean> {
    return await this.setCache<T>(key, value, ttl);
  }

  async delete(key: string): Promise<boolean> {
    return await this.deleteCache(key);
  }

  async has(key: string): Promise<boolean> {
    return await this.hasCache(key);
  }

  async clear(): Promise<boolean> {
    let redisSuccess = true;
    let memorySuccess = true;

    if (this.useRedis) {
      try {
        await this.redisCache.clear();
      } catch (error) {
        console.warn('Redis clear error:', error);
        redisSuccess = false;
      }
    }

    memorySuccess = await this.memoryCache.clear();

    return redisSuccess && memorySuccess;
  }

  async keys(pattern?: string): Promise<string[]> {
    // If using Redis, prefer Redis results, fall back to memory
    if (this.useRedis) {
      try {
        return await this.redisCache.keys(pattern);
      } catch (error) {
        console.warn('Redis keys error, using memory cache:', error);
      }
    }

    return await this.memoryCache.keys(pattern);
  }

  async flush(): Promise<boolean> {
    return await this.clear();
  }

  async healthCheck(): Promise<boolean> {
    if (this.useRedis) {
      try {
        return await this.redisCache.healthCheck();
      } catch (error) {
        console.warn('Redis health check failed:', error);
        return false;
      }
    }
    // Memory cache is always healthy
    return true;
  }

  // Specialized methods for product caching using strategies
  async getProductData(asin: string) {
    const strategy = PRODUCT_CACHE_STRATEGIES.productData;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)(asin) : strategy.key;
    return await this.get<any>(key);
  }

  async setProductData(asin: string, data: any) {
    const strategy = PRODUCT_CACHE_STRATEGIES.productData;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)(asin) : strategy.key;
    const ttl = typeof strategy.ttl === 'function' ? (strategy.ttl as any)(data) : strategy.ttl;
    return await this.set(key, data, ttl);
  }

  async getImageUrl(asin: string) {
    const strategy = PRODUCT_CACHE_STRATEGIES.imageUrl;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)(asin) : strategy.key;
    return await this.get<string>(key);
  }

  async setImageUrl(asin: string, imageUrl: string) {
    const strategy = PRODUCT_CACHE_STRATEGIES.imageUrl;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)(asin) : strategy.key;
    const ttl = typeof strategy.ttl === 'function' ? (strategy.ttl as any)(imageUrl) : strategy.ttl;
    return await this.set(key, imageUrl, ttl);
  }

  async getLinkValidation(url: string) {
    const strategy = PRODUCT_CACHE_STRATEGIES.linkValidation;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)(url) : strategy.key;
    return await this.get<any>(key);
  }

  async setLinkValidation(url: string, data: any, isValid: boolean) {
    const strategy = PRODUCT_CACHE_STRATEGIES.linkValidation;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)(url) : strategy.key;
    const ttl = typeof strategy.ttl === 'function' ? (strategy.ttl as any)(isValid) : strategy.ttl;
    return await this.set(key, data, ttl);
  }

  async getDashboardData(section: string) {
    const strategy = PRODUCT_CACHE_STRATEGIES.dashboardData;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)(section) : strategy.key;
    return await this.get<any>(key);
  }

  async setDashboardData(section: string, data: any) {
    const strategy = PRODUCT_CACHE_STRATEGIES.dashboardData;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)(section) : strategy.key;
    const ttl = typeof strategy.ttl === 'function' ? (strategy.ttl as any)(data) : strategy.ttl;
    return await this.set(key, data, ttl);
  }

  async getProductStatus() {
    const strategy = PRODUCT_CACHE_STRATEGIES.productStatus;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)() : strategy.key;
    return await this.get<any>(key);
  }

  async setProductStatus(data: any) {
    const strategy = PRODUCT_CACHE_STRATEGIES.productStatus;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)() : strategy.key;
    const ttl = typeof strategy.ttl === 'function' ? (strategy.ttl as any)(data) : strategy.ttl;
    return await this.set(key, data, ttl);
  }

  async getJobStatusList() {
    const strategy = PRODUCT_CACHE_STRATEGIES.jobStatusList;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)() : strategy.key;
    return await this.get<any>(key);
  }

  async setJobStatusList(data: any) {
    const strategy = PRODUCT_CACHE_STRATEGIES.jobStatusList;
    const key = typeof strategy.key === 'function' ? (strategy.key as any)() : strategy.key;
    const ttl = typeof strategy.ttl === 'function' ? (strategy.ttl as any)(data) : strategy.ttl;
    return await this.set(key, data, ttl);
  }
}

// Export a singleton instance of the cache service
export const cacheService = new CacheServiceImplementation();