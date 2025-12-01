// lib/rate-limiter.ts

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private refillRate: number; // tokens per second
  private capacity: number; // max tokens

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // in seconds
    this.tokens = Math.min(this.capacity, this.tokens + timePassed * this.refillRate);
    this.lastRefill = now;
  }

  public consume(tokensToConsume: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokensToConsume) {
      this.tokens -= tokensToConsume;
      return true;
    }
    return false;
  }

  public async waitForToken(tokensToConsume: number = 1): Promise<void> {
    while (true) {
      this.refill();
      if (this.tokens >= tokensToConsume) {
        this.tokens -= tokensToConsume;
        return;
      }
      // Calculate time to wait for enough tokens
      const tokensNeeded = tokensToConsume - this.tokens;
      const timeToWaitMs = (tokensNeeded / this.refillRate) * 1000;
      await new Promise(resolve => setTimeout(resolve, timeToWaitMs + 10)); // Add a small buffer
    }
  }

  public getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// Export a singleton instance for common use, e.g., 1 request per second
export const defaultRateLimiter = new RateLimiter(1, 1);
