// lib/config/amazon-config.ts

import { PAAPICredentials } from '../types/amazon';

export class AmazonConfig {
  private static instance: AmazonConfig;
  private _credentials: PAAPICredentials | null = null;
  private _isConfigured: boolean = false;
  private _isValid: boolean = false;
  private _validationError: string | null = null;
  private _lastValidationTime: Date | null = null;

  private constructor() {
    this.loadAndValidateConfig();
  }

  public static getInstance(): AmazonConfig {
    if (!AmazonConfig.instance) {
      AmazonConfig.instance = new AmazonConfig();
    }
    return AmazonConfig.instance;
  }

  private loadAndValidateConfig(): void {
    // Validate JWT_SECRET first (critical for authentication)
    if (!process.env.JWT_SECRET) {
      const error = 'CRITICAL: JWT_SECRET environment variable is not set. Authentication will fail.';
      console.error(error);
      throw new Error(error);
    }

    const accessKey = process.env.AMAZON_ACCESS_KEY || process.env.AMAZON_PAAPI_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY || process.env.AMAZON_PAAPI_SECRET_KEY;
    const partnerTag = process.env.AMAZON_ASSOCIATE_TAG || process.env.AMAZON_PAAPI_PARTNER_TAG;

    if (!accessKey || !secretKey || !partnerTag) {
      this._isConfigured = false;
      this._isValid = false;
      this._validationError = 'Missing one or more Amazon PA-API environment variables (AMAZON_ACCESS_KEY/AMAZON_PAAPI_ACCESS_KEY, AMAZON_SECRET_KEY/AMAZON_PAAPI_SECRET_KEY, AMAZON_ASSOCIATE_TAG/AMAZON_PAAPI_PARTNER_TAG).';
      console.warn('Amazon PA-API configuration incomplete:', this._validationError);
    } else {
      this._credentials = { accessKey, secretKey, partnerTag };
      this._isConfigured = true;
      this._isValid = true; // Assume valid until first API call or explicit validation
      this._validationError = null;
      this._lastValidationTime = new Date();
    }
  }

  public get credentials(): PAAPICredentials {
    if (!this._credentials) {
      throw new Error('Amazon PA-API credentials are not configured.');
    }
    return this._credentials;
  }

  public get isConfigured(): boolean {
    return this._isConfigured;
  }

  public get isValid(): boolean {
    return this._isValid;
  }

  public get validationError(): string | null {
    return this._validationError;
  }

  public get lastValidationTime(): Date | null {
    return this._lastValidationTime;
  }

  public setValidationStatus(isValid: boolean, error: string | null = null): void {
    this._isValid = isValid;
    this._validationError = error;
    this._lastValidationTime = new Date();
  }

  public refreshConfig(): void {
    this.loadAndValidateConfig();
  }
}

export const amazonConfig = AmazonConfig.getInstance();
