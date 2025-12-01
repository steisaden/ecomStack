// types/amazon.d.ts

import { Item } from 'paapi5-nodejs-sdk';

// The raw response from the PA-API
export type PAAPIItem = Item;

// The flattened application model for an Amazon Product
export interface AmazonProduct {
  asin: string;
  url: string;
  title: string;
  brand: string;
  features: string[];
  imageUrl: string;
  price: {
    amount: number;
    currency: string;
    displayAmount: string;
  } | null;
  availability: boolean;
  lastFetched: Date;
}

export interface PAAPICredentials {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
}

export enum AmazonAPIErrorType {
  RateLimitExceeded,
  ServiceUnavailable,
  InvalidASIN,
  AuthenticationFailed,
  Unknown,
}

export class AmazonAPIError extends Error {
  constructor(
    message: string,
    public type: AmazonAPIErrorType,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AmazonAPIError';
  }
}

export interface ProductResponse {
  success: boolean;
  data?: AmazonProduct;
  error?: string;
  cached: boolean;
}

export interface BatchResponse {
  success: boolean;
  products: AmazonProduct[];
  failedAsins: { asin: string; error: string }[];
}

export interface ValidateResponse {
  valid: boolean;
  exists?: boolean;
  error?: string;
}
