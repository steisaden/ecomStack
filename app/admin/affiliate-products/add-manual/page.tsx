import { ManualAmazonProductEntry } from '@/components/admin/ManualAmazonProductEntry'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ManualAmazonProductPage() {
  return (
    <div className="container mx-auto py-8 px-4">


      <div className="max-w-3xl mx-auto mt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Add Amazon Product Manually</h1>
          <p className="text-gray-600">
            Copy product details from Amazon and paste them here. Your affiliate tag will be automatically added to the URL.
          </p>
        </div>

        <ManualAmazonProductEntry />

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">How to Find Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>ASIN:</strong> Found in the product details section or in the URL (amazon.com/dp/<strong>ASIN</strong>)</p>
            <p><strong>Title:</strong> Copy from the product page heading</p>
            <p><strong>Price:</strong> Current price shown on the product page</p>
            <p><strong>Features:</strong> Copy bullet points from &quot;About this item&quot; section</p>
            <p><strong>Image:</strong> Right-click product image → Copy image address (or leave blank to auto-generate)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
