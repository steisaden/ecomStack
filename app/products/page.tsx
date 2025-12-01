import ProductsPageClient from '@/components/ProductsPageClient'
import { getAllProducts } from '@/lib/unified-products'
import { createCollectionMetadataGenerator } from '@/lib/seo'
import ResponsiveContainer from '@/components/ResponsiveContainer'

export const generateMetadata = createCollectionMetadataGenerator(async () => {
  const products = await getAllProducts()
  return {
    title: 'Our Collection',
    description: 'Handcrafted with love and formulated with the finest natural ingredients to enhance your natural beauty and nourish your skin. Featuring both our signature products and carefully curated partner recommendations.',
    url: '/products',
    itemCount: products.length,
  }
})

export default async function ProductsPage() {
  // Fetch all products (regular + affiliate) server-side
  const products = await getAllProducts()

  return (
    <div className="relative min-h-screen">
      {/* Background intentionally left plain (no paper shader) */}
      
      <div className="relative z-10">
        <ResponsiveContainer>
          <div className="py-16 md:py-24">
            <ProductsPageClient products={products} />
          </div>
        </ResponsiveContainer>
      </div>
    </div>
  )
}