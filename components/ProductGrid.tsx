'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/lib/responsive'
import { cardVariants } from '@/lib/glass-morphism'
import { 
  staggerContainer, 
  staggerItem, 
  cardHoverVariants,
  createViewportAnimation
} from '@/lib/animations'
import { Button } from '@/components/ui/button'
import ResponsiveGrid from './ResponsiveGrid'

interface Product {
  slug: string
  title: string
  price?: number
  images: Array<{
    fields: {
      file: {
        url: string
      }
    }
  }>
}

interface ProductGridProps {
  products: Product[]
  className?: string
  showViewAllButton?: boolean
  maxItems?: number
}

export default function ProductGrid({ 
  products, 
  className, 
  showViewAllButton = false,
  maxItems 
}: ProductGridProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  const displayProducts = maxItems ? products.slice(0, maxItems) : products
  
  const getGridColumns = () => {
    const productCount = displayProducts.length
    
    if (isMobile) {
      return { mobile: Math.min(productCount, 2) }
    }
    
    if (isTablet) {
      return { 
        mobile: 2, 
        tablet: Math.min(productCount, 3) 
      }
    }
    
    return { 
      mobile: 2, 
      tablet: 3, 
      desktop: Math.min(productCount, 4) 
    }
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div 
      variants={staggerItem}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        cardVariants.hybrid,
        'overflow-hidden transition-all duration-300 h-full flex flex-col'
      )}
    >
      <div className="relative overflow-hidden aspect-square group">
        {product.images[0] ? (
          <>
            <img 
              src={product.images[0].fields.file.url || ''}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Glassmorphism overlay on hover */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3"
              initial={{ x: "-100%" }}
              whileHover={{ x: "300%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            
            {/* Price badge */}
            {product.price && (
              <motion.div 
                className={cn(
                  cardVariants.glass,
                  "absolute top-4 right-4 px-3 py-1 text-sm font-semibold text-sage-700"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                ${product.price}
              </motion.div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sage-50 to-beauty-50 flex items-center justify-center">
            <motion.div 
              className="text-center"              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={cn(
                cardVariants.glass,
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              )}>
                <svg className="w-8 h-8 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <p className="text-sm text-sage-600 font-medium">No Image</p>
            </motion.div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <motion.h3 
          className="text-lg font-semibold text-sage-800 mb-2 line-clamp-2 flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {product.title}
        </motion.h3>
        
        {!product.price && (
          <motion.p 
            className="text-sm text-beauty-600 mb-4 font-medium"            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Price on request
          </motion.p>
        )}
        
        <motion.div 
          className="mt-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            variant="glassPrimary" 
            size="sm" 
            className="w-full" 
            asChild
          >
            <Link href={`/products/${product.slug}`} aria-label={`Buy – ${product.title}`}>
              Buy
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <div className={className}>
      <motion.div
        {...createViewportAnimation(staggerContainer, 0.1)}
      >
        <ResponsiveGrid 
          variant="custom" 
          columns={getGridColumns()}
          gap={isMobile ? 'medium' : isTablet ? 'medium' : 'large'}
          className="gap-6 lg:gap-8"
        >
          {displayProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </ResponsiveGrid>
      </motion.div>
      
      {showViewAllButton && (
        <motion.div 
          className="text-center mt-12 lg:mt-16"          {...createViewportAnimation(staggerItem, 0.2)}
        >
          <Button 
            variant="glass" 
            size="lg" 
            className="px-12 py-4 text-base"
            asChild
          >
            <Link href="/products">
              View All Products
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  )
}
