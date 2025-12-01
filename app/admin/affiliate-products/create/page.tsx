'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Plus, 
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

interface NewAffiliateProduct {
  title: string
  description: string
  price: number
  imageUrl?: string
  affiliateUrl: string
  category?: string
  tags: string[]
  commissionRate: number
  platform: string
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

export default function CreateAffiliateProductPage() {
  const [newProduct, setNewProduct] = useState<Omit<NewAffiliateProduct, 'id' | 'performance' | 'status'>>({
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
  const [saving, setSaving] = useState(false)
  const router = useRouter()

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
      toast.success('Product added successfully')
      router.push('/admin/affiliate-products')
    } catch (error: any) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product')
    } finally {
      setSaving(false)
    }
  }

  const addTag = (tag: string) => {
    if (!tag.trim()) return
    
    setNewProduct(prev => ({
      ...prev,
      tags: [...prev.tags, tag.trim()]
    }))
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setNewProduct(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Affiliate Product</h1>
          <p className="text-gray-600">Create a new affiliate product with AI optimization</p>
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
            Enter the details for your new affiliate product. AI will help optimize its performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Product Title</label>
                <Input
                  value={newProduct.title}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter product title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Affiliate URL</label>
                <Input
                  value={newProduct.affiliateUrl}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, affiliateUrl: e.target.value }))}
                  placeholder="https://example.com/product"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price ($)</label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Commission Rate (%)</label>
                  <Input
                    type="number"
                    value={newProduct.commissionRate}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={newProduct.category || ''} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
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
                <Select value={newProduct.platform} onValueChange={(value) => setNewProduct(prev => ({ ...prev, platform: value }))}>
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
                  {newProduct.tags.map(tag => (
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
                  value={newProduct.imageUrl || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">AI Optimization Tips</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Our AI will automatically optimize your product for search engines and recommend the best times to promote it based on historical data and market trends.
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
        </CardFooter>
      </Card>
    </div>
  )
}