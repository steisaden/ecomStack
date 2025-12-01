// lib/types/amazon.ts - Implementation file

// Raw PA-API Response Structure (matches external API exactly)
export interface PAAPIItem {
  ASIN: string;
  DetailPageURL?: string;
  Images?: {
    Primary?: {
      Large?: {
        URL: string;
        Height: number;
        Width: number;
      };
    };
  };
  ItemInfo?: {
    Title?: {
      DisplayValue: string;
    };
    Features?: {
      DisplayValues: string[];
    };
    Brand?: {
      DisplayValue: string;
    };
  };
  Offers?: {
    Listings?: Array<{
      Price?: {
        Amount: number;
        Currency: string;
        DisplayAmount: string;
      };
    }>;
  };
}

// Application Model (simplified, flat structure for internal use)
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
  lastFetched: string; // ISO string format for JSON serialization
}

export interface PAAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  host: string;
  region: string;
}

export interface PAAPICredentials {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
}

export enum AmazonAPIErrorType {
  InvalidASIN = 'InvalidASIN',
  RateLimitExceeded = 'RateLimitExceeded',
  AuthenticationFailed = 'AuthenticationFailed',
  ServiceUnavailable = 'ServiceUnavailable',
  Unknown = 'Unknown',
}

export class AmazonAPIError extends Error {
  type: AmazonAPIErrorType;
  statusCode?: number;
  name: string;

  constructor(message: string, type: AmazonAPIErrorType, statusCode?: number) {
    super(message);
    this.name = 'AmazonAPIError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

export interface ProductResponse {
  success: boolean;
  data?: AmazonProduct;
  error?: string;
  cached?: boolean;
}

export interface BatchResponse {
  success: boolean;
  products: AmazonProduct[];
  failedASINs: { ASIN: string; error: string }[];
  error?: string;
}

export interface ValidateResponse {
  success: boolean;
  valid: boolean;
  exists?: boolean;
  error?: string;
}
