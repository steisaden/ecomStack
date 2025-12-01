// lib/cache-manager.ts

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs: number = 60 * 1000) { // Default cleanup every minute
    this.startCleanup(cleanupIntervalMs);
  }

  public set<T>(key: string, value: T, ttl: number): void {
    const timestamp = Date.now();
    this.cache.set(key, { value, timestamp, ttl });
  }

  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    return !!entry && !this.isExpired(entry);
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private startCleanup(intervalMs: number): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => this.cleanup(), intervalMs);
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export a singleton instance for common use
export const cacheManager = new CacheManager();
