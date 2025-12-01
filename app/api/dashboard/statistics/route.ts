import { NextRequest, NextResponse } from 'next/server'
import { getProducts, getBlogPosts } from '@/lib/contentful'
import Stripe from 'stripe'

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// ✅ COPY Stripe config from existing checkout route
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Helper function to format dates as month-year string
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Helper function to format dates as week string (e.g. "Week of Jan 1")
const formatWeek = (date: Date): string => {
  const weekStart = new Date(date);
  // Go to Monday of the week
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  weekStart.setDate(diff);
  return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

// Helper function to group charges by month for the last 12 months
const groupChargesByMonth = (charges: any[]): any[] => {
  const last12Months: { [key: string]: { revenue: number; orders: number } } = {};
  
  // Get the date 12 months ago
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11); // 12 months including current month
  
  // Initialize last 12 months with zero values
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(twelveMonthsAgo.getMonth() + i);
    const monthKey = formatDate(date);
    last12Months[monthKey] = { revenue: 0, orders: 0 };
  }
  
  // Aggregate charges by month
  charges.forEach(charge => {
    if (charge.status === 'succeeded') {
      const chargeDate = new Date(charge.created * 1000); // Stripe uses Unix timestamp
      const monthKey = formatDate(chargeDate);
      
      // Only include charges from the last 12 months
      if (new Date(chargeDate) >= twelveMonthsAgo) {
        if (last12Months[monthKey]) {
          last12Months[monthKey].revenue += charge.amount / 100; // Convert from cents
          last12Months[monthKey].orders += 1;
        }
      }
    }
  });
  
  // Convert to array format for chart
  return Object.entries(last12Months).map(([period, data]) => ({
    period,
    revenue: data.revenue,
    orders: data.orders
  }));
};

// Helper function to group charges by week
const groupChargesByWeek = (charges: any[]): any[] => {
  const last12Weeks: { [key: string]: { revenue: number; orders: number } } = {};
  
  // Get the date 12 weeks ago
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 83); // ~12 weeks back
  
  // Initialize last 12 weeks with zero values
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setDate(twelveWeeksAgo.getDate() + (i * 7));
    const weekKey = formatWeek(date);
    last12Weeks[weekKey] = { revenue: 0, orders: 0 };
  }
  
  // Aggregate charges by week
  charges.forEach(charge => {
    if (charge.status === 'succeeded') {
      const chargeDate = new Date(charge.created * 1000); // Stripe uses Unix timestamp
      const weekKey = formatWeek(chargeDate);
      
      // Only include charges from the last 12 weeks
      if (new Date(chargeDate) >= twelveWeeksAgo) {
        if (last12Weeks[weekKey]) {
          last12Weeks[weekKey].revenue += charge.amount / 100; // Convert from cents
          last12Weeks[weekKey].orders += 1;
        }
      }
    }
  });
  
  // Convert to array format for chart
  return Object.entries(last12Weeks).map(([period, data]) => ({
    period,
    revenue: data.revenue,
    orders: data.orders
  }));
};

export async function GET(request: NextRequest) {
  try {
    // ✅ REUSE existing functions
    const [products, blogPosts] = await Promise.all([
      getProducts(),
      getBlogPosts()
    ])
    
    // ✅ COPY interfaces from components/DashboardStatistics.tsx
    const contentStats = {
      totalProducts: products.length,
      publishedProducts: products.filter(p => p.sys?.id).length,
      draftProducts: 0, // Calculate based on your logic
      totalBlogPosts: blogPosts.length,
      publishedBlogPosts: blogPosts.filter(p => p.sys?.publishedVersion).length,
      draftBlogPosts: blogPosts.filter(p => !p.sys?.publishedVersion).length,
      lastUpdated: new Date(),
      productsByCategory: [], // Calculate from products
      blogPostsByCategory: [] // Calculate from blogPosts
    }
    
    // ✅ GET Stripe data
    const charges = await stripe.charges.list({ limit: 1000 }) // Increased limit to get more data
    
    // Calculate revenue for current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const revenueThisMonth = charges.data
      .filter(charge => {
        const chargeDate = new Date(charge.created * 1000);
        return charge.status === 'succeeded' && 
               chargeDate.getMonth() === currentMonth && 
               chargeDate.getFullYear() === currentYear;
      })
      .reduce((sum, charge) => sum + charge.amount, 0) / 100;
      
    const revenueThisYear = charges.data
      .filter(charge => {
        const chargeDate = new Date(charge.created * 1000);
        return charge.status === 'succeeded' && 
               chargeDate.getFullYear() === currentYear;
      })
      .reduce((sum, charge) => sum + charge.amount, 0) / 100;
    
    // Group charges by month for the last 12 months
    const monthlyRevenue = groupChargesByMonth(charges.data);
    
    // Group charges by week for the last 12 weeks
    const weeklyRevenue = groupChargesByWeek(charges.data);
    
    // Calculate payment methods breakdown
    const paymentMethodMap = new Map<string, { count: number; totalAmount: number }>();
    charges.data.forEach(charge => {
      const method = charge.payment_method_details?.type || 'other';
      if (!paymentMethodMap.has(method)) {
        paymentMethodMap.set(method, { count: 0, totalAmount: 0 });
      }
      const current = paymentMethodMap.get(method)!;
      current.count += 1;
      current.totalAmount += charge.amount / 100;
    });
    
    const topPaymentMethods = Array.from(paymentMethodMap.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        totalAmount: data.totalAmount
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
    
    const salesMetrics = {
      totalRevenue: charges.data.reduce((sum, charge) => sum + charge.amount, 0) / 100,
      totalOrders: charges.data.length,
      averageOrderValue: charges.data.length > 0 ? 
        (charges.data.reduce((sum, charge) => sum + charge.amount, 0) / 100) / charges.data.length : 0,
      successfulPayments: charges.data.filter(c => c.status === 'succeeded').length,
      failedPayments: charges.data.filter(c => c.status === 'failed').length,
      pendingPayments: charges.data.filter(c => c.status === 'pending').length,
      revenueThisMonth,
      revenueThisYear,
      topPaymentMethods,
      recentOrders: charges.data.slice(0, 10).map(charge => ({
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency,
        status: charge.status,
        created: charge.created,
        paymentMethod: charge.payment_method_details?.type || 'unknown'
      })),
      monthlyRevenue
    }
    
    const systemHealth = {
      contentfulStatus: 'healthy' as const,
      stripeStatus: 'healthy' as const,
      lastContentUpdate: new Date(),
      lastOrderUpdate: new Date(),
      cacheStatus: 'active' as const
    }

    const productMetrics = {
        totalProducts: products.length,
        publishedProducts: products.length,
        draftProducts: 0,
        inStockProducts: products.filter(p => p.inStock).length,
        outOfStockProducts: products.filter(p => !p.inStock).length,
        affiliateProducts: products.filter(p => p.isAffiliate).length,
        directProducts: products.filter(p => !p.isAffiliate).length,
        productsByCategory: [],
        averagePrice: products.length > 0 ? products.reduce((acc, p) => acc + (p.price || 0), 0) / products.length : 0,
        priceRange: {
            min: Math.min(...products.map(p => p.price || 0)),
            max: Math.max(...products.map(p => p.price || 0)),
        }
    }

    const blogMetrics = {
        totalPosts: blogPosts.length,
        publishedPosts: blogPosts.length,
        draftPosts: 0,
        postsThisMonth: 0,
        postsThisYear: 0,
        postsByCategory: [],
        postsByTag: [],
        averagePostsPerMonth: 0,
        recentPosts: [],
    }
    
    return NextResponse.json({
      contentStats,
      salesMetrics,
      systemHealth,
      productMetrics,
      blogMetrics,
      lastUpdated: new Date(),
      // Include additional data specifically for revenue trends chart
      revenueTrendsData: {
        weekly: weeklyRevenue,
        monthly: monthlyRevenue,
        lastUpdated: new Date()
      }
    })
  } catch (error) {
    console.error('Dashboard statistics error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
