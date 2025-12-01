#!/usr/bin/env node

/**
 * Standalone script to create Contentful content types
 * 
 * Usage:
 *   node scripts/create-contentful-content-types.js
 */

// Load environment variables
require('dotenv').config();
const contentful = require('contentful-management');

// Validate environment variables
const requiredEnvVars = ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_MANAGEMENT_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please add them to your .env file');
  process.exit(1);
}

// Initialize Contentful management client
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
});

// Product content type
const goddessCareProduct = {
  sys: { id: 'goddessCareProduct' },
  name: 'Goddess Care Product',
  description: 'Product information for Goddess Care Co',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
    { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
    { id: 'description', name: 'Description', type: 'RichText', required: false, localized: false },
    { id: 'price', name: 'Price', type: 'Number', required: false, localized: false },
    { id: 'images', name: 'Images', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Asset' } },
    { id: 'category', name: 'Category', type: 'Link', required: false, localized: false, linkType: 'Entry' },
    { id: 'inStock', name: 'In Stock', type: 'Boolean', required: false, localized: false },
    { id: 'isAffiliate', name: 'Is Affiliate Product', type: 'Boolean', required: false, localized: false },
    { id: 'affiliateUrl', name: 'Affiliate URL', type: 'Symbol', required: false, localized: false },
  ]
};

// Blog post content type
const testBlog = {
  sys: { id: 'testBlog' },
  name: 'Blog Post',
  description: 'Blog posts for the website',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
    { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
    { id: 'excerpt', name: 'Excerpt', type: 'RichText', required: false, localized: false },
    { id: 'content', name: 'Content', type: 'RichText', required: true, localized: false },
    { id: 'featuredImage', name: 'Featured Image', type: 'Link', required: false, localized: false, linkType: 'Asset' },
    { id: 'author', name: 'Author', type: 'Link', required: true, localized: false, linkType: 'Entry' },
    { id: 'categories', name: 'Categories', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry' } },
    { id: 'tags', name: 'Tags', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
    { id: 'publishedAt', name: 'Published At', type: 'Date', required: false, localized: false },
    { id: 'views', name: 'Views', type: 'Integer', required: false, localized: false },
    { id: 'likes', name: 'Likes', type: 'Integer', required: false, localized: false },
  ]
};

// Category content type
const category = {
  sys: { id: 'category' },
  name: 'Category',
  description: 'Category for products and blog posts',
  displayField: 'name',
  fields: [
    { id: 'name', name: 'Name', type: 'Symbol', required: true, localized: false },
    { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
  ]
};

// Author content type
const author = {
  sys: { id: 'author' },
  name: 'Author',
  description: 'Blog post authors',
  displayField: 'name',
  fields: [
    { id: 'name', name: 'Name', type: 'Symbol', required: true, localized: false },
    { id: 'avatar', name: 'Avatar', type: 'Link', required: false, localized: false, linkType: 'Asset' },
    { id: 'bio', name: 'Bio', type: 'RichText', required: false, localized: false },
  ]
};

// About Page content type
const aboutPage = {
  sys: { id: 'aboutPage' },
  name: 'About Page',
  description: 'About page content model',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
    { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
    { id: 'content', name: 'Content', type: 'RichText', required: false, localized: false },
    { id: 'seoDescription', name: 'SEO Description', type: 'Text', required: false, localized: false }
  ]
};

// Social Media Settings content type
const socialMediaSettings = {
  sys: { id: 'socialMediaSettings' },
  name: 'Social Media Settings',
  description: 'Global social media links/settings',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: false, localized: false },
    { id: 'facebookUrl', name: 'Facebook URL', type: 'Symbol', required: false, localized: false },
    { id: 'instagramUrl', name: 'Instagram URL', type: 'Symbol', required: false, localized: false },
    { id: 'twitterUrl', name: 'Twitter URL', type: 'Symbol', required: false, localized: false },
    { id: 'tiktokUrl', name: 'TikTok URL', type: 'Symbol', required: false, localized: false },
    { id: 'youtubeUrl', name: 'YouTube URL', type: 'Symbol', required: false, localized: false },
    { id: 'emailAddress', name: 'Email Address', type: 'Symbol', required: false, localized: false },
    { id: 'showSocialLinks', name: 'Show Social Links', type: 'Boolean', required: false, localized: false }
  ]
};

// Yoga Service content type
const yogaService = {
  sys: { id: 'yogaService' },
  name: 'Yoga Service',
  description: 'Luxury yoga and wellness sessions',
  displayField: 'name',
  fields: [
    { id: 'name', name: 'Name', type: 'Symbol', required: true, localized: false },
    { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
    { id: 'description', name: 'Description', type: 'Text', required: false, localized: false },
    { id: 'price', name: 'Price', type: 'Number', required: false, localized: false },
    { id: 'duration', name: 'Duration (mins)', type: 'Integer', required: false, localized: false },
    { id: 'category', name: 'Category', type: 'Symbol', required: false, localized: false },
    { id: 'includedAmenities', name: 'Included Amenities', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
    { id: 'luxuryFeatures', name: 'Luxury Features', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
    { id: 'image', name: 'Image', type: 'Link', required: false, localized: false, linkType: 'Asset' },
    { id: 'displayOrder', name: 'Display Order', type: 'Integer', required: false, localized: false }
  ]
};

// Add-On Experience content type
const addOnExperience = {
  sys: { id: 'addOnExperience' },
  name: 'Add-On Experience',
  description: 'Optional luxury add-ons for services',
  displayField: 'name',
  fields: [
    { id: 'name', name: 'Name', type: 'Symbol', required: true, localized: false },
    { id: 'description', name: 'Description', type: 'Text', required: false, localized: false },
    { id: 'price', name: 'Price', type: 'Number', required: false, localized: false },
    { id: 'applicableServices', name: 'Applicable Services', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
    { id: 'image', name: 'Image', type: 'Link', required: false, localized: false, linkType: 'Asset' }
  ]
};

// Add CTA Button content type
const ctaButton = {
  sys: { id: 'ctaButton' },
  name: 'CTA Button',
  description: 'Call-to-action button model',
  displayField: 'text',
  fields: [
    { id: 'text', name: 'Text', type: 'Symbol', required: true, localized: false },
    { id: 'href', name: 'Href', type: 'Symbol', required: true, localized: false },
    { id: 'variant', name: 'Variant', type: 'Symbol', required: true, localized: false, validations: [{ in: ['primary', 'secondary', 'accent'] }] },
    { id: 'external', name: 'External', type: 'Boolean', required: false, localized: false }
  ]
};

// Navigation Item content type
const navigationItem = {
  sys: { id: 'navigationItem' },
  name: 'Navigation Item',
  description: 'Primary/secondary navigation links with nesting',
  displayField: 'label',
  fields: [
    { id: 'label', name: 'Label', type: 'Symbol', required: true, localized: false },
    { id: 'href', name: 'Href', type: 'Symbol', required: true, localized: false },
    { id: 'icon', name: 'Icon', type: 'Symbol', required: false, localized: false },
    { id: 'external', name: 'External', type: 'Boolean', required: false, localized: false },
    { id: 'disabled', name: 'Disabled', type: 'Boolean', required: false, localized: false },
    { id: 'order', name: 'Order', type: 'Integer', required: false, localized: false },
    { id: 'children', name: 'Children', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['navigationItem'] }] } }
  ]
};

// Footer Section content type
const footerSection = {
  sys: { id: 'footerSection' },
  name: 'Footer Section',
  description: 'Footer column with section title and links',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
    { id: 'links', name: 'Links', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['navigationItem'] }] } },
    { id: 'order', name: 'Order', type: 'Integer', required: false, localized: false }
  ]
};

// Contact Info content type
const contactInfo = {
  sys: { id: 'contactInfo' },
  name: 'Contact Info',
  description: 'Global contact information',
  displayField: 'email',
  fields: [
    { id: 'email', name: 'Email', type: 'Symbol', required: false, localized: false },
    { id: 'phone', name: 'Phone', type: 'Symbol', required: false, localized: false },
    { id: 'address', name: 'Address', type: 'Text', required: false, localized: false }
  ]
};

// Social Link content type
const socialLink = {
  sys: { id: 'socialLink' },
  name: 'Social Link',
  description: 'Platform and URL with optional icon',
  displayField: 'platform',
  fields: [
    { id: 'platform', name: 'Platform', type: 'Symbol', required: true, localized: false },
    { id: 'url', name: 'URL', type: 'Symbol', required: true, localized: false },
    { id: 'icon', name: 'Icon', type: 'Link', required: false, localized: false, linkType: 'Asset' }
  ]
};

// Hero Content content type
const heroContent = {
  sys: { id: 'heroContent' },
  name: 'Hero Content',
  description: 'Homepage hero configuration',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
    { id: 'subtitle', name: 'Subtitle', type: 'Symbol', required: false, localized: false },
    { id: 'backgroundImage', name: 'Background Image', type: 'Link', required: false, localized: false, linkType: 'Asset' },
    { id: 'primaryCTA', name: 'Primary CTA', type: 'Link', required: false, localized: false, linkType: 'Entry', validations: [{ linkContentType: ['ctaButton'] }] },
    { id: 'secondaryCTA', name: 'Secondary CTA', type: 'Link', required: false, localized: false, linkType: 'Entry', validations: [{ linkContentType: ['ctaButton'] }] }
  ]
};

// Global Settings content type
const globalSettings = {
  sys: { id: 'globalSettings' },
  name: 'Global Settings',
  description: 'Site-wide settings, navigation, and metadata',
  displayField: 'siteTitle',
  fields: [
    { id: 'siteTitle', name: 'Site Title', type: 'Symbol', required: true, localized: false },
    { id: 'siteDescription', name: 'Site Description', type: 'Text', required: false, localized: false },
    { id: 'seoKeywords', name: 'SEO Keywords', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
    { id: 'favicon', name: 'Favicon', type: 'Link', required: false, localized: false, linkType: 'Asset' },
    { id: 'logo', name: 'Logo', type: 'Link', required: false, localized: false, linkType: 'Asset' },
    { id: 'primaryNavigation', name: 'Primary Navigation', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['navigationItem'] }] } },
    { id: 'footerNavigation', name: 'Footer Navigation', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['footerSection'] }] } },
    { id: 'contactInfo', name: 'Contact Info', type: 'Link', required: false, localized: false, linkType: 'Entry', validations: [{ linkContentType: ['contactInfo'] }] },
    { id: 'socialLinks', name: 'Social Links', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['socialLink'] }] } },
    { id: 'heroContent', name: 'Hero Content', type: 'Link', required: false, localized: false, linkType: 'Entry', validations: [{ linkContentType: ['heroContent'] }] },
    { id: 'featuredProducts', name: 'Featured Products', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['goddessCareProduct'] }] } },
    { id: 'copyrightText', name: 'Copyright Text', type: 'Text', required: false, localized: false },
    { id: 'footerSections', name: 'Footer Sections', type: 'Array', required: false, localized: false, items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['footerSection'] }] } }
  ]
};

// Affiliate Product content type
const affiliateProduct = {
  sys: { id: 'affiliateProduct' },
  name: 'Affiliate Product',
  description: 'Affiliate products for commission-based sales',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
    { id: 'description', name: 'Description', type: 'Text', required: false, localized: false },
    { id: 'price', name: 'Price', type: 'Number', required: false, localized: false },
    { id: 'imageUrl', name: 'Image URL', type: 'Symbol', required: false, localized: false },
    { id: 'affiliateUrl', name: 'Affiliate URL', type: 'Symbol', required: true, localized: false },
    { id: 'category', name: 'Category', type: 'Symbol', required: false, localized: false },
    { id: 'tags', name: 'Tags', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
    { id: 'commissionRate', name: 'Commission Rate', type: 'Number', required: false, localized: false },
    { id: 'platform', name: 'Platform', type: 'Symbol', required: false, localized: false },
    { id: 'performance', name: 'Performance', type: 'Object', required: false, localized: false },
    { id: 'status', name: 'Status', type: 'Symbol', required: false, localized: false, validations: [{ in: ['active', 'inactive', 'pending'] }] },
    { id: 'scheduledPromotions', name: 'Scheduled Promotions', type: 'Array', required: false, localized: false, items: { type: 'Object' } }
  ]
};

async function createContentTypes() {
  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment('master');
    
    const contentTypes = [
      { id: 'goddessCareProduct', definition: goddessCareProduct },
      { id: 'testBlog', definition: testBlog },
      { id: 'category', definition: category },
      { id: 'author', definition: author },
      { id: 'aboutPage', definition: aboutPage },
      { id: 'socialMediaSettings', definition: socialMediaSettings },
      { id: 'yogaService', definition: yogaService },
      { id: 'addOnExperience', definition: addOnExperience },
      { id: 'ctaButton', definition: ctaButton },
      { id: 'navigationItem', definition: navigationItem },
      { id: 'footerSection', definition: footerSection },
      { id: 'contactInfo', definition: contactInfo },
      { id: 'socialLink', definition: socialLink },
      { id: 'heroContent', definition: heroContent },
      { id: 'globalSettings', definition: globalSettings },
      { id: 'affiliateProduct', definition: affiliateProduct }
    ];
    
    for (const { id, definition } of contentTypes) {
      try {
        // Check if content type with the target ID already exists
        try {
          await environment.getContentType(id);
          console.log(`Content type '${id}' already exists, skipping...`);
          continue;
        } catch (error) {
          // Not found, proceed to create with deterministic ID
        }
        
        console.log(`Creating content type with ID: ${id}`);
        const { sys, ...rest } = definition; // remove sys since API will set it from ID arg
        const contentType = await environment.createContentTypeWithId(id, rest);
        await contentType.publish();
        console.log(`Successfully created and published: ${id}`);
      } catch (error) {
        console.error(`Failed to create ${id}:`, error.message);
      }
    }
    
    console.log('Content type creation process completed');
  } catch (error) {
    console.error('Error during content type creation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createContentTypes();
}