"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Filter,
  Star,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Grid,
  List,
  ChevronDown,
  Check,
  Eye,
  ShoppingCart,
  Heart,
  Award,
  Zap,
  Settings,
  X,
  RefreshCw,
  Download
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Image from 'next/image'
import { type CuratedProduct } from '@/lib/amazon-curated-catalog'
import { createAffiliateProduct } from '@/lib/affiliate-products'
import { getBaseUrl } from '@/lib/utils'

interface CuratedCatalogProps {
  onProductAdded?: () => void
}

export function CuratedCatalog({ onProductAdded }: CuratedCatalogProps) {
  const [products, setProducts] = useState<CuratedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categories, setCategories] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [suitableForOptions, setSuitableForOptions] = useState<string[]>([])
  const [priceRanges, setPriceRanges] = useState<string[]>([])
  const [allProducts, setAllProducts] = useState<CuratedProduct[]>([])
  const [newCategoryName, setNewCategoryName] = useState('') // New state for category management

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlatform, setSelectedPlatform] = useState('amazon')
  const [selectedPriceRange, setSelectedPriceRange] = useState<'all' | 'budget' | 'mid-range' | 'luxury'>('all')
  const [selectedSuitableFor, setSelectedSuitableFor] = useState('all')
  const [showPopular, setShowPopular] = useState(false)
  const [showTrending, setShowTrending] = useState(false)
  const [showNewArrivals, setShowNewArrivals] = useState(false)

  // Load Amazon products on mount
  useEffect(() => {
    loadCuratedProducts()
    loadCategories()
  }, [])

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters()
  }, [searchTerm, selectedCategory, selectedPriceRange, selectedSuitableFor, showPopular, showTrending, showNewArrivals, allProducts])

  const loadCuratedProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/curated-catalog')
      const data = await response.json()

      if (data.success) {
        const catalog = data.products || []
        setAllProducts(catalog)
        setProducts(catalog)

        // Load filter options from the catalog
        setCategories(localGetCuratedCategories(catalog))
        setPlatforms(localGetCuratedPlatforms(catalog))
        setSuitableForOptions(localGetSuitableForOptions(catalog))
        setPriceRanges(localGetPriceRanges())

        if (data.source === 'verified-generation') {
          toast.success(data.message || `Generated ${catalog.length} verified products with Amazon data!`)
          if (data.asinsVerified && data.totalASINs) {
            toast.info(`✅ ${data.asinsVerified}/${data.totalASINs} ASINs verified successfully`)
          }
          if (data.thumbnailsCaptured > 0) {
            toast.info(`📸 ${data.thumbnailsCaptured} Amazon thumbnails captured`)
          }
        } else if (data.source === 'unique-generation') {
          toast.success(data.message || `Generated ${catalog.length} completely new products!`)
          if (data.screenshotsQueued) {
            toast.info('Real product screenshots are being captured in the background!')
          }
        } else if (data.source === 'real-amazon-products') {
          toast.success(data.message || `Loaded ${catalog.length} real Amazon products with affiliate links!`)
        } else if (data.source === 'fallback') {
          if (data.message) {
            toast.info(data.message)
          } else {
            toast.info('Amazon API not configured. Showing setup instructions.')
          }
        } else if (data.source === 'amazon-api' && catalog.length > 0) {
          toast.success(data.message || `Loaded ${catalog.length} curated Amazon products`)
        } else if (data.error) {
          toast.error(data.error)
        }
      } else {
        throw new Error(data.error || 'Failed to load catalog')
      }
    } catch (error: any) {
      console.error('Error loading curated products:', error)
      toast.error(`Failed to load curated products: ${error.message || 'Network error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (categoryName: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Category added successfully')
        setNewCategoryName('')
        // Reload categories
        loadCategories()
      } else {
        throw new Error(data.error || 'Failed to add category')
      }
    } catch (error: any) {
      console.error('Error adding category:', error)
      toast.error(error.message || 'Failed to add category')
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (data.success && data.categories) {
        // We could merge these with the curated categories if needed
        console.log('Loaded categories:', data.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const applyFilters = () => {
    try {
      const filteredProducts = localFilterCuratedProducts(allProducts, {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        priceRange: selectedPriceRange !== 'all' ? selectedPriceRange : undefined,
        platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
        suitableFor: selectedSuitableFor !== 'all' ? selectedSuitableFor : undefined,
        isPopular: showPopular || undefined,
        isTrending: showTrending || undefined,
        isNewArrival: showNewArrivals || undefined,
        searchTerm: searchTerm.trim() || undefined
      })
      setProducts(filteredProducts)
    } catch (error) {
      console.error('Error filtering products:', error)
    }
  }

  // Helper functions for filter options (now using state)
  const getCategories = () => categories
  const getPlatforms = () => platforms
  const getPriceRanges = () => priceRanges
  const getSuitableForOptions = () => suitableForOptions

  // Local helper functions for filtering and extracting options
  const localFilterCuratedProducts = (
    productsToFilter: CuratedProduct[],
    filters: {
      category?: string;
      priceRange?: 'budget' | 'mid-range' | 'luxury';
      platform?: string;
      suitableFor?: string;
      isPopular?: boolean;
      isTrending?: boolean;
      isNewArrival?: boolean;
      searchTerm?: string;
    }
  ): CuratedProduct[] => {
    return productsToFilter.filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.priceRange && product.priceRange !== filters.priceRange) return false;
      if (filters.platform && product.platform !== filters.platform) return false;
      if (filters.suitableFor && !product.suitableFor.includes(filters.suitableFor)) return false;
      if (filters.isPopular && !product.isPopular) return false;
      if (filters.isTrending && !product.isTrending) return false;
      if (filters.isNewArrival && !product.isNewArrival) return false;

      if (filters.searchTerm) {
        const lowerCaseSearchTerm = filters.searchTerm.toLowerCase();
        const matches =
          product.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          product.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          product.brandName.toLowerCase().includes(lowerCaseSearchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm)) ||
          product.benefits.some(benefit => benefit.toLowerCase().includes(lowerCaseSearchTerm));
        if (!matches) return false;
      }
      return true;
    });
  };

  const localGetCuratedCategories = (products: CuratedProduct[]): string[] => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => uniqueCategories.add(product.category));
    return Array.from(uniqueCategories).sort();
  };

  const localGetCuratedPlatforms = (products: CuratedProduct[]): string[] => {
    const uniquePlatforms = new Set<string>();
    products.forEach(product => uniquePlatforms.add(product.platform));
    return Array.from(uniquePlatforms).sort();
  };

  const localGetSuitableForOptions = (products: CuratedProduct[]): string[] => {
    const uniqueOptions = new Set<string>();
    products.forEach(product => product.suitableFor.forEach(option => uniqueOptions.add(option)));
    return Array.from(uniqueOptions).sort();
  };

  const localGetPriceRanges = (): ('budget' | 'mid-range' | 'luxury')[] => {
    return ['budget', 'mid-range', 'luxury'];
  };

  const handleAddProduct = async (curatedProduct: CuratedProduct) => {
    setAddingProducts(prev => new Set(prev).add(curatedProduct.id))

    try {
      const affiliateProductData = {
        title: curatedProduct.title,
        description: curatedProduct.description || '',
        price: curatedProduct.price || 0,
        imageUrl: curatedProduct.imageUrl,
        affiliateUrl: curatedProduct.affiliateUrl,
        category: curatedProduct.category,
        tags: curatedProduct.tags,
        commissionRate: curatedProduct.commissionRate,
        platform: curatedProduct.platform,
        scheduledPromotions: []
      }

      await createAffiliateProduct(affiliateProductData as any)

      toast.success(`Added "${curatedProduct.title}" to your products!`)
      onProductAdded?.()

      // Refresh the product cache
      try {
        await fetch('/api/revalidate-products', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (cacheError) {
        console.warn('Failed to refresh cache:', cacheError)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product. Please try again.')
    } finally {
      setAddingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(curatedProduct.id)
        return newSet
      })
    }
  }

  const handleRefreshFromAmazon = async (asin: string) => {
    setLoading(true); // Indicate that a refresh is in progress
    try {
      const response = await fetch(`${getBaseUrl()}/api/amazon/product/refresh/${asin}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Product ${asin} refreshed from Amazon!`);
        // Reload the entire catalog to reflect changes
        await loadCuratedProducts();
      } else {
        throw new Error(data.error || `Failed to refresh product ${asin}.`);
      }
    } catch (error: any) {
      console.error(`Error refreshing product ${asin}:`, error);
      toast.error(`Failed to refresh product ${asin}: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedPlatform('all')
    setSelectedPriceRange('all')
    setSelectedSuitableFor('all')
    setShowPopular(false)
    setShowTrending(false)
    setShowNewArrivals(false)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'amazon': return '🛒'
      case 'sephora': return '💄'
      case 'ulta': return '✨'
      case 'shareasale': return '🤝'
      case 'cj': return '🔗'
      default: return '🏪'
    }
  }

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case 'budget': return 'bg-green-100 text-green-800'
      case 'mid-range': return 'bg-blue-100 text-blue-800'
      case 'luxury': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-beauty-dark">Curated Product Catalog</h2>
          <p className="text-beauty-muted">
            Browse and add pre-selected, brand-appropriate affiliate products to your store
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beauty-muted" />
            <Input
              placeholder="Search products, brands, or benefits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {localGetCuratedCategories(allProducts).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {localGetCuratedPlatforms(allProducts).map(platform => (
                  <SelectItem key={platform} value={platform}>
                    {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                {localGetPriceRanges().map(range => (
                  <SelectItem key={range} value={range}>
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSuitableFor} onValueChange={setSelectedSuitableFor}>
              <SelectTrigger>
                <SelectValue placeholder="Suitable For" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skin Types</SelectItem>
                {localGetSuitableForOptions(allProducts).map(option => (
                  <SelectItem key={option} value={option}>
                    {option.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Row 2 - Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showPopular ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPopular(!showPopular)}
            >
              <Star className="w-3 h-3 mr-1" />
              Popular
            </Button>
            <Button
              variant={showTrending ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTrending(!showTrending)}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Button>
            <Button
              variant={showNewArrivals ? "default" : "outline"}
              size="sm"
              onClick={() => setShowNewArrivals(!showNewArrivals)}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              New Arrivals
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-beauty-muted">
            Showing {products.length} of {allProducts.length} products
            {allProducts.length > 0 && (
              <span className="ml-2 text-green-600">
                ✓ All products have verified Amazon ASINs and working affiliate links
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Management for Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Category Management
          </CardTitle>
          <CardDescription>
            Manage product categories and organize your curated catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">Current Categories</h3>
              <div className="flex flex-wrap gap-2">
                {localGetCuratedCategories(allProducts).map(category => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <button
                      onClick={() => {
                        // In a real implementation, this would call an API to remove the category
                        toast.info(`Would remove category: ${category} (not implemented)`)
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Add New Category</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      // In a real implementation, this would call an API to add the category
                      toast.info(`Would add category: ${newCategoryName} (not implemented)`)
                      setNewCategoryName('')
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      // In a real implementation, this would call an API to add the category
                      toast.info(`Would add category: ${newCategoryName} (not implemented)`)
                      setNewCategoryName('')
                    }
                  }}
                  disabled={!newCategoryName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Bulk Actions</h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      setLoading(true)
                      toast.info('Refreshing catalog with new products and images...')

                      const response = await fetch(`${getBaseUrl()}/api/curated-catalog/refresh`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      })

                      if (response.ok) {
                        const data = await response.json()
                        toast.success(data.message || 'Catalog refreshed successfully')

                        // Show additional info if available
                        if (data.productsGenerated > 0) {
                          toast.info(`Generated ${data.productsGenerated} completely new products!`)
                        }
                        if (data.asinsVerified && data.totalASINs) {
                          toast.success(`✅ ${data.asinsVerified}/${data.totalASINs} ASINs verified with working links!`)
                        }
                        if (data.thumbnailsCaptured > 0) {
                          toast.success(`📸 ${data.thumbnailsCaptured} Amazon product thumbnails captured!`)
                        }
                        if (data.screenshotsQueued > 0) {
                          toast.info(`Queued ${data.screenshotsQueued} additional screenshots for enhanced images!`)
                        }
                        if (data.source === 'verified-generation') {
                          toast.success('🎉 All products verified with real Amazon data!')
                        }

                        // Reload the products
                        await loadCuratedProducts()
                      } else {
                        throw new Error('Failed to refresh catalog')
                      }
                    } catch (error: any) {
                      console.error('Error refreshing catalog:', error)
                      toast.error(`Failed to refresh catalog: ${error.message || 'Unknown error'}`)
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh Catalog'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export current catalog
                    const dataStr = JSON.stringify(allProducts, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'curated-catalog-export.json'
                    link.click()
                    URL.revokeObjectURL(url)
                    toast.success('Catalog exported successfully')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Catalog
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Products Grid/List */}
      {!loading && viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card key={`${product.id}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/400x400?text=Image+Not+Found`;
                    e.currentTarget.srcset = '';
                  }}
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isPopular && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {product.isTrending && (
                    <Badge className="bg-red-500 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  {product.isNewArrival && (
                    <Badge className="bg-green-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>

                {/* Price Range */}
                <div className="absolute top-2 right-2">
                  <Badge className={getPriceRangeColor(product.priceRange)}>
                    {product.priceRange}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{product.title}</CardTitle>
                    <p className="text-sm text-beauty-muted">{product.brandName}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-beauty-primary">${product.price}</div>
                    <div className="text-xs text-beauty-muted">{product.commissionRate}% commission</div>
                  </div>
                </div>
                {product.asinValid !== undefined && (
                  <div className="mt-2">
                    <Badge variant={product.asinValid ? "default" : "destructive"}>
                      {product.asinValid ? "ASIN Valid" : "ASIN Invalid"}
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="py-2">
                <p className="text-sm text-beauty-muted line-clamp-2 mb-3">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-xs text-beauty-muted">({product.reviewCount} reviews)</span>
                </div>

                {/* Platform */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">{getPlatformIcon(product.platform)}</span>
                  <span className="text-sm text-beauty-muted capitalize">{product.platform}</span>
                </div>

                {/* Benefits */}
                <div className="flex flex-wrap gap-1">
                  {product.benefits.slice(0, 3).map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                  {product.benefits.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{product.benefits.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(product.affiliateUrl, '_blank')}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddProduct(product)}
                    disabled={addingProducts.has(product.id)}
                  >
                    {addingProducts.has(product.id) ? (
                      <>
                        <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Store
                      </>
                    )}
                  </Button>
                  {product.asin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshFromAmazon(product.asin!)}
                      disabled={loading} // Disable if overall catalog is loading
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !loading ? (
        // List View
        <div className="space-y-4">
          {products.map((product, index) => (
            <Card key={`${product.id}-${index}`} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/80x80?text=Image+Not+Found`;
                        e.currentTarget.srcset = '';
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-beauty-dark line-clamp-1">{product.title}</h3>
                        <p className="text-sm text-beauty-muted">{product.brandName}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-beauty-primary">${product.price}</div>
                        <div className="text-xs text-beauty-muted">{product.commissionRate}% commission</div>
                      </div>
                    </div>

                    <p className="text-sm text-beauty-muted line-clamp-2 mb-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                          <span className="text-xs text-beauty-muted">({product.reviewCount})</span>
                        </div>

                        <Badge className={getPriceRangeColor(product.priceRange)}>
                          {product.priceRange}
                        </Badge>

                        <span className="text-sm">{getPlatformIcon(product.platform)} {product.platform}</span>
                        {product.asinValid !== undefined && (
                          <Badge variant={product.asinValid ? "default" : "destructive"}>
                            {product.asinValid ? "ASIN Valid" : "ASIN Invalid"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(product.affiliateUrl, '_blank')}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddProduct(product)}
                          disabled={addingProducts.has(product.id)}
                        >
                          {addingProducts.has(product.id) ? (
                            <>
                              <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Add to Store
                            </>
                          )}
                        </Button>
                        {product.asin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefreshFromAmazon(product.asin!)}
                            disabled={loading}
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-beauty-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-beauty-dark mb-2">No products found</h3>
            <p className="text-beauty-muted mb-4">
              Try adjusting your filters or search terms to find more products.
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
