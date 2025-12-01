'use server';

import { getAllProducts as getAllProductsServer } from '@/lib/unified-products';
import { revalidateTag } from 'next/cache';

export async function getAllProducts() {
  try {
    return await getAllProductsServer();
  } catch (error) {
    console.error('Error fetching products in server action:', error);
    return [];
  }
}

export async function refreshProductsCache() {
  try {
    // Revalidate the cache for products
    revalidateTag('products');
    revalidateTag('affiliate-products');
    revalidateTag('unified-products');
    revalidateTag('featured-products');
    
    // Also revalidate related paths
    revalidateTag('products');
    revalidateTag('unified-products');
    
    const products = await getAllProducts();
    
    return {
      success: true,
      products,
      message: 'Products refreshed successfully',
      timestamp: new Date().toISOString(),
      count: products.length
    };
  } catch (error) {
    console.error('Error refreshing products cache:', error);
    return {
      success: false,
      error: 'Failed to refresh products',
      message: 'An error occurred while refreshing products'
    };
  }
}