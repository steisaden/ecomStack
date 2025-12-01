// URL validation for affiliate links
const TRUSTED_DOMAINS = [
  'amazon.com',
  'amazon.co.uk', 
  'amazon.ca',
  'amazon.de',
  'amazon.fr',
  'amazon.it',
  'amazon.es',
  'amazon.co.jp',
  'amazon.in',
  'amazon.com.au',
  'amzn.to', // Amazon short links
  'a.co'     // Amazon short links
];

export function isValidAffiliateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if it's a trusted domain or subdomain
    return TRUSTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export function validateAndSanitizeUrl(url: string): string | null {
  if (!url) return null;
  
  // Remove any potential XSS attempts
  const cleanUrl = url.trim();
  
  if (!isValidAffiliateUrl(cleanUrl)) {
    console.warn(`Blocked potentially dangerous URL: ${cleanUrl}`);
    return null;
  }
  
  return cleanUrl;
}