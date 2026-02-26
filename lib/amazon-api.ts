import aws4 from 'aws4';

// Amazon Product Advertising API 5.0 Integration
// This service handles Amazon product searches and affiliate link generation

interface AmazonProduct {
  ASIN: string;
  DetailPageURL: string;
  ItemInfo?: {
    Title?: {
      DisplayValue: string;
    };
    Features?: {
      DisplayValues: string[];
    };
    ProductInfo?: {
      Brand?: {
        DisplayValue: string;
      };
    };
  };
  Images?: {
    Primary?: {
      Small?: {
        URL: string;
        Height: number;
        Width: number;
      };
      Medium?: {
        URL: string;
        Height: number;
        Width: number;
      };
      Large?: {
        URL: string;
        Height: number;
        Width: number;
      };
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
  CustomerReviews?: {
    StarRating?: number;
    Count?: number;
  };
}

interface AmazonSearchResponse {
  SearchResult?: {
    Items?: AmazonProduct[];
    TotalResultCount?: number;
    SearchURL?: string;
  };
  Errors?: Array<{
    Code: string;
    Message: string;
  }>;
}

class AmazonAPI {
  private accessKey: string;
  private secretKey: string;
  private associateTag: string;
  private host: string;
  private region: string;
  private serviceName = 'ProductAdvertisingAPI'; // Correct service name for PA-API 5.0

  constructor() {
    // Use consolidated environment variable approach
    this.accessKey = process.env.AMAZON_ACCESS_KEY || process.env.AMAZON_PAAPI_ACCESS_KEY || '';
    this.secretKey = process.env.AMAZON_SECRET_KEY || process.env.AMAZON_PAAPI_SECRET_KEY || '';
    this.associateTag = process.env.AMAZON_ASSOCIATE_TAG || process.env.AMAZON_PAAPI_PARTNER_TAG || '';
    this.host = process.env.AMAZON_HOST || 'webservices.amazon.com';
    this.region = process.env.AMAZON_REGION || 'us-east-1';

    if (!this.accessKey || !this.secretKey || !this.associateTag) {
      console.warn('Amazon API credentials not configured. Amazon affiliate features will be disabled.');
    }
  }

  isConfigured(): boolean {
    const isConfigured = !!(this.accessKey && this.secretKey && this.associateTag);
    if (!isConfigured) {
      console.warn('Amazon API not fully configured. Required: AMAZON_ACCESS_KEY/AMAZON_PAAPI_ACCESS_KEY, AMAZON_SECRET_KEY/AMAZON_PAAPI_SECRET_KEY, AMAZON_ASSOCIATE_TAG/AMAZON_PAAPI_PARTNER_TAG');
    }
    return isConfigured;
  }

  // Test the Amazon API connection with a simple search
  async testConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Amazon API credentials not configured. Please add your Amazon Access Key, Secret Key, and Associate Tag to your environment variables.'
      };
    }

    try {
      // Perform a simple search to verify the connection
      const testProducts = await this.searchProducts('shampoo', 'Beauty', 1);
      return {
        success: true,
        message: `Successfully connected to Amazon API. Found ${testProducts.length} test products.`
      };
    } catch (error: any) {
      console.error('Amazon API connection test failed:', error);
      return {
        success: false,
        error: `Amazon API connection test failed: ${error.message}`
      };
    }
  }

  async searchProducts(
    keywords: string,
    searchIndex: string = 'Beauty',
    itemCount: number = 10
  ): Promise<AmazonProduct[]> {
    if (!this.isConfigured()) {
      console.warn('Amazon API not configured, returning empty results');
      return [];
    }

    // Use mock data if enabled
    if (process.env.AMAZON_USE_MOCK_DATA === 'true') {
      console.log('Using mock Amazon data for development');
      return this.getMockProducts(keywords, itemCount);
    }

    // Log the configuration being used (without exposing secrets)
    console.log('Amazon API Config:', {
      host: this.host,
      region: this.region,
      serviceName: this.serviceName,
      associateTag: this.associateTag ? `${this.associateTag.substring(0, 3)}...` : 'NOT_SET'
    });

    const payload = JSON.stringify({
      Keywords: keywords,
      Resources: [
        'Images.Primary.Small',
        'Images.Primary.Medium',
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ],
      SearchIndex: searchIndex,
      ItemCount: Math.min(itemCount, 10),
      PartnerTag: this.associateTag,
      PartnerType: 'Associates',
      Marketplace: this.host.includes('webservices.amazon.co.uk') ? 'www.amazon.co.uk' :
        this.host.includes('webservices.amazon.co.jp') ? 'www.amazon.co.jp' :
          'www.amazon.com' // Default to US marketplace
    });

    const requestOptions: aws4.Request = {
      host: this.host,
      path: '/paapi5/searchitems',
      method: 'POST',
      service: this.serviceName,
      region: this.region,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
      },
      body: payload
    };

    const signedRequest = aws4.sign(requestOptions, {
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretKey
    });

    // Debug logging to see what URL we're hitting
    const fullUrl = `https://${signedRequest.host}${signedRequest.path}`;
    console.log('Making Amazon API request to:', fullUrl);
    console.log('Request method:', signedRequest.method);
    console.log('Request headers:', signedRequest.headers);

    try {
      const response = await fetch(fullUrl,
        {
          method: signedRequest.method,
          headers: signedRequest.headers as any,
          body: signedRequest.body as any
        }
      );

      console.log('Amazon API response status:', response.status);
      console.log('Amazon API response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('Non-JSON response body:', textResponse);
        throw new Error(`Amazon API request failed: ${response.status} ${response.statusText}. Response: ${textResponse.substring(0, 200)}...`);
      }

      const data: AmazonSearchResponse = await response.json();
      console.log('Amazon API response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        const error = data.Errors?.[0];
        throw new Error(error ? `Amazon API Error: ${error.Code} - ${error.Message}` : `Amazon API request failed: ${response.status} ${response.statusText}`);
      }

      // Type guard to ensure we're getting the right data structure
      const items = data.SearchResult?.Items || [];
      return items.filter((item): item is AmazonProduct =>
        item !== null &&
        typeof item === 'object' &&
        'ASIN' in item &&
        typeof item.ASIN === 'string'
      );
    } catch (error) {
      console.error('Error searching Amazon products:', error);

      // Fallback to mock data if real API fails and we're in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to mock data due to API error');
        return this.getMockProducts(keywords, itemCount);
      }

      throw error;
    }
  }

  // Mock products for development/testing
  private getMockProducts(keywords: string, itemCount: number): AmazonProduct[] {
    const mockProducts: AmazonProduct[] = [
      {
        ASIN: 'B08N5WRWNW',
        DetailPageURL: 'https://www.amazon.com/dp/B08N5WRWNW',
        ItemInfo: {
          Title: {
            DisplayValue: `${keywords} - Premium Beauty Serum`
          },
          Features: {
            DisplayValues: [`Premium ${keywords} formula`, 'Natural ingredients', 'Dermatologist tested']
          },
          ProductInfo: {
            Brand: {
              DisplayValue: 'Beauty Brand'
            }
          }
        },
        Images: {
          Primary: {
            Small: { URL: 'https://via.placeholder.com/150x150', Height: 150, Width: 150 },
            Medium: { URL: 'https://via.placeholder.com/300x300', Height: 300, Width: 300 },
            Large: { URL: 'https://via.placeholder.com/500x500', Height: 500, Width: 500 }
          }
        },
        Offers: {
          Listings: [{
            Price: {
              Amount: 29.99,
              Currency: 'USD',
              DisplayAmount: '$29.99'
            }
          }]
        },
        CustomerReviews: {
          StarRating: 4.5,
          Count: 1250
        }
      },
      {
        ASIN: 'B07XYZ1234',
        DetailPageURL: 'https://www.amazon.com/dp/B07XYZ1234',
        ItemInfo: {
          Title: {
            DisplayValue: `${keywords} - Organic Face Cream`
          },
          Features: {
            DisplayValues: [`Organic ${keywords} blend`, 'Moisturizing formula', 'Suitable for all skin types']
          },
          ProductInfo: {
            Brand: {
              DisplayValue: 'Organic Beauty Co'
            }
          }
        },
        Images: {
          Primary: {
            Small: { URL: 'https://via.placeholder.com/150x150', Height: 150, Width: 150 },
            Medium: { URL: 'https://via.placeholder.com/300x300', Height: 300, Width: 300 },
            Large: { URL: 'https://via.placeholder.com/500x500', Height: 500, Width: 500 }
          }
        },
        Offers: {
          Listings: [{
            Price: {
              Amount: 24.99,
              Currency: 'USD',
              DisplayAmount: '$24.99'
            }
          }]
        },
        CustomerReviews: {
          StarRating: 4.3,
          Count: 890
        }
      },
      {
        ASIN: 'B09ABC5678',
        DetailPageURL: 'https://www.amazon.com/dp/B09ABC5678',
        ItemInfo: {
          Title: {
            DisplayValue: `${keywords} - Natural Hair Oil`
          },
          Features: {
            DisplayValues: [`Natural ${keywords} oil`, 'Nourishing formula', 'For all hair types']
          },
          ProductInfo: {
            Brand: {
              DisplayValue: 'Natural Hair Co'
            }
          }
        },
        Images: {
          Primary: {
            Small: { URL: 'https://via.placeholder.com/150x150', Height: 150, Width: 150 },
            Medium: { URL: 'https://via.placeholder.com/300x300', Height: 300, Width: 300 },
            Large: { URL: 'https://via.placeholder.com/500x500', Height: 500, Width: 500 }
          }
        },
        Offers: {
          Listings: [{
            Price: {
              Amount: 19.99,
              Currency: 'USD',
              DisplayAmount: '$19.99'
            }
          }]
        },
        CustomerReviews: {
          StarRating: 4.7,
          Count: 2100
        }
      }
    ];

    return mockProducts.slice(0, Math.min(itemCount, mockProducts.length));
  }

  // Convert Amazon product to our affiliate product format
  convertToAffiliateProduct(amazonProduct: AmazonProduct): any {
    // Check if product exists and has ASIN
    if (!amazonProduct) {
      console.error('Invalid Amazon product: null or undefined');
      return null;
    }

    const asin = amazonProduct.ASIN;
    if (!asin) {
      console.error('Amazon product missing ASIN:', amazonProduct);
      return null; // Skip products without ASIN
    }

    return {
      title: amazonProduct.ItemInfo?.Title?.DisplayValue || 'Amazon Product',
      description: amazonProduct.ItemInfo?.Features?.DisplayValues?.join('. ') || '',
      price: amazonProduct.Offers?.Listings?.[0]?.Price?.Amount || 0,
      imageUrl: amazonProduct.Images?.Primary?.Large?.URL ||
        amazonProduct.Images?.Primary?.Medium?.URL ||
        amazonProduct.Images?.Primary?.Small?.URL || '',
      affiliateUrl: this.generateAffiliateLink(asin),
      category: 'Beauty',
      tags: [
        'amazon',
        'affiliate'
      ],
      commissionRate: 4,
      platform: 'amazon',
      scheduledPromotions: []
    };
  }

  // Generate affiliate link for a product
  generateAffiliateLink(asin: string): string {
    if (!this.associateTag) {
      return `https://www.amazon.com/dp/${asin}`;
    }
    const baseUrl = `https://www.amazon.com/dp/${asin}`;
    const params = new URLSearchParams({
      tag: this.associateTag,
      linkCode: 'as2',
      camp: '1789',
      creative: '9325'
    });
    return `${baseUrl}?${params.toString()}`;
  }

  // Verify if an ASIN is valid (simple check)
  async verifyASIN(asin: string): Promise<boolean> {
    // Basic ASIN format validation
    if (!asin || asin.length !== 10) {
      return false;
    }

    // Check if ASIN contains only valid characters
    const asinRegex = /^[A-Z0-9]{10}$/;
    if (!asinRegex.test(asin)) {
      return false;
    }

    // For now, assume all properly formatted ASINs are valid
    // In a real implementation, you might want to make a HEAD request to Amazon
    // or use the Product Advertising API to verify
    return true;
  }
}

export const amazonAPI = new AmazonAPI();
export type { AmazonProduct, AmazonSearchResponse };