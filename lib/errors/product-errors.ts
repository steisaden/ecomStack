// Custom error classes for different failure types in the product system

export class ProductError extends Error {
  public code: string;
  public timestamp: Date;
  public context?: any;

  constructor(message: string, code: string, context?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class AmazonAPIError extends ProductError {
  constructor(message: string, context?: any) {
    super(message, 'AMAZON_API_ERROR', context);
  }
}

export class LinkValidationError extends ProductError {
  constructor(message: string, context?: any) {
    super(message, 'LINK_VALIDATION_ERROR', context);
  }
}

export class CacheError extends ProductError {
  constructor(message: string, context?: any) {
    super(message, 'CACHE_ERROR', context);
  }
}

export class BackgroundJobError extends ProductError {
  constructor(message: string, context?: any) {
    super(message, 'BACKGROUND_JOB_ERROR', context);
  }
}

export class ContentfulAPIError extends ProductError {
  constructor(message: string, context?: any) {
    super(message, 'CONTENTFUL_API_ERROR', context);
  }
}

// Error categorization
export type ErrorCategory = 'temporary' | 'permanent' | 'system';

export interface CategorizedError {
  error: ProductError;
  category: ErrorCategory;
  retryable: boolean;
}

export function categorizeError(error: ProductError): CategorizedError {
  // Temporary errors - typically network-related or rate limiting
  if (
    error.code.includes('NETWORK') || 
    error.code.includes('TIMEOUT') || 
    error.code.includes('RATE_LIMIT') ||
    error.code === 'AMAZON_API_ERROR'
  ) {
    return {
      error,
      category: 'temporary',
      retryable: true
    };
  }
  
  // Permanent errors - typically due to invalid input or resource not found
  if (
    error.code.includes('NOT_FOUND') || 
    error.code.includes('INVALID_INPUT') || 
    error.code.includes('AUTH') ||
    error.code === 'LINK_VALIDATION_ERROR'
  ) {
    return {
      error,
      category: 'permanent',
      retryable: false
    };
  }
  
  // System errors - typically infrastructure related
  if (
    error.code.includes('DATABASE') || 
    error.code.includes('SYSTEM') || 
    error.code === 'CACHE_ERROR'
  ) {
    return {
      error,
      category: 'system',
      retryable: true // Some system errors may be resolved by retrying
    };
  }
  
  // Default to temporary for unknown errors
  return {
    error,
    category: 'temporary',
    retryable: true
  };
}

// Error recovery strategies
export interface ErrorRecoveryStrategy {
  shouldRetry(error: ProductError): boolean;
  getRetryDelay(attempt: number): number;
  shouldNotify(error: ProductError): boolean;
}

export class DefaultErrorRecoveryStrategy implements ErrorRecoveryStrategy {
  shouldRetry(error: ProductError): boolean {
    const categorized = categorizeError(error);
    return categorized.retryable;
  }

  getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return Math.pow(2, attempt) * 1000;
  }

  shouldNotify(error: ProductError): boolean {
    const categorized = categorizeError(error);
    // Notify for permanent errors or system errors
    return categorized.category === 'permanent' || categorized.category === 'system';
  }
}