'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function ManualAmazonProductEntry() {
  const [formData, setFormData] = useState({
    asin: '',
    title: '',
    brand: '',
    price: '',
    imageUrl: '',
    features: '',
    affiliateUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate ASIN
    if (!/^[A-Z0-9]{10}$/.test(formData.asin)) {
      toast.error('Invalid ASIN format. Must be 10 alphanumeric characters.')
      return
    }

    // Auto-generate affiliate URL if not provided
    const affiliateUrl = formData.affiliateUrl || 
      `https://www.amazon.com/dp/${formData.asin}?tag=${process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'goddesscare0d-20'}`

    // Auto-generate image URL if not provided
    const imageUrl = formData.imageUrl || 
      `https://m.media-amazon.com/images/P/${formData.asin}.01._SY300_QL70_.jpg`

    const productData = {
      asin: formData.asin,
      title: formData.title,
      brand: formData.brand,
      price: parseFloat(formData.price),
      imageUrl,
      affiliateUrl,
      features: formData.features.split('\n').filter(f => f.trim()),
      availability: true,
      lastFetched: new Date().toISOString()
    }

    try {
      // Save to Contentful via API route
      const response = await fetch('/api/admin/affiliate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save product')
      }

      toast.success('Product added successfully!')
      
      // Reset form
      setFormData({
        asin: '',
        title: '',
        brand: '',
        price: '',
        imageUrl: '',
        features: '',
        affiliateUrl: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product')
      console.error('Error saving product:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Amazon Product Entry</CardTitle>
        <CardDescription>
          Enter product details manually from Amazon product pages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="asin">ASIN *</Label>
            <Input
              id="asin"
              placeholder="B08N5WRWNW"
              value={formData.asin}
              onChange={(e) => setFormData({...formData, asin: e.target.value.toUpperCase()})}
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Find this on the Amazon product page (10 characters)
            </p>
          </div>

          <div>
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              placeholder="Premium Organic Face Oil"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              placeholder="Goddess Care Co"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="24.99"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              placeholder="Leave blank to auto-generate"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">
              Will auto-generate from ASIN if left blank
            </p>
          </div>

          <div>
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              placeholder="100% organic ingredients&#10;Deep moisturizing formula&#10;Suitable for all skin types"
              value={formData.features}
              onChange={(e) => setFormData({...formData, features: e.target.value})}
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="affiliateUrl">Affiliate URL (optional)</Label>
            <Input
              id="affiliateUrl"
              placeholder="Leave blank to auto-generate with your tag"
              value={formData.affiliateUrl}
              onChange={(e) => setFormData({...formData, affiliateUrl: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Product
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
