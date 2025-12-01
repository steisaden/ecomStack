import { createClient } from 'contentful'
import { unstable_cache, revalidateTag } from 'next/cache'
import { 
  deduplicateRequest,
  createCachedFunction,
  CACHE_DURATIONS,
  globalBatcher,
  performanceMonitor
} from './performance'

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  // Added configurable environment with sensible defaults
  environment: process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master',
})

// Import types from the shared types file
import { 
  Product,
  BlogPost,
  AboutContent,
  SocialMediaSettings,
  Asset,
  NavigationItem,
  SocialLink,
  ContactInfo,
  CTAButton,
  HeroContent,
  FooterSection,
  GlobalSettings,
  Category,
  Author,
  DEFAULT_GLOBAL_SETTINGS
} from './types'

// Import Contentful raw types from shared types file
import type {
  ContentfulProduct,
  ContentfulBlogPost,
  ContentfulAboutContent,
  ContentfulSocialMediaSettings,
  ContentfulAsset,
  ContentfulNavigationItem,
  ContentfulSocialLink,
  ContentfulContactInfo,
  ContentfulCTAButton,
  ContentfulHeroContent,
  ContentfulFooterSection,
  ContentfulGlobalSettings,
  ContentfulCategory,
  ContentfulAuthor
} from './types'

import { Entry } from 'contentful'

// Optimized helper function for rich text extraction with memoization
const textExtractionCache = new Map<string, string>()

// Blog content type ID (configurable via env, defaults to 'testBlog')
const BLOG_CT_ID = process.env.CONTENTFUL_BLOG_CT_ID || 'testBlog'

function extractTextFromRichText(richTextContent: any): string {
  if (!richTextContent) return ''
  
  // If it's already a string, return it
  if (typeof richTextContent === 'string') return richTextContent
  
  // Create cache key for memoization
  const cacheKey = JSON.stringify(richTextContent)
  if (textExtractionCache.has(cacheKey)) {
    return textExtractionCache.get(cacheKey)!
  }
  
  let result = ''
  
  // If it's a rich text object, extract the text content efficiently
  if (richTextContent.content && Array.isArray(richTextContent.content)) {
    result = richTextContent.content
      .filter((node: any) => node.nodeType === 'paragraph' && node.content)
      .map((node: any) => 
        node.content
          .filter((textNode: any) => textNode.value)
          .map((textNode: any) => textNode.value)
          .join('')
      )
      .join(' ')
      .trim()
  }
  
  // Cache the result for future use
  if (textExtractionCache.size > 100) {
    // Clear oldest entries to prevent memory leaks
    const firstKey = textExtractionCache.keys().next().value
    if (firstKey !== undefined) {
      textExtractionCache.delete(firstKey)
    }
  }
  textExtractionCache.set(cacheKey, result)
  
  return result
}

// Optimized transformation functions with performance improvements
function transformContentfulAsset(asset: ContentfulAsset): Asset {
  const url = asset.fields.file.url
  return {
    url: url.startsWith('//') ? `https:${url}` : url,
    title: asset.fields.title || '',
    description: asset.fields.description || '',
    width: asset.fields.file.details.image?.width,
    height: asset.fields.file.details.image?.height,
    contentType: asset.fields.file.contentType
  }
}

// Navigation item transformation with early returns for performance
function transformNavigationItem(item: Entry<any>, index: number): NavigationItem {
  const fields = item.fields
  
  return {
    id: item.sys.id || `nav-${index}`,
    label: fields.label ? String(fields.label) : '',
    href: fields.href ? String(fields.href) : '',
    icon: fields.icon ? String(fields.icon) : undefined,
    external: Boolean(fields.external),
    disabled: Boolean(fields.disabled),
    order: fields.order ? Number(fields.order) : index,
    children: Array.isArray(fields.children) 
      ? fields.children
          .filter((child): child is Entry<any> => Boolean(child && typeof child === 'object' && 'sys' in child))
          .map((child, childIndex) => transformNavigationItem(child, childIndex))
      : undefined
  }
}

function transformSocialLink(link: ContentfulSocialLink): SocialLink {
  return {
    platform: link.fields.platform,
    url: link.fields.url,
    icon: link.fields.icon ? transformContentfulAsset(link.fields.icon) : undefined
  }
}

function transformCTAButton(cta: ContentfulCTAButton): CTAButton {
  return {
    text: cta.fields.text,
    href: cta.fields.href,
    variant: cta.fields.variant,
    external: cta.fields.external || false
  }
}

function transformHeroContent(hero: any): HeroContent {
  return {
    title: hero.fields.title as string,
    subtitle: hero.fields.subtitle as string | undefined,
    backgroundImage: hero.fields.backgroundImage ? transformContentfulAsset(hero.fields.backgroundImage as any) : undefined,
    primaryCTA: hero.fields.primaryCTA ? transformCTAButton(hero.fields.primaryCTA as any) : undefined,
    secondaryCTA: hero.fields.secondaryCTA ? transformCTAButton(hero.fields.secondaryCTA as any) : undefined
  }
}

function transformFooterSection(section: any): FooterSection {
  return {
    title: section.fields.title as string,
    links: (section.fields.links as any[])?.map((link, index) => transformNavigationItem(link, index)) || [],
    order: section.fields.order as number
  }
}

function transformCategory(category: ContentfulCategory): Category {
  return {
    name: category.fields.name,
    slug: category.fields.slug,
  }
}

function transformAuthor(author: ContentfulAuthor): Author {
  return {
    name: author.fields.name,
    avatar: author.fields.avatar ? transformContentfulAsset(author.fields.avatar) : undefined,
    bio: author.fields.bio,
  }
}

// Optimized product transformation with early validation
function transformProduct(item: Entry<any>): Product {
  const fields = item.fields
  
  return {
    sys: { id: item.sys.id },
    title: fields.title ? String(fields.title) : '',
    description: extractTextFromRichText(fields.description),
    price: fields.price ? Number(fields.price) : 0,
    images: Array.isArray(fields.images) 
      ? fields.images.filter(Boolean).map((img: any) => transformContentfulAsset(img))
      : [],
    category: fields.category && typeof fields.category === 'object' 
      ? transformCategory(fields.category as any) 
      : undefined,
    inStock: fields.inStock !== false,
    isAffiliate: Boolean(fields.isAffiliate),
    affiliateUrl: fields.affiliateUrl ? String(fields.affiliateUrl) : '',
    slug: fields.slug ? String(fields.slug) : '',
  }
}

// Optimized blog post transformation
function transformBlogPost(item: any): BlogPost {
  const fields = item.fields
  
  return {
    sys: {
      id: item.sys.id,
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
      publishedVersion: item.sys.publishedVersion,
    },
    title: fields.title || '',
    content: fields.content,
    excerpt: extractTextFromRichText(fields.excerpt) || '',
    featuredImage: fields.featuredImage ? transformContentfulAsset(fields.featuredImage) : undefined,
    author: transformAuthor(fields.author),
    categories: Array.isArray(fields.categories) ? fields.categories.map(transformCategory) : [],
    tags: Array.isArray(fields.tags) ? fields.tags : [],
    publishedAt: fields.publishedAt || '',
    slug: fields.slug || '',
  }
}



function transformGlobalSettings(contentfulSettings: Entry<any>): GlobalSettings {
  return {
    siteTitle: String(contentfulSettings.fields.siteTitle || DEFAULT_GLOBAL_SETTINGS.siteTitle),
    siteDescription: String(contentfulSettings.fields.siteDescription || DEFAULT_GLOBAL_SETTINGS.siteDescription),
    seoKeywords: Array.isArray(contentfulSettings.fields.seoKeywords) 
      ? contentfulSettings.fields.seoKeywords.map(String) 
      : DEFAULT_GLOBAL_SETTINGS.seoKeywords,
    favicon: contentfulSettings.fields.favicon && typeof contentfulSettings.fields.favicon === 'object' 
      ? transformContentfulAsset(contentfulSettings.fields.favicon as any) : undefined,
    logo: contentfulSettings.fields.logo && typeof contentfulSettings.fields.logo === 'object' 
      ? transformContentfulAsset(contentfulSettings.fields.logo as any) : undefined,
    navigation: Array.isArray(contentfulSettings.fields.primaryNavigation) 
      ? contentfulSettings.fields.primaryNavigation.map((item: any, index: number) => transformNavigationItem(item, index))
      : DEFAULT_GLOBAL_SETTINGS.navigation,
    footerNavigation: Array.isArray(contentfulSettings.fields.footerNavigation) 
      ? contentfulSettings.fields.footerNavigation.map((item: any) => transformFooterSection(item)) 
      : [],
    contactInfo: {
      email: String((contentfulSettings.fields.contactInfo as any)?.fields?.email || ''),
      phone: String((contentfulSettings.fields.contactInfo as any)?.fields?.phone || ''),
      address: String((contentfulSettings.fields.contactInfo as any)?.fields?.address || '')
    },
    socialLinks: Array.isArray(contentfulSettings.fields.socialLinks) 
      ? contentfulSettings.fields.socialLinks.map((item: any) => transformSocialLink(item)) 
      : [],
    heroContent: contentfulSettings.fields.heroContent && typeof contentfulSettings.fields.heroContent === 'object' 
      ? transformHeroContent(contentfulSettings.fields.heroContent as any) : undefined,
    featuredProducts: [], // Will be populated separately by fetching referenced products
    copyrightText: String(contentfulSettings.fields.copyrightText || DEFAULT_GLOBAL_SETTINGS.copyrightText),
    footerSections: Array.isArray(contentfulSettings.fields.footerSections) 
      ? contentfulSettings.fields.footerSections.map((item: any) => transformFooterSection(item)) 
      : [],
    lastUpdated: new Date(contentfulSettings.sys.updatedAt)
  }
}

// Enhanced products fetching with caching and deduplication
export const getProducts = createCachedFunction(
  async (): Promise<Product[]> => {
    const stopTimer = performanceMonitor.startTimer('contentful-products')
    
    try {
      const entries = await deduplicateRequest(
        'products-list',
        () => client.getEntries({
          content_type: 'goddessCareProduct',
          order: ['fields.title'] as any,
        })
      )
      
      // Log the first product to debug image inclusion
      if (entries.items.length > 0) {
        console.log('First product data:', JSON.stringify(entries.items[0], null, 2))
      }
      
      const products = entries.items.map((item: any) => transformProduct(item))
      stopTimer()
      
      return products
    } catch (error) {
      stopTimer()
      console.log('Error fetching products:', error)
      return []
    }
  },
  {
    key: ['products'],
    tags: ['products', 'contentful'],
    revalidate: CACHE_DURATIONS.MEDIUM,
    fallback: () => [],
    retryOnError: true
  }
)

// Enhanced blog posts fetching with caching and deduplication
export const getBlogPosts = createCachedFunction(
  async (): Promise<BlogPost[]> => {
    try {
      // Primary attempt: order by publishedAt if the field exists in the model
      const entries = await client.getEntries({
        content_type: BLOG_CT_ID,
        order: ['-fields.publishedAt'] as any,
        limit: 100
      })
      return entries.items.map(transformBlogPost)
    } catch (primaryError: any) {
      console.warn('Primary blog fetch failed (likely missing fields.publishedAt). Retrying with -sys.createdAt...', primaryError?.message || primaryError)
      try {
        const fallbackEntries = await client.getEntries({
          content_type: BLOG_CT_ID,
          order: ['-sys.createdAt'] as any,
          limit: 100
        })
        return fallbackEntries.items.map(transformBlogPost)
      } catch (fallbackError: any) {
        console.log('Blog post content type not found or other error:', fallbackError)
        console.warn(`Attempted content_type: ${BLOG_CT_ID}`)
        return []
      }
    }
  },
  {
    key: ['blog-posts'],
    tags: ['blog-posts', 'contentful'],
    revalidate: CACHE_DURATIONS.SHORT,
    fallback: () => [],
    retryOnError: true
  }
)



// Enhanced single product fetching with caching
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return createCachedFunction(
    async (): Promise<Product | null> => {
      const stopTimer = performanceMonitor.startTimer('contentful-product-by-slug')
      
      try {
        const entries = await deduplicateRequest(
          `product-${slug}`,
          () => client.getEntries({
            content_type: 'goddessCareProduct',
            'fields.slug': slug,
            limit: 1
          })
        )
        
        stopTimer()
        
        if (entries.items.length === 0) return null
        return transformProduct(entries.items[0])
      } catch (error) {
        stopTimer()
        console.error(`Error fetching product by slug ${slug}:`, error)
        return null
      }
    },
    {
      key: [`product-${slug}`],
      tags: ['products', 'contentful', `product-${slug}`],
      revalidate: CACHE_DURATIONS.LONG,
      fallback: () => null
    }
  )()
}

// Enhanced single blog post fetching with caching
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const cachedFn = unstable_cache(
      async () => {
        const entries = await client.getEntries({
          content_type: BLOG_CT_ID,
          'fields.slug': slug,
          limit: 1
        })
        return entries.items.length > 0 ? transformBlogPost(entries.items[0]) : null
      },
      ['blog-post', slug],
      { revalidate: CACHE_DURATIONS.SHORT, tags: ['blog-post', 'contentful'] }
    )
    return await cachedFn()
  } catch (error) {
    console.error('Error fetching blog post by slug:', error)
    console.warn(`Attempted content_type: ${BLOG_CT_ID}`)
    return null
  }
}

export async function getAboutContent(): Promise<AboutContent | null> {
  try {
    // Allow overriding the content type ID via env var to handle variations across spaces
    const aboutCt = process.env.CONTENTFUL_ABOUT_CT_ID || 'aboutPage'

    // Primary query: by configured content type and slug
    const primary = await client.getEntries({
      content_type: aboutCt,
      'fields.slug': 'about',
      limit: 1
    })

    let entry: any | undefined = primary.items?.[0]

    // Fallback 1: If no items returned, try without content type filter (some spaces may use a different CT ID)
    if (!entry) {
      const fallbackAnyCt = await client.getEntries({
        'fields.slug': 'about',
        limit: 1
      })
      entry = fallbackAnyCt.items?.[0]
    }

    if (!entry) return null

    const fields = entry.fields as any
    return {
      title: String(fields.title || ''),
      // Pass through rich text document for client rendering
      mainContent: (fields.content as any) ?? undefined,
      mission: fields.mission ? String(fields.mission) : undefined,
      vision: fields.vision ? String(fields.vision) : undefined,
      image: fields.image ? transformContentfulAsset(fields.image as any) : undefined,
    }
  } catch (error) {
    console.log('Error fetching about content:', error)

    // Last-resort fallback: attempt a generic slug-based fetch ignoring content type
    try {
      const generic = await client.getEntries({ 'fields.slug': 'about', limit: 1 })
      if (generic.items.length === 0) return null
      const fields = (generic.items[0] as any).fields as any
      return {
        title: String(fields.title || ''),
        mainContent: (fields.content as any) ?? undefined,
        mission: fields.mission ? String(fields.mission) : undefined,
        vision: fields.vision ? String(fields.vision) : undefined,
        image: fields.image ? transformContentfulAsset(fields.image as any) : undefined,
      }
    } catch (_) {
      return null
    }
  }
}

export async function getSocialMediaSettings(): Promise<SocialMediaSettings | null> {
  try {
    const entries = await client.getEntries({
      content_type: 'socialMediaSettings',
      limit: 1
    })
    
    if (entries.items.length === 0) return null
    
    const item = entries.items[0] as any
    const fields = item.fields as any
    return {
      instagram: fields.instagram ? String(fields.instagram) : undefined,
      facebook: fields.facebook ? String(fields.facebook) : undefined,
      twitter: fields.twitter ? String(fields.twitter) : undefined,
      linkedin: fields.linkedin ? String(fields.linkedin) : undefined,
      youtube: fields.youtube ? String(fields.youtube) : undefined,
      tiktok: fields.tiktok ? String(fields.tiktok) : undefined,
      patreon: fields.patreon ? String(fields.patreon) : undefined,
    }
  } catch (error) {
    console.log('Error fetching social media settings:', error)
    return null
  }
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
  // Use the service which handles caching and fallbacks
  return globalSettingsService.getGlobalSettings()
}

export async function getGlobalSettingsWithFallback(): Promise<GlobalSettings> {
  return globalSettingsService.getSettingsWithFallback()
}

export interface GlobalSettingsService {
  getGlobalSettings(): Promise<GlobalSettings>
  revalidateSettings(): Promise<void>
  getSettingsWithFallback(): Promise<GlobalSettings>
}

export class ContentfulGlobalSettingsService implements GlobalSettingsService {
  private client: any
  private cacheTag: string = 'global-settings'
  private navigationCacheTag: string = 'navigation'

  constructor(contentfulClient?: any) {
    this.client = contentfulClient || client
  }

  async getGlobalSettings(): Promise<GlobalSettings> {
    try {
      const entries = await this.client.getEntries({
        content_type: 'globalSettings',
        limit: 1
      })

      if (!entries.items.length) {
        // Merge default settings when Contentful settings are missing
        return {
          ...DEFAULT_GLOBAL_SETTINGS,
          lastUpdated: new Date()
        }
      }

      const settings = transformGlobalSettings(entries.items[0] as any)
      return settings
    } catch (error) {
      console.error('Error fetching global settings:', error)
      // Fall back to default settings on error
      return {
        ...DEFAULT_GLOBAL_SETTINGS,
        lastUpdated: new Date()
      }
    }
  }

  async getNavigation(): Promise<NavigationItem[]> {
    try {
      const entries = await this.client.getEntries({
        content_type: 'navigationItem',
        order: ['fields.order'] as any
      })
      return entries.items.map((item: any, index: number) => transformNavigationItem(item, index))
    } catch (error) {
      console.error('Error fetching navigation items:', error)
      return DEFAULT_GLOBAL_SETTINGS.navigation
    }
  }

  async getSettingsWithFallback(): Promise<GlobalSettings> {
    try {
      // Try to get cached version first
      const cached = await this.getCachedSettings()
      if (cached) return cached

      const settings = await this.getGlobalSettings()
      return settings
    } catch (error) {
      console.error('Error in getSettingsWithFallback:', error)
      return {
        ...DEFAULT_GLOBAL_SETTINGS,
        lastUpdated: new Date()
      }
    }
  }

  private async getCachedSettings(): Promise<GlobalSettings | null> {
    try {
      const cachedFn = unstable_cache(
        async () => {
          const entries = await this.client.getEntries({
            content_type: 'globalSettings',
            limit: 1
          })
          return entries.items.length ? transformGlobalSettings(entries.items[0] as any) : null
        },
        ['global-settings-cache'],
        { revalidate: CACHE_DURATIONS.MEDIUM, tags: [this.cacheTag, this.navigationCacheTag] }
      )
      return await cachedFn()
    } catch (error) {
      console.error('Error getting cached settings:', error)
      return null
    }
  }

  private validateAndMergeWithDefaults(settings: Partial<GlobalSettings>): GlobalSettings {
    return {
      siteTitle: settings.siteTitle || DEFAULT_GLOBAL_SETTINGS.siteTitle,
      siteDescription: settings.siteDescription || DEFAULT_GLOBAL_SETTINGS.siteDescription,
      seoKeywords: settings.seoKeywords || DEFAULT_GLOBAL_SETTINGS.seoKeywords,
      favicon: settings.favicon,
      logo: settings.logo,
      navigation: Array.isArray(settings.navigation) && settings.navigation.length ? settings.navigation : DEFAULT_GLOBAL_SETTINGS.navigation,
      footerNavigation: settings.footerNavigation || [],
      contactInfo: settings.contactInfo || { email: '', phone: '', address: '' },
      socialLinks: settings.socialLinks || [],
      heroContent: settings.heroContent,
      featuredProducts: settings.featuredProducts || [],
      copyrightText: settings.copyrightText || DEFAULT_GLOBAL_SETTINGS.copyrightText,
      footerSections: settings.footerSections || [],
      lastUpdated: settings.lastUpdated || new Date()
    }
  }

  async revalidateSettings(): Promise<void> {
    try {
      revalidateTag(this.cacheTag)
      revalidateTag(this.navigationCacheTag)
    } catch (error) {
      console.error('Error revalidating settings cache:', error)
    }
  }

  getCacheTags(): string[] {
    return [this.cacheTag, this.navigationCacheTag]
  }
}

// Get all categories from Contentful
export async function getCategories(): Promise<Category[]> {
  try {
    const entries = await client.getEntries({
      content_type: 'category',
      order: ['fields.name'] as any
    })
    
    return entries.items.map((item: any) => ({
      name: item.fields.name,
      slug: item.fields.slug
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Create a new category in Contentful
export async function createCategory(name: string, slug: string): Promise<Category | null> {
  try {
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!)
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master')
    
    const category = await environment.createEntry('category', {
      fields: {
        name: {
          'en-US': name
        },
        slug: {
          'en-US': slug
        }
      }
    })
    
    return {
      name: category.fields.name['en-US'],
      slug: category.fields.slug['en-US']
    }
  } catch (error) {
    console.error('Error creating category:', error)
    return null
  }
}

// Export the global settings service instance
export const globalSettingsService = new ContentfulGlobalSettingsService()

export async function warmGlobalSettingsCache(): Promise<void> {
  try {
    const service = new ContentfulGlobalSettingsService()
    await service.getSettingsWithFallback()
  } catch (error) {
    console.error('Error warming settings cache:', error)
  }
}

// Function to get a new instance of the global settings service when needed
export function getGlobalSettingsService(): ContentfulGlobalSettingsService {
  return new ContentfulGlobalSettingsService()
}
