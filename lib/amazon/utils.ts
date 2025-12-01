// Utility functions for Amazon product processing

/**
 * Extracts ASIN from Amazon URL
 * @param url The Amazon product URL
 * @returns The extracted ASIN or null if not found
 */
export function extractAsinFromUrl(url: string): string | null {
  // Regular expression to match ASIN in various Amazon URL formats
  const asinRegex = /(?:\/dp\/|\/gp\/product\/|\/exec\/obidos\/asin\/)([A-Z0-9]{10})/;
  const match = url.match(asinRegex);
  return match ? match[1] : null;
}

/**
 * Validates ASIN format
 * @param asin The ASIN to validate
 * @returns Whether the ASIN is valid
 */
export function validateAsin(asin: string): boolean {
  return /^[A-Z0-9]{10}$/.test(asin);
}

/**
 * Validates if a URL is an Amazon product URL
 * @param url The URL to validate
 * @returns Whether the URL is an Amazon product URL
 */
export function isAmazonUrl(url: string): boolean {
  return /^https?:\/\/(?:www\.)?amazon\.[a-z.]+\/.*$/.test(url.toLowerCase());
}

/**
 * Transform Amazon API response to internal product format
 * @param amazonResponse The raw response from Amazon API
 * @returns Transformed product data
 */
export function transformAmazonResponse(amazonResponse: any): any {
  // This would contain the appropriate transformation logic
  // depending on the exact structure of the Amazon API response
  return {
    asin: amazonResponse.ASIN,
    title: amazonResponse.ItemInfo?.Title?.DisplayValue || 'Unknown Title',
    imageUrl: amazonResponse.Images?.Primary?.Large?.URL || '',
    price: amazonResponse.Offers?.Listings?.[0]?.Price?.Amount || 0,
    availability: amazonResponse.Offers?.Listings?.[0]?.Availability?.Message !== 'Currently unavailable',
    lastUpdated: new Date().toISOString()
  };
}