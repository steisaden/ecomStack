'use client'

import React from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import { ProductCard } from '@/components/ProductCard'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'
import { createButton } from '@/lib/cecred-design-system'
import { ProductCategory } from '@/lib/enums'

export default function DesignDemoPage() {
  const handleCtaClick = () => {
    console.log('CTA clicked')
  }

  const handleAddToCart = () => {
    console.log('Add to cart clicked')
  }

  const products = [
    {
      id: '1',
      name: 'Organic Hair Oil',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800',
      description: 'Nourishing blend of natural oils for healthy, shiny hair',
      category: ProductCategory.HAIR_CARE,
      rating: 4.8,
      isNew: true
    },
    {
      id: '2',
      name: 'Herbal Shampoo',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800',
      description: 'Gentle cleansing with botanical extracts',
      category: ProductCategory.HAIR_CARE,
      rating: 4.6,
      isBestSeller: true
    },
    {
      id: '3',
      name: 'Repair Conditioner',
      price: 22.99,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800',
      description: 'Intensive repair for damaged hair',
      category: ProductCategory.HAIR_CARE,
      rating: 4.7
    },
    {
      id: '4',
      name: 'Scalp Treatment',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800',
      description: 'Revitalizing treatment for healthy scalp',
      category: ProductCategory.HAIR_CARE,
      rating: 4.9,
      isOrganic: true
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Hero 
          title="Natural Beauty Redefined"
          subtitle="Experience the perfect blend of nature and science with our premium hair care collection."
          ctaText="Shop Collection"
          onCtaClick={handleCtaClick}
          image="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800"
        />
        
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-section font-heading text-primary mb-4">
                Premium Essential Oils
              </h2>
              <p className="text-body text-dark-gray max-w-2xl mx-auto">
                Therapeutic-grade oils to elevate your wellness ritual. Ethically sourced, GC/MS tested, and 100% pure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  uniformHeight={false} // Demo page should not have uniform height
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button className={cn(createButton('secondary'), "px-8 py-4")}>
                View All Products
              </button>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-light-gray">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-section font-heading text-primary mb-6">
                Our Philosophy
              </h2>
              <p className="text-body text-dark-gray mb-8">
                At Goddess Hair, we believe in the power of nature combined with scientific innovation. 
                Our products are crafted with the finest natural ingredients, sustainably sourced and 
                carefully formulated to deliver exceptional results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className={cn(createButton('primary'), "w-full sm:w-auto")}>
                  Learn More
                </button>
                <button className={cn(createButton('outline'), "w-full sm:w-auto")}>
                  Our Story
                </button>
              </div>
            </div>
          </div>
        </section>
        
        <Newsletter />
      </main>
      
      <Footer />
    </div>
  )
}