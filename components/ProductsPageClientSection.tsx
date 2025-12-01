'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Product } from '@/lib/types'
import { ProductCard } from '@/components/ui/product-card'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw, Filter, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProductsPageClientSectionProps {
  initialProducts: Product[]
}

export default function ProductsPageClientSection({ initialProducts }: ProductsPageClientSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false)
  const [products, setProducts] = React.useState(initialProducts)
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Check for URL search parameters on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
      setIsSearchExpanded(true)
    }
  }, [])
  
  // Extract unique categories from products
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        initialProducts
          .map(p => p.category?.name)
          .filter(Boolean) as string[]
      )
    ).sort()
    return ['all', ...uniqueCategories]
  }, [initialProducts])

  // Refresh products by fetching fresh data
  const refreshProducts = React.useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/products/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProducts(data.products)
        } else {
          console.error('Failed to refresh products:', data.message)
        }
      } else {
        console.error('Failed to refresh products')
      }
    } catch (error) {
      console.error('Error refreshing products:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Set up periodic refresh every 15 minutes (900000 ms)
  React.useEffect(() => {
    const interval = setInterval(refreshProducts, 900000)
    return () => clearInterval(interval)
  }, [refreshProducts])

  // Filter products based on search query and selected category
  const filteredProducts = React.useMemo(() => {
    let result = products
    
    // Apply category filter if not 'all'
    if (selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }
    
    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      )
    }
    
    return result
  }, [products, searchQuery, selectedCategory])

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="relative">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProducts}
            disabled={isRefreshing}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        {/* Search Input */}
        <motion.div
          className="relative w-full sm:w-64"
          initial={{ width: '6rem' }}
          animate={{ width: isSearchExpanded ? '20rem' : '6rem' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            onHoverStart={() => setIsSearchExpanded(true)}
            onHoverEnd={() => {
                if (searchQuery === '') {
                    setIsSearchExpanded(false)
                }
            }}
            onFocusCapture={() => setIsSearchExpanded(true)}
            onBlurCapture={() => {
                if (searchQuery === '') {
                    setIsSearchExpanded(false)
                }
            }}
            className="relative w-full"
          >
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full text-sm h-8"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>

      <div className={cn(
        "grid gap-4 sm:gap-5 md:gap-6 [grid-template-columns:repeat(auto-fit,minmax(312px,1fr))]",
        filteredProducts.length < 3 
          ? "max-w-4xl mx-auto" 
          : ""
      )}>
        {filteredProducts.map((product) => (
          <motion.div
            key={product.sys.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-base font-semibold mb-1.5">No products found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search terms or category filter</p>
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex justify-center gap-2 mt-3">
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              )}
              {selectedCategory !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Clear category
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
