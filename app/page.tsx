import React, { lazy, Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import { cn } from '@/lib/utils'
import { createButton } from '@/lib/cecred-design-system'
import { Card } from '@/components/ui/card'
import { ProductCard } from '@/components/ui/product-card'
import { getFeaturedProducts } from '@/lib/unified-products'
import { Product } from '@/lib/types'
import { PhilosophySection, YogaSection } from '@/components/HomePageAnimatedSections'

// Revalidate every 60 seconds so Contentful product changes appear on the live site
export const revalidate = 60

const Newsletter = lazy(() => import('@/components/Newsletter'))

type ProductsPromise = Promise<Product[]>

export const metadata: Metadata = {
  title: 'Premium Self Care & Lifestyle | Goddess Care Co',
  description: 'Shop therapeutic-grade essential oils and wellness essentials crafted to elevate your rituals and nurture radiant hair and skin.',
  keywords: ['essential oils', 'self care', 'hair care', 'skincare', 'wellness'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Premium Self Care & Lifestyle | Goddess Care Co',
    description: 'Luxury essentials curated for wellness, confidence, and intention.',
    url: '/',
    images: ['/og.png'],
  },
}

async function ProductsSection({ productsPromise }: { productsPromise: ProductsPromise }) {
  try {
    const products = await productsPromise

    return (
      <div className={cn(
        'grid gap-8',
        products.length >= 5
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2'
      )}>
        {products.map((product) => (
          <ProductCard
            key={product.sys.id}
            product={product}
            priority={false}
          />
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="text-center py-12 text-red-500" role="status" aria-live="polite">
        Error loading products. Please try again later.
      </div>
    )
  }
}

function ProductsContent({ productsPromise }: { productsPromise: ProductsPromise }) {
  return (
    <ProductsSection productsPromise={productsPromise} />
  )
}

async function ProductStructuredData({ productsPromise }: { productsPromise: ProductsPromise }) {
  try {
    const products = await productsPromise
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Featured Products',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${baseUrl}/products/${product.slug}`,
        item: {
          '@type': 'Product',
          name: product.title,
          image: product.images?.[0]?.url,
          offers: product.price ? {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.price.toFixed(2),
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          } : undefined,
        },
      })),
    }

    return (
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    )
  } catch (error) {
    console.error('Error generating product structured data:', error)
    return null
  }
}

export default async function HomePage() {
  const featuredProductsPromise = getFeaturedProducts(6)

  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero
          title="Premium Self Care & Lifestyle"
          subtitle="Elevate your experience with our thoughfully curated collection to radiate wellness, confidence, and intention with our luxury essentials."
          ctaText="Shop Collection"
          ctaLink="/products"
          image="/images/oil.png"
          imageAlt="Glass bottle of premium essential oil with natural botanicals"
        />

        <section className="py-16 md:py-24" aria-labelledby="featured-products-heading">
          <div className="container">
            <div className="text-center mb-16">
              <h2 id="featured-products-heading" className="text-section font-heading text-primary mb-4">
                Premium Essential Oils
              </h2>
              <p className="text-body text-dark-gray max-w-2xl mx-auto">
                Therapeutic-grade oils to elevate your wellness ritual. 100% pure.
              </p>
            </div>

            <Suspense fallback={
              <div
                className={cn(
                  'grid gap-8',
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                )}
                role="status"
                aria-label="Loading featured products"
              >
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Card key={`skeleton-${idx}`} className="h-[400px] animate-pulse bg-gray-100" aria-hidden="true">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            }>
              <ProductsContent productsPromise={featuredProductsPromise} />
            </Suspense>

            <div className="text-center mt-12">
              <Link href="/products" className={cn(createButton('secondary'), 'px-8 py-4 inline-block')}>
                View All Products
              </Link>
            </div>
          </div>
        </section>

        <PhilosophySection />

        <YogaSection />

        <Suspense fallback={<div className="py-16 text-center">Loading newsletter...</div>}>
          <Newsletter />
        </Suspense>

        <Suspense fallback={null}>
          <ProductStructuredData productsPromise={featuredProductsPromise} />
        </Suspense>
      </main>
    </div>
  )
}
