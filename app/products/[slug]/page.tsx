import { getProductBySlug, getProducts, getGlobalSettingsService } from '../../../lib/contentful'
import { Asset, Product } from '../../../lib/types'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import StripeCheckout from '../../../components/StripeCheckout'
import { ProductStructuredData } from '@/components/StructuredData'
import { createProductMetadataGenerator } from '@/lib/seo'
import { validateAndSanitizeUrl } from '@/lib/url-validation'

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export const generateMetadata = createProductMetadataGenerator(async (params: Promise<{ slug: string }>) => {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    return null
  }

  return {
    title: product.title,
    description: product.description,
    image: product.images[0] ? product.images[0].url : undefined,
    price: product.price,
    inStock: product.inStock,
    category: product.category?.name,
    slug: product.slug,
  }
})

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, globalSettings] = await Promise.all([
    getProductBySlug(slug),
    getGlobalSettingsService().getSettingsWithFallback().catch(() => null)
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="container section-spacing">
      <ProductStructuredData
        title={product.title}
        description={product.description}
        url={`/products/${product.slug}`}
        image={product.images[0] ? product.images[0].url : undefined}
        price={product.price}
        globalSettings={globalSettings}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images.map((image: Asset, index: number) => (
            <Image
              key={index}
              src={image.url}
              alt={`${product.title} - Image ${index + 1}`}
              width={800}
              height={600}
              className="w-full rounded-lg"
              priority={index === 0}
            />
          ))}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-hero font-heading text-primary mb-4">{product.title}</h1>
            {product.category && (
              <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-gray max-w-none">
            <p>{product.description}</p>
          </div>

          {/* Price and Purchase */}
          <div className="border-t pt-6">
            {product.isAffiliate ? (
              <div className="space-y-4">
                <p className="text-gray-600">Available on Amazon</p>
                {(() => {
                  const safeUrl = validateAndSanitizeUrl(product.affiliateUrl);
                  if (safeUrl) {
                    return (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-block"
                      >
                        View on Amazon →
                      </a>
                    );
                  } else {
                    return (
                      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                        ⚠️ This product link has been blocked for security reasons. 
                        Please contact support.
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">${product.price}</span>
                  {product.inStock ? (
                    <span className="text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>
                
                {product.inStock ? (
                  <StripeCheckout 
                    product={{
                      name: product.title,
                      price: product.price!,
                      image: product.images[0] ? product.images[0].url : undefined
                    }}
                  />
                ) : (
                  <button disabled className="btn-primary opacity-50 cursor-not-allowed w-full">
                    Out of Stock
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}