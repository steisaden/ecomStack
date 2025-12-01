/**
 * Extracts product image from Amazon product page
 * This is an alternative to PA-API when account limitations prevent API access
 */

interface ScrapeResult {
  success: boolean;
  imageUrl?: string;
  title?: string;
  price?: string;
  error?: string;
}

/**
 * Scrapes an Amazon product page to extract product information
 * @param asin The ASIN of the Amazon product
 * @returns ScrapeResult containing image URL and other details
 */
export async function extractProductImageFromAmazon(asin: string): Promise<ScrapeResult> {
  try {
    const url = `https://www.amazon.com/dp/${asin}`;
    
    // Fetch the product page content
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch product page. Status: ${response.status}`
      };
    }

    const html = await response.text();

    // Extract image URL using regex
    // This looks for the main product image in Amazon's structured data
    const imageRegex1 = /"hiRes":"([^"]*)"/;
    const imageRegex2 = /"large":"([^"]*)"/;
    const imageRegex3 = /<div id="imgTagWrapperId"[^>]*>.*?<img[^>]*src="([^"]*1500[^"]*|[^"]*L[0-9]+[^"]*)"/s;
    const imageRegex4 = /<img[^>]*id="landingImage"[^>]*src="([^"]*)"/;
    
    let imageUrl = '';
    let match;

    if (match = html.match(imageRegex1)) {
      imageUrl = match[1];
    } else if (match = html.match(imageRegex2)) {
      imageUrl = match[1];
    } else if (match = html.match(imageRegex3)) {
      imageUrl = match[1];
    } else if (match = html.match(imageRegex4)) {
      imageUrl = match[1];
    }

    // If we still don't have an image URL, try looking in JSON-LD structured data
    if (!imageUrl) {
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.image) {
            imageUrl = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
          }
        } catch (e) {
          // If JSON parsing fails, continue with other methods
        }
      }
    }

    if (!imageUrl) {
      return {
        success: false,
        error: 'Could not extract image URL from product page'
      };
    }

    // Clean up the image URL if needed
    imageUrl = decodeURIComponent(imageUrl.replace(/\\u002F/g, '/'));
    
    // Try to extract additional information
    const titleRegex = /<span[^>]*id="productTitle"[^>]*>([^<]*)</;
    const priceRegex = /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*)</;
    
    let title = '';
    let price = '';
    
    if (match = html.match(titleRegex)) {
      title = match[1].trim();
    }
    
    if (match = html.match(priceRegex)) {
      price = match[1].trim();
    }

    return {
      success: true,
      imageUrl,
      title,
      price
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Error scraping Amazon product: ${error.message}`
    };
  }
}

/**
 * Alternative approach: Generate common Amazon image URL patterns based on ASIN
 * This may work when direct scraping is blocked
 */
export function generateAmazonImageUrl(asin: string): string {
  // Common patterns Amazon uses for product images
  const patterns = [
    `https://m.media-amazon.com/images/P/${asin}.01._SY300_QL70_.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01._SY400_QL70_.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01._SY500_QL70_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SY300_QL70_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SY400_QL70_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SY500_QL70_.jpg`,
    `https://m.media-amazon.com/images/I/${asin}.jpg`,
    `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`
  ];

  // Return the first pattern as default
  return patterns[0];
}