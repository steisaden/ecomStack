'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Loader2,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface AffiliateProduct {
  id: string
  title: string
  description: string
  price: number
  imageUrl?: string
  affiliateUrl: string
  category?: string
  tags: string[]
  commissionRate: number
  platform: string
  performance: {
    clicks: number
    conversions: number
    revenue: number
    conversionRate: number
    lastUpdated: string
  }
  status: 'active' | 'inactive' | 'pending'
  scheduledPromotions: {
    startDate: string
    endDate: string
    discount?: number
  }[]
}

const PLATFORMS = [
  { id: 'amazon', name: 'Amazon Associates' },
  { id: 'shareasale', name: 'ShareASale' },
  { id: 'cj', name: 'Commission Junction' },
  { id: 'custom', name: 'Custom Affiliate' },
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

export default function EditAffiliateProductPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const [product, setProduct] = useState<AffiliateProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/affiliate-products/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch product')

      const data = await response.json()
      setProduct(data.product)
    } catch (error: any) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!product) return

    try {
      setSaving(true)

      const response = await fetch(`/api/admin/affiliate-products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product
        }),
      })

      if (!response.ok) throw new Error('Failed to update product')

      const data = await response.json()
      setProduct(data.product)
      toast.success('Product updated successfully')
      router.push('/admin/affiliate-products')
    } catch (error: any) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const addTag = (tag: string) => {
    if (!tag.trim() || !product) return

    setProduct(prev => prev ? {
      ...prev,
      tags: [...prev.tags, tag.trim()]
    } : null)
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    if (!product) return

    setProduct(prev => prev ? {
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    } : null)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-100 rounded"></div>
                  </div>
                ))}
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-6 w-16 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <ExternalLink className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-4">The requested product could not be found</p>
          <Button onClick={() => router.push('/admin/affiliate-products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Affiliate Product</h1>
          <p className="text-gray-600">Update product details and optimize performance with AI insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/admin/affiliate-products')}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Update the details for your affiliate product. AI will help optimize its performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Product Title</label>
                <Input
                  value={product.title}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Enter product title"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={product.description}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Affiliate URL</label>
                <Input
                  value={product.affiliateUrl}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, affiliateUrl: e.target.value } : null)}
                  placeholder="https://example.com/product"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price ($)</label>
                  <Input
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Commission Rate (%)</label>
                  <Input
                    type="number"
                    value={product.commissionRate}
                    onChange={(e) => setProduct(prev => prev ? { ...prev, commissionRate: parseFloat(e.target.value) || 0 } : null)}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={product.category || ''} onValueChange={(value) => setProduct(prev => prev ? { ...prev, category: value } : null)}>
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
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <Select value={product.platform} onValueChange={(value) => setProduct(prev => prev ? { ...prev, platform: value } : null)}>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTag(newTag)
                      }
                    }}
                  />
                  <Button
                    onClick={() => addTag(newTag)}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Product Image URL (optional)</label>
                <Input
                  value={product.imageUrl || ''}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">AI Performance Insights</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="text-center p-2 bg-purple-100 rounded">
                    <div className="font-medium">{product.performance.clicks}</div>
                    <div className="text-purple-700">Clicks</div>
                  </div>
                  <div className="text-center p-2 bg-purple-100 rounded">
                    <div className="font-medium">{product.performance.conversions}</div>
                    <div className="text-purple-700">Conversions</div>
                  </div>
                  <div className="text-center p-2 bg-purple-100 rounded">
                    <div className="font-medium">${product.performance.revenue.toFixed(2)}</div>
                    <div className="text-purple-700">Revenue</div>
                  </div>
                </div>
                <p className="text-sm text-purple-700">
                  This product has a {product.performance.conversionRate.toFixed(1)}% conversion rate.
                  AI recommends adjusting the commission rate to {Math.min(100, product.commissionRate + 0.5).toFixed(1)}%
                  for improved performance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/affiliate-products')}
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
        </CardFooter>
      </Card>
    </div>
  )
}