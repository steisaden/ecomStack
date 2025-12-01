import type { Metadata } from 'next'

import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/types'
import { GlobalSettings, Asset, BlogPost, Product } from '@/lib/types'

/**
 * SEO configuration options for pages
 */
export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: Asset | string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
  noFollow?: boolean
  canonical?: string
}

/**
 * Generate comprehensive metadata for Next.js pages using global settings
 * @param globalSettings - Global settings from Contentful
 * @param pageOptions - Page-specific SEO options
 * @returns Next.js Metadata object
 */
export function generateSEOMetadata(
  globalSettings: GlobalSettings | null,
  pageOptions: SEOProps = {}
): Metadata {
  // Use global settings or fallback to defaults
  const settings = globalSettings || DEFAULT_GLOBAL_SETTINGS
  
  // Merge page-specific options with global defaults
  const {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords = [],
    image: pageImage,
    url: pageUrl = '/',
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
    noIndex = false,
    noFollow = false,
    canonical
  } = pageOptions

  // Build the final title
  const finalTitle = pageTitle 
    ? `${pageTitle} | ${settings.siteTitle}`
    : settings.siteTitle

  // Build the final description
  const finalDescription = pageDescription || settings.siteDescription

  // Merge keywords
  const finalKeywords = [...settings.seoKeywords, ...pageKeywords, ...tags]

  // Determine the image to use
  let finalImage: Asset | undefined
  if (pageImage) {
    if (typeof pageImage === 'string') {
      finalImage = {
        url: pageImage,
        contentType: 'image/jpeg',
        title: pageTitle || settings.siteTitle,
        description: finalDescription
      }
    } else {
      finalImage = pageImage
    }
  } else if (settings.logo) {
    finalImage = settings.logo
  }

  // Build the base URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goddesshairandbeauty.com'
  const fullUrl = new URL(pageUrl, baseUrl).toString()
  const canonicalUrl = canonical ? new URL(canonical, baseUrl).toString() : fullUrl

  // Build robots configuration
  const robotsConfig = {
    index: !noIndex,
    follow: !noFollow,
    googleBot: {
      index: !noIndex,
      follow: !noFollow,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  }

  // Build Open Graph images array
  const ogImages = finalImage ? [
    {
      url: finalImage.url,
      width: finalImage.width || 1200,
      height: finalImage.height || 630,
      alt: finalImage.title || finalTitle,
      type: finalImage.contentType || 'image/jpeg',
    }
  ] : []

  // Build Twitter images array
  const twitterImages = finalImage ? [finalImage.url] : []

  // Build the metadata object
  const metadata: Metadata = {
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords.length > 0 ? finalKeywords : undefined,
    authors: author ? [{ name: author }] : [{ name: settings.siteTitle }],
    creator: settings.siteTitle,
    publisher: settings.siteTitle,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle || settings.siteTitle,
      description: finalDescription,
      url: fullUrl,
      siteName: settings.siteTitle,
      locale: 'en_US',
      type: type as any,
      images: ogImages,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle || settings.siteTitle,
      description: finalDescription,
      images: twitterImages,
      ...(author && { creator: `@${author}` }),
    },
    robots: robotsConfig,
    icons: {
      icon: settings.favicon?.url || '/favicon.ico',
      shortcut: settings.favicon?.url || '/favicon.ico',
      apple: settings.favicon?.url || '/favicon.ico',
    },
  }

  return metadata
}

/**
 * Generate metadata for article/blog post pages
 * @param globalSettings - Global settings from Contentful
 * @param article - Article-specific options
 * @returns Next.js Metadata object
 */
export function generateArticleMetadata(
  globalSettings: GlobalSettings | null,
  article: {
    title: string
    description?: string
    image?: Asset | string
    publishedTime?: string
    modifiedTime?: string
    author?: string
    tags?: string[]
    slug: string
  }
): Metadata {
  return generateSEOMetadata(globalSettings, {
    title: article.title,
    description: article.description,
    image: article.image,
    url: `/blog/${article.slug}`,
    type: 'article',
    publishedTime: article.publishedTime,
    modifiedTime: article.modifiedTime,
    author: article.author,
    tags: article.tags,
  })
}

/**
 * Generate metadata for product pages
 * @param globalSettings - Global settings from Contentful
 * @param product - Product-specific options
 * @returns Next.js Metadata object
 */
export function generateProductMetadata(
  globalSettings: GlobalSettings | null,
  product: {
    title: string
    description?: string
    image?: Asset | string
    price?: number
    inStock?: boolean
    category?: string
    slug: string
  }
): Metadata {
  const description = product.description || `${product.title} - Premium handcrafted beauty product`
  const enhancedDescription = product.price 
    ? `${description} - $${product.price}${product.inStock ? ' - In Stock' : ' - Out of Stock'}`
    : description

  return generateSEOMetadata(globalSettings, {
    title: product.title,
    description: enhancedDescription,
    image: product.image,
    url: `/products/${product.slug}`,
    type: 'website',
    keywords: product.category ? [product.category, 'beauty', 'skincare'] : ['beauty', 'skincare'],
  })
}

/**
 * Generate metadata for collection/category pages
 * @param globalSettings - Global settings from Contentful
 * @param collection - Collection-specific options
 * @returns Next.js Metadata object
 */
export function generateCollectionMetadata(
  globalSettings: GlobalSettings | null,
  collection: {
    title: string
    description?: string
    image?: Asset | string
    url: string
    itemCount?: number
  }
): Metadata {
  const description = collection.description || `Browse our ${collection.title.toLowerCase()} collection`
  const enhancedDescription = collection.itemCount 
    ? `${description} - ${collection.itemCount} items available`
    : description

  return generateSEOMetadata(globalSettings, {
    title: collection.title,
    description: enhancedDescription,
    image: collection.image,
    url: collection.url,
    type: 'website',
  })
}

/**
 * Default metadata for error pages (404, 500, etc.)
 * @param globalSettings - Global settings from Contentful
 * @param errorType - Type of error (404, 500, etc.)
 * @returns Next.js Metadata object
 */
export function generateErrorMetadata(
  globalSettings: GlobalSettings | null,
  errorType: '404' | '500' | 'error' = 'error'
): Metadata {
  const titles = {
    '404': 'Page Not Found',
    '500': 'Server Error',
    'error': 'Error'
  }

  const descriptions = {
    '404': 'The page you are looking for could not be found.',
    '500': 'We are experiencing technical difficulties. Please try again later.',
    'error': 'An error occurred while loading this page.'
  }

  return generateSEOMetadata(globalSettings, {
    title: titles[errorType],
    description: descriptions[errorType],
    noIndex: true,
    noFollow: true,
  })
}