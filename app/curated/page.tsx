import { Metadata } from 'next'
import CuratedProducts from '@/components/CuratedProducts'
import { CheckCircle, Sparkles, Shield, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Curated Products | Goddess Hair & Beauty',
  description: 'Discover our carefully curated collection of verified beauty and wellness products with working affiliate links and quality thumbnails.',
  keywords: ['curated products', 'beauty products', 'verified products', 'affiliate products', 'goddess hair beauty']
}

export default function CuratedProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Curated Products
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Discover our carefully selected collection of verified beauty and wellness products
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Verified Quality</h3>
                <p className="text-white/80 text-sm">
                  Every product is validated for quality, availability, and working links
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Trusted Sources</h3>
                <p className="text-white/80 text-sm">
                  Products from reputable brands and verified affiliate partners
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ExternalLink className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Direct Access</h3>
                <p className="text-white/80 text-sm">
                  Working affiliate links that take you directly to purchase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <CuratedProducts 
          showValidationSummary={true}
          className="max-w-7xl mx-auto"
        />
      </div>

      {/* Information Section */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Curated Products?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Quality Assurance</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Every product undergoes validation for image availability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Affiliate links are tested for functionality</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Product information is complete and accurate</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Seamless Experience</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>High-quality product thumbnails for better browsing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Direct links to purchase without broken redirects</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Organized display with consistent formatting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}