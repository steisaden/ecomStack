// Cache-related types and interfaces

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  fallbackToMemory?: boolean; // Whether to fallback to memory if primary cache fails
  compress?: boolean; // Whether to compress values
}

export interface CacheStrategy {
  key: string | ((...args: any[]) => string);
  ttl: number | ((...args: any[]) => number);
  tags?: string[]; // Cache tags for invalidation
}

export type CacheValue = string | number | boolean | object | null | undefined;

export interface CacheService {
  get<T = CacheValue>(key: string): Promise<T | null>;
  set<T = CacheValue>(key: string, value: T, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
  flush(): Promise<boolean>;
  healthCheck(): Promise<boolean>;
}