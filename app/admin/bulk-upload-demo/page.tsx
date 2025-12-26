'use client'

import BulkProductUpload from '@/components/admin/BulkProductUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BulkUploadDemoPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Bulk Product Upload Demo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the smooth card flip animation and comprehensive bulk upload functionality.
            This component integrates seamlessly with the existing admin system and provides
            both CSV upload and manual entry capabilities.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Main Bulk Upload Component */}
        <BulkProductUpload />

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{"✨ Smooth Animation"}</CardTitle>
              <CardDescription>
                {'Card flip animation with CSS 3D transforms and smooth transitions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>{'• 3D perspective with backface visibility'}</li>
                <li>{'• Cubic-bezier easing for natural motion'}</li>
                <li>{'• Responsive design that works on all devices'}</li>
                <li>{'• Clean state management during transitions'}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{"📊 Comprehensive Features"}</CardTitle>
              <CardDescription>
                {'Full-featured bulk upload with validation and error handling'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>{'• CSV file upload with drag & drop'}</li>
                <li>{'• Manual product entry form'}</li>
                <li>{'• Real-time validation and error reporting'}</li>
                <li>{'• Product queue management'}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{"🔧 Technical Excellence"}</CardTitle>
              <CardDescription>
                {'Built with modern React patterns and TypeScript'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>{'• TypeScript interfaces for type safety'}</li>
                <li>{'• Shadcn UI components for consistency'}</li>
                <li>{'• Proper error handling and user feedback'}</li>
                <li>{'• Integration with Contentful CMS'}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{"🎯 User Experience"}</CardTitle>
              <CardDescription>
                {'Intuitive interface designed for productivity'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>{'• Clear visual feedback and progress indicators'}</li>
                <li>{'• Downloadable CSV template'}</li>
                <li>{'• Bulk operations with individual error tracking'}</li>
                <li>{'• Mobile-responsive design'}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription>
              Step-by-step guide to using the bulk upload feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">CSV Upload Method:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Click &quot;Start Bulk Upload&quot; to flip the card</li>
                  <li>Download the CSV template for reference</li>
                  <li>Prepare your CSV file with product data</li>
                  <li>Upload via drag & drop or file browser</li>
                  <li>Review parsed products and click upload</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">Manual Entry Method:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Click &quot;Start Bulk Upload&quot; to access the form</li>
                  <li>Fill in product details in the manual entry section</li>
                  <li>Add tags and configure product settings</li>
                  <li>Click &quot;Add Product to Queue&quot;</li>
                  <li>Repeat for multiple products, then upload all</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}