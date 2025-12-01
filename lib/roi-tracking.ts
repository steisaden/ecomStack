import { Product, AffiliateProduct } from './types';
import { getProducts } from './contentful';

// Types for ROI tracking
export interface ROIMetric {
  productId: string;
  productName: string;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  roiPercentage: number; // (Net Profit / Total Costs) * 100
  salesCount: number;
  averageOrderValue: number;
  customerAcquisitionCost: number; // CAC
  customerLifetimeValue: number; // CLV
  conversionRate: number; // From impressions/views to sales
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  timePeriod: {
    start: string;
    end: string;
  };
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  totalSales: number;
  totalRevenue: number;
  unitsSold: number;
  avgSalePrice: number;
  grossProfit: number;
  marketingSpend: number;
  roi: number;
  performanceTrend: 'increasing' | 'decreasing' | 'stable';
  efficiencyRating: number; // 0-100 scale
}

/**
 * Service for tracking and analyzing ROI per product
 */
export class ROITrackingService {
  /**
   * Calculate ROI metrics for a specific product
   */
  static async calculateProductROI(
    productId: string,
    timeRange: { start: string; end: string },
    costs: {
      marketingSpend: number;
      inventoryCost: number;
      operationalCosts: number;
      otherCosts: number;
    }
  ): Promise<ROIMetric> {
    // In a real implementation, you would fetch actual sales data from your database
    // For now, we'll simulate the data
    
    // Simulate sales data
    const salesCount = Math.floor(Math.random() * 100) + 10; // Random sales between 10-110
    const averageOrderValue = Math.random() * 50 + 20; // Random AOV between $20-$70
    const totalRevenue = salesCount * averageOrderValue;
    
    // Calculate costs
    const totalCosts = costs.marketingSpend + 
                      costs.inventoryCost + 
                      costs.operationalCosts + 
                      costs.otherCosts;
    
    const netProfit = totalRevenue - totalCosts;
    const roiPercentage = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    
    // Simulate tracking metrics
    const impressions = salesCount * (Math.random() * 20 + 50); // 50-70x impressions per sale
    const clicks = impressions * (Math.random() * 0.05 + 0.02); // 2-7% CTR
    const conversionRate = salesCount > 0 ? (salesCount / clicks) * 100 : 0;
    const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    // Get product name
    let productName = `Product ${productId}`;
    try {
      const products = await getProducts();
      const product = products.find(p => p.sys.id === productId);
      if (product) {
        productName = product.title;
      }
    } catch (error) {
      console.warn('Could not fetch product name for ROI calculation');
    }
    
    // Calculate CAC and CLV (simplified)
    const customerAcquisitionCost = costs.marketingSpend / salesCount || 0;
    const customerLifetimeValue = averageOrderValue * 3; // Assuming 3 purchases per customer
    
    return {
      productId,
      productName,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalCosts: parseFloat(totalCosts.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      roiPercentage: parseFloat(roiPercentage.toFixed(2)),
      salesCount,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      customerAcquisitionCost: parseFloat(customerAcquisitionCost.toFixed(2)),
      customerLifetimeValue: parseFloat(customerLifetimeValue.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      impressions,
      clicks: Math.round(clicks),
      clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
      timePeriod: timeRange
    };
  }

  /**
   * Get ROI performance for all products
   */
  static async getAllProductsROI(
    timeRange: { start: string; end: string }
  ): Promise<ProductPerformance[]> {
    try {
      const products = await getProducts();
      const results: ProductPerformance[] = [];

      for (const product of products) {
        // Simulate performance data for each product
        const salesCount = Math.floor(Math.random() * 50) + 5; // 5-55 sales
        const avgSalePrice = product.price || Math.random() * 40 + 15; // Use product price or random
        const totalRevenue = salesCount * avgSalePrice;
        const unitsSold = salesCount;
        
        // Simulate costs - typically 60-80% of revenue for cost of goods
        const costPercentage = 0.65 + (Math.random() * 0.15 - 0.075); // 57.5% to 82.5%
        const costOfGoods = totalRevenue * costPercentage;
        const marketingSpend = totalRevenue * (0.1 + Math.random() * 0.15); // 10-25% of revenue
        const grossProfit = totalRevenue - costOfGoods;
        const netProfit = grossProfit - marketingSpend;
        const roi = marketingSpend > 0 ? (netProfit / marketingSpend) * 100 : 0;
        
        // Determine performance trend
        let performanceTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        const trendValue = Math.random();
        if (trendValue > 0.6) performanceTrend = 'increasing';
        else if (trendValue < 0.3) performanceTrend = 'decreasing';
        
        // Calculate efficiency rating (0-100 based on multiple factors)
        const efficiencyRating = Math.min(100, 
          (netProfit / Math.max(1, marketingSpend)) * 30 + // ROI contribution
          (salesCount / 10) * 10 + // Volume contribution
          (avgSalePrice > 30 ? 20 : 10) // Price point contribution
        );

        results.push({
          productId: product.sys.id,
          productName: product.title,
          totalSales: parseFloat(totalRevenue.toFixed(2)),
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          unitsSold,
          avgSalePrice: parseFloat(avgSalePrice.toFixed(2)),
          grossProfit: parseFloat(grossProfit.toFixed(2)),
          marketingSpend: parseFloat(marketingSpend.toFixed(2)),
          roi: parseFloat(roi.toFixed(2)),
          performanceTrend,
          efficiencyRating: parseFloat(efficiencyRating.toFixed(1))
        });
      }

      // Sort by ROI in descending order
      results.sort((a, b) => b.roi - a.roi);
      
      return results;
    } catch (error) {
      console.error('Error calculating all products ROI:', error);
      
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get top performing products by ROI
   */
  static async getTopROIPerformers(
    timeRange: { start: string; end: string },
    limit: number = 10
  ): Promise<ProductPerformance[]> {
    const allPerformances = await this.getAllProductsROI(timeRange);
    return allPerformances.slice(0, limit);
  }

  /**
   * Get product performance trend over time
   */
  static async getProductPerformanceTrend(
    productId: string,
    timeRange: { start: string; end: string },
    interval: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<{
    productId: string;
    productName: string;
    trendData: Array<{
      period: string;
      revenue: number;
      salesCount: number;
      roi: number;
    }>;
    overallImprovement: number; // Percentage improvement over the period
  }> {
    try {
      // Get product info
      let productName = `Product ${productId}`;
      try {
        const products = await getProducts();
        const product = products.find(p => p.sys.id === productId);
        if (product) {
          productName = product.title;
        }
      } catch (error) {
        console.warn('Could not fetch product name for trend analysis');
      }
      
      // Generate trend data based on interval
      const startDate = new Date(timeRange.start);
      const endDate = new Date(timeRange.end);
      
      const trendData = [];
      const currentDate = new Date(startDate);
      
      // Calculate the interval step
      let intervalStep: number;
      switch (interval) {
        case 'daily':
          intervalStep = 24 * 60 * 60 * 1000; // 1 day in milliseconds
          break;
        case 'weekly':
          intervalStep = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
          break;
        case 'monthly':
          intervalStep = 30 * 24 * 60 * 60 * 1000; // 1 month in milliseconds (approx)
          break;
        default:
          intervalStep = 7 * 24 * 60 * 60 * 1000; // Default to weekly
      }
      
      while (currentDate <= endDate) {
        const periodEnd = new Date(currentDate);
        periodEnd.setTime(periodEnd.getTime() + intervalStep);
        
        // Simulate data for this period
        const revenue = Math.random() * 500 + 50; // $50-$550
        const salesCount = Math.floor(Math.random() * 20) + 2; // 2-22 sales
        const marketingSpend = revenue * (0.1 + Math.random() * 0.15); // 10-25% of revenue
        const costOfGoods = revenue * (0.6 + Math.random() * 0.2); // 60-80% of revenue
        const netProfit = revenue - costOfGoods - marketingSpend;
        const roi = marketingSpend > 0 ? (netProfit / marketingSpend) * 100 : 0;
        
        trendData.push({
          period: currentDate.toISOString().split('T')[0],
          revenue: parseFloat(revenue.toFixed(2)),
          salesCount,
          roi: parseFloat(roi.toFixed(2))
        });
        
        currentDate.setTime(currentDate.getTime() + intervalStep);
      }
      
      // Calculate overall improvement
      if (trendData.length > 1) {
        const firstROIPeriod = trendData[0].roi;
        const lastROIPeriod = trendData[trendData.length - 1].roi;
        const overallImprovement = firstROIPeriod !== 0 
          ? ((lastROIPeriod - firstROIPeriod) / Math.abs(firstROIPeriod)) * 100 
          : 0;
        
        return {
          productId,
          productName,
          trendData,
          overallImprovement: parseFloat(overallImprovement.toFixed(2))
        };
      } else {
        return {
          productId,
          productName,
          trendData,
          overallImprovement: 0
        };
      }
    } catch (error) {
      console.error('Error calculating product performance trend:', error);
      
      return {
        productId,
        productName: `Product ${productId}`,
        trendData: [],
        overallImprovement: 0
      };
    }
  }

  /**
   * Generate ROI recommendations
   */
  static async generateROIRecommendations(
    timeRange: { start: string; end: string }
  ): Promise<{
    topRecommendations: Array<{
      productId: string;
      productName: string;
      action: 'invest_more' | 'optimize' | 'reduce_spend' | 'discontinue';
      reasoning: string;
      potentialImpact: number; // Estimated improvement in ROI percentage
    }>;
    overallRecommendations: string[];
  }> {
    try {
      const productsPerformance = await this.getAllProductsROI(timeRange);
      
      const recommendations = [];
      
      // Generate recommendations based on performance
      for (const product of productsPerformance) {
        let action: 'invest_more' | 'optimize' | 'reduce_spend' | 'discontinue' = 'optimize';
        let reasoning = '';
        let potentialImpact = 0;
        
        if (product.roi > 200) {
          // High ROI product, suggest investing more
          action = 'invest_more';
          reasoning = 'This product has exceptional ROI. Consider increasing marketing spend to capitalize on its success.';
          potentialImpact = Math.random() * 20 + 10; // 10-30% potential improvement
        } else if (product.roi > 50) {
          // Good ROI, suggest optimizing
          action = 'optimize';
          reasoning = 'Product has good ROI. Optimize pricing, marketing channels, or operations to improve further.';
          potentialImpact = Math.random() * 15 + 5; // 5-20% potential improvement
        } else if (product.roi > 0) {
          // Positive but low ROI, suggest optimizing
          action = 'optimize';
          reasoning = 'Product is profitable but with low ROI. Focus on cost optimization and marketing efficiency.';
          potentialImpact = Math.random() * 10 + 5; // 5-15% potential improvement
        } else {
          // Negative ROI, suggest reducing spend or discontinuing
          action = product.efficiencyRating > 30 ? 'reduce_spend' : 'discontinue';
          reasoning = product.efficiencyRating > 30 
            ? 'Product has negative ROI but some efficiency. Reduce marketing spend and reevaluate.' 
            : 'Product has negative ROI and low efficiency. Consider discontinuing.';
          potentialImpact = action === 'reduce_spend' ? Math.random() * 15 : -product.roi; // Potential improvement if optimized or avoided loss
        }
        
        recommendations.push({
          productId: product.productId,
          productName: product.productName,
          action,
          reasoning,
          potentialImpact: parseFloat(potentialImpact.toFixed(2))
        });
      }
      
      // Sort recommendations by potential impact (descending)
      recommendations.sort((a, b) => b.potentialImpact - a.potentialImpact);
      
      // Generate overall recommendations
      const topPerformers = productsPerformance.slice(0, 3);
      const bottomPerformers = productsPerformance.slice(-3).reverse();
      
      const overallRecommendations = [
        `Focus marketing budget on top performers like ${topPerformers[0]?.productName || 'Product A'} (ROI: ${topPerformers[0]?.roi?.toFixed(2) || 0}%)`,
        `Reassess strategy for lowest performers like ${bottomPerformers[0]?.productName || 'Product Z'} (ROI: ${bottomPerformers[0]?.roi?.toFixed(2) || 0}%)`,
        `Consider repricing or cost reduction for products with high cost of goods sold`,
        `Optimize marketing channels with lowest customer acquisition costs`
      ];
      
      return {
        topRecommendations: recommendations.slice(0, 10),
        overallRecommendations
      };
    } catch (error) {
      console.error('Error generating ROI recommendations:', error);
      
      return {
        topRecommendations: [],
        overallRecommendations: ['Unable to generate recommendations due to data processing error']
      };
    }
  }
}