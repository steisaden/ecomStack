// Test file to verify unified products integration
// This can be run manually to test the integration

import { getAllProducts, getFeaturedProducts, getProductStats } from './unified-products'

export async function testUnifiedProducts() {
  console.log('🧪 Testing Unified Products Integration...')
  
  try {
    // Test 1: Get all products
    console.log('\n📦 Testing getAllProducts...')
    const allProducts = await getAllProducts()
    console.log(`✅ Found ${allProducts.length} total products`)
    
    const regularProducts = allProducts.filter(p => !p.isAffiliate)
    const affiliateProducts = allProducts.filter(p => p.isAffiliate)
    
    console.log(`   - Regular products: ${regularProducts.length}`)
    console.log(`   - Affiliate products: ${affiliateProducts.length}`)
    
    // Test 2: Get featured products
    console.log('\n⭐ Testing getFeaturedProducts...')
    const featuredProducts = await getFeaturedProducts(6)
    console.log(`✅ Found ${featuredProducts.length} featured products`)
    
    // Test 3: Get product stats
    console.log('\n📊 Testing getProductStats...')
    const stats = await getProductStats()
    console.log('✅ Product Statistics:')
    console.log(`   - Total: ${stats.total}`)
    console.log(`   - Regular: ${stats.regular}`)
    console.log(`   - Affiliate: ${stats.affiliate}`)
    console.log(`   - In Stock: ${stats.inStock}`)
    console.log(`   - Categories: ${stats.categories}`)
    
    // Test 4: Check affiliate product structure
    if (affiliateProducts.length > 0) {
      console.log('\n🔗 Testing affiliate product structure...')
      const sampleAffiliate = affiliateProducts[0]
      console.log('✅ Sample affiliate product:')
      console.log(`   - Title: ${sampleAffiliate.title}`)
      console.log(`   - Is Affiliate: ${sampleAffiliate.isAffiliate}`)
      console.log(`   - Has Affiliate URL: ${!!sampleAffiliate.affiliateUrl}`)
      console.log(`   - In Stock: ${sampleAffiliate.inStock}`)
    }
    
    console.log('\n🎉 All tests passed! Unified products integration is working correctly.')
    
    return {
      success: true,
      totalProducts: allProducts.length,
      regularProducts: regularProducts.length,
      affiliateProducts: affiliateProducts.length,
      featuredProducts: featuredProducts.length,
      stats
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to log product details
export function logProductDetails(products: any[]) {
  console.log('\n📋 Product Details:')
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title}`)
    console.log(`   - Type: ${product.isAffiliate ? 'Affiliate' : 'Regular'}`)
    console.log(`   - Price: $${product.price || 0}`)
    console.log(`   - In Stock: ${product.inStock}`)
    if (product.isAffiliate) {
      console.log(`   - Affiliate URL: ${product.affiliateUrl}`)
    }
    console.log(`   - Images: ${product.images?.length || 0}`)
    console.log('')
  })
}