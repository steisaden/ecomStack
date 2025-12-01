import { unstable_cache } from 'next/cache'

/**
 * Performance Optimization Utilities
 * Provides request deduplication, caching, and batching strategies
 */

// Cache duration constants
export const CACHE_DURATIONS = {
  VERY_SHORT: 60,      // 1 minute - for frequently changing data
  SHORT: 300,          // 5 minutes - for dynamic content
  MEDIUM: 900,         // 15 minutes - for semi-static content
  LONG: 1800,          // 30 minutes - for relatively static content
  VERY_LONG: 3600,     // 1 hour - for global settings
  STATIC: 7200,        // 2 hours - for rarely changing content
  PERMANENT: 86400     // 24 hours - for permanent content
} as const

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>()

/**
 * Request deduplication utility
 * Prevents duplicate API calls for the same resource
 */
export function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 5000 // 5 seconds default TTL for deduplication
): Promise<T> {
  // Check if request is already in progress
  if (requestCache.has(key)) {
    return requestCache.get(key)!
  }

  // Create new request
  const request = requestFn()
    .finally(() => {
      // Remove from cache after TTL
      setTimeout(() => {
        requestCache.delete(key)
      }, ttl)
    })

  // Store in cache
  requestCache.set(key, request)
  
  return request
}

/**
 * Enhanced cache wrapper with fallback strategies
 */
export function createCachedFunction<T>(
  fn: () => Promise<T>,
  options: {
    key: string[]
    tags: string[]
    revalidate: number
    fallback?: () => T
    retryOnError?: boolean
    maxRetries?: number
  }
): () => Promise<T> {
  const { key, tags, revalidate, fallback, retryOnError = true, maxRetries = 2 } = options

  return unstable_cache(
    async () => {
      let lastError: Error | null = null
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn()
        } catch (error) {
          lastError = error as Error
          
          if (!retryOnError || attempt === maxRetries) {
            console.error(`Cache function failed after ${attempt + 1} attempts:`, error)
            
            // Try fallback if available
            if (fallback) {
              console.log('Using fallback data due to cache function failure')
              return fallback()
            }
            
            throw error
          }
          
          // Exponential backoff for retries
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
      
      throw lastError
    },
    key,
    {
      tags,
      revalidate
    }
  )
}

/**
 * Batch request utility for grouping multiple API calls
 */
export class RequestBatcher<T> {
  private batch: Array<{
    id: string
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (error: Error) => void
  }> = []
  
  private timeoutId: NodeJS.Timeout | null = null
  private readonly batchSize: number
  private readonly batchTimeout: number
  
  constructor(batchSize: number = 10, batchTimeout: number = 100) {
    this.batchSize = batchSize
    this.batchTimeout = batchTimeout
  }
  
  add(id: string, requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Check if we already have this request
      const existing = this.batch.find(item => item.id === id)
      if (existing) {
        return existing.promise
      }
      
      const promise = requestFn()
      
      this.batch.push({
        id,
        promise,
        resolve,
        reject
      })
      
      // Start timeout if not already started
      if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.processBatch(), this.batchTimeout)
      }
      
      // Process immediately if batch is full
      if (this.batch.length >= this.batchSize) {
        this.processBatch()
      }
    })
  }
  
  private async processBatch() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    
    const currentBatch = this.batch.splice(0, this.batchSize)
    
    if (currentBatch.length === 0) return
    
    // Execute all requests in parallel
    const results = await Promise.allSettled(
      currentBatch.map(item => item.promise)
    )
    
    // Resolve/reject individual promises
    results.forEach((result, index) => {
      const item = currentBatch[index]
      
      if (result.status === 'fulfilled') {
        item.resolve(result.value)
      } else {
        item.reject(result.reason)
      }
    })
  }
}

/**
 * Memory-efficient cache with size limits
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private readonly maxSize: number
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key)
    
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    
    return value
  }
  
  set(key: K, value: V): void {
    // Delete if exists (to move to end)
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // Remove oldest if at capacity
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, value)
  }
  
  has(key: K): boolean {
    return this.cache.has(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
}

/**
 * Preloader utility for prefetching critical resources
 */
export class ResourcePreloader {
  private preloadedResources = new Set<string>()
  
  /**
   * Preload critical resources
   */
  preloadResources(resources: Array<{
    href: string
    as: 'script' | 'style' | 'font' | 'image'
    crossorigin?: 'anonymous' | 'use-credentials'
  }>) {
    if (typeof window === 'undefined') return
    
    resources.forEach(({ href, as, crossorigin }) => {
      if (this.preloadedResources.has(href)) return
      
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      
      if (crossorigin) {
        link.crossOrigin = crossorigin
      }
      
      document.head.appendChild(link)
      this.preloadedResources.add(href)
    })
  }
  
  /**
   * Prefetch data for future navigation
   */
  prefetchData(urls: string[]) {
    if (typeof window === 'undefined') return
    
    urls.forEach(url => {
      if (this.preloadedResources.has(url)) return
      
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      
      document.head.appendChild(link)
      this.preloadedResources.add(url)
    })
  }
}

// Global instances
export const globalBatcher = new RequestBatcher()
export const memoryCache = new LRUCache(200)
export const resourcePreloader = new ResourcePreloader()

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics = new Map<string, number[]>()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  startTimer(key: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      this.recordMetric(key, duration)
    }
  }
  
  recordMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const values = this.metrics.get(key)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }
  
  getMetrics(key: string): {
    avg: number
    min: number
    max: number
    count: number
  } | null {
    const values = this.metrics.get(key)
    
    if (!values || values.length === 0) return null
    
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    }
  }
  
  getAllMetrics(): Record<string, ReturnType<PerformanceMonitor['getMetrics']>> {
    const result: Record<string, ReturnType<PerformanceMonitor['getMetrics']>> = {}
    
    this.metrics.forEach((_, key) => {
      result[key] = this.getMetrics(key)
    })
    
    return result
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()