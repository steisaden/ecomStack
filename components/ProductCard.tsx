'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createButton, createCard } from '@/lib/cecred-design-system'
import { ProductCategory } from '@/lib/enums'
import { AspectRatio } from '@radix-ui/react-aspect-ratio'
import Image from 'next/image'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    category: ProductCategory
    rating: number
    isNew?: boolean
    isBestSeller?: boolean
    isOrganic?: boolean
    isCrueltyFree?: boolean
    isHandcrafted?: boolean
  }
  uniformHeight?: boolean // Add prop to control uniform height
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product,
  uniformHeight = false // Default to false
}: ProductCardProps) => {
  const prefersReducedMotion = useReducedMotion()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleAddToCart = () => {
    console.log('Add to cart:', product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ duration: 0.3 }}
      className={cn(
        createCard('base'),
        "product-card group relative rounded-2xl overflow-hidden",
        uniformHeight ? "h-full flex flex-col" : ""
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {product.isNew && (
          <span className="bg-primary text-white text-xs px-2 py-1 rounded-sm font-medium">
            NEW
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-accent text-primary text-xs px-2 py-1 rounded-sm font-medium">
            BEST
          </span>
        )}
      </div>

      {/* Sustainability badges */}
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        {product.isOrganic && (
          <span className="bg-green-100 text-green-800 text-xs w-6 h-6 rounded-full flex items-center justify-center" title="Organic">
            🌿
          </span>
        )}
        {product.isCrueltyFree && (
          <span className="bg-blue-100 text-blue-800 text-xs w-6 h-6 rounded-full flex items-center justify-center" title="Cruelty Free">
            🐰
          </span>
        )}
        {product.isHandcrafted && (
          <span className="bg-purple-100 text-purple-800 text-xs w-6 h-6 rounded-full flex items-center justify-center" title="Handcrafted">
            ✋
          </span>
        )}
      </div>

      {uniformHeight ? (
        <div className="w-full overflow-hidden bg-light-gray relative rounded-t-2xl">
          <AspectRatio ratio={1}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={cn(
                "w-full h-full object-cover transition-transform duration-500",
                prefersReducedMotion ? "" : "group-hover:scale-105"
              )}
            />
          </AspectRatio>
        </div>
      ) : (
        <div className="product-card-image">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              prefersReducedMotion ? "" : "group-hover:scale-105"
            )}
          />
        </div>
      )}

      <div className={cn(
        "product-card-content",
        uniformHeight ? "flex flex-col flex-grow" : ""
      )}>
        <h3 className={cn(
          "text-product-title font-medium text-darkGray mb-2",
          uniformHeight ? "line-clamp-2" : ""
        )}>
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-none'}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray ml-2">{product.rating}</span>
        </div>
        
        {/* Pricing */}
        <div className={cn(
          "flex items-center justify-between mb-4",
          uniformHeight ? "mt-auto" : ""
        )}>
          <div className="flex items-baseline gap-2">
            <span className="text-product-price font-light text-darkGray">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          className={cn(
            createButton('secondary'),
            "w-full px-4 py-2 text-xs",
            prefersReducedMotion 
              ? "transition-colors duration-200" 
              : "transition-all duration-300 hover:shadow-md"
          )}
        >
          ADD TO BAG
        </button>
      </div>
    </motion.div>
  )
}

export default ProductCard