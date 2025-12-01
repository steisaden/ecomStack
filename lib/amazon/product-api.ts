import { AmazonProductData, AmazonProductResponse } from "./types";
import crypto from 'crypto';

// Basic rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

class AmazonProductAPI {
    private accessKey: string;
    private secretKey: string;
    private associateTag: string;
    private host: string;
    private region: string;

    constructor() {
        this.accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY || "";
        this.secretKey = process.env.AMAZON_PAAPI_SECRET_KEY || "";
        this.associateTag = process.env.AMAZON_ASSOCIATE_TAG || "";
        this.host = "webservices.amazon.com";
        this.region = "us-east-1";

        if (!this.accessKey || !this.secretKey || !this.associateTag) {
            console.warn("Amazon PAAPI credentials are not fully configured. API calls will fail.");
        }
    }

    private createSignature(stringToSign: string, secretKey: string): string {
        return crypto
            .createHmac('sha256', secretKey)
            .update(stringToSign)
            .digest('base64');
    }

    private createCanonicalRequest(method: string, uri: string, queryString: string, headers: Record<string, string>, payload: string): string {
        const canonicalHeaders = Object.keys(headers)
            .sort()
            .map(key => `${key.toLowerCase()}:${headers[key]}`)
            .join('\n');
        
        const signedHeaders = Object.keys(headers)
            .sort()
            .map(key => key.toLowerCase())
            .join(';');

        const hashedPayload = crypto.createHash('sha256').update(payload).digest('hex');

        return [
            method,
            uri,
            queryString,
            canonicalHeaders,
            '',
            signedHeaders,
            hashedPayload
        ].join('\n');
    }

    private async makeApiRequest(asin: string, retryOptions: RetryOptions = { maxRetries: 3, baseDelay: 1000, maxDelay: 8000 }): Promise<any> {
        // Use mock data in development or when explicitly enabled
        if (process.env.NODE_ENV === 'development' || process.env.AMAZON_USE_MOCK_DATA === 'true') {
            console.log(`Using mock API data for ASIN: ${asin}`);
            return this.getMockResponse(asin);
        }

        if (!this.accessKey || !this.secretKey || !this.associateTag) {
            throw new Error('Amazon PAAPI credentials not configured');
        }

        const payload = JSON.stringify({
            ItemIds: [asin],
            Resources: [
                "ItemInfo.Title",
                "ItemInfo.Features",
                "Images.Primary.Large",
                "Offers.Listings.Price",
                "Offers.Listings.Availability.Type"
            ],
            PartnerTag: this.associateTag,
            PartnerType: "Associates",
            Marketplace: "www.amazon.com"
        });

        const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
        const date = timestamp.substr(0, 8);

        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': this.host,
            'X-Amz-Date': timestamp,
            'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
        };

        // Create AWS Signature Version 4
        const canonicalRequest = this.createCanonicalRequest('POST', '/paapi5/getitems', '', headers, payload);
        const credentialScope = `${date}/${this.region}/ProductAdvertisingAPI/aws4_request`;
        const stringToSign = [
            'AWS4-HMAC-SHA256',
            timestamp,
            credentialScope,
            crypto.createHash('sha256').update(canonicalRequest).digest('hex')
        ].join('\n');

        const kDate = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(date).digest();
        const kRegion = crypto.createHmac('sha256', kDate).update(this.region).digest();
        const kService = crypto.createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
        const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
        const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

        const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=${signature}`;

        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
            try {
                // Rate limiting: Amazon PAAPI allows 1 request per second
                if (attempt > 0) {
                    const delayMs = Math.min(
                        retryOptions.baseDelay * Math.pow(2, attempt - 1),
                        retryOptions.maxDelay
                    );
                    await delay(delayMs);
                }

                const response = await fetch(`https://${this.host}/paapi5/getitems`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Authorization': authorizationHeader
                    },
                    body: payload
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Amazon API error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                
                // Handle Amazon API errors
                if (data.Errors && data.Errors.length > 0) {
                    const error = data.Errors[0];
                    if (error.Code === 'TooManyRequests' && attempt < retryOptions.maxRetries) {
                        lastError = new Error(`Rate limited: ${error.Message}`);
                        continue; // Retry on rate limit
                    }
                    throw new Error(`Amazon API error: ${error.Code} - ${error.Message}`);
                }

                return data;

            } catch (error: any) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error.message.includes('InvalidParameterValue') || 
                    error.message.includes('AuthFailure') ||
                    attempt === retryOptions.maxRetries) {
                    throw error;
                }
                
                console.warn(`Amazon API request attempt ${attempt + 1} failed:`, error.message);
            }
        }

        throw lastError || new Error('Amazon API request failed after all retries');
    }

    private getMockResponse(asin: string): any {
        // Mock response for development/testing
        if (asin === "B000000000") {
            return {
                Errors: [{
                    Code: "InvalidParameterValue",
                    Message: "The value you specified for ASIN is invalid.",
                }]
            };
        }

        return {
            ItemsResult: {
                Items: [{
                    ASIN: asin,
                    ItemInfo: {
                        Title: {
                            DisplayValue: `Mock Product ${asin}`,
                        },
                        Features: {
                            DisplayValues: ["Feature 1", "Feature 2"],
                        },
                    },
                    Images: {
                        Primary: {
                            Large: {
                                URL: `https://m.media-amazon.com/images/I/71${Math.floor(Math.random() * 90 + 10)}gG+4+3L._AC_SL1500_.jpg`,
                            },
                        },
                    },
                    Offers: {
                        Listings: [{
                            Price: {
                                Amount: Math.floor(Math.random() * 100) + 10,
                            },
                            Availability: {
                                Type: "NOW",
                            },
                        }],
                    },
                }],
            },
        };
    }


    async getProductData(asin: string): Promise<AmazonProductResponse> {
        const { recordTimer, increment, recordMetric } = await import('../monitoring/production-monitoring');
        const timer = recordTimer('amazon_api_request');
        
        try {
            if (!this.accessKey) {
                increment('amazon_api_error', 1, { error_type: 'auth_failure' });
                return { error: { code: "AuthFailure", message: "Missing Amazon API credentials." } };
            }

            const response = await this.makeApiRequest(asin);

            if (response.Errors) {
                increment('amazon_api_error', 1, { error_type: 'api_error', error_code: response.Errors[0].Code });
                
                // Calculate error rate
                const totalRequests = (await import('../monitoring/production-monitoring')).productionMonitoring.getLatestMetricValue('amazon_api_total_requests') || 0;
                const totalErrors = (await import('../monitoring/production-monitoring')).productionMonitoring.getLatestMetricValue('amazon_api_error') || 0;
                const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;
                recordMetric('amazon_api_error_rate', errorRate);
                
                return { error: response.Errors[0] };
            }

            const item = response.ItemsResult.Items[0];
            const productData: AmazonProductData = {
                asin: item.ASIN,
                title: item.ItemInfo.Title.DisplayValue,
                imageUrl: item.Images.Primary.Large.URL,
                price: item.Offers.Listings[0].Price.Amount,
                availability: item.Offers.Listings[0].Availability.Type === "NOW",
                lastUpdated: new Date().toISOString(),
            };

            increment('amazon_api_success', 1);
            increment('amazon_api_total_requests', 1);
            
            return { data: productData };
        } catch (error: any) {
            increment('amazon_api_error', 1, { error_type: 'internal_error' });
            increment('amazon_api_total_requests', 1);
            
            return { error: { code: "InternalError", message: error.message } };
        } finally {
            timer();
        }
    }

    async getProductImage(asin: string): Promise<string | null> {
        const result = await this.getProductData(asin);
        return result.data?.imageUrl || null;
    }

    async validateProductExists(asin: string): Promise<boolean> {
        const result = await this.getProductData(asin);
        return !!result.data;
    }
}

export const amazonProductApi = new AmazonProductAPI();
