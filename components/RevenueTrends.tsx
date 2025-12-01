'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Define types for our chart data
interface RevenueDataPoint {
  period: string;
  revenue: number;
  orders: number;
  previousRevenue?: number;
  previousOrders?: number;
}

interface RevenueTrendsProps {
  data: RevenueDataPoint[];
  weeklyData?: RevenueDataPoint[];
}

const RevenueTrends: React.FC<RevenueTrendsProps> = ({ data, weeklyData }) => {
  const [activeChart, setActiveChart] = useState<'weekly' | 'monthly' | 'overview'>('monthly');
  const [timeRange, setTimeRange] = useState<number>(12); // months for overview

  // Calculate comparative data for the last period
  const calculateComparativeData = (chartData: RevenueDataPoint[]): RevenueDataPoint[] => {
    return chartData.map((item, index) => {
      // Get previous period values for comparison
      const previousPeriodIndex = index - 1;
      const previousRevenue = previousPeriodIndex >= 0 ? chartData[previousPeriodIndex].revenue : 0;
      const previousOrders = previousPeriodIndex >= 0 ? chartData[previousPeriodIndex].orders : 0;
      
      return {
        ...item,
        previousRevenue,
        previousOrders
      };
    });
  };

  // Get chart data based on active view
  const getChartData = () => {
    let baseData: RevenueDataPoint[] = [];
    
    switch (activeChart) {
      case 'weekly':
        baseData = weeklyData || data;
        break;
      case 'monthly':
        baseData = data;
        break;
      case 'overview':
        // Filter data for the selected time range (last N months)
        baseData = data.slice(-timeRange);
        break;
      default:
        baseData = data;
    }
    
    // Calculate comparative data for the chart
    return calculateComparativeData(baseData);
  };

  // Format data for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('revenue') ? formatCurrency(entry.value) : entry.value} {entry.name.includes('orders') ? 'orders' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartData = getChartData();

  // Select the appropriate chart based on active view
  const renderChart = () => {
    switch (activeChart) {
      case 'weekly':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value} orders`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3A8134" />
              <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#AAC5A6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'monthly':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value} orders`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3A8134" />
              <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#AAC5A6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'overview':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value} orders`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                name="Current Revenue" 
                stroke="#3A8134" 
                fill="#3A8134" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
              {chartData.some(d => d.previousRevenue !== undefined) && (
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="previousRevenue" 
                  name="Previous Period Revenue" 
                  stroke="#AAC5A6" 
                  fill="#AAC5A6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )}
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="orders" 
                name="Orders" 
                stroke="#228B22" 
                fill="#228B22"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              {chartData.some(d => d.previousOrders !== undefined) && (
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="previousOrders" 
                  name="Previous Orders" 
                  stroke="#7C7C7C" 
                  fill="#7C7C7C"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value} orders`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3A8134" />
              <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#AAC5A6" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-900">Revenue and Order Trends</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Chart View Selector */}
          <div className="flex bg-gray-100 p-1 rounded-md">
            <button
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeChart === 'weekly'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveChart('weekly')}
            >
              Weekly
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeChart === 'monthly'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveChart('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeChart === 'overview'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveChart('overview')}
            >
              Overview
            </button>
          </div>
          
          {/* Time Range Selector (only for overview) */}
          {activeChart === 'overview' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Months:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                {[2, 3, 6, 9, 12].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-96">
        {renderChart()}
      </div>
      
      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-800">Total Revenue</h4>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {data.length > 1 ? 
              `+${((data[data.length - 1].revenue - data[data.length - 2].revenue) / data[data.length - 2].revenue * 100).toFixed(1)}% from previous period`
              : 'N/A'}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800">Total Orders</h4>
          <p className="text-2xl font-bold text-blue-900">
            {data.reduce((sum, item) => sum + item.orders, 0).toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {data.length > 1 ? 
              `+${((data[data.length - 1].orders - data[data.length - 2].orders) / data[data.length - 2].orders * 100).toFixed(1)}% from previous period`
              : 'N/A'}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="text-sm font-medium text-amber-800">Avg. Order Value</h4>
          <p className="text-2xl font-bold text-amber-900">
            {formatCurrency(
              data.length && data.reduce((sum, item) => sum + item.orders, 0) > 0
                ? data.reduce((sum, item) => sum + item.revenue, 0) / 
                  data.reduce((sum, item) => sum + item.orders, 0)
                : 0
            )}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {data.length > 1 && data[data.length - 1].orders > 0 && data[data.length - 2].orders > 0 ? 
              `+${(((data[data.length - 1].revenue / data[data.length - 1].orders) - (data[data.length - 2].revenue / data[data.length - 2].orders)) / (data[data.length - 2].revenue / data[data.length - 2].orders) * 100).toFixed(1)}% from previous period`
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueTrends;