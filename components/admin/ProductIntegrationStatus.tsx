"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, AlertCircle, ExternalLink, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

interface ProductIntegrationStatusProps {
  className?: string
}

export function ProductIntegrationStatus({ className }: ProductIntegrationStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefreshCache = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/revalidate-products', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setLastRefresh(new Date())
        toast.success('Product cache refreshed successfully! Affiliate products are now visible on the main products page.')
      } else {
        toast.error('Failed to refresh cache: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error refreshing cache:', error)
      toast.error('Failed to refresh cache. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Product Integration Status
        </CardTitle>
        <CardDescription>
          Affiliate products are automatically integrated with your main product catalog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Integration Status */}
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-800 font-medium">Integration Active</span>
          </div>
          <Badge variant="default" className="bg-green-600">
            Live
          </Badge>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          <h4 className="font-medium text-beauty-dark">Active Features:</h4>
          <ul className="space-y-1 text-sm text-beauty-muted">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Affiliate products appear on main products page
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Visual indicators distinguish partner products
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Direct links to affiliate URLs
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Automatic cache synchronization
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 pt-3 border-t border-beauty-light">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cache Status:</span>
            <span className="text-xs text-beauty-muted">
              {lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()}` : 'Auto-sync active'}
            </span>
          </div>
          
          <Button
            onClick={handleRefreshCache}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Product Cache
              </>
            )}
          </Button>
        </div>

        {/* Quick Links */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open('/products', '_blank')}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            View Products
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open('/admin', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Admin Panel
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-xs">
            <strong>How it works:</strong> When you create or update affiliate products, they automatically 
            appear alongside your regular products with a &quot;Partner&quot; badge. Customers can click to visit 
            the affiliate site directly.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}