'use client'

import { useEffect } from 'react'
import { resourcePreloader } from '@/lib/performance'

/**
 * Critical resources to preload for better performance
 */
const CRITICAL_RESOURCES = [
  // Fonts (if using external fonts)
  {
    href: '/fonts/inter-var.woff2',
    as: 'font' as const,
    crossorigin: 'anonymous' as const
  },
  // Critical CSS
  {
    href: '/css/critical.css',
    as: 'style' as const
  },
  // Hero images (placeholder URLs)
  {
    href: '/images/hero-bg.webp',
    as: 'image' as const
  }
]

/**
 * Data endpoints to prefetch
 */
const PREFETCH_ENDPOINTS = [
  '/api/products',
  '/api/contentful/blog-posts',
  '/api/global-settings'
]

/**
 * Resource preloader component
 * Preloads critical resources and prefetches data
 */
export function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources
    resourcePreloader.preloadResources(CRITICAL_RESOURCES)
    
    // Prefetch data endpoints after a short delay
    const prefetchTimer = setTimeout(() => {
      resourcePreloader.prefetchData(PREFETCH_ENDPOINTS)
    }, 1000)
    
    return () => clearTimeout(prefetchTimer)
  }, [])
  
  return null // This component doesn't render anything
}

/**
 * Hook for prefetching page resources when user hovers over links
 */
export function usePrefetchOnHover() {
  useEffect(() => {
    const handleLinkHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href) {
        // Only prefetch internal links
        if (link.href.startsWith(window.location.origin)) {
          resourcePreloader.prefetchData([link.href])
        }
      }
    }
    
    // Add hover listeners to all links
    document.addEventListener('mouseover', handleLinkHover)
    
    return () => {
      document.removeEventListener('mouseover', handleLinkHover)
    }
  }, [])
}

/**
 * Critical CSS inlining component
 */
export function CriticalStyles() {
  return (
    <style jsx>{`
      /* Critical CSS for immediate rendering */
      body {
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #f0f4f3 0%, #faf7f5 100%);
      }
      
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Prevent layout shift */
      .hero-section {
        min-height: 60vh;
      }
      
      .product-grid {
        min-height: 400px;
      }
      
      .blog-grid {
        min-height: 300px;
      }
    `}</style>
  )
}

/**
 * Performance hints for the browser
 */
export function PerformanceHints() {
  return (
    <>
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//images.ctfassets.net" />
      <link rel="dns-prefetch" href="//cdn.contentful.com" />
      <link rel="dns-prefetch" href="//api.stripe.com" />
      
      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://images.ctfassets.net" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      
      {/* Resource hints */}
      <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
    </>
  )
}

export default ResourcePreloader
