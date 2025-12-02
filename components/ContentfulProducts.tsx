
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, Category } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/new_styles/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 6;

export default function ContentfulProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/contentful/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data.items || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category?.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const allCategories = ['All', ...Array.from(new Set(products.map(p => p.category?.name).filter(Boolean))) as string[]];

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.slug));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on:`, selectedProducts);
    // Here you would typically call an API to perform the bulk action
    // For now, we'll just log it and clear the selection.
    setSelectedProducts([]);
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.sys.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove the product from the local state
      setProducts(prev => prev.filter(p => p.sys.id !== product.sys.id));
      
      // Show success message
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleArchiveProduct = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.sys.id}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive product');
      }

      // Update the product in the local state to show it's archived
      setProducts(prev => 
        prev.map(p => 
          p.sys.id === product.sys.id ? { ...p, inStock: false } : p
        )
      );
      
      // Show success message
      toast.success('Product archived successfully');
    } catch (error) {
      console.error('Error archiving product:', error);
      toast.error('Failed to archive product');
    } finally {
      setArchiveDialogOpen(false);
      setProductToArchive(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" data-testid="skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" data-testid="skeleton" />
                <Skeleton className="h-4 w-1/2" data-testid="skeleton" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" data-testid="skeleton" />
                <Skeleton className="h-4 w-full mt-2" data-testid="skeleton" />
                <Skeleton className="h-4 w-1/4 mt-2" data-testid="skeleton" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" data-testid="skeleton" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-grow flex flex-col gap-6 pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="flex-grow"
          />
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            className="p-2 border rounded-md bg-background text-foreground"
          >
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-4 p-2 bg-muted rounded-md">
            <p className="text-sm font-medium">{selectedProducts.length} selected</p>
            <Button onClick={() => handleBulkAction('delete')} variant="destructive">{"Delete Selected"}</Button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-center text-gray-500">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="flex-grow flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <Card key={product.slug} className="flex flex-col relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedProducts.includes(product.slug)}
                      onCheckedChange={() => handleSelectProduct(product.slug)}
                      aria-label={`Select ${product.title}`}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base">{product.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.category?.name && (
                        <Badge variant="secondary">{product.category.name}</Badge>
                      )}
                      <Badge variant={product.inStock ? "default" : "destructive"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="relative w-full h-40 mb-4">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].url.startsWith('//') ? `https:${product.images[0].url}` : product.images[0].url}
                          alt={product.title}
                          fill
                          className="rounded-md object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-semibold mb-2">${product.price?.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 p-4">
                    <div className="flex gap-1.5 w-full">
                      <Button asChild size="sm" variant="outline" className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 text-xs px-2">
                        <Link href={`/admin/products/edit/${product.slug}`}>
                          {"Edit"}
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 text-xs px-2"
                        onClick={() => {
                          setProductToArchive(product);
                          setArchiveDialogOpen(true);
                        }}
                      >
                        {"Archive"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex-1 text-xs px-2"
                        onClick={() => {
                          setProductToDelete(product);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        {"Delete"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="flex justify-between items-center mt-auto pt-4">
              <div className="flex items-center gap-2">
                  <Checkbox
                      checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all products on this page"
                  />
                  <span className="text-sm">Select All</span>
              </div>
              <div className="flex justify-center items-center space-x-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This action cannot be undone. This will permanently delete the product "${productToDelete?.title}" from the website and Contentful.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will remove the product "${productToArchive?.title}" from the store's frontpage while keeping it in the system. You can unarchive it later.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => productToArchive && handleArchiveProduct(productToArchive)}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
