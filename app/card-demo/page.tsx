'use client'

import { ContentCard } from '@/components/ContentCard'
import { ProductCard } from '@/components/ui/product-card'
import { BlogCard } from '@/components/BlogCard'
import { FeatureCard } from '@/components/FeatureCard'
import { Button } from '@/components/ui/button'
import { ProductCategory } from '@/lib/enums'
import { Heart, Star, ShoppingCart, Sparkles, Leaf, Sun } from 'lucide-react'

export default function CardDemoPage() {
  const sampleImage = {
    src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    alt: 'Beauty product',
    width: 400,
    height: 300
  }

  const blogImage = {
    src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
    alt: 'Skincare routine',
    width: 400,
    height: 300
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-hero font-heading text-primary mb-4">Card Component Demo</h1>
          <p className="text-lg text-muted-foreground">
            Showcasing the flexible ContentCard component with multiple variants
          </p>
        </div>

        {/* Basic ContentCard Variants */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Basic Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ContentCard
              title="Default Card"
              description="This is a default card with hover effects and subtle elevation changes."
              image={sampleImage}
              actions={<Button variant="outline" size="sm">Learn More</Button>}
              href="/products"
            />

            <ContentCard
              title="Featured Card"
              description="This featured card has enhanced styling with gradient background and stronger hover effects."
              image={sampleImage}
              variant="featured"
              actions={<Button variant="default" size="sm">Get Started</Button>}
              onClick={() => alert('Featured card clicked!')}
            />

            <ContentCard
              title="Minimal Card"
              description="A clean, minimal card with transparent background and subtle interactions."
              variant="minimal"
              actions={<Button variant="ghost" size="sm">Buy</Button>}
            />
          </div>
        </section>

        {/* Product Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Product Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard
              product={{
                id: '1',
                name: 'Lavender Essential Oil',
                price: 29.99,
                image: sampleImage.src,
                category: ProductCategory.HAIR_CARE,
                rating: 4.8,
                isNew: true,
                isOrganic: true,
                isCrueltyFree: true
              }}
              uniformHeight={false} // Demo page should not have uniform height
            />

            <ProductCard
              product={{
                id: '2',
                name: 'Hair Growth Serum',
                price: 24.99,
                originalPrice: 34.99,
                image: sampleImage.src,
                category: ProductCategory.HAIR_CARE,
                rating: 4.6,
                isBestSeller: true,
                isHandcrafted: true
              }}
              uniformHeight={false} // Demo page should not have uniform height
            />

            <ProductCard
              product={{
                id: '3',
                name: 'Vitamin C Serum',
                price: 32.99,
                image: sampleImage.src,
                category: ProductCategory.SKIN_CARE,
                rating: 4.9,
                isOrganic: true,
                isCrueltyFree: true
              }}
              uniformHeight={false} // Demo page should not have uniform height
            />

            <ProductCard
              product={{
                id: '4',
                name: 'Moisturizing Cream',
                price: 19.99,
                image: sampleImage.src,
                category: ProductCategory.SKIN_CARE,
                rating: 4.7,
                isHandcrafted: true,
                isOrganic: true
              }}
              uniformHeight={false} // Demo page should not have uniform height
            />
          </div>
        </section>

        {/* Blog Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Blog Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BlogCard
              title="5 Essential Oils for Healthy Hair Growth"
              description="Discover the natural oils that can transform your hair care routine and promote healthy, lustrous locks."
              image={blogImage}
              author="Sarah Johnson"
              publishedAt="2024-01-15"
              readTime="5 min read"
              categories={['Hair Care', 'Natural Beauty']}
              href="/blog/essential-oils-hair"
            />

            <BlogCard
              title="Natural Skincare Morning Routine"
              description="Start your day with a gentle, natural skincare routine that nourishes and protects your skin from environmental stressors."
              image={blogImage}
              author="Emma Davis"
              publishedAt="2024-01-12"
              readTime="3 min read"
              categories={['Skincare', 'Morning Routine']}
              href="/blog/morning-routine"
            />
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Feature Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Natural Ingredients"
              icon={<Leaf />}
              content={
                <p className="text-sm text-muted-foreground">
                  All our products are made with carefully selected natural ingredients
                  that nourish and protect your skin.
                </p>
              }
            />

            <FeatureCard
              title="Handcrafted Quality"
              icon={<Heart />}
              content={
                <p className="text-sm text-muted-foreground">
                  Each product is lovingly handcrafted in small batches to ensure
                  the highest quality and freshness.
                </p>
              }
            />

            <FeatureCard
              title="Radiant Results"
              icon={<Sparkles />}
              content={
                <p className="text-sm text-muted-foreground">
                  Experience the transformative power of nature with products
                  designed to enhance your natural beauty.
                </p>
              }
            />
          </div>
        </section>

        {/* Card Sizes */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Card Sizes</h2>
          <div className="flex flex-wrap gap-8 items-start">
            <ContentCard
              title="Small Card"
              description="This is a small card variant."
              size="small"
              actions={<Button size="sm" variant="outline">Small</Button>}
            />

            <ContentCard
              title="Medium Card (Default)"
              description="This is the default medium-sized card."
              size="medium"
              actions={<Button size="sm" variant="outline">Medium</Button>}
            />

            <ContentCard
              title="Large Card"
              description="This is a large card variant with more space for content."
              size="large"
              actions={<Button size="sm" variant="outline">Large</Button>}
            />
          </div>
        </section>

        {/* Interactive States */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Interactive States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ContentCard
              title="Loading Card"
              image={sampleImage}
              loading={true}
              actions={<Button variant="outline" size="sm" disabled>Loading...</Button>}
            />

            <ContentCard
              title="Card with Badge"
              description="This card demonstrates badge functionality."
              image={sampleImage}
              badge={
                <div className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-md font-medium">
                  New
                </div>
              }
              actions={<Button variant="outline" size="sm">View</Button>}
            />

            <ContentCard
              title="Card with Metadata"
              description="This card shows how metadata can be displayed."
              metadata={
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="w-3 h-3" />
                  <span>4.8 rating</span>
                  <span>•</span>
                  <span>124 reviews</span>
                </div>
              }
              actions={<Button variant="outline" size="sm">Read Reviews</Button>}
            />
          </div>
        </section>

        {/* Responsive Behavior */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Responsive Grid</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCard
                key={i}
                product={{
                  id: `product-${i + 1}`,
                  name: `Product ${i + 1}`,
                  price: 19.99 + i * 5,
                  image: sampleImage.src,
                  category: i % 2 === 0 ? ProductCategory.SKIN_CARE : ProductCategory.HAIR_CARE,
                  rating: 4.0 + (i % 5) * 0.2,
                  isNew: i % 4 === 0,
                  isBestSeller: i % 3 === 0,
                  isOrganic: i % 2 === 0,
                  isCrueltyFree: true,
                  isHandcrafted: i % 5 === 0
                }}
                uniformHeight={false} // Demo page should not have uniform height
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}