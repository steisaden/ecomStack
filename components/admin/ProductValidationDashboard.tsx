'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { toast } from 'sonner'

interface ValidationSummary {
  total: number
  valid: number
  invalid: number
  missingImages: number
  invalidUrls: number
  missingFields: number
  validationRate: number
}

interface ProductValidationIssue {
  productId: string
  title: string
  issues: string[]
  hasImage: boolean
  hasValidUrl: boolean
  hasRequiredFields: boolean
}

export default function ProductValidationDashboard() {
  const [summary, setSummary] = useState<ValidationSummary | null>(null)
  const [issues, setIssues] = useState<ProductValidationIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchValidationData = async () => {
    try {
      const response = await fetch('/api/curated-products?summary=true')
      const data = await response.json()
      
      if (data.success) {
        setSummary(data.validation)
        
        // Extract issues from invalid products
        const productIssues: ProductValidationIssue[] = []
        // This would need to be implemented in the API to return detailed validation results
        setIssues(productIssues)
      } else {
        throw new Error(data.message || 'Failed to fetch validation data')
      }
    } catch (error: any) {
      console.error('Error fetching validation data:', error)
      toast.error('Failed to load validation data')
    }
  }

  const refreshValidation = async () => {
    try {
      setRefreshing(true)
      
      const response = await fetch('/api/curated-products', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSummary(data.validation)
        toast.success('Validation refreshed successfully')
      } else {
        throw new Error(data.message || 'Failed to refresh validation')
      }
    } catch (error: any) {
      console.error('Error refreshing validation:', error)
      toast.error('Failed to refresh validation')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchValidationData()
      setLoading(false)
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Product Validation Dashboard</h2>
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Validation Dashboard</h2>
          <p className="text-gray-600">Monitor and manage product validation status</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshValidation} 
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Validation
          </Button>
          <Button onClick={() => window.open('/curated', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            View Curated Products
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">
                Products in Contentful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valid Products</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.valid}</div>
              <p className="text-xs text-muted-foreground">
                Passing all validation checks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validation Rate</CardTitle>
              {summary.validationRate >= 80 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                summary.validationRate >= 80 ? 'text-green-600' : 
                summary.validationRate >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {summary.validationRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Products passing validation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invalid Products</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.invalid}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Issues Breakdown */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                Missing Images
              </CardTitle>
              <CardDescription>
                Products without thumbnail images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {summary.missingImages}
              </div>
              <p className="text-sm text-gray-600">
                Products need images in Contentful or screenshot files
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-orange-500" />
                Invalid URLs
              </CardTitle>
              <CardDescription>
                Products with broken affiliate links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {summary.invalidUrls}
              </div>
              <p className="text-sm text-gray-600">
                Check affiliate URLs and associate tags
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Missing Fields
              </CardTitle>
              <CardDescription>
                Products with incomplete information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {summary.missingFields}
              </div>
              <p className="text-sm text-gray-600">
                Products need title, description, or price
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Status</CardTitle>
          <CardDescription>
            Current status of product validation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-green-900">Validation System Active</h4>
                  <p className="text-sm text-green-700">
                    Products are being validated for images, URLs, and required fields
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Image Validation</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Checks for Contentful images and local screenshots
                </p>
                <Badge variant="outline" className="text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">URL Validation</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Verifies affiliate link format and parameters
                </p>
                <Badge variant="outline" className="text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing product validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.open('/admin/products', '_blank')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
            >
              <FileText className="h-5 w-5 mb-2" />
              <span className="font-medium">Manage Products</span>
              <span className="text-xs text-gray-500">Add or edit products in Contentful</span>
            </Button>

            <Button 
              onClick={() => window.open('/curated', '_blank')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
            >
              <Eye className="h-5 w-5 mb-2" />
              <span className="font-medium">View Curated</span>
              <span className="text-xs text-gray-500">See validated products display</span>
            </Button>

            <Button 
              onClick={refreshValidation}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              disabled={refreshing}
            >
              <RefreshCw className="h-5 w-5 mb-2" />
              <span className="font-medium">Refresh Validation</span>
              <span className="text-xs text-gray-500">Re-run validation checks</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
