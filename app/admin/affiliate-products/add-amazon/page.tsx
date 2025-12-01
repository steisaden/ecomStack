import { SimplifiedAmazonAdder } from '@/components/admin/SimplifiedAmazonAdder'
import { ManualAmazonProductEntry } from '@/components/admin/ManualAmazonProductEntry'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackToAdminButton } from '@/components/admin/BackToAdminButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Force dynamic rendering for admin routes that use authentication
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Add Amazon Product | Admin',
  description: 'Add Amazon products to your affiliate catalog',
}

export default function AddAmazonProductPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-beauty-dark">Add Amazon Product</h1>
          <p className="text-beauty-muted mt-2">
            Add products from Amazon with affiliate links
          </p>
        </div>
        <BackToAdminButton />
      </div>

      <Tabs defaultValue="manual" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="auto">Auto-Fetch (Mock Data)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="mt-6">
          <ManualAmazonProductEntry />
        </TabsContent>
        
        <TabsContent value="auto" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Fetch with ASIN</CardTitle>
              <CardDescription>
                Enter an ASIN to fetch mock product data (PA-API access required for real data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimplifiedAmazonAdder />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Enter ASIN</h3>
              <p className="text-sm text-beauty-muted">
                Provide the unique 10-character ASIN from any Amazon product page
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Fetch Details</h3>
              <p className="text-sm text-beauty-muted">
                Automatically retrieve product title, price, description, and real images
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Add to Store</h3>
              <p className="text-sm text-beauty-muted">
                Add the product with your affiliate tag and real Amazon images
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}