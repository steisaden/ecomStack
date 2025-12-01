'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AffiliateProduct {
  id: string
  title: string
  description: string
  price: number
  imageUrl?: string
  affiliateUrl: string
  category?: string
  tags?: string[]
  platform: string
  status: 'active' | 'inactive' | 'pending'
}

export function AffiliateProductsManager() {
  const [products, setProducts] = useState<AffiliateProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<AffiliateProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, statusFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/affiliate-products/list', {
        credentials: 'include'
      })
      
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load affiliate products')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(filtered)
  }

  const handleEdit = (product: AffiliateProduct) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/admin/affiliate-products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingProduct)
      })

      if (!response.ok) throw new Error('Failed to update product')

      toast.success('Product updated successfully')
      setIsEditDialogOpen(false)
      fetchProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    }
  }

  const handleArchive = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/affiliate-products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'inactive' })
      })

      if (!response.ok) throw new Error('Failed to archive product')

      toast.success('Product archived successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error archiving product:', error)
      toast.error('Failed to archive product')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/affiliate-products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to delete product')

      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading affiliate products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Product Management</h1>
          <p className="text-gray-600 mt-2">Search, filter, and manage your affiliate products.</p>
        </div>
        <Link href="/admin/affiliate-products/add-manual">
          <Button className="bg-sage-600 hover:bg-sage-700">
            Create Product
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Archived</option>
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No affiliate products found.</p>
            <Link href="/admin/affiliate-products/add-manual">
              <Button className="mt-4">Add Your First Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Product Header */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.category && (
                      <Badge variant="secondary">{product.category}</Badge>
                    )}
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status === 'active' ? 'In Stock' : 'Archived'}
                    </Badge>
                  </div>
                </div>

                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Price */}
                <div className="p-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchive(product.id)}
                    className="flex-1 text-orange-600 hover:text-orange-700"
                  >
                    Archive
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Affiliate Product</DialogTitle>
            <DialogDescription>
              Update product details and save changes.
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-affiliateUrl">Affiliate URL</Label>
                <Input
                  id="edit-affiliateUrl"
                  value={editingProduct.affiliateUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, affiliateUrl: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editingProduct.category || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {filteredProducts.length} of {products.length} products
        </div>
        <div>
          Page 1 of 1
        </div>
      </div>
    </div>
  )
}
