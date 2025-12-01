'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Heart, Star, ShoppingBag, TrendingUp } from 'lucide-react'
import { 
  fusionBentoLayouts, 
  generateBentoGrid, 
  generateBentoItem,
  ecommerceGridPatterns 
} from '@/lib/fusion-bento-grid'
import { 
  fusionVariants, 
  createFusionEffect,
  fusionInteractions,
  createCustomFusion 
} from '@/lib/fusion-design'
import {
  cardHoverVariants,
  featuredCardVariants,
  ctaButtonVariants,
  pageVariants,
  starVariants,
  badgeVariants
} from '@/lib/fusion-interactions'
import { Product } from '@/lib/types'

interface HeroSectionProps {
  featuredProducts?: Product[]
}

export default function HeroSection({ featuredProducts = [] }: HeroSectionProps) {
  return (
    <motion.section 
      className="relative min-h-screen bg-gradient-to-br from-champagne-200 via-champagne-300 to-champagne-400 overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(116,211,174,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(166,196,138,0.1)_0%,transparent_50%)]" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 lg:py-20">
        {/* Hero Grid Layout */}
        <div className={generateBentoGrid('hero')}>
          {/* Main Hero Card - 2x2 */}
          <motion.div
            className={generateBentoItem('2x2', 'featured', 'relative overflow-hidden')}
            variants={featuredCardVariants}
            whileHover="hover"
            initial="initial"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-celadon-400/20 to-asparagus-500/20" />
            <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-center">
              {/* Hero Badge */}
              <motion.div
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                className={createFusionEffect('light', 'sm', 'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 w-fit bg-coral-500/80 text-white text-sm font-semibold')}
              >
                <Sparkles className="w-4 h-4" />
                Premium Beauty Collection
              </motion.div>
              
              {/* Hero Title */}
              <motion.h1 
                className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 text-asparagus-800 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Goddess Hair
                <span className="block text-celadon-500">Beauty Studio</span>
              </motion.h1>
              
              {/* Hero Description */}
              <motion.p 
                className="text-lg lg:text-xl text-asparagus-600 mb-8 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Transform your beauty routine with our premium collection of natural, 
                sustainable products crafted for the modern goddess.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <motion.div variants={ctaButtonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    size="lg" 
                    className={createCustomFusion({
                      glass: 'medium',
                      neomorphic: 'md',
                      background: 'bg-celadon-400/80',
                      text: 'text-white font-semibold',
                      hover: true
                    })}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Shop Collection
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
                
                <motion.div variants={ctaButtonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className={createCustomFusion({
                      glass: 'light',
                      neomorphic: 'sm',
                      background: 'bg-champagne-200/60 border-asparagus-500/50',
                      text: 'text-asparagus-700 font-semibold',
                      hover: true
                    })}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div 
                className="flex items-center gap-6 mt-8 pt-8 border-t border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        variants={starVariants}
                        initial="initial"
                        animate="filled"
                        transition={{ delay: 1 + i * 0.1 }}
                      >
                        <Star className="w-4 h-4 fill-celadon-400 text-celadon-400" />
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-sm text-asparagus-600 font-medium">4.9/5 from 2,500+ reviews</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-celadon-500" />
                  <span className="text-sm text-asparagus-600 font-medium">10K+ Happy Customers</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Quick Category Card - 1x1 */}
          <motion.div
            className={generateBentoItem('1x1', 'card', 'relative overflow-hidden group')}
            variants={cardHoverVariants}
            whileHover="hover"
            whileTap="tap"
            initial="initial"
          >
            <div className="p-6 h-full flex flex-col justify-center items-center text-center">
              <motion.div 
                className={createFusionEffect('light', 'sm', 'w-16 h-16 rounded-2xl bg-olivine-400/60 flex items-center justify-center mb-4')}
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <Sparkles className="w-8 h-8 text-asparagus-700" />
              </motion.div>
              <h3 className="text-lg font-semibold text-asparagus-800 mb-2">Hair Care</h3>
              <p className="text-sm text-asparagus-600 mb-4">Premium oils & treatments</p>
              <Button 
                size="sm" 
                variant="outline"
                className={createFusionEffect('light', 'sm', 'bg-champagne-200/50 border-olivine-400/50 text-asparagus-700')}
              >
                Explore
              </Button>
            </div>
          </motion.div>
          
          {/* Trending Products Card - 1x1 */}
          <motion.div
            className={generateBentoItem('1x1', 'card', 'relative overflow-hidden group')}
            variants={cardHoverVariants}
            whileHover="hover"
            whileTap="tap"
            initial="initial"
          >
            <div className="p-6 h-full flex flex-col justify-center items-center text-center">
              <motion.div 
                className={createFusionEffect('light', 'sm', 'w-16 h-16 rounded-2xl bg-coral-500/60 flex items-center justify-center mb-4')}
                whileHover={{ rotate: -5, scale: 1.1 }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-asparagus-800 mb-2">Trending Now</h3>
              <p className="text-sm text-asparagus-600 mb-4">Most loved products</p>
              <Button 
                size="sm" 
                className={createFusionEffect('medium', 'sm', 'bg-coral-500/80 text-white')}
              >
                View All
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Featured Products Preview */}
        {featuredProducts.length > 0 && (
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-asparagus-800 mb-4">
                Featured Products
              </h2>
              <p className="text-asparagus-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium beauty essentials
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.slug || index}
                  className={createCustomFusion({
                    glass: 'medium',
                    neomorphic: 'md',
                    background: 'bg-champagne-200/50',
                    border: 'rounded-2xl p-6',
                    hover: true
                  })}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  initial="initial"
                  transition={{ delay: 1.4 + index * 0.1 }}
                >
                  {product.images?.[0]?.url && (
                    <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-champagne-100">
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-asparagus-800 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  {product.price && (
                    <p className="text-celadon-600 font-bold text-lg">
                      ${product.price}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}