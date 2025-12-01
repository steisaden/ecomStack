'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product, AffiliateProduct } from '@/lib/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  MoreHorizontal, 
  Filter, 
  RefreshCw, 
  Edit,
  Eye,
  Trash2,
  Tag,
  X,
  Save,
  Pencil
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import BulkProductUpload from '@/components/admin/BulkProductUpload'
import ProductStatusDashboard from '@/components/admin/ProductStatusDashboard'
import BulkProductActions from '@/components/admin/BulkProductActions'
import JobMonitor from '@/components/admin/JobMonitor'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [updatedCategoryName, setUpdatedCategoryName] = useState('')
  const router = useRouter()

  // Fetch products from API
  const fetchProducts = async () => {
    setIsLoading(true)
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
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(
              data.products
                .map(p => p.category?.name)
                .filter(Boolean) as string[]
            )
          ).sort()
          
          setCategories(['all', ...uniqueCategories])
        }
      } else {
        console.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize data
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products based on category and search term
  useEffect(() => {
    let result = products
    
    if (selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(product => 
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category?.name?.toLowerCase().includes(term)
      )
    }
    
    setFilteredProducts(result)
  }, [products, selectedCategory, searchTerm])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchProducts()
    setIsRefreshing(false)
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`)
  }

  const handleViewProduct = (productSlug: string) => {
    window.open(`/products/${productSlug}`, '_blank')
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories(prev => [...prev, newCategoryName.trim()])
      setNewCategoryName('')
    }
  }

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (categoryToDelete === 'all') return
    
    // Remove the category from the list
    setCategories(prev => prev.filter(cat => cat !== categoryToDelete))
    
    // If the current selected category is the one being deleted, reset to 'all'
    if (selectedCategory === categoryToDelete) {
      setSelectedCategory('all')
    }
  }

  const startEditCategory = (category: string) => {
    setEditingCategory(category)
    setUpdatedCategoryName(category)
  }

  const saveEditCategory = (oldName: string) => {
    if (updatedCategoryName.trim() && updatedCategoryName.trim() !== oldName) {
      // Update category name in categories list
      setCategories(prev => 
        prev.map(cat => cat === oldName ? updatedCategoryName.trim() : cat)
      )
      
      // Update products that have this category
      setProducts(prev => 
        prev.map(product => {
          if (product.category && product.category.name === oldName) {
            return {
              ...product,
              category: {
                ...product.category,
                name: updatedCategoryName.trim(),
                slug: updatedCategoryName.trim().toLowerCase().replace(/\s+/g, '-')
              }
            }
          }
          return product
        })
      )
      
      // If the selected category was the old name, update it to the new name
      if (selectedCategory === oldName) {
        setSelectedCategory(updatedCategoryName.trim())
      }
    }
    
    setEditingCategory(null)
    setUpdatedCategoryName('')
  }

  // Affiliate products state for the new dashboard components
  const [affiliateProducts, setAffiliateProducts] = useState<AffiliateProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'affiliate'>('all');

  // Fetch affiliate products for dashboard components
  useEffect(() => {
    const fetchAffiliateProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch from API
        const response = await fetch('/api/admin/products/status');
        if (response.ok) {
          // In a real implementation, we'd get the actual affiliate products
          // For now, we'll use mock data but would connect to real API
          const mockAffiliateProducts: AffiliateProduct[] = [
            {
              id: '1', title: 'Premium Skincare Set', affiliateUrl: 'https://amzn.to/1',
              imageRefreshStatus: 'current', linkValidationStatus: 'valid',
              lastImageRefresh: new Date(Date.now() - 3600000).toISOString(), lastLinkCheck: new Date(Date.now() - 1800000).toISOString(),
              needsReview: false, description: 'A premium set of skincare products', price: 49.99, tags: ['skincare', 'premium'], commissionRate: 8, platform: 'amazon', performance: { clicks: 120, conversions: 12, revenue: 599.88, conversionRate: 10, lastUpdated: new Date().toISOString() }, status: 'active', scheduledPromotions: []
            },
            {
              id: '2', title: 'Organic Hair Oil', affiliateUrl: 'https://amzn.to/2',
              imageRefreshStatus: 'outdated', linkValidationStatus: 'invalid',
              lastImageRefresh: new Date(Date.now() - 86400000).toISOString(), lastLinkCheck: new Date(Date.now() - 3600000).toISOString(),
              needsReview: true, description: 'Organic hair oil for healthy hair', price: 29.99, tags: ['hair', 'organic'], commissionRate: 10, platform: 'amazon', performance: { clicks: 85, conversions: 8, revenue: 239.92, conversionRate: 9.4, lastUpdated: new Date().toISOString() }, status: 'active', scheduledPromotions: []
            },
            {
              id: '3', title: 'Essential Oil Diffuser', affiliateUrl: 'https://amzn.to/3',
              imageRefreshStatus: 'failed', linkValidationStatus: 'checking',
              lastImageRefresh: new Date(Date.now() - 172800000).toISOString(), lastLinkCheck: new Date().toISOString(),
              needsReview: true, description: 'Ultrasonic diffuser for aromatherapy', price: 34.99, tags: ['aromatherapy', 'diffuser'], commissionRate: 12, platform: 'amazon', performance: { clicks: 200, conversions: 15, revenue: 524.85, conversionRate: 7.5, lastUpdated: new Date().toISOString() }, status: 'active', scheduledPromotions: []
            },
            {
              id: '4', title: 'Natural Face Mask', affiliateUrl: 'https://amzn.to/4',
              imageRefreshStatus: 'current', linkValidationStatus: 'valid',
              lastImageRefresh: new Date(Date.now() - 1800000).toISOString(), lastLinkCheck: new Date(Date.now() - 900000).toISOString(),
              needsReview: false, description: 'Natural clay face mask for all skin types', price: 19.99, tags: ['skincare', 'mask'], commissionRate: 15, platform: 'amazon', performance: { clicks: 300, conversions: 25, revenue: 499.75, conversionRate: 8.3, lastUpdated: new Date().toISOString() }, status: 'active', scheduledPromotions: []
            },
          ];
          setAffiliateProducts(mockAffiliateProducts);
        } else {
          console.error('Failed to fetch affiliate product statuses');
        }
      } catch (error) {
        console.error('Error fetching affiliate products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliateProducts();
  }, []);

  const handleBulkRefresh = async (productIds: string[]) => {
    try {
      // Call API to trigger bulk image refresh
      const response = await fetch('/api/admin/products/bulk-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productIds,
          action: 'refresh_image'
        })
      });

      if (!response.ok) {
        console.error('Failed to trigger bulk image refresh');
        return;
      }

      // Update the affiliate products status in local state
      setAffiliateProducts(prev => 
        prev.map(p => 
          productIds.includes(p.id) ? { ...p, imageRefreshStatus: 'current', lastImageRefresh: new Date().toISOString() } : p
        )
      );
    } catch (error) {
      console.error('Error triggering bulk image refresh:', error);
    }
  };

  const handleBulkValidateLinks = async (productIds: string[]) => {
    try {
      // Call API to trigger bulk link validation
      const response = await fetch('/api/admin/products/bulk-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productIds,
          action: 'validate_link'
        })
      });

      if (!response.ok) {
        console.error('Failed to trigger bulk link validation');
        return;
      }

      // Update the affiliate products status in local state
      setAffiliateProducts(prev => 
        prev.map(p => 
          productIds.includes(p.id) ? { ...p, linkValidationStatus: 'valid', lastLinkCheck: new Date().toISOString() } : p
        )
      );
    } catch (error) {
      console.error('Error triggering bulk link validation:', error);
    }
  };

  const handleJobRetry = async (jobId: string) => {
    try {
      // In a real implementation, call the API to retry a failed job
      console.log('Retrying job:', jobId);
      // Implementation would call the API to retry the job
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products and organize them by category
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button onClick={() => router.push('/admin/products/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Tag className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Category Management</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newCategoryName">New Category Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newCategoryName"
                      placeholder="Enter category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button onClick={handleAddCategory}>Add</Button>
                  </div>
                </div>
                
                <div>
                  <Label>Existing Categories</Label>
                  <div className="mt-2 space-y-2">
                    {categories
                      .filter(cat => cat !== 'all')
                      .map((category) => (
                        <div key={category} className="flex items-center justify-between p-2 bg-secondary rounded">
                          {editingCategory === category ? (
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={updatedCategoryName}
                                onChange={(e) => setUpdatedCategoryName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveEditCategory(category)}
                                autoFocus
                              />
                              <Button size="sm" onClick={() => saveEditCategory(category)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingCategory(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center flex-1">
                              <span className="capitalize">{category}</span>
                            </div>
                          )}
                          {editingCategory !== category && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditCategory(category)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCategory(category)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for switching between all products and affiliate dashboard */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Products
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'affiliate'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('affiliate')}
          >
            Affiliate Dashboard
          </button>
        </nav>
      </div>

      {activeTab === 'affiliate' ? (
        <div className="space-y-8">
          {/* Product Status Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Product Status Dashboard</CardTitle>
              <CardDescription>
                Monitor the status of your affiliate products for image refresh and link validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductStatusDashboard />
            </CardContent>
          </Card>

          {/* Bulk Product Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Product Actions</CardTitle>
              <CardDescription>
                Select products and perform bulk operations for efficient management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkProductActions
                products={affiliateProducts}
                selectedProducts={selectedProductIds}
                onSelectionChange={setSelectedProductIds}
                onBulkRefresh={handleBulkRefresh}
                onBulkValidateLinks={handleBulkValidateLinks}
              />
            </CardContent>
          </Card>

          {/* Job Monitor */}
          <Card>
            <CardHeader>
              <CardTitle>Background Job Monitor</CardTitle>
              <CardDescription>
                Monitor the status of background processing tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobMonitor 
                onRefresh={() => console.log('Refreshing jobs...')} 
                onJobRetry={handleJobRetry}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search products by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select category" />
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
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length - 1}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Filtered Results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredProducts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Affiliate Products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.filter(p => p.isAffiliate).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Upload Section */}
          <div className="mb-6">
            <BulkProductUpload onUploadComplete={handleRefresh} />
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product catalog. {filteredProducts.length} items shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.sys.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {product.images && product.images[0] && (
                              <img
                                src={product.images[0].url}
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            )}
                            <span>{product.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category ? (
                            <Badge variant="secondary" className="capitalize">
                              <Tag className="h-3 w-3 mr-1" />
                              {product.category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Uncategorized</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.inStock ? (
                            <Badge variant="default">In Stock</Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.price ? `${product.price.toFixed(2)}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {product.isAffiliate ? (
                            <Badge variant="outline">Affiliate</Badge>
                          ) : (
                            <Badge variant="outline">Direct</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProduct(product.slug)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Product
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProduct(product.sys.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
