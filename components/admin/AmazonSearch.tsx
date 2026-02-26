"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  ExternalLink,
  Star,
  Package,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAffiliateProduct } from '@/lib/affiliate-products'
import { extractAsinFromUrl } from '@/lib/amazon/utils'
import type { AffiliateProduct } from '@/lib/types'
import { toast } from 'sonner'

interface AmazonProduct {
  title: string
  description: string
  price: number
  imageUrl: string
  affiliateUrl: string
  asin?: string
  category: string
  tags: string[]
  commissionRate: number
  platform: 'amazon'
  scheduledPromotions: any[]
}

interface AmazonSearchProps {
  onProductAdded?: () => void
}

export function AmazonSearch({ onProductAdded }: AmazonSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchIndex, setSearchIndex] = useState('Beauty')
  const [searchResults, setSearchResults] = useState<AmazonProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addingProducts, setAddingProducts] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const searchIndexOptions = [
    { value: 'Beauty', label: 'Beauty & Personal Care' },
    { value: 'HealthPersonalCare', label: 'Health & Personal Care' },
    { value: 'All', label: 'All Departments' },
    { value: 'Baby', label: 'Baby Products' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'HomeGarden', label: 'Home & Garden' },
    { value: 'PetSupplies', label: 'Pet Supplies' },
    { value: 'Sports', label: 'Sports & Outdoors' }
  ]

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch('/api/amazon/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: searchTerm,
          searchIndex,
          itemCount: 10
        })
      })

      const data = await response.json()

      if (data.success) {
        setSearchResults(data.products || [])
        if (data.message) {
          if (data.products.length === 0) {
            toast.info(data.message)
          } else {
            toast.success(data.message)
          }
        }
      } else {
        // Handle API errors gracefully
        setSearchResults([])

        if (data.configurationRequired) {
          setError('Amazon API not configured. Please add your credentials to continue.')
          toast.error('Amazon API configuration required')
        } else {
          setError(data.error || 'Search failed')
          toast.error(data.error || 'Search failed')
        }
      }
    } catch (error: any) {
      console.error('Search error:', error)
      setError(error.message)
      toast.error(`Search failed: ${error.message}`)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddProduct = async (product: AmazonProduct, index: number) => {
    setAddingProducts(prev => new Set(prev).add(index))

    try {
      const asin = product.asin ?? extractAsinFromUrl(product.affiliateUrl) ?? undefined
      const productData: Omit<AffiliateProduct, 'id' | 'performance' | 'status'> = {
        title: product.title,
        description: product.description,
        price: product.price ?? 0,
        imageUrl: product.imageUrl,
        affiliateUrl: product.affiliateUrl,
        asin: asin ?? '',
        category: product.category,
        tags: product.tags,
        commissionRate: product.commissionRate,
        platform: product.platform,
        scheduledPromotions: product.scheduledPromotions,
        imageRefreshStatus: 'current' as const,
        linkValidationStatus: 'valid' as const,
        needsReview: false,
      }

      await createAffiliateProduct(productData)
      toast.success(`Added "${product.title}" to your products`)
      onProductAdded?.()
    } catch (error: any) {
      console.error('Error adding product:', error)
      toast.error(`Failed to add product: ${error.message}`)
    } finally {
      setAddingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search for beauty products, brands, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={searchIndex} onValueChange={setSearchIndex}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {searchIndexOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchTerm.trim()}
          className="w-full sm:w-auto"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search Amazon
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Search Error</p>
            </div>
            <p className="text-red-600 mt-1 text-sm">{error}</p>
            {(error.includes('not configured') || error.includes('configuration required')) && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Setup Required:</strong> Amazon API credentials need to be configured in your environment variables:
                </p>
                <ul className="text-xs text-red-700 mt-2 space-y-1">
                  <li>• AMAZON_ACCESS_KEY (from AWS IAM)</li>
                  <li>• AMAZON_SECRET_KEY (from AWS IAM)</li>
                  <li>• AMAZON_ASSOCIATE_TAG (from Amazon Associates)</li>
                </ul>
                <div className="mt-2 p-2 bg-red-50 rounded">
                  <p className="text-xs text-red-600">
                    <strong>Note:</strong> You need both Amazon Associates approval AND Product Advertising API access approval.
                  </p>
                </div>
              </div>
            )}

            {error.includes('authentication failed') && (
              <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Authentication Issue:</strong> Your Amazon API credentials may be incorrect or your API access may not be approved yet.
                </p>
                <ul className="text-xs text-orange-700 mt-2 space-y-1">
                  <li>• Verify your AWS IAM credentials are correct</li>
                  <li>• Ensure your Amazon Associates account is approved</li>
                  <li>• Check that Product Advertising API access is approved</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-beauty-dark">
              Search Results ({searchResults.length})
            </h3>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Amazon Products
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((product, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-sm line-clamp-2">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Price and Commission */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.commissionRate}% commission
                      </Badge>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p className="text-xs text-beauty-muted line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="text-xs px-2 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddProduct(product, index)}
                        disabled={addingProducts.has(index)}
                        className="flex-1"
                      >
                        {addingProducts.has(index) ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Add Product
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(product.affiliateUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-beauty-dark mb-2">
              Search Amazon Products
            </h3>
            <p className="text-beauty-muted mb-4 max-w-md mx-auto">
              Enter keywords to search Amazon&apos;s catalog for products that match your brand.
              We&apos;ll automatically generate affiliate links with your Associates tag.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-beauty-muted">
              <span>Try searching for:</span>
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchTerm('organic skincare')}>
                organic skincare
              </Badge>
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchTerm('hair oil')}>
                hair oil
              </Badge>
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchTerm('beauty tools')}>
                beauty tools
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Search className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-beauty-dark mb-1">Amazon Search Tips</h4>
              <div className="space-y-1 text-sm text-beauty-muted">
                <p>• Use specific product names or brand names for better results</p>
                <p>• Select the appropriate category to narrow down results</p>
                <p>• Products automatically include your Amazon Associates tag</p>
                <p>• Commission rates are estimated based on Amazon&apos;s standard rates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
