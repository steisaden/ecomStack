
'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      async function fetchProduct() {
        try {
          const response = await fetch(`/api/contentful/products/${slug}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setProduct(data.product);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }

      fetchProduct();
    }
  }, [slug]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const response = await fetch(`/api/contentful/products/${slug}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.push('/admin');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
        <CardDescription>Modify the details of the product.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name *</label>
            <Input
              id="name"
              type="text"
              value={product.title}
              onChange={(e) => setProduct({ ...product, title: e.target.value })}
              required
            />
          </div>

          {/* Product Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug *</label>
            <Input
              id="slug"
              type="text"
              value={product.slug}
              onChange={(e) => setProduct({ ...product, slug: e.target.value })}
              required
              placeholder="e.g. organic-face-oil"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">Price *</label>
            <Input
              id="price"
              type="number"
              value={product.price || ''}
              onChange={(e) => setProduct({ ...product, price: Number(e.target.value) || 0 })}
              required
              step="0.01"
              min="0"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              id="description"
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
            <Input
              id="category"
              type="text"
              value={product.category?.name || ''}
              onChange={(e) => setProduct({
                ...product,
                category: { name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }
              })}
              placeholder="e.g. Face Oils"
            />
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inStock"
              checked={product.inStock}
              onChange={(e) => setProduct({ ...product, inStock: e.target.checked })}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="inStock" className="text-sm font-medium">In Stock</label>
          </div>

          {/* Affiliate Product Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAffiliate"
              checked={product.isAffiliate}
              onChange={(e) => setProduct({ ...product, isAffiliate: e.target.checked })}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="isAffiliate" className="text-sm font-medium">Affiliate Product</label>
          </div>

          {product.isAffiliate && (
            <div>
              <label htmlFor="affiliateUrl" className="block text-sm font-medium mb-1">Affiliate URL</label>
              <Input
                id="affiliateUrl"
                type="url"
                value={product.affiliateUrl || ''}
                onChange={(e) => setProduct({ ...product, affiliateUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Submit and Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Product
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
