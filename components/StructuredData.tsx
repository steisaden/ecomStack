import { generateStructuredData } from '@/lib/seo'
import { getGlobalSettingsService } from '@/lib/contentful'
import { GlobalSettings, Product, BlogPost, Asset } from '@/lib/types'


interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'Product' | 'Article' | 'BlogPosting'
  title?: string
  description?: string
  url?: string
  image?: string
  price?: number
  author?: string
  publishedTime?: string
  modifiedTime?: string
  globalSettings?: GlobalSettings | null
}

/**
 * Server-side component to add JSON-LD structured data to pages
 * This helps search engines understand the content better
 */
export async function StructuredData({ globalSettings, ...props }: StructuredDataProps) {
  // Use provided settings or fetch them
  const service = getGlobalSettingsService()
  const settings = globalSettings || await service.getSettingsWithFallback().catch(() => null)
  
  const structuredData = generateStructuredData(settings, props)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

/**
 * Convenience component for website structured data
 */
export async function WebSiteStructuredData({ globalSettings }: { globalSettings?: GlobalSettings | null } = {}) {
  return <StructuredData type="WebSite" globalSettings={globalSettings} />
}

/**
 * Convenience component for organization structured data
 */
export async function OrganizationStructuredData({ globalSettings }: { globalSettings?: GlobalSettings | null } = {}) {
  return <StructuredData type="Organization" globalSettings={globalSettings} />
}

/**
 * Convenience component for product structured data
 */
export async function ProductStructuredData({
  title,
  description,
  url,
  image,
  price,
  globalSettings,
}: {
  title: string
  description?: string
  url: string
  image?: string
  price?: number
  globalSettings?: GlobalSettings | null
}) {
  return (
    <StructuredData
      type="Product"
      title={title}
      description={description}
      url={url}
      image={image}
      price={price}
      globalSettings={globalSettings}
    />
  )
}

/**
 * Convenience component for article/blog post structured data
 */
export async function ArticleStructuredData({
  title,
  description,
  url,
  image,
  author,
  publishedTime,
  modifiedTime,
  globalSettings,
}: {
  title: string
  description?: string
  url: string
  image?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  globalSettings?: GlobalSettings | null
}) {
  return (
    <StructuredData
      type="BlogPosting"
      title={title}
      description={description}
      url={url}
      image={image}
      author={author}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      globalSettings={globalSettings}
    />
  )
}