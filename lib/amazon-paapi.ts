// lib/amazon-paapi.ts

import { AmazonProduct, PAAPIItem, AmazonAPIError, AmazonAPIErrorType } from './types/amazon';
import { cacheManager } from './cache-manager';
import { defaultRateLimiter } from './rate-limiter';
import { requestDeduplicator } from './request-deduplicator';
import { amazonConfig } from './config/amazon-config';
import { amazonLogger } from './amazon-logger';

const PAAPI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  retryableErrorTypes: AmazonAPIErrorType[] = [AmazonAPIErrorType.RateLimitExceeded, AmazonAPIErrorType.ServiceUnavailable]
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error instanceof AmazonAPIError && retryableErrorTypes.includes(error.type)) {
      amazonLogger.warn(`Retrying after error: ${error.message}. Retries left: ${retries}`, { errorType: error.type, retriesLeft: retries });
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2, retryableErrorTypes);
    }
    throw error;
  }
}

export class AmazonPAAPIService {
  private client: any;
  private host: string;
  private region: string;

  constructor(host: string, region: string) {
    this.host = host;
    this.region = region;

    if (!amazonConfig.isConfigured) {
      const errorMessage = amazonConfig.validationError || 'Amazon PA-API is not configured.';
      amazonLogger.error('Amazon PA-API configuration error.', new Error(errorMessage));
      throw new Error(errorMessage);
    }

    try {
      // Dynamically import the library and create the client
      const paapi = require('paapi5-nodejs-sdk');
      const defaultClient = paapi.ApiClient.instance;
      defaultClient.accessKey = amazonConfig.credentials.accessKey;
      defaultClient.secretKey = amazonConfig.credentials.secretKey;
      defaultClient.host = host;
      defaultClient.region = region;
      
      this.client = new paapi.DefaultApi();
    } catch (error: any) {
      const errorMessage = `Failed to initialize Amazon PA-API client: ${error.message}`;
      amazonLogger.error('Amazon PA-API client initialization failed.', error);
      throw new Error(errorMessage);
    }
  }

  public validateCredentials(): boolean {
    return amazonConfig.isValid;
  }

  public async validateConfiguration(): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Check if configuration is loaded
      if (!amazonConfig.isConfigured) {
        return { 
          isValid: false, 
          error: amazonConfig.validationError || 'Amazon PA-API not configured' 
        };
      }

      // Test API connectivity with a simple validation call
      const testAsin = 'B08N5WRWNW'; // Known valid ASIN for testing
      await this.validateASIN(testAsin);
      
      amazonConfig.setValidationStatus(true);
      return { isValid: true };
    } catch (error: any) {
      const errorMessage = error instanceof AmazonAPIError 
        ? error.message 
        : `Configuration validation failed: ${error.message}`;
      
      amazonConfig.setValidationStatus(false, errorMessage);
      return { isValid: false, error: errorMessage };
    }
  }

  public validateASINFormat(asin: string): boolean {
    const asinRegex = /^[A-Z0-9]{10}$/;
    return asinRegex.test(asin);
  }

  public sanitizeASIN(asin: string): string {
    return asin.trim().toUpperCase();
  }

  public async validateASIN(asin: string): Promise<{ valid: boolean; exists?: boolean }> {
    const sanitizedAsin = this.sanitizeASIN(asin);
    if (!this.validateASINFormat(sanitizedAsin)) {
      return { valid: false };
    }

    try {
      const product = await this.getProduct(sanitizedAsin);
      return { valid: true, exists: !!product };
    } catch (error) {
      if (error instanceof AmazonAPIError && error.type === AmazonAPIErrorType.InvalidASIN) {
        return { valid: true, exists: false };
      }
      amazonLogger.error(`Error validating ASIN ${sanitizedAsin}:`, error);
      throw error; // Re-throw other errors
    }
  }

  private parseAmazonProduct(item: PAAPIItem): AmazonProduct {
    const price = item.Offers?.Listings?.[0]?.Price;
    return {
      asin: item.ASIN || '',
      url: item.DetailPageURL || '',
      title: item.ItemInfo?.Title?.DisplayValue || '',
      brand: item.ItemInfo?.Brand?.DisplayValue || '',
      features: item.ItemInfo?.Features?.DisplayValues || [],
      imageUrl: item.Images?.Primary?.Large?.URL || '',
      price: price ? {
        amount: price.Amount || 0,
        currency: price.Currency || '',
        displayAmount: price.DisplayAmount || '',
      } : null,
      availability: (item.Offers?.Listings?.length || 0) > 0,
      lastFetched: new Date().toISOString(),
    };
  }

  private generateMockProduct(asin: string): AmazonProduct {
    // Generate realistic mock data for testing
    const mockProducts: Record<string, AmazonProduct> = {
      'B0BCVXRJG2': {
        asin: 'B0BCVXRJG2',
        url: `https://www.amazon.com/dp/${asin}`,
        title: 'Premium Organic Face Oil - Deep Hydration for All Skin Types',
        brand: 'Goddess Care Co',
        features: [
          '100% organic and natural ingredients',
          'Deep moisturizing formula',
          'Suitable for sensitive skin',
          'Vegan and cruelty-free',
          'Non-comedogenic'
        ],
        imageUrl: 'https://m.media-amazon.com/images/I/61nYAN656aL._SL1000_.jpg',
        price: {
          amount: 24.99,
          currency: 'USD',
          displayAmount: '$24.99'
        },
        availability: true,
        lastFetched: new Date().toISOString()
      },
      'B08N5WRWNW': {
        asin: 'B08N5WRWNW',
        url: `https://www.amazon.com/dp/${asin}`,
        title: 'Sample Premium Product for Testing',
        brand: 'Sample Brand',
        features: [
          'High quality materials',
          'Eco-friendly packaging',
          'Satisfaction guaranteed'
        ],
        imageUrl: 'https://m.media-amazon.com/images/I/71nYAN656aL._SL1000_.jpg',
        price: {
          amount: 29.99,
          currency: 'USD',
          displayAmount: '$29.99'
        },
        availability: true,
        lastFetched: new Date().toISOString()
      }
    };

    // If we have a specific mock for this ASIN, return it
    if (mockProducts[asin]) {
      return mockProducts[asin];
    }

    // Otherwise generate generic mock data
    return {
      asin,
      url: `https://www.amazon.com/dp/${asin}`,
      title: `Mock Product for ASIN ${asin}`,
      brand: 'Mock Brand',
      features: [
        'Sample feature 1',
        'Sample feature 2',
        'Sample feature 3'
      ],
      imageUrl: `https://placehold.co/500x500?text=${asin}`,
      price: {
        amount: Math.random() * 100 + 10, // Random price between $10-$110
        currency: 'USD',
        displayAmount: `$${(Math.random() * 100 + 10).toFixed(2)}`
      },
      availability: true,
      lastFetched: new Date().toISOString()
    };
  }

  public async getProduct(asin: string): Promise<{ product: AmazonProduct; cached: boolean } | undefined> {
    // Check if using mock data - only use if explicitly enabled
    if (process.env.AMAZON_USE_MOCK_DATA === 'true') {
      amazonLogger.info(`Using mock data for ASIN ${asin} (AMAZON_USE_MOCK_DATA=true)`);
      return {
        product: this.generateMockProduct(asin),
        cached: false
      };
    }

    const cacheKey = `amazon-product-${asin}`;
    if (cacheManager.has(cacheKey)) {
      amazonLogger.info(`Cache hit for product ${asin}.`);
      const product = cacheManager.get<AmazonProduct>(cacheKey);
      return product ? { product, cached: true } : undefined;
    }

    return requestDeduplicator.deduplicate(cacheKey, async () => {
      return withRetry(async () => {
        await defaultRateLimiter.waitForToken();
        amazonLogger.info(`Fetching product ${asin} from PA-API.`, { asin });

        // Dynamically import types
        const paapi = require('paapi5-nodejs-sdk');
        const getItemsRequest = new paapi.GetItemsRequest();
        getItemsRequest['ItemIds'] = [asin];
        getItemsRequest['Resources'] = [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ByLineInfo',
          'Offers.Listings.Price',
        ];
        getItemsRequest['PartnerTag'] = amazonConfig.credentials.partnerTag;
        getItemsRequest['PartnerType'] = 'Associates';

        try {
          // Use a more generic type for the response since we're dynamically importing
          const response: any = await new Promise((resolve, reject) => {
            this.client.getItems(getItemsRequest, (error: any, data: any) => {
              if (error) {
                console.error('PA-API SDK Error Details:', {
                  message: error.message,
                  code: error.code,
                  statusCode: error.status,
                  response: error.response?.data,
                  fullError: error
                });
                reject(error);
              } else {
                console.log('PA-API Success:', data);
                resolve(data);
              }
            });
          });

          const item = response.ItemsResult?.Items?.[0];

          if (item && item.ASIN) {
            const product = this.parseAmazonProduct(item);
            cacheManager.set(cacheKey, product, PAAPI_CACHE_TTL);
            amazonLogger.info(`Successfully fetched and cached product ${asin}.`, { asin });
            return { product, cached: false };
          } else {
            amazonLogger.warn(`Product with ASIN ${asin} not found in PA-API response.`, { asin, response });
            throw new AmazonAPIError(`Product with ASIN ${asin} not found.`, AmazonAPIErrorType.InvalidASIN);
          }
        } catch (error: any) {
          console.error('Full PA-API error:', error);
          amazonLogger.error(`Error fetching product ${asin}:`, error, { asin });
          
          // Handle different error types comprehensively
          if (error instanceof AmazonAPIError) {
            amazonConfig.setValidationStatus(true);
            throw error;
          }
          
          // Handle HTTP response errors
          if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data || {};
            
            switch (status) {
              case 400:
                amazonConfig.setValidationStatus(true);
                throw new AmazonAPIError(
                  `Invalid request for ASIN ${asin}: ${errorData.message || error.message}`, 
                  AmazonAPIErrorType.InvalidASIN, 
                  400
                );
              case 403:
                amazonConfig.setValidationStatus(false, 'Authentication failed. Check your PA-API credentials.');
                throw new AmazonAPIError(
                  'Authentication failed. Check your PA-API credentials.', 
                  AmazonAPIErrorType.AuthenticationFailed, 
                  403
                );
              case 429:
                amazonConfig.setValidationStatus(true);
                throw new AmazonAPIError(
                  'Rate limit exceeded. Please wait before making more requests.', 
                  AmazonAPIErrorType.RateLimitExceeded, 
                  429
                );
              case 503:
                amazonConfig.setValidationStatus(true);
                throw new AmazonAPIError(
                  'Amazon PA-API service temporarily unavailable.', 
                  AmazonAPIErrorType.ServiceUnavailable, 
                  503
                );
              default:
                amazonConfig.setValidationStatus(true);
                throw new AmazonAPIError(
                  `HTTP ${status} error: ${errorData.message || error.message}`, 
                  AmazonAPIErrorType.Unknown, 
                  status
                );
            }
          }
          
          // Handle network errors
          if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            amazonConfig.setValidationStatus(true);
            throw new AmazonAPIError(
              `Network error: Unable to connect to Amazon PA-API. ${error.message}`, 
              AmazonAPIErrorType.ServiceUnavailable
            );
          }
          
          // Handle SDK-specific errors
          if (error.name === 'ValidationException' || error.name === 'InvalidParameterException') {
            amazonConfig.setValidationStatus(true);
            throw new AmazonAPIError(
              `Invalid request parameters: ${error.message}`, 
              AmazonAPIErrorType.InvalidASIN
            );
          }
          
          // Handle unknown errors
          amazonConfig.setValidationStatus(true);
          throw new AmazonAPIError(
            `Unknown error fetching product ${asin}: ${error.message || 'Unexpected error occurred'}`, 
            AmazonAPIErrorType.Unknown
          );
        }
      });
    });
  }

  public async getProducts(asins: string[]): Promise<AmazonProduct[]> {
    // Check if using mock data
    if (process.env.AMAZON_USE_MOCK_DATA === 'true') {
      amazonLogger.info(`Using mock data for batch ASINs ${asins.join(', ')} (AMAZON_USE_MOCK_DATA=true)`);
      return asins.map(asin => this.generateMockProduct(asin));
    }

    const products: AmazonProduct[] = [];
    const uncachedAsins: string[] = [];

    for (const asin of asins) {
      const cacheKey = `amazon-product-${asin}`;
      if (cacheManager.has(cacheKey)) {
        amazonLogger.info(`Cache hit for product ${asin} in batch.`, { asin });
        products.push(cacheManager.get<AmazonProduct>(cacheKey)!);
      } else {
        uncachedAsins.push(asin);
      }
    }

    if (uncachedAsins.length === 0) {
      return products;
    }

    const batchSize = 10;
    for (let i = 0; i < uncachedAsins.length; i += batchSize) {
      const batchAsins = uncachedAsins.slice(i, i + batchSize);
      const batchCacheKey = `amazon-product-batch-${batchAsins.join('-')}`;

      const batchProducts = await requestDeduplicator.deduplicate(batchCacheKey, async () => {
        return withRetry(async () => {
          await defaultRateLimiter.waitForToken();
          amazonLogger.info(`Fetching batch products ${batchAsins.join(', ')} from PA-API.`, { asins: batchAsins });

          // Dynamically import types
          const { GetItemsRequest } = require('paapi5-nodejs-sdk');
          const getItemsRequest = new GetItemsRequest({
            ItemIds: batchAsins,
            Resources: [
              'Images.Primary.Large',
              'ItemInfo.Title',
              'ItemInfo.Features',
              'ItemInfo.Brand',
              'Offers.Listings.Price',
            ],
            PartnerTag: amazonConfig.credentials.partnerTag,
            PartnerType: 'Associates',
            Marketplace: this.region === 'us' ? 'www.amazon.com' : undefined,
          });

          try {
            // Use a more generic type for the response since we're dynamically importing
            const response: any = await this.client.getItems(getItemsRequest);
            const fetchedItems = response.ItemsResult?.Items || [];
            const parsedProducts = fetchedItems.map(item => this.parseAmazonProduct(item));

            parsedProducts.forEach(product => {
              cacheManager.set(`amazon-product-${product.asin}`, product, PAAPI_CACHE_TTL);
            });
            amazonLogger.info(`Successfully fetched and cached batch products ${batchAsins.join(', ')}.`, { asins: batchAsins });
            return parsedProducts;
          } catch (error: any) {
            amazonLogger.error(`Error fetching batch products ${batchAsins.join(', ')}:`, error, { asins: batchAsins });
            if (error.response && error.response.status === 429) {
              amazonConfig.setValidationStatus(true);
              throw new AmazonAPIError('Rate limit exceeded.', AmazonAPIErrorType.RateLimitExceeded, 429);
            } else if (error.response && error.response.status === 403) {
              amazonConfig.setValidationStatus(false, 'Authentication failed. Check your PA-API credentials.');
              throw new AmazonAPIError('Authentication failed. Check your PA-API credentials.', AmazonAPIErrorType.AuthenticationFailed, 403);
            } else if (error instanceof AmazonAPIError) {
              amazonConfig.setValidationStatus(true);
              throw error;
            } else {
              amazonConfig.setValidationStatus(true);
              throw new AmazonAPIError(error.message || 'Unknown error fetching batch products.', AmazonAPIErrorType.Unknown);
            }
          }
        });
      });
      if (batchProducts) {
        products.push(...batchProducts);
      }
    }

    return products;
  }
}

export const amazonPAAPIService = new AmazonPAAPIService(
  'webservices.amazon.com',
  'us'
);
