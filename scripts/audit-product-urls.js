#!/usr/bin/env node

/**
 * Audit script to check for potentially dangerous product URLs
 */

require('dotenv').config();
const contentful = require('contentful');

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

const TRUSTED_DOMAINS = [
  'amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de', 'amazon.fr',
  'amazon.it', 'amazon.es', 'amazon.co.jp', 'amazon.in', 'amazon.com.au',
  'amzn.to', 'a.co'
];

function isValidAffiliateUrl(url) {
  if (!url) return true; // Empty URLs are okay
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return TRUSTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

async function auditProductUrls() {
  try {
    console.log('🔍 Auditing product URLs for security issues...\n');
    
    const entries = await client.getEntries({
      content_type: 'goddessCareProduct',
      limit: 1000,
    });
    
    const dangerousProducts = [];
    const safeProducts = [];
    
    entries.items.forEach(item => {
      const fields = item.fields;
      const affiliateUrl = fields.affiliateUrl;
      
      if (fields.isAffiliate && affiliateUrl) {
        if (isValidAffiliateUrl(affiliateUrl)) {
          safeProducts.push({
            id: item.sys.id,
            title: fields.title,
            url: affiliateUrl
          });
        } else {
          dangerousProducts.push({
            id: item.sys