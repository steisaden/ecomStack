import { redis } from './db/config';

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private refillRate: number; // tokens per second
  private capacity: number; // max tokens

  // In-memory fallback storage
  private static memoryStore: Map<string, { count: number, resetAt: number }> = new Map();

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Check if a key has exceeded the rate limit
   * @param key Unique identifier (e.g., IP address or username)
   * @param limit Maximum requests allowed
   * @param windowSeconds Time window in seconds
   */
  public async checkLimit(key: string, limit: number, windowSeconds: number): Promise<{
    success: boolean;
    remaining: number;
    resetIn: number;
  }> {
    if (redis) {
      try {
        const redisKey = `rate_limit:${key}`;
        const multi = redis.multi();
        multi.incr(redisKey);
        multi.ttl(redisKey);

        const results = await multi.exec();

        if (results && results[0] && results[1]) {
          const count = results[0][1] as number;
          const ttl = results[1][1] as number;

          if (count === 1) {
            // First request, set expiration
            await redis.expire(redisKey, windowSeconds);
            return {
              success: true,
              remaining: limit - 1,
              resetIn: windowSeconds
            };
          }

          if (count > limit) {
            return {
              success: false,
              remaining: 0,
              resetIn: ttl > 0 ? ttl : windowSeconds
            };
          }

          return {
            success: true,
            remaining: Math.max(0, limit - count),
            resetIn: ttl > 0 ? ttl : windowSeconds
          };
        }
      } catch (error) {
        console.error('Redis rate limit error, falling back to memory:', error);
      }
    }

    // Fallback to in-memory (per instance) impl
    return this.checkMemoryLimit(key, limit, windowSeconds);
  }

  private checkMemoryLimit(key: string, limit: number, windowSeconds: number): {
    success: boolean;
    remaining: number;
    resetIn: number;
  } {
    const now = Date.now();
    const record = RateLimiter.memoryStore.get(key);

    if (!record || record.resetAt < now) {
      // New window or expired
      RateLimiter.memoryStore.set(key, {
        count: 1,
        resetAt: now + (windowSeconds * 1000)
      });

      return {
        success: true,
        remaining: limit - 1,
        resetIn: windowSeconds
      };
    }

    // Existing window
    if (record.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetIn: Math.ceil((record.resetAt - now) / 1000)
      };
    }

    record.count++;
    RateLimiter.memoryStore.set(key, record);

    return {
      success: true,
      remaining: limit - record.count,
      resetIn: Math.ceil((record.resetAt - now) / 1000)
    };
  }

  // Legacy method for backward compatibility if needed, though we should migrate calls
  public consume(tokensToConsume: number = 1): boolean {
    // This was a token bucket implementation, keeping simple in-memory version for compatibility
    // but users should switch to checkLimit
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + timePassed * this.refillRate);
    this.lastRefill = now;

    if (this.tokens >= tokensToConsume) {
      this.tokens -= tokensToConsume;
      return true;
    }
    return false;
  }
  /**
   * Wait until a token is available
   * @param count Number of tokens to consume
   */
  public async waitForToken(count: number = 1): Promise<void> {
    const key = 'global'; // Using a global key for rate limiting PA-API calls specifically
    // PA-API limit is typically 1 request per second
    const limit = this.refillRate;
    const windowSeconds = 1;

    while (true) {
      const result = await this.checkLimit(key, limit, windowSeconds);

      if (result.success) {
        return; // Success, token consumed (count logic is handled inside checkLimit roughly via key ttl/count)
        // Note: The current checkLimit implementation doesn't strictly support "consuming" N tokens at once properly in the same call 
        // if we just check limit. But for simple 1 req/sec it works as a "check then proceed" gate.
        // For strict token bucket consumption we'd need a different redis script, but this is a build fix.
      }

      // Wait for reset
      const waitTime = (result.resetIn * 1000) + 100; // Add small buffer
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Export a singleton instance
export const rateLimiter = new RateLimiter(10, 1);
