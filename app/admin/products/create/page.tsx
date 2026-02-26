'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';


export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for product form
  const [product, setProduct] = useState<Omit<Product, 'sys' | 'images'>>({
    title: '',
    description: '',
    price: 0,
    category: undefined as any,
    inStock: true,
    isAffiliate: false,
    affiliateUrl: '',
    slug: '',
  });

  // State for file uploads
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Comprehensive form validation
      const errors: string[] = [];

      if (!product.title.trim()) {
        errors.push('Product name is required');
      }

      if (!product.slug.trim()) {
        errors.push('Slug is required');
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) {
        errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
      }

      if ((product.price ?? 0) < 0) {
        errors.push('Price must be a positive number');
      }

      if (product.isAffiliate && !product.affiliateUrl) {
        errors.push('Affiliate URL is required for affiliate products');
      } else if (product.isAffiliate && product.affiliateUrl && !/^https?:\/\/.+/.test(product.affiliateUrl)) {
        errors.push('Affiliate URL must be a valid URL starting with http:// or https://');
      }

      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }

      // If there are files to upload, we need to:
      // 1. Upload each file as an asset to Contentful
      // 2. Get the asset IDs
      // 3. Create the product with references to those assets

      // Array to hold references to uploaded asset IDs
      const assetIds: any[] = [];
      const uploadedAssets: any[] = [];

      if (files.length > 0) {
        for (const file of files) {
          const assetFormData = new FormData();
          assetFormData.append('file', file);

          const assetResponse = await fetch('/api/admin/upload-asset', {
            method: 'POST',
            body: assetFormData,
          });

          if (!assetResponse.ok) {
            const assetError = await assetResponse.json();
            throw new Error(`Failed to upload image: ${assetError.error || 'Unknown error'}`);
          }

          // Get the uploaded asset
          const assetResult = await assetResponse.json();
          uploadedAssets.push(assetResult.asset);
          assetIds.push(assetResult.asset); // Push the full asset object as expected by the API
          console.log('Uploaded asset:', assetResult.asset);
        }
      }

      // Prepare product data with asset IDs
      const productPayload = {
        productData: {
          ...product,
          images: [] // Will be linked through Contentful references
        },
        assetIds: uploadedAssets // Send the full asset objects to be linked
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product');
      }

      // Redirect to admin products page on success
      router.push('/admin');
      router.refresh(); // Refresh to show the new product
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: keyof Omit<Product, 'sys' | 'images'>, value: any) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    } as any));
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>Add a new product to your catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                type="text"
                value={product.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            {/* Product Slug */}
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                type="text"
                value={product.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                required
                placeholder="e.g. organic-face-oil"
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={product.price || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                required
                step="0.01"
                min="0"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                type="text"
                value={product.category?.name || ''}
                onChange={(e) => setProduct(prev => ({
                  ...prev,
                  category: { name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }
                } as any))}
                placeholder="e.g. Face Oils"
              />
            </div>

            {/* In Stock */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={product.inStock}
                onCheckedChange={(checked) => handleInputChange('inStock', checked)}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>

            {/* Affiliate Product */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAffiliate"
                checked={product.isAffiliate}
                onCheckedChange={(checked) => handleInputChange('isAffiliate', checked)}
              />
              <Label htmlFor="isAffiliate">Affiliate Product</Label>
            </div>

            {product.isAffiliate && (
              <div>
                <Label htmlFor="affiliateUrl">Affiliate URL</Label>
                <Input
                  id="affiliateUrl"
                  type="url"
                  value={product.affiliateUrl || ''}
                  onChange={(e) => handleInputChange('affiliateUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}

            {/* Image Upload */}
            <div>
              <Label>Product Images</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                />
                {files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Selected Images:</h4>
                    <div className="flex flex-wrap gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="border rounded-lg overflow-hidden w-32 h-32">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {file.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center">

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size={16} className="mr-2" />
                      Creating...
                    </>
                  ) : 'Create Product'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}