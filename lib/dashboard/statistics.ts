import { getProducts, getBlogPosts } from '../contentful'
import { BlogPost } from '../types'
import { unstable_cache } from 'next/cache'
import Stripe from 'stripe'

// Initialize Stripe client with proper error handling
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

// Interfaces for Dashboard Statistics
export interface ContentStats {
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

export interface CategoryCount {
  category: string | { name: string; slug: string }
  count: number
}

export interface ProductMetrics {
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

export interface BlogMetrics {
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

export interface RecentPost {
  title: string
  slug: string
  publishedAt: string
  categories: string[]
}

export interface SalesMetrics {
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

export interface PaymentMethodCount {
  method: string
  count: number
  totalAmount: number
}

export interface RecentOrder {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  paymentMethod?: string
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

export interface SystemHealth {
  contentfulStatus: 'healthy' | 'warning' | 'error'
  stripeStatus: 'healthy' | 'warning' | 'error'
  lastContentUpdate: Date
  lastOrderUpdate: Date
  cacheStatus: 'active' | 'stale' | 'error'
}

export interface DashboardData {
  contentStats: ContentStats
  productMetrics: ProductMetrics
  blogMetrics: BlogMetrics
  salesMetrics: SalesMetrics
  systemHealth: SystemHealth
  lastUpdated: Date
}

// Dashboard Service Interface
export interface DashboardService {
  getContentStatistics(): Promise<ContentStats>
  getProductMetrics(): Promise<ProductMetrics>
  getBlogMetrics(): Promise<BlogMetrics>
  getSalesAnalytics(): Promise<SalesMetrics>
  getSystemHealth(): Promise<SystemHealth>
  getDashboardData(): Promise<DashboardData>
}

// Implementation of DashboardService
export class DashboardServiceImpl implements DashboardService {
  private contentStatsCacheTag: string = 'dashboard-content-stats'
  private productMetricsCacheTag: string = 'dashboard-product-metrics'
  private blogMetricsCacheTag: string = 'dashboard-blog-metrics'
  private salesMetricsCacheTag: string = 'dashboard-sales-metrics'
  private systemHealthCacheTag: string = 'dashboard-system-health'
  private dashboardDataCacheTag: string = 'dashboard-data'

  /**
   * Aggregates and returns comprehensive content statistics.
   * Caches the result for 30 minutes.
   */
  async getContentStatistics(): Promise<ContentStats> {
    return unstable_cache(
      async () => {
        try {
          const products = await getProducts()
          const blogPosts = await getBlogPosts()

          const totalProducts = products.length
          const publishedProducts = products.filter(p => p.inStock).length
          const draftProducts = totalProducts - publishedProducts

          const totalBlogPosts = blogPosts.length
          const publishedBlogPosts = blogPosts.filter(b => b.publishedAt).length
          const draftBlogPosts = totalBlogPosts - publishedBlogPosts

          // Aggregate products by category
          const productCategoryMap = new Map<string, number>()
          products.forEach(product => {
            const category = (product.category as any)?.fields?.name || product.category || 'Uncategorized'
            productCategoryMap.set(category, (productCategoryMap.get(category) || 0) + 1)
          })

          // Aggregate blog posts by category
          const blogCategoryMap = new Map<string, number>()
          if (Array.isArray(blogPosts)) {
            blogPosts.forEach(post => {
            if (post.categories && Array.isArray(post.categories)) {
              post.categories.forEach(category => {
                const categoryName = (category as any)?.fields?.name || category || 'Uncategorized'
                blogCategoryMap.set(categoryName, (blogCategoryMap.get(categoryName) || 0) + 1)
              })
            } else {
              blogCategoryMap.set('Uncategorized', (blogCategoryMap.get('Uncategorized') || 0) + 1)
            }
          })
          }

          const productsByCategory: CategoryCount[] = Array.from(productCategoryMap.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)

          const blogPostsByCategory: CategoryCount[] = Array.from(blogCategoryMap.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)

          return {
            totalProducts,
            publishedProducts,
            draftProducts,
            totalBlogPosts,
            publishedBlogPosts,
            draftBlogPosts,
            lastUpdated: new Date(),
            productsByCategory,
            blogPostsByCategory,
          }
        } catch (error) {
          console.error('Error fetching content statistics:', error)
          return {
            totalProducts: 0,
            publishedProducts: 0,
            draftProducts: 0,
            totalBlogPosts: 0,
            publishedBlogPosts: 0,
            draftBlogPosts: 0,
            lastUpdated: new Date(),
            productsByCategory: [],
            blogPostsByCategory: [],
          }
        }
      },
      ['content-stats'],
      {
        tags: [this.contentStatsCacheTag],
        revalidate: 1800, // 30 minutes
      }
    )()
  }

  /**
   * Aggregates and returns detailed product metrics.
   * Caches the result for 30 minutes.
   */
  async getProductMetrics(): Promise<ProductMetrics> {
    return unstable_cache(
      async () => {
        try {
          const products = await getProducts()

          const totalProducts = products.length
          const publishedProducts = products.filter(p => p.inStock).length
          const draftProducts = totalProducts - publishedProducts
          const inStockProducts = products.filter(p => p.inStock).length
          const outOfStockProducts = totalProducts - inStockProducts
          const affiliateProducts = products.filter(p => p.isAffiliate).length
          const directProducts = totalProducts - affiliateProducts

          // Calculate price metrics
          const productsWithPrices = products.filter(p => p.price && p.price > 0)
          const prices = productsWithPrices.map(p => p.price!)
          const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0
          const priceRange = {
            min: prices.length > 0 ? Math.min(...prices) : 0,
            max: prices.length > 0 ? Math.max(...prices) : 0,
          }

          // Aggregate by category
          const categoryMap = new Map<string, number>()
          products.forEach(product => {
            const category = (product.category as any)?.fields?.name || product.category || 'Uncategorized'
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
          })

          const productsByCategory: CategoryCount[] = Array.from(categoryMap.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)

          return {
            totalProducts,
            publishedProducts,
            draftProducts,
            inStockProducts,
            outOfStockProducts,
            affiliateProducts,
            directProducts,
            productsByCategory,
            averagePrice,
            priceRange,
          }
        } catch (error) {
          console.error('Error fetching product metrics:', error)
          return {
            totalProducts: 0,
            publishedProducts: 0,
            draftProducts: 0,
            inStockProducts: 0,
            outOfStockProducts: 0,
            affiliateProducts: 0,
            directProducts: 0,
            productsByCategory: [],
            averagePrice: 0,
            priceRange: { min: 0, max: 0 },
          }
        }
      },
      ['product-metrics'],
      {
        tags: [this.productMetricsCacheTag],
        revalidate: 1800, // 30 minutes
      }
    )()
  }

  /**
   * Aggregates and returns detailed blog metrics.
   * Caches the result for 30 minutes.
   */
  async getBlogMetrics(): Promise<BlogMetrics> {
    return unstable_cache(
      async () => {
        try {
          const blogPosts = await getBlogPosts()

          const totalPosts = blogPosts.length
          const publishedPosts = blogPosts.filter(p => p.publishedAt).length
          const draftPosts = totalPosts - publishedPosts

          // Calculate time-based metrics
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()

          const postsThisMonth = blogPosts.filter(post => {
            if (!post.publishedAt) return false
            const publishDate = new Date(post.publishedAt)
            return publishDate.getMonth() === currentMonth && publishDate.getFullYear() === currentYear
          }).length

          const postsThisYear = blogPosts.filter(post => {
            if (!post.publishedAt) return false
            const publishDate = new Date(post.publishedAt)
            return publishDate.getFullYear() === currentYear
          }).length

          // Calculate average posts per month (based on published posts)
          const publishedPostsWithDates = blogPosts.filter(p => p.publishedAt)
          let averagePostsPerMonth = 0
          if (publishedPostsWithDates.length > 0) {
            const dates = publishedPostsWithDates.map(p => new Date(p.publishedAt!))
            const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())))
            const monthsDiff = (now.getFullYear() - oldestDate.getFullYear()) * 12 + (now.getMonth() - oldestDate.getMonth()) + 1
            averagePostsPerMonth = publishedPostsWithDates.length / Math.max(monthsDiff, 1)
          }

          // Aggregate by category
          const categoryMap = new Map<string, number>()
          if (Array.isArray(blogPosts)) {
            blogPosts.forEach(post => {
              if (post.categories && Array.isArray(post.categories)) {
                post.categories.forEach(category => {
                  const categoryName = (category as any)?.fields?.name || category || 'Uncategorized'
                  categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
                })
              } else {
                categoryMap.set('Uncategorized', (categoryMap.get('Uncategorized') || 0) + 1)
              }
            })
          }

          // Aggregate by tags
          const tagMap = new Map<string, number>()
          if (Array.isArray(blogPosts)) {
            blogPosts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => {
                const tagName = typeof tag === 'string' ? tag : (tag as any)?.fields?.name || tag || 'Untagged'
                tagMap.set(tagName, (tagMap.get(tagName) || 0) + 1)
              })
            }
          })
          }

          const postsByCategory: CategoryCount[] = Array.from(categoryMap.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)

          const postsByTag: CategoryCount[] = Array.from(tagMap.entries())
            .map(([tag, count]) => ({ category: tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10) // Top 10 tags

          // Get recent posts
          const recentPosts: RecentPost[] = Array.isArray(blogPosts) ? blogPosts
            .filter((p): p is BlogPost & { publishedAt: string } => !!p.publishedAt)
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, 5)
            .map(post => ({
              title: post.title,
              slug: post.slug,
              publishedAt: post.publishedAt,
              categories: Array.isArray(post.categories) 
                ? post.categories.map(cat => (cat as any)?.fields?.name || cat || 'Uncategorized')
                : ['Uncategorized']
            })) : []

          return {
            totalPosts,
            publishedPosts,
            draftPosts,
            postsThisMonth,
            postsThisYear,
            postsByCategory,
            postsByTag,
            averagePostsPerMonth,
            recentPosts,
          }
        } catch (error) {
          console.error('Error fetching blog metrics:', error)
          return {
            totalPosts: 0,
            publishedPosts: 0,
            draftPosts: 0,
            postsThisMonth: 0,
            postsThisYear: 0,
            postsByCategory: [],
            postsByTag: [],
            averagePostsPerMonth: 0,
            recentPosts: [],
          }
        }
      },
      ['blog-metrics'],
      {
        tags: [this.blogMetricsCacheTag],
        revalidate: 1800, // 30 minutes
      }
    )()
  }

  /**
   * Aggregates and returns comprehensive sales analytics from Stripe.
   * Caches the result for 15 minutes.
   */
  async getSalesAnalytics(): Promise<SalesMetrics> {
    return unstable_cache(
      async () => {
        try {
          // Check if Stripe is configured
          if (!stripe) {
            console.warn('Stripe not configured, returning empty sales metrics')
            return {
              totalRevenue: 0,
              totalOrders: 0,
              averageOrderValue: 0,
              successfulPayments: 0,
              failedPayments: 0,
              pendingPayments: 0,
              revenueThisMonth: 0,
              revenueThisYear: 0,
              topPaymentMethods: [],
              recentOrders: [],
              monthlyRevenue: [],
            }
          }

          // Fetch payment intents from Stripe (last 100 for comprehensive analysis)
          const paymentIntents = await stripe.paymentIntents.list({
            limit: 100,
          })

          const payments = paymentIntents.data
          const totalOrders = payments.length
          
          // Calculate revenue metrics
          const successfulPayments = payments.filter(p => p.status === 'succeeded')
          const failedPayments = payments.filter(p => p.status === 'canceled')
          const pendingPayments = payments.filter(p => p.status === 'requires_payment_method' || p.status === 'requires_confirmation' || p.status === 'processing')

          const totalRevenue = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0) / 100 // Convert from cents
          const averageOrderValue = successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0

          // Calculate time-based metrics
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()

          const revenueThisMonth = successfulPayments
            .filter(payment => {
              const paymentDate = new Date(payment.created * 1000)
              return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
            })
            .reduce((sum, payment) => sum + payment.amount, 0) / 100

          const revenueThisYear = successfulPayments
            .filter(payment => {
              const paymentDate = new Date(payment.created * 1000)
              return paymentDate.getFullYear() === currentYear
            })
            .reduce((sum, payment) => sum + payment.amount, 0) / 100

          // Aggregate payment methods
          const paymentMethodMap = new Map<string, { count: number; totalAmount: number }>()
          
          for (const payment of successfulPayments) {
            try {
              // Fetch payment method details if available
              if (payment.payment_method) {
                const paymentMethod = await stripe.paymentMethods.retrieve(payment.payment_method as string)
                const methodType = paymentMethod.type || 'unknown'
                const existing = paymentMethodMap.get(methodType) || { count: 0, totalAmount: 0 }
                paymentMethodMap.set(methodType, {
                  count: existing.count + 1,
                  totalAmount: existing.totalAmount + payment.amount / 100
                })
              } else {
                const existing = paymentMethodMap.get('unknown') || { count: 0, totalAmount: 0 }
                paymentMethodMap.set('unknown', {
                  count: existing.count + 1,
                  totalAmount: existing.totalAmount + payment.amount / 100
                })
              }
            } catch (error) {
              // If we can't fetch payment method details, categorize as unknown
              const existing = paymentMethodMap.get('unknown') || { count: 0, totalAmount: 0 }
              paymentMethodMap.set('unknown', {
                count: existing.count + 1,
                totalAmount: existing.totalAmount + payment.amount / 100
              })
            }
          }

          const topPaymentMethods: PaymentMethodCount[] = Array.from(paymentMethodMap.entries())
            .map(([method, data]) => ({
              method,
              count: data.count,
              totalAmount: data.totalAmount
            }))
            .sort((a, b) => b.count - a.count)

          // Get recent orders
          const recentOrders: RecentOrder[] = payments
            .slice(0, 10)
            .map(payment => ({
              id: payment.id,
              amount: payment.amount / 100,
              currency: payment.currency,
              status: payment.status,
              created: payment.created,
              paymentMethod: payment.payment_method_types?.[0] || 'unknown'
            }))

          // Calculate monthly revenue for the last 12 months
          const monthlyRevenue: MonthlyRevenue[] = []
          for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthPayments = successfulPayments.filter(payment => {
              const paymentDate = new Date(payment.created * 1000)
              return paymentDate.getMonth() === date.getMonth() && paymentDate.getFullYear() === date.getFullYear()
            })
            
            monthlyRevenue.push({
              month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
              revenue: monthPayments.reduce((sum, payment) => sum + payment.amount, 0) / 100,
              orders: monthPayments.length
            })
          }

          return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            successfulPayments: successfulPayments.length,
            failedPayments: failedPayments.length,
            pendingPayments: pendingPayments.length,
            revenueThisMonth,
            revenueThisYear,
            topPaymentMethods,
            recentOrders,
            monthlyRevenue,
          }
        } catch (error) {
          console.error('Error fetching sales analytics:', error)
          return {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            successfulPayments: 0,
            failedPayments: 0,
            pendingPayments: 0,
            revenueThisMonth: 0,
            revenueThisYear: 0,
            topPaymentMethods: [],
            recentOrders: [],
            monthlyRevenue: [],
          }
        }
      },
      ['sales-analytics'],
      {
        tags: [this.salesMetricsCacheTag],
        revalidate: 900, // 15 minutes
      }
    )()
  }

  /**
   * Checks system health across different services.
   * Caches the result for 5 minutes.
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return unstable_cache(
      async () => {
        let contentfulStatus: 'healthy' | 'warning' | 'error' = 'healthy'
        let stripeStatus: 'healthy' | 'warning' | 'error' = 'healthy'
        let lastContentUpdate = new Date()
        let lastOrderUpdate = new Date()
        let cacheStatus: 'active' | 'stale' | 'error' = 'active'

        // Check Contentful health
        try {
          const products = await getProducts()
          const blogPosts = await getBlogPosts()
          
          if (products.length === 0 && blogPosts.length === 0) {
            contentfulStatus = 'warning'
          }
          
          // Find most recent content update
          const allContent = [...products, ...blogPosts]
          if (allContent.length > 0) {
            // This is a simplified check - in a real scenario, you'd check actual update timestamps
            lastContentUpdate = new Date()
          }
        } catch (error) {
          console.error('Contentful health check failed:', error)
          contentfulStatus = 'error'
        }

        // Check Stripe health
        try {
          if (!stripe) {
            console.warn('Stripe not configured')
            stripeStatus = 'warning'
          } else {
            const recentPayments = await stripe.paymentIntents.list({ limit: 1 })
            if (recentPayments.data.length > 0) {
              lastOrderUpdate = new Date(recentPayments.data[0].created * 1000)
            }
          }
        } catch (error) {
          console.error('Stripe health check failed:', error)
          stripeStatus = 'error'
        }

        // Cache status is assumed to be active if we're able to run this function
        // In a more sophisticated setup, you'd check actual cache metrics
        cacheStatus = 'active'

        return {
          contentfulStatus,
          stripeStatus,
          lastContentUpdate,
          lastOrderUpdate,
          cacheStatus,
        }
      },
      ['system-health'],
      {
        tags: [this.systemHealthCacheTag],
        revalidate: 300, // 5 minutes
      }
    )()
  }

  /**
   * Combines all dashboard data into a comprehensive object.
   * Caches the result for 15 minutes.
   */
  async getDashboardData(): Promise<DashboardData> {
    return unstable_cache(
      async () => {
        const [contentStats, productMetrics, blogMetrics, salesMetrics, systemHealth] = await Promise.all([
          this.getContentStatistics(),
          this.getProductMetrics(),
          this.getBlogMetrics(),
          this.getSalesAnalytics(),
          this.getSystemHealth(),
        ])

        return {
          contentStats,
          productMetrics,
          blogMetrics,
          salesMetrics,
          systemHealth,
          lastUpdated: new Date(),
        }
      },
      ['dashboard-data'],
      {
        tags: [
          this.dashboardDataCacheTag,
          this.contentStatsCacheTag,
          this.productMetricsCacheTag,
          this.blogMetricsCacheTag,
          this.salesMetricsCacheTag,
          this.systemHealthCacheTag,
        ],
        revalidate: 900, // 15 minutes
      }
    )()
  }
}

// Create a singleton instance of the service
export const dashboardService = new DashboardServiceImpl()
