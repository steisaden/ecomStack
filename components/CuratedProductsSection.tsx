'use client'

import React from 'react'
import CuratedProducts from './CuratedProducts'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CuratedProductsSectionProps {
  title?: string
  subtitle?: string
  maxProducts?: number
  showViewAll?: boolean
  className?: string
}

export default function CuratedProductsSection({
  title = "Curated Products",
  subtitle = "Discover our carefully selected collection of verified beauty and wellness products",
  maxProducts = 6,
  showViewAll = true,
  className = ""
}: CuratedProductsSectionProps) {
  return (
    <section className={`py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          {/* Quality Indicators */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Verified Quality
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Working Links
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              High-Quality Images
            </div>
          </div>
        </div>

        {/* Curated Products Display */}
        <CuratedProducts 
          maxProducts={maxProducts}
          className="max-w-7xl mx-auto"
        />

        {/* View All Button */}
        {showViewAll && (
          <div className="text-center mt-12">
            <Link href="/curated">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                View All Curated Products
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}