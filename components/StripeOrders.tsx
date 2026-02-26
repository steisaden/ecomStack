'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, AlertCircle, Calendar, Users } from 'lucide-react';
import { SalesMetrics } from '@/lib/dashboard/statistics';

interface StripeAnalyticsData {
  salesMetrics: SalesMetrics;
  lastUpdated: Date;
}

export default function StripeOrders() {
  const [analyticsData, setAnalyticsData] = useState<StripeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/dashboard/statistics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnalyticsData({
          salesMetrics: data.salesMetrics,
          lastUpdated: new Date(data.lastUpdated)
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" data-testid="skeleton" />
                        <Skeleton className="h-8 w-16" data-testid="skeleton" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" data-testid="skeleton" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" data-testid="skeleton" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" data-testid="skeleton" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" data-testid="skeleton" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" data-testid="skeleton" />
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">Error loading sales analytics</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData || !analyticsData.salesMetrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { salesMetrics } = analyticsData;

  // Chart colors
  const CHART_COLORS = {
    revenue: '#8884d8',
    orders: '#82ca9d',
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Calculate trends
  const currentMonth = salesMetrics.monthlyRevenue[salesMetrics.monthlyRevenue.length - 1];
  const previousMonth = salesMetrics.monthlyRevenue[salesMetrics.monthlyRevenue.length - 2];
  const revenueTrend = previousMonth ?
    ((currentMonth?.revenue || 0) - (previousMonth?.revenue || 0)) / (previousMonth?.revenue || 1) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sales Analytics Dashboard</span>
            <div className="text-sm text-muted-foreground">
              Last updated: {analyticsData.lastUpdated.toLocaleString()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${salesMetrics.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      {revenueTrend >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(revenueTrend).toFixed(1)}% from last month
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{salesMetrics.totalOrders.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {salesMetrics.successfulPayments} successful
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                    <p className="text-2xl font-bold">${salesMetrics.averageOrderValue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per successful order
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">${salesMetrics.revenueThisMonth.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${salesMetrics.revenueThisYear.toLocaleString()} this year
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesMetrics.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={CHART_COLORS.revenue}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS.revenue }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Orders Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Orders Trend (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesMetrics.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill={CHART_COLORS.orders} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods and Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {salesMetrics.topPaymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesMetrics.topPaymentMethods as any}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {salesMetrics.topPaymentMethods.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                                    <p className="font-medium">{data.method}</p>
                                    <p className="text-sm">Orders: {data.count}</p>
                                    <p className="text-sm">Revenue: ${data.totalAmount.toFixed(2)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {salesMetrics.topPaymentMethods.map((method, index) => (
                        <div key={method.method} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium capitalize">{method.method}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{method.count} orders</p>
                            <p className="text-xs text-muted-foreground">${method.totalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No payment method data available</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {salesMetrics.recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {salesMetrics.recentOrders.slice(0, 6).map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <p className="text-sm font-mono text-muted-foreground truncate">
                              {order.id.slice(-8)}...
                            </p>
                            <Badge
                              variant={
                                order.status === 'succeeded' ? 'default' :
                                  order.status === 'canceled' ? 'destructive' : 'secondary'
                              }
                              className="text-xs w-fit"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                            <span>{new Date(order.created * 1000).toLocaleDateString()}</span>
                            <span className="capitalize">{order.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-medium text-base">
                            ${order.amount.toFixed(2)} {order.currency.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recent orders found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Status Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {salesMetrics.successfulPayments}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Successful Payments</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {salesMetrics.totalOrders > 0 ?
                      ((salesMetrics.successfulPayments / salesMetrics.totalOrders) * 100).toFixed(1) : 0}% success rate
                  </div>
                </div>

                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {salesMetrics.pendingPayments}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Payments</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Awaiting completion
                  </div>
                </div>

                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {salesMetrics.failedPayments}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Failed Payments</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {salesMetrics.totalOrders > 0 ?
                      ((salesMetrics.failedPayments / salesMetrics.totalOrders) * 100).toFixed(1) : 0}% failure rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}