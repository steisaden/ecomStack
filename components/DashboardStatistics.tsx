'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from './ui/loading-spinner'
import { ErrorDisplay } from './ui/error-display'
import RevenueTrends from './RevenueTrends'

// Import types from the statistics service
interface ContentStats {
  totalProducts: number
  publishedProducts: number
  draftProducts: number
  totalBlogPosts: number
  publishedBlogPosts: number
  draftBlogPosts: number
  lastUpdated: Date
  productsByCategory: CategoryCount[]
  blogPostsByCategory: CategoryCount[]
}

interface CategoryCount {
  category: string | { name: string; slug: string }
  count: number
}

interface ProductMetrics {
  totalProducts: number
  publishedProducts: number
  draftProducts: number
  inStockProducts: number
  outOfStockProducts: number
  affiliateProducts: number
  directProducts: number
  productsByCategory: CategoryCount[]
  averagePrice: number
  priceRange: {
    min: number
    max: number
  }
}

interface BlogMetrics {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  postsThisMonth: number
  postsThisYear: number
  postsByCategory: CategoryCount[]
  postsByTag: CategoryCount[]
  averagePostsPerMonth: number
  recentPosts: RecentPost[]
}

interface RecentPost {
  title: string
  slug: string
  publishedAt: string
  categories: string[]
}

interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  successfulPayments: number
  failedPayments: number
  pendingPayments: number
  revenueThisMonth: number
  revenueThisYear: number
  topPaymentMethods: PaymentMethodCount[]
  recentOrders: RecentOrder[]
  monthlyRevenue: MonthlyRevenue[]
}

interface PaymentMethodCount {
  method: string
  count: number
  totalAmount: number
}

interface RecentOrder {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  paymentMethod?: string
}

interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

interface SystemHealth {
  contentfulStatus: 'healthy' | 'warning' | 'error'
  stripeStatus: 'healthy' | 'warning' | 'error'
  lastContentUpdate: Date
  lastOrderUpdate: Date
  cacheStatus: 'active' | 'stale' | 'error'
}

interface RevenueTrendsData {
  weekly: { period: string; revenue: number; orders: number }[]
  monthly: { period: string; revenue: number; orders: number }[]
  lastUpdated: Date
}

interface DashboardData {
  contentStats: ContentStats
  productMetrics: ProductMetrics
  blogMetrics: BlogMetrics
  salesMetrics: SalesMetrics
  systemHealth: SystemHealth
  revenueTrendsData?: RevenueTrendsData
  lastUpdated: Date
}

export default function DashboardStatistics() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/dashboard/statistics')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setDashboardData(data)
      setLastRefresh(new Date())
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to fetch dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set initial timestamp on client side only
    setLastRefresh(new Date())
    fetchDashboardData()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    fetchDashboardData()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="p-6">
        <LoadingSpinner size={32} label="Loading dashboard statistics" />
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6">
        <ErrorDisplay 
          error={new Error(error)} 
          onRetry={handleRefresh}
        />
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6 text-center text-gray-500">
        No dashboard data available
      </div>
    )
  }

  const { contentStats, productMetrics, blogMetrics, salesMetrics, systemHealth } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Statistics</h2>
          <p className="text-sm text-gray-500">
            Last updated: {lastRefresh ? formatDate(lastRefresh) : 'Loading...'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <LoadingSpinner size={16} /> : '🔄'}
          Refresh
        </button>
      </div>

      {/* System Health Status */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-md ${getStatusColor(systemHealth.contentfulStatus)}`}>
            <div className="flex items-center gap-2">
              <span>{getStatusIcon(systemHealth.contentfulStatus)}</span>
              <span className="font-medium">Contentful</span>
            </div>
            <p className="text-sm mt-1">
              Last update: {formatDate(systemHealth.lastContentUpdate)}
            </p>
          </div>
          <div className={`p-3 rounded-md ${getStatusColor(systemHealth.stripeStatus)}`}>
            <div className="flex items-center gap-2">
              <span>{getStatusIcon(systemHealth.stripeStatus)}</span>
              <span className="font-medium">Stripe</span>
            </div>
            <p className="text-sm mt-1">
              Last order: {formatDate(systemHealth.lastOrderUpdate)}
            </p>
          </div>
          <div className={`p-3 rounded-md ${getStatusColor(systemHealth.cacheStatus === 'active' ? 'healthy' : systemHealth.cacheStatus === 'stale' ? 'warning' : 'error')}`}>
            <div className="flex items-center gap-2">
              <span>{getStatusIcon(systemHealth.cacheStatus === 'active' ? 'healthy' : systemHealth.cacheStatus === 'stale' ? 'warning' : 'error')}</span>
              <span className="font-medium">Cache</span>
            </div>
            <p className="text-sm mt-1">Status: {systemHealth.cacheStatus}</p>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{contentStats.totalProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Published:</span>
              <span className="font-medium">{contentStats.publishedProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">Draft:</span>
              <span className="font-medium">{contentStats.draftProducts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Blog Posts</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{contentStats.totalBlogPosts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Published:</span>
              <span className="font-medium">{contentStats.publishedBlogPosts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">Draft:</span>
              <span className="font-medium">{contentStats.draftBlogPosts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Sales Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-medium">{formatCurrency(salesMetrics.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders:</span>
              <span className="font-medium">{salesMetrics.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Order:</span>
              <span className="font-medium">{formatCurrency(salesMetrics.averageOrderValue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">This Month</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium">{formatCurrency(salesMetrics.revenueThisMonth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blog Posts:</span>
              <span className="font-medium">{blogMetrics.postsThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-medium">
                {salesMetrics.totalOrders > 0 
                  ? Math.round((salesMetrics.successfulPayments / salesMetrics.totalOrders) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Categories */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Products by Category</h3>
          {productMetrics.productsByCategory.length > 0 ? (
            <div className="space-y-2">
              {productMetrics.productsByCategory.slice(0, 5).map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{typeof category.category === 'string' ? category.category : category.category.name}</span>
                  <span className="font-medium">{category.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No categories found</p>
          )}
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Blog Posts</h3>
          {blogMetrics.recentPosts.length > 0 ? (
            <div className="space-y-3">
              {blogMetrics.recentPosts.slice(0, 5).map((post, index) => (
                <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                  <p className="font-medium text-sm">{post.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(post.publishedAt)} • {post.categories.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent posts found</p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          {salesMetrics.topPaymentMethods.length > 0 ? (
            <div className="space-y-2">
              {salesMetrics.topPaymentMethods.slice(0, 5).map((method, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{method.method}</span>
                  <div className="text-right">
                    <div className="font-medium">{method.count} orders</div>
                    <div className="text-sm text-gray-500">{formatCurrency(method.totalAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No payment data available</p>
          )}
        </div>

        {/* Product Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Product Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Stock:</span>
              <span className="font-medium text-green-600">{productMetrics.inStockProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Out of Stock:</span>
              <span className="font-medium text-red-600">{productMetrics.outOfStockProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Affiliate:</span>
              <span className="font-medium">{productMetrics.affiliateProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Direct:</span>
              <span className="font-medium">{productMetrics.directProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Price:</span>
              <span className="font-medium">{formatCurrency(productMetrics.averagePrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Order Trends */}
      {dashboardData.revenueTrendsData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <RevenueTrends 
            data={dashboardData.revenueTrendsData.monthly} 
            weeklyData={dashboardData.revenueTrendsData.weekly}
          />
        </div>
      )}

      {/* Error display if there was an error during refresh */}
      {error && (
        <div className="mt-4">
          <ErrorDisplay 
            error={new Error(error)} 
            onRetry={handleRefresh}
          />
        </div>
      )}
    </div>
  )
}