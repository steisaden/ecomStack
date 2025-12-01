'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Sparkles, Star, Heart, TrendingUp, Award } from 'lucide-react'
import { 
  generateBentoGrid, 
  generateBentoItem,
  ecommerceGridPatterns 
} from '@/lib/fusion-bento-grid'
import { 
  createFusionEffect,
  createCustomFusion 
} from '@/lib/fusion-design'
import {
  cardHoverVariants,
  productCardVariants,
  ctaButtonVariants,
  staggerContainer,
  staggerItem,
  badgeVariants
} from '@/lib/fusion-interactions'
import { Product } from '@/lib/types'

interface FusionProductsSectionProps {
  products: Product[]
  title?: string
  subtitle?: string
}

export default function FusionProductsSection({ 
  products, 
  title = "Premium Beauty Collection",
  subtitle = "Discover our handpicked selection of natural beauty essentials"
}: FusionProductsSectionProps) {
  const featuredProducts = products.slice(0, 4)
  
  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-br from-champagne-200/50 via-champagne-300/30 to-champagne-400/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(166,196,138,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(116,211,174,0.1)_0%,transparent_50%)]" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div variants={staggerItem}>
            <div className={createFusionEffect('light', 'sm', 'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-coral-500/80 text-white text-sm font-semibold')}>
              <Sparkles className="w-4 h-4" />
              Featured Collection
            </div>
          </motion.div>
          <motion.h2 
            className="text-section font-heading text-primary mb-4"
            variants={staggerItem}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-lg text-asparagus-600 leading-relaxed"
            variants={staggerItem}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Products Grid */}
        {featuredProducts.length > 0 ? (
          <motion.div
            className={generateBentoGrid('products')}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Featured Product - 1x1 */}
            <motion.div
              className={generateBentoItem('1x1', 'featured', 'group')}
              variants={productCardVariants}
              whileHover="hover"
              whileTap="tap"
              initial="initial"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Product Badge */}
                <motion.div
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  className={createFusionEffect('light', 'sm', 'absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-coral-500/90 text-white text-xs font-bold')}
                >
                  <Award className="w-3 h-3 mr-1 inline" />
                  Featured
                </motion.div>
                
                {/* Product Image */}
                {featuredProducts[0]?.images?.[0]?.url && (
                  <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-champagne-100 relative">
                    <img
                      src={featuredProducts[0].images[0].url}
                      alt={featuredProducts[0].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                )}
                
                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-asparagus-800 mb-2 line-clamp-2">
                      {featuredProducts[0]?.title}
                    </h3>
                    <p className="text-sm text-asparagus-600 mb-4 line-clamp-3">
                      {featuredProducts[0]?.description || "Experience the luxury of premium beauty."}
                    </p>
                  </div>
                  
                  {/* Price and Actions */}
                  <div className="space-y-3">
                    {featuredProducts[0]?.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-celadon-600">
                          ${featuredProducts[0].price}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-celadon-400 text-celadon-400" />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <motion.div variants={ctaButtonVariants} whileHover="hover" whileTap="tap">
                      <Button 
                        className={createCustomFusion({
                          glass: 'medium',
                          neomorphic: 'md',
                          background: 'bg-celadon-400/80',
                          text: 'text-white font-semibold w-full',
                          hover: true
                        })}
                        asChild
                      >
                        <Link href={`/products/${featuredProducts[0]?.slug || ''}`}>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Shop Now
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Product Grid - 2x1 */}
            <motion.div
              className={generateBentoItem('2x1', 'card', 'group')}
              variants={staggerItem}
            >
              <div className="p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-asparagus-800">More Products</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={createFusionEffect('light', 'sm', 'bg-champagne-200/50 border-olivine-400/50 text-asparagus-700')}
                    asChild
                  >
                    <Link href="/products">View All</Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                  {featuredProducts.slice(1, 4).map((product, index) => (
                    <motion.div
                      key={product.slug || index}
                      className={createCustomFusion({
                        glass: 'light',
                        neomorphic: 'sm',
                        background: 'bg-champagne-100/60',
                        border: 'rounded-xl p-4 group',
                        hover: true
                      })}
                      variants={cardHoverVariants}
                      whileHover="hover"
                      initial="initial"
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      {/* Mini Product Image */}
                      {product.images?.[0]?.url && (
                        <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-champagne-50">
                          <img
                            src={product.images[0].url}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      
                      {/* Mini Product Info */}
                      <h4 className="font-semibold text-asparagus-800 mb-1 line-clamp-2 text-sm">
                        {product.title}
                      </h4>
                      {product.price && (
                        <p className="text-celadon-600 font-bold text-lg">
                          ${product.price}
                        </p>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={createFusionEffect('light', 'sm', 'w-full mt-3 bg-champagne-50/50 border-olivine-400/30 text-asparagus-700 text-xs')}
                        asChild
                      >
                        <Link href={`/products/${product.slug || ''}`}>
                          <Heart className="w-3 h-3 mr-1" />
                          Quick View
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // Fallback content
          <motion.div
            className={generateBentoGrid('products')}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Featured Fallback Product */}
            <motion.div
              className={generateBentoItem('1x1', 'featured', 'group')}
              variants={productCardVariants}
              whileHover="hover"
            >
              <div className="p-6 h-full flex flex-col justify-center items-center text-center">
                <motion.div 
                  className={createFusionEffect('medium', 'lg', 'w-20 h-20 rounded-3xl bg-celadon-400/60 flex items-center justify-center mb-6')}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-asparagus-800 mb-4">Premium Hair Oil</h3>
                <p className="text-asparagus-600 mb-6">Nourish your hair with our signature blend</p>
                <Button 
                  className={createCustomFusion({
                    glass: 'medium',
                    neomorphic: 'md',
                    background: 'bg-celadon-400/80',
                    text: 'text-white font-semibold',
                    hover: true
                  })}
                  asChild
                >
                  <Link href="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Shop Collection
                  </Link>
                </Button>
              </div>
            </motion.div>
            
            {/* Fallback Grid */}
            <motion.div
              className={generateBentoItem('2x1', 'card')}
              variants={staggerItem}
            >
              <div className="p-6 h-full flex flex-col justify-center">
                <h3 className="text-xl font-bold text-asparagus-800 mb-4">Discover Our Collection</h3>
                <p className="text-asparagus-600 mb-6">
                  Explore our range of premium beauty products crafted with natural ingredients
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={createFusionEffect('light', 'sm', 'p-4 rounded-xl bg-champagne-100/50 text-center')}>
                    <Heart className="w-8 h-8 text-coral-500 mx-auto mb-2" />
                    <h4 className="font-semibold text-asparagus-800">Skincare</h4>
                  </div>
                  <div className={createFusionEffect('light', 'sm', 'p-4 rounded-xl bg-champagne-100/50 text-center')}>
                    <Star className="w-8 h-8 text-olivine-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-asparagus-800">Hair Care</h4>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* CTA Section */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            size="lg"
            className={createCustomFusion({
              glass: 'medium',
              neomorphic: 'md',
              background: 'bg-asparagus-500/80',
              text: 'text-white font-semibold',
              hover: true
            })}
            asChild
          >
            <Link href="/products">
              <TrendingUp className="w-5 h-5 mr-2" />
              View All Products
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}