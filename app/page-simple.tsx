import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="section-spacing bg-light-gray">
        <div className="container text-center">
          <h1 className="text-hero font-heading text-primary mb-6">
            Handcrafted with Care
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Premium homemade oils, curated apparel, and thoughtfully selected products for mindful living.
          </p>
          <Link href="/products" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Coming Soon Sections */}
      <section className="section-spacing">
        <div className="container">
          <h2 className="text-section mb-8">Premium Essential Oils</h2>
          <div className="text-center py-12 bg-light-gray rounded-lg">
            <p className="text-gray-600 mb-4">Products will appear here once you add them to Contentful</p>
            <p className="text-sm text-gray-500">
              Create your first product in Contentful to see it displayed here
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-light-gray">
        <div className="container">
          <h2 className="text-section mb-8">Latest Stories</h2>
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">Blog posts will appear here once you add them to Contentful</p>
            <p className="text-sm text-gray-500">
              Create your first blog post in Contentful to see it displayed here
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}