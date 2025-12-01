'use client'

import { useState, useEffect } from 'react'
import { AffiliateProduct } from '@/lib/types'
import { getBaseUrl } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ExternalLink,
  Sparkles,
  Loader2,
  Upload,
  Download,
  Calendar,
  BarChart3,
  Filter,
  Tag,
  Grid,
  List,
  ChevronDown,
  Star,
  Clock,
  Eye,
  ShoppingCart,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
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
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
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
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

interface AIRecommendation {
  productId: string | null
  title: string
  reason: string
  confidence: number
  predictedPerformance: {
    clicks: number
    conversions: number
    revenue: number
  }
  suggestedAction: 'add' | 'promote' | 'optimize' | 'remove'
}

interface PerformanceMetrics {
  totalProducts: number
  activeProducts: number
  totalRevenue: number
  avgCommissionRate: number
  topPerforming: AffiliateProduct[]
  recommendations: AIRecommendation[]
}

const PLATFORMS = [
  { id: 'amazon', name: 'Amazon Associates', icon: <ExternalLink className="h-4 w-4" /> },
  { id: 'shareasale', name: 'ShareASale', icon: <ExternalLink className="h-4 w-4" /> },
  { id: 'cj', name: 'Commission Junction', icon: <ExternalLink className="h-4 w-4" /> },
  { id: 'custom', name: 'Custom Affiliate', icon: <ExternalLink className="h-4 w-4" /> },
]

const CATEGORIES = [
  'Skincare',
  'Hair Care',
  'Wellness',
  'Beauty Tools',
  'Organic Products',
  'Luxury Items',
  'Self-Care',
  'Accessories'
]

export default function AffiliateProducts() {
  const [products, setProducts] = useState<AffiliateProduct[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'performance' | 'date' | 'revenue'>('performance')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null)
  const [newProduct, setNewProduct] = useState<Omit<AffiliateProduct, 'id' | 'performance' | 'status' | 'scheduledPromotions'>>({
    title: '',
    description: '',
    price: 0,
    affiliateUrl: '',
    category: '',
    tags: [],
    commissionRate: 0,
    platform: 'amazon'
  })
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch affiliate products
      const productsResponse = await fetch(`${getBaseUrl()}/api/admin/affiliate-products`)
      if (!productsResponse.ok) throw new Error('Failed to fetch affiliate products')
      const productsData = await productsResponse.json()
      setProducts(productsData.products || [])
      
      // Fetch performance metrics
      const metricsResponse = await fetch(`${getBaseUrl()}/api/admin/affiliate-products/metrics`)
      if (!metricsResponse.ok) throw new Error('Failed to fetch performance metrics')
      const metricsData = await metricsResponse.json()
      setMetrics(metricsData.metrics || null)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load affiliate products data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/affiliate-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            ...newProduct,
            performance: {
              clicks: 0,
              conversions: 0,
              revenue: 0,
              conversionRate: 0,
              lastUpdated: new Date().toISOString()
            },
            status: 'active',
            scheduledPromotions: []
          }
        }),
      })
      
      if (!response.ok) throw new Error('Failed to add product')
      
      const data = await response.json()
      setProducts(prev => [...prev, data.product])
      setShowAddDialog(false)
      resetNewProduct()
      toast.success('Product added successfully')
    } catch (error: any) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkUpload = async (csvData: string) => {
    try {
      setSaving(true)
      
      // Parse CSV data
      const lines = csvData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      // Validate headers
      const requiredHeaders = ['title', 'price', 'affiliateurl']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
      }
      
      // Parse products
      const products = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length !== headers.length) continue
        
        const product: any = {}
        headers.forEach((header, index) => {
          const value = values[index]
          
          switch (header) {
            case 'title':
            case 'description':
            case 'category':
            case 'platform':
            case 'imageurl':
            case 'affiliateurl':
              product[header === 'imageurl' ? 'imageUrl' : header === 'affiliateurl' ? 'affiliateUrl' : header] = value
              break
            case 'price':
            case 'commissionrate':
              product[header === 'commissionrate' ? 'commissionRate' : header] = parseFloat(value) || 0
              break
            case 'tags':
              product.tags = value ? value.split('|').map(t => t.trim()) : []
              break
            default:
              product[header] = value
          }
        })
        
        products.push(product)
      }
      
      if (products.length === 0) {
        throw new Error('No valid products found in CSV')
      }
      
      // Send to bulk upload API
      const response = await fetch('/api/admin/affiliate-products/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      })
      
      if (!response.ok) throw new Error('Failed to upload products')
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Successfully uploaded ${result.created} products`)
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} products had errors`)
        }
        // Refresh the products list
        fetchData()
      } else {
        throw new Error(result.message || 'Upload failed')
      }
      
      setShowBulkUploadDialog(false)
    } catch (error: any) {
      console.error('Error bulk uploading products:', error)
      toast.error(error.message || 'Failed to upload products')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/affiliate-products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: editingProduct
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update product')
      
      const data = await response.json()
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p))
      setEditingProduct(null)
      toast.success('Product updated successfully')
    } catch (error: any) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/affiliate-products/${productId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product')
      }
      
      setProducts(prev => prev.filter(p => p.id !== productId))
      toast.success('Product deleted successfully')
    } catch (error: any) {
      console.error('Error deleting product:', error)
      toast.error(error.message || 'Failed to delete product')
    }
  }

  const handleGenerateAIRecommendations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/affiliate-products/recommendations', {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to generate recommendations')
      
      const data = await response.json()
      setMetrics(prev => prev ? {
        ...prev,
        recommendations: data.recommendations
      } : null)
      toast.success('AI recommendations generated')
    } catch (error: any) {
      console.error('Error generating recommendations:', error)
      toast.error('Failed to generate AI recommendations')
    } finally {
      setLoading(false)
    }
  }

  const resetNewProduct = () => {
    setNewProduct({
      title: '',
      description: '',
      price: 0,
      affiliateUrl: '',
      category: '',
      tags: [],
      commissionRate: 0,
      platform: 'amazon'
    })
  }

  const addTag = (product: AffiliateProduct | null, tag: string) => {
    if (!tag.trim()) return
    
    if (product) {
      // Editing existing product
      setEditingProduct(prev => prev ? {
        ...prev,
        tags: [...prev.tags, tag.trim()]
      } : null)
    } else {
      // Adding new product
      setNewProduct(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
    setNewTag('')
  }

  const removeTag = (product: AffiliateProduct | null, tagToRemove: string) => {
    if (product) {
      // Editing existing product
      setEditingProduct(prev => prev ? {
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      } : null)
    } else {
      // Adding new product
      setNewProduct(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }))
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesPlatform = selectedPlatform === 'all' || product.platform === selectedPlatform
    
    return matchesSearch && matchesCategory && matchesPlatform
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'performance') {
      const aConversions = a.performance?.conversions || 0
      const bConversions = b.performance?.conversions || 0
      return bConversions - aConversions
    } else if (sortBy === 'date') {
      const aDate = a.performance?.lastUpdated ? new Date(a.performance.lastUpdated).getTime() : 0
      const bDate = b.performance?.lastUpdated ? new Date(b.performance.lastUpdated).getTime() : 0
      return bDate - aDate
    } else {
      const aRevenue = a.performance?.revenue || 0
      const bRevenue = b.performance?.revenue || 0
      return bRevenue - aRevenue
    }
  })

  if (loading && (!products.length || !metrics)) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Linked Products</h2>
          <p className="text-gray-600">Manage your product links and see how they are performing.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button 
            onClick={() => setShowBulkUploadDialog(true)}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Grid className={`h-4 w-4 ${viewMode === 'grid' ? 'text-primary' : ''}`} />
                  <List className={`h-4 w-4 ml-1 ${viewMode === 'list' ? 'text-primary' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  <Grid className="h-4 w-4 mr-2" />
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4 mr-2" />
                  List View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>
            {filteredProducts.length} products found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="p-4">
                    {product.imageUrl ? (
                      <div className="relative h-40 rounded-md overflow-hidden mb-4">
                        <img 
                          src={product.imageUrl} 
                          alt={product.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-40 rounded-md bg-gray-100 flex items-center justify-center mb-4">
                        <ExternalLink className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-lg">${(product.price || 0).toFixed(2)}</span>
                      <Badge variant="secondary">{product.platform}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Your Cut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.title} 
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${(product.price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{product.commissionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <Grid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {PLATFORMS.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>{platform.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort by</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="date">Last Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowFilters(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a New Product Link</DialogTitle>
            <DialogDescription>
              Add a product you want to recommend to your audience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Product Name</label>
                <Input
                  value={newProduct.title}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 'The Best Hair Serum'"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Product Link</label>
                <Input
                  value={newProduct.affiliateUrl}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, affiliateUrl: e.target.value }))}
                  placeholder="This is the special link you get from the seller"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price ($)</label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="e.g., 29.99"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Cut (%)</label>
                  <Input
                    type="number"
                    value={newProduct.commissionRate}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="e.g., 8.5"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Where is this link from?</label>
                <Select value={newProduct.platform} onValueChange={(value) => setNewProduct(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="e.g., Amazon" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>{platform.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false)
                resetNewProduct()
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProduct}
              disabled={saving || !newProduct.title || !newProduct.affiliateUrl}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product Link</DialogTitle>
            <DialogDescription>
              Update the details for this product link.
            </DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Product Name</label>
                  <Input
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Product Link</label>
                  <Input
                    value={editingProduct.affiliateUrl}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, affiliateUrl: e.target.value } : null)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price ($)</label>
                    <Input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Cut (%)</label>
                    <Input
                      type="number"
                      value={editingProduct.commissionRate}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, commissionRate: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select 
                    value={editingProduct.category || ''} 
                    onValueChange={(value) => setEditingProduct(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Where is this link from?</label>
                  <Select 
                    value={editingProduct.platform} 
                    onValueChange={(value) => setEditingProduct(prev => prev ? { ...prev, platform: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(platform => (
                        <SelectItem key={platform.id} value={platform.id}>{platform.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingProduct(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProduct}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUploadDialog} onOpenChange={setShowBulkUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Multiple Products at Once</DialogTitle>
            <DialogDescription>
              Use a CSV file to add many products quickly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Step 1: Get the Template</h4>
              <p className="text-sm text-blue-700 mb-3">
                Download our CSV template to make sure your file is in the right format.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const csvTemplate = `title,description,price,affiliateUrl,category,platform,commissionRate,tags,imageUrl
"Premium Face Serum","Anti-aging serum with vitamin C",29.99,"https://example.com/serum","Skincare","amazon",8.5,"anti-aging|vitamin-c|serum","https://example.com/serum.jpg"
"Organic Hair Oil","Nourishing hair oil for all hair types",19.99,"https://example.com/hair-oil","Hair Care","custom",10,"organic|hair-care|oil","https://example.com/oil.jpg"`
                  
                  const blob = new Blob([csvTemplate], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'affiliate-products-template.csv'
                  a.click()
                  window.URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Step 2: Fill Out the File</h4>
              <p className="text-sm text-gray-600">Open the template in a spreadsheet program (like Excel or Google Sheets) and fill in your product information. Here are the columns you need:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>title:</strong> The name of the product.</li>
                <li><strong>price:</strong> The price of the product (just the number).</li>
                <li><strong>affiliateUrl:</strong> The special product link you get from the seller.</li>
                <li><strong>category:</strong> The product's category (e.g., Skincare, Hair Care).</li>
                <li><strong>platform:</strong> Where the link is from (e.g., amazon, custom).</li>
                <li><strong>commissionRate:</strong> Your cut from the sale (just the number).</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Step 3: Upload the File</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const csvData = event.target?.result as string
                        handleBulkUpload(csvData)
                      }
                      reader.readAsText(file)
                    }
                  }}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to select your CSV file or drag and drop it here.
                  </p>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBulkUploadDialog(false)}
              disabled={saving}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
