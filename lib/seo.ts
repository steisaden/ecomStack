import type { Metadata } from 'next'
import { globalSettingsService } from './contentful'
import { GlobalSettings, BlogPost, Product, Asset, DEFAULT_GLOBAL_SETTINGS } from './types'
import { 
  generateSEOMetadata, 
  generateArticleMetadata, 
  generateProductMetadata, 
  generateCollectionMetadata,
  generateErrorMetadata,
  type SEOProps 
} from '@/components/SEO'

/**
 * Create a generateMetadata function for pages that need global settings
 * This is a higher-order function that returns a generateMetadata function
 * @param seoOptions - SEO options for the page
 * @returns generateMetadata function for Next.js pages
 */
export function createMetadataGenerator(seoOptions: SEOProps) {
  return async function generateMetadata(): Promise<Metadata> {
    try {
      const globalSettings = await globalSettingsService.getSettingsWithFallback()
      return generateSEOMetadata(globalSettings, seoOptions)
    } catch (error) {
      console.error('Error generating metadata with global settings:', error)
      // Fallback to generating metadata without global settings
      return generateSEOMetadata(null, seoOptions)
    }
  }
}

/**
 * Create a generateMetadata function for article/blog pages
 * @param getArticleData - Function that returns article data
 * @returns generateMetadata function for Next.js pages
 */
export function createArticleMetadataGenerator<T extends { params: any }>(
  getArticleData: (params: T['params']) => Promise<{
    title: string
    description?: string
    image?: any
    publishedTime?: string
    modifiedTime?: string
    author?: string
    tags?: string[]
    slug: string
  } | null>
) {
  return async function generateMetadata({ params }: T): Promise<Metadata> {
    try {
      const [globalSettings, articleData] = await Promise.all([
        globalSettingsService.getSettingsWithFallback(),
        getArticleData(params)
      ])

      if (!articleData) {
        return generateErrorMetadata(globalSettings, '404')
      }

      return generateArticleMetadata(globalSettings, articleData)
    } catch (error) {
      console.error('Error generating article metadata:', error)
      return generateErrorMetadata(null, 'error')
    }
  }
}

/**
 * Create a generateMetadata function for product pages
 * @param getProductData - Function that returns product data
 * @returns generateMetadata function for Next.js pages
 */
export function createProductMetadataGenerator<T extends { params: any }>(
  getProductData: (params: T['params']) => Promise<{
    title: string
    description?: string
    image?: any
    price?: number
    inStock?: boolean
    category?: string
    slug: string
  } | null>
) {
  return async function generateMetadata({ params }: T): Promise<Metadata> {
    try {
      const [globalSettings, productData] = await Promise.all([
        globalSettingsService.getSettingsWithFallback(),
        getProductData(params)
      ])

      if (!productData) {
        return generateErrorMetadata(globalSettings, '404')
      }

      return generateProductMetadata(globalSettings, productData)
    } catch (error) {
      console.error('Error generating product metadata:', error)
      return generateErrorMetadata(null, 'error')
    }
  }
}

/**
 * Create a generateMetadata function for collection/category pages
 * @param getCollectionData - Function that returns collection data
 * @returns generateMetadata function for Next.js pages
 */
export function createCollectionMetadataGenerator(
  getCollectionData: (params?: any) => Promise<{
    title: string
    description?: string
    image?: any
    url: string
    itemCount?: number
  }>
) {
  return async function generateMetadata(): Promise<Metadata> {
    try {
      const [globalSettings, collectionData] = await Promise.all([
        globalSettingsService.getSettingsWithFallback(),
        getCollectionData()
      ])

      return generateCollectionMetadata(globalSettings, collectionData)
    } catch (error) {
      console.error('Error generating collection metadata:', error)
      return generateErrorMetadata(null, 'error')
    }
  }
}

/**
 * Utility function to get global settings for metadata generation
 * Use this when you need to generate metadata manually
 */
export async function getGlobalSettingsForSEO(): Promise<GlobalSettings | null> {
  try {
    return await globalSettingsService.getSettingsWithFallback()
  } catch (error) {
    console.error('Error fetching global settings for SEO:', error)
    return null
  }
}

/**
 * Generate structured data (JSON-LD) for pages
 * @param globalSettings - Global settings from Contentful
 * @param pageData - Page-specific data
 * @returns JSON-LD structured data
 */
export function generateStructuredData(
  globalSettings: GlobalSettings | null,
  pageData: {
    type: 'WebSite' | 'Organization' | 'Product' | 'Article' | 'BlogPosting'
    title?: string
    description?: string
    url?: string
    image?: string
    price?: number
    author?: string
    publishedTime?: string
    modifiedTime?: string
  }
) {
  const settings = globalSettings || { siteTitle: 'Goddess Care Co', siteDescription: 'Handcrafted oils and natural beauty essentials' }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goddesshairandbeauty.com'

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': pageData.type,
    name: pageData.title || settings.siteTitle,
    description: pageData.description || settings.siteDescription,
    url: pageData.url ? new URL(pageData.url, baseUrl).toString() : baseUrl,
  }

  // Add type-specific properties
  switch (pageData.type) {
    case 'WebSite':
      return {
        ...baseStructuredData,
        publisher: {
          '@type': 'Organization',
          name: settings.siteTitle,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }

    case 'Organization':
      return {
        ...baseStructuredData,
        '@type': 'Organization',
        logo: globalSettings?.logo?.url,
        contactPoint: globalSettings?.contactInfo?.email ? {
          '@type': 'ContactPoint',
          email: globalSettings.contactInfo.email,
          contactType: 'customer service',
        } : undefined,
        sameAs: globalSettings?.socialLinks?.map(link => link.url) || [],
      }

    case 'Product':
      return {
        ...baseStructuredData,
        image: pageData.image,
        offers: pageData.price ? {
          '@type': 'Offer',
          price: pageData.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        } : undefined,
        brand: {
          '@type': 'Brand',
          name: settings.siteTitle,
        },
      }

    case 'Article':
    case 'BlogPosting':
      return {
        ...baseStructuredData,
        '@type': 'BlogPosting',
        headline: pageData.title,
        image: pageData.image,
        author: pageData.author ? {
          '@type': 'Person',
          name: pageData.author,
        } : {
          '@type': 'Organization',
          name: settings.siteTitle,
        },
        publisher: {
          '@type': 'Organization',
          name: settings.siteTitle,
          logo: globalSettings?.logo?.url ? {
            '@type': 'ImageObject',
            url: globalSettings.logo.url,
          } : undefined,
        },
        datePublished: pageData.publishedTime,
        dateModified: pageData.modifiedTime || pageData.publishedTime,
      }

    default:
      return baseStructuredData
  }
}