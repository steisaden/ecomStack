'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ShoppingCart, ExternalLink, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { title, price, images, slug, isAffiliate, affiliateUrl } = product
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // For affiliate products, redirect to affiliate URL
    if (isAffiliate && affiliateUrl) {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
      return
    }
    
    // For regular products, add to cart
    const cartProduct = {
      name: product.title,
      price: product.price,
      image: product.images?.[0]?.url,
    }
    addToCart(cartProduct)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // For affiliate products, redirect to affiliate URL
    if (isAffiliate && affiliateUrl) {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
      return
    }
    
    // For regular products, navigate to product page
    window.location.href = `/products/${slug}`
  }

  // Precompute image URL and alt text for better performance
  const imageUrl = images[0]?.url || '/images/oil.png'
  const imageAlt = title || 'Product image'
  
  // Precompute formatted price to avoid repeated calculations
  const formattedPrice = price ? `${price.toFixed(2)}` : null

  return (
    <div 
      className={cn("w-full", className)}
      // Using CSS transitions for better performance
      style={{ 
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Card className="h-full overflow-hidden flex flex-col">
        {/* Optimized aspect ratio for product images - reduced size */}
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4=`}
          />
          
          {/* Product Status Badges */}
          <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5">
            {isAffiliate && (
              <Badge variant="default" className="text-[8px] px-1 py-0.5 bg-purple-600 hover:bg-purple-700">
                <Star className="w-2 h-2 mr-0.5" />
                Partner
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary" className="text-[8px] px-1 py-0.5">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
        <CardHeader className="p-2">
          <CardTitle className="text-xs mb-1 leading-tight text-product-title truncate">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          {formattedPrice && (
            <div className="text-xs font-semibold mb-1">
              {formattedPrice}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 p-2 flex flex-col gap-1">
          {isAffiliate ? (
            // Affiliate Product Button
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-xs py-1 h-7" 
              onClick={handleBuyNow}
              disabled={!product.inStock}
            >
              <ExternalLink className="h-2.5 w-2.5 mr-1" />
              Shop Now
            </Button>
          ) : (
            // Regular Product Buttons
            <>
              <Button 
                className="w-full text-xs py-1 h-7" 
                variant="outline"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-2.5 w-2.5 mr-1" /> 
                Add to Cart
              </Button>
              <Link href={`/products/${slug}`} className="w-full" aria-label={`Buy Now – ${title}`}>
                <Button 
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-xs py-1 h-7" 
                  disabled={!product.inStock}
                >
                  Buy Now
                </Button>
              </Link>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
