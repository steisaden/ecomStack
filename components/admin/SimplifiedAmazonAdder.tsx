'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Search,
  ExternalLink,
  Star,
  Package,
  DollarSign,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface AmazonProduct {
  asin: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  affiliateUrl: string;
  brandName: string;
  rating: number;
  reviewCount: number;
  features: string[];
  isValid: boolean;
}

export function SimplifiedAmazonAdder() {
  const [asin, setAsin] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<AmazonProduct | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchProduct = async () => {
    if (!asin.trim()) {
      toast.error('Please enter an ASIN')
      return
    }

    setLoading(true)
    setError(null)

    const sanitizedAsin = asin.trim().toUpperCase()

    try {
      // First validate the ASIN format
      const asinRegex = /^[A-Z0-9]{10}$/
      if (!asinRegex.test(sanitizedAsin)) {
        throw new Error('Invalid ASIN format. ASINs are 10-character identifiers.')
      }

      // Use our proper Amazon PA-API integration
      const response = await fetch(`/api/amazon/product/${sanitizedAsin}`, {
        method: 'GET',
        credentials: 'include',  // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product details')
      }

      if (!data.success || !data.data) {
        throw new Error('Product not found. Please check the ASIN.')
      }

      // Transform the PA-API response to our component format
      const amazonProduct = data.data
      const transformedProduct: AmazonProduct = {
        asin: amazonProduct.asin,
        title: amazonProduct.title || `Product ${sanitizedAsin}`,
        description: amazonProduct.features?.join('. ') || 'No description available',
        price: amazonProduct.price?.amount || 0,
        imageUrl: amazonProduct.imageUrl || `https://m.media-amazon.com/images/P/${sanitizedAsin}.01._SY300_QL70_.jpg`,
        affiliateUrl: amazonProduct.url || `https://www.amazon.com/dp/${sanitizedAsin}`,
        brandName: amazonProduct.brand || 'Unknown Brand',
        rating: 4.5, // Default rating since PA-API doesn't always provide this
        reviewCount: 100, // Default review count
        features: amazonProduct.features || [],
        isValid: true
      }

      setProduct(transformedProduct)
      toast.success('Product details fetched successfully!')
    } catch (error: any) {
      console.error('Error fetching product details from API:', error);

      // If the main API fails, try to extract image information directly from Amazon page
      try {
        toast.info('API failed, trying to fetch image directly from Amazon...');

        // Try to extract image via our server-side scraping API
        const scrapeResponse = await fetch(`/api/amazon/scrape-image?asin=${sanitizedAsin}`, {
          method: 'GET',
          credentials: 'include',  // Include cookies for auth if needed
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const scrapeResult = await scrapeResponse.json();

        if (scrapeResponse.ok && scrapeResult.success && scrapeResult.imageUrl) {
          // Use the scraped data to create a fallback product
          const fallbackProduct: AmazonProduct = {
            asin: asin,
            title: scrapeResult.title || `Product ${asin}`,
            description: 'Product details not available via API, but image fetched from Amazon',
            price: parseFloat(scrapeResult.price?.replace(/[^0-9.]/g, '')) || 0,
            imageUrl: scrapeResult.imageUrl,
            affiliateUrl: `https://www.amazon.com/dp/${asin}`,
            brandName: 'Unknown Brand',
            rating: 0,
            reviewCount: 0,
            features: [],
            isValid: true
          };

          setProduct(fallbackProduct);
          toast.success('Fetched product image directly from Amazon');
        } else {
          // If scraping also failed, fall back to a generated URL
          const fallbackImageUrl = `https://m.media-amazon.com/images/P/${asin}.01._SY400_QL70_.jpg`;

          const fallbackProduct: AmazonProduct = {
            asin: asin,
            title: `Product ${asin}`,
            description: 'Product details not available via API, but image may load from Amazon',
            price: 0, // Unknown price
            imageUrl: fallbackImageUrl,
            affiliateUrl: `https://www.amazon.com/dp/${asin}`,
            brandName: 'Unknown Brand',
            rating: 0,
            reviewCount: 0,
            features: [],
            isValid: true
          };

          setProduct(fallbackProduct);
          toast.success('Using fallback product image');
        }
      } catch (fallbackError: any) {
        console.error('All attempts to fetch product failed:', fallbackError);
        setError('Failed to fetch product from API and direct Amazon lookup. Please check the ASIN.');
        toast.error('All methods to fetch product details failed');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleAddProduct = async () => {
    if (!product) return

    setAdding(true)

    try {
      // Add product to affiliate products
      const response = await fetch('/api/admin/affiliate-products', {
        method: 'POST',
        credentials: 'include',  // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            title: product.title,
            description: product.description || '',
            price: product.price,
            imageUrl: product.imageUrl, // This will now be a real Amazon image
            affiliateUrl: product.affiliateUrl,
            category: 'Amazon Products', // Default category
            tags: [product.brandName, ...product.features.slice(0, 3)], // Use brand and first 3 features as tags
            commissionRate: 4, // Default commission rate
            platform: 'amazon',
            scheduledPromotions: [] // Adding the expected field
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add product')
      }

      const result = await response.json()
      toast.success(`Successfully added "${product.title}" to your products!`)
      // Reset form
      setAsin('')
      setProduct(null)
    } catch (error: any) {
      console.error('Error adding product:', error)
      toast.error(`Failed to add product: ${error.message || 'Unknown error'}`)
    } finally {
      setAdding(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (product) {
        handleAddProduct()
      } else {
        handleFetchProduct()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Search className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-beauty-dark mb-1">Add Amazon Affiliate Product</h3>
            <p className="text-sm text-beauty-muted">
              Enter an Amazon product&apos;s ASIN (10-character identifier) to add it to your store with real product image and affiliate link
            </p>
          </div>
        </div>
      </div>

      {/* ASIN Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Enter Product ASIN
          </CardTitle>
          <CardDescription>
            Find the ASIN on Amazon product pages or in the URL. It&apos;s a 10-character code (e.g., B08N5WRWNW).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="asin">Amazon Standard Identification Number (ASIN)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="asin"
                  placeholder="Enter ASIN (e.g., B08N5WRWNW)"
                  value={asin}
                  onChange={(e) => setAsin(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="font-mono"
                />
                <Button
                  onClick={product ? handleAddProduct : handleFetchProduct}
                  disabled={loading || adding || (!asin.trim() && !product)}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {product ? 'Adding...' : 'Fetching...'}
                    </>
                  ) : adding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : product ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Add to Store
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Fetch Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Preview */}
      {product && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Preview
            </CardTitle>
            <CardDescription>
              Review the product details before adding to your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-sm aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-contain p-4"
                      onError={(e) => {
                        // Change to a default image when Amazon image fails
                        const target = e.currentTarget;
                        // Use a local product placeholder image as fallback
                        target.src = '/images/product-placeholder.svg';
                      }}
                      unoptimized // Important: disable optimization for external images that may be protected
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-beauty-dark">{product.title}</h3>
                  <p className="text-beauty-muted mt-1">{product.brandName}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-beauty-muted">({product.reviewCount} reviews)</span>
                  <Badge variant="secondary" className="ml-auto">
                    {product.isValid ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Valid ASIN
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Invalid ASIN
                      </>
                    )}
                  </Badge>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-green-600">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Amazon Product
                  </Badge>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium text-beauty-dark mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-beauty-muted flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add Button */}
                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={handleAddProduct}
                    disabled={adding}
                  >
                    {adding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding to Store...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Add This Product to My Store
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How to Find ASIN */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            How to Find an ASIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-beauty-muted">
            <p><strong>On Amazon Website:</strong> The ASIN is in the product URL or in the &quot;Product Information&quot; section</p>
            <p><strong>Example URL:</strong> https://www.amazon.com/dp/<strong className="font-mono bg-blue-100 px-1 rounded">B08N5WRWNW</strong>/...</p>
            <p><strong>On Product Page:</strong> Look for &quot;ASIN&quot; in the Product Information details section</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// HelpCircle icon component (since it's not imported but used in the JSX)
const HelpCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <path d="M12 17h.01"></path>
  </svg>
)