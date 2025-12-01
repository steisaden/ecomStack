'use client'

import React, { Suspense } from 'react'
import { Product, BlogPost, AboutContent } from '@/lib/types'
import { HeroSkeleton, PageLoadingSkeleton } from '@/components/ui/skeleton-components'
import { performanceMonitor } from '@/lib/performance'

/**
 * Simple error boundary implementation
 */
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Streaming component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback
      return <Fallback error={this.state.error} resetErrorBoundary={() => this.setState({ hasError: false })} />
    }

    return this.props.children
  }
}

/**
 * Error fallback for streaming sections
 */
function StreamingSectionError({ error, resetErrorBoundary, sectionName }: {
  error: Error
  resetErrorBoundary: () => void
  sectionName: string
}) {
  return (
    <div className="bg-gradient-to-br from-sage-50 to-lavender-50 border border-sage-200 rounded-lg p-6 m-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {sectionName} Temporarily Unavailable
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          This section couldn&apos;t load right now, but you can continue browsing.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-sage-600 text-white text-sm rounded-lg hover:bg-sage-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

/**
 * Streaming wrapper for sections
 */
export function StreamingSection({
  children,
  fallback,
  sectionName
}: {
  children: React.ReactNode
  fallback: React.ReactNode
  sectionName: string
}) {
  return (
    <SimpleErrorBoundary
      fallback={(props: any) => (
        <StreamingSectionError {...props} sectionName={sectionName} />
      )}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </SimpleErrorBoundary>
  )
}

/**
 * Progressive loading skeleton
 */
function ContentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  )
}

/**
 * Main streaming layout
 */
export function StreamingLayout({
  products,
  posts,
  aboutContent,
  children
}: {
  products: Product[]
  posts: BlogPost[]
  aboutContent: AboutContent | null
  children?: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <StreamingSection
        sectionName="Hero"
        fallback={<HeroSkeleton />}
      >
        <HeroContent aboutContent={aboutContent} />
      </StreamingSection>
      
      <main>
        <StreamingSection
          sectionName="Products"
          fallback={<ContentSkeleton count={4} />}
        >
          <ProductsContent products={products} />
        </StreamingSection>
        
        <StreamingSection
          sectionName="Blog"
          fallback={<ContentSkeleton count={3} />}
        >
          <BlogContent posts={posts} />
        </StreamingSection>
        
        {children}
      </main>
    </div>
  )
}

// Content components
function HeroContent({ aboutContent }: { aboutContent: AboutContent | null }) {
  return (
    <section className="bg-gradient-to-br from-sage-50 to-lavender-50 py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Goddess Care Co
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {aboutContent?.mission || 'Handcrafted natural beauty essentials'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700">
            Shop Now
          </button>
          <button className="px-8 py-3 border border-sage-600 text-sage-600 rounded-lg hover:bg-sage-50">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}

function ProductsContent({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products available at the moment.</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.slice(0, 6).map((product) => (
        <div key={product.sys.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          {product.images[0] && (
            <img 
              src={product.images[0].url} 
              alt={product.title}
              className="w-full h-48 object-cover rounded mb-4"
              loading="lazy"
            />
          )}
          <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          <p className="font-bold text-sage-600">${product.price}</p>
        </div>
      ))}
    </div>
  )
}

function BlogContent({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No blog posts available at the moment.</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {posts.slice(0, 3).map((post) => (
        <article key={post.sys.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          {post.featuredImage && (
            <img 
              src={post.featuredImage.url} 
              alt={post.title}
              className="w-full h-48 object-cover rounded mb-4"
              loading="lazy"
            />
          )}
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{post.author.name}</span>
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}</span>
          </div>
        </article>
      ))}
    </div>
  )
}

export default StreamingLayout