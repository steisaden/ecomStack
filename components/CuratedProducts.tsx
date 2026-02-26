'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ValidatedProduct } from '@/lib/product-validation'
import {
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  ShoppingCart,
  Star,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CuratedProductsProps {
  className?: string
  showValidationSummary?: boolean
  maxProducts?: number
}

interface ValidationSummary {
  total: number
  valid: number
  invalid: number
  missingImages: number
  invalidUrls: number
  missingFields: number
  validationRate: number
}

export default function CuratedProducts({
  className,
  showValidationSummary = false,
  maxProducts
}: CuratedProductsProps) {
  const [products, setProducts] = useState<ValidatedProduct[]>([])
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async (includeValidation = false) => {
    try {
      const url = new URL('/api/curated-products', window.location.origin)
      if (includeValidation) {
        url.searchParams.set('summary', 'true')
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products')
      }

      setProducts(data.products || [])

      if (data.validation) {
        setValidationSummary(data.validation)
      }

      setError(null)
    } catch (err: any) {
      console.error('Error fetching curated products:', err)
      setError(err.message || 'Failed to load products')
    }
  }

  const refreshValidation = async () => {
    try {
      setRefreshing(true)

      const response = await fetch('/api/curated-products', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh validation')
      }

      setProducts(data.products || [])
      setValidationSummary(data.validation)
      setError(null)

    } catch (err: any) {
      console.error('Error refreshing validation:', err)
      setError(err.message || 'Failed to refresh validation')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      await fetchProducts(showValidationSummary)
      setLoading(false)
    }

    loadProducts()
  }, [showValidationSummary])

  const displayProducts = maxProducts ? products.slice(0, maxProducts) : products

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {showValidationSummary && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => fetchProducts(showValidationSummary)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Validation Summary */}
      {showValidationSummary && validationSummary && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Product Validation Summary
              </CardTitle>
              <CardDescription>
                Only validated products with thumbnails and working links are displayed
              </CardDescription>
            </div>
            <Button
              onClick={refreshValidation}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{validationSummary.valid}</div>
                <div className="text-sm text-gray-600">Valid Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{validationSummary.total}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{validationSummary.validationRate}%</div>
                <div className="text-sm text-gray-600">Validation Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{validationSummary.invalid}</div>
                <div className="text-sm text-gray-600">Invalid Products</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      {displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Validated Products</h3>
          <p className="text-gray-600 mb-4">
            No products currently pass validation. Products need thumbnails and working affiliate links to be displayed.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>To add products:</p>
            <p>• Add products to Contentful with images</p>
            <p>• Ensure affiliate URLs are working</p>
            <p>• Check that product screenshots are available</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.sys.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Show More Button */}
      {maxProducts && products.length > maxProducts && (
        <div className="text-center">
          <Button
            onClick={() => window.location.href = '/products'}
            variant="outline"
          >
            View All {products.length} Products
          </Button>
        </div>
      )}
    </div>
  )
}

// Individual Product Card Component
function ProductCard({ product }: { product: ValidatedProduct }) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleProductClick = () => {
    if (product.isAffiliate && product.affiliateUrl) {
      // Open affiliate link in new tab
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer')
    } else {
      // Navigate to product page
      window.location.href = `/products/${product.slug}`
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Image not available</p>
            </div>
          </div>
        )}

        {/* Validation Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </div>

        {/* Affiliate Badge */}
        {product.isAffiliate && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-white/90">
              <ExternalLink className="h-3 w-3 mr-1" />
              Affiliate
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Category */}
        {product.category && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              {product.category.name}
            </Badge>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price ?? 0)}
          </span>
          {product.inStock && (
            <Badge variant="secondary" className="text-green-700 bg-green-100">
              In Stock
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleProductClick}
          className="w-full"
          variant={product.isAffiliate ? "default" : "outline"}
        >
          {product.isAffiliate ? (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Product
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Learn More
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}