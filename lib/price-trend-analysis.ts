import { Product } from './types';

/**
 * Price trend analysis service using external APIs
 */
export class PriceTrendService {
  private static readonly EXTERNAL_PRICE_API_KEY = process.env.EXTERNAL_PRICE_API_KEY || '';
  private static readonly EXTERNAL_PRICE_API_URL = process.env.EXTERNAL_PRICE_API_URL || 'https://api.example-price-service.com';

  /**
   * Get price trends for a product using external APIs
   */
  static async getPriceTrends(productId: string, productName: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    productId: string;
    currentPrice: number;
    historicalPrices: Array<{ date: string; price: number }>;
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: number; // 0-1 scale
    forecast: {
      nextWeek: number;
      nextMonth: number;
    };
  }> {
    try {
      // For now, we'll simulate the API call since we don't have a real external service
      // In a real implementation, we would call an actual price tracking API
      console.log(`Simulating price trend analysis for product: ${productName} (${productId})`);

      // Simulate getting historical data
      const now = new Date();
      const historicalPrices: Array<{ date: string; price: number }> = [];
      let currentPrice = 0;

      // Generate simulated historical prices
      for (let i = 0; i <= this.getTimeRangeDays(timeRange); i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);

        // Simulate price changes (this would come from real data in production)
        const basePrice = Math.random() * 50 + 20; // Random price between $20-$70
        const variation = (Math.random() - 0.5) * 5; // Random variation

        const price = Math.max(5, basePrice + variation); // Minimum $5

        if (i === 0) {
          currentPrice = price;
        }

        historicalPrices.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(2))
        });
      }

      // Calculate trend
      const trend = this.calculateTrend(historicalPrices);

      // Calculate volatility (standard deviation)
      const volatility = this.calculateVolatility(historicalPrices);

      // Generate forecast based on trend
      const forecast = this.generateForecast(historicalPrices, trend);

      return {
        productId,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        historicalPrices: historicalPrices.reverse(), // Reverse to show oldest first
        trend,
        volatility,
        forecast
      };
    } catch (error) {
      console.error('Error in price trend analysis:', error);

      // Return default data on error
      return {
        productId,
        currentPrice: 0,
        historicalPrices: [],
        trend: 'stable',
        volatility: 0,
        forecast: {
          nextWeek: 0,
          nextMonth: 0
        }
      };
    }
  }

  /**
   * Compare prices with competitors
   */
  static async getPriceComparison(productId: string, productName: string, category: string): Promise<{
    productId: string;
    productName: string;
    ourPrice: number;
    competitorPrices: Array<{
      name: string;
      price: number;
      rating: number;
    }>;
    pricePosition: 'lowest' | 'competitive' | 'highest';
    savingsOpportunity: number; // Potential savings if we adjusted price
  }> {
    try {
      // Simulate competitor price comparison
      console.log(`Simulating price comparison for: ${productName} in category: ${category}`);

      // In a real implementation, we would fetch actual competitor prices
      const ourPrice = Math.random() * 50 + 20; // Random price between $20-$70

      const competitors = [
        { name: 'Competitor A', price: ourPrice * 0.95, rating: 4.2 },
        { name: 'Competitor B', price: ourPrice * 1.1, rating: 4.5 },
        { name: 'Competitor C', price: ourPrice * 0.98, rating: 4.0 },
      ];

      // Determine price position
      const allPrices = [ourPrice, ...competitors.map(c => c.price)];
      let pricePosition: 'lowest' | 'competitive' | 'highest' = 'competitive';

      if (ourPrice === Math.min(...allPrices)) {
        pricePosition = 'lowest';
      } else if (ourPrice === Math.max(...allPrices)) {
        pricePosition = 'highest';
      }

      // Calculate potential savings opportunity
      const savingsOpportunity = pricePosition === 'highest'
        ? ourPrice - Math.min(...competitors.map(c => c.price))
        : 0;

      return {
        productId,
        productName,
        ourPrice: parseFloat(ourPrice.toFixed(2)),
        competitorPrices: competitors.map(c => ({
          name: c.name,
          price: parseFloat(c.price.toFixed(2)),
          rating: c.rating
        })),
        pricePosition,
        savingsOpportunity: parseFloat(savingsOpportunity.toFixed(2))
      };
    } catch (error) {
      console.error('Error in price comparison:', error);

      return {
        productId,
        productName,
        ourPrice: 0,
        competitorPrices: [],
        pricePosition: 'competitive',
        savingsOpportunity: 0
      };
    }
  }

  private static getTimeRangeDays(timeRange: '7d' | '30d' | '90d' | '1y'): number {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  private static calculateTrend(prices: Array<{ date: string; price: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (prices.length < 2) return 'stable';

    const firstPrice = prices[prices.length - 1].price; // Oldest price
    const lastPrice = prices[0].price; // Newest price

    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  private static calculateVolatility(prices: Array<{ date: string; price: number }>): number {
    if (prices.length < 2) return 0;

    const pricesOnly = prices.map(p => p.price);
    const mean = pricesOnly.reduce((sum, price) => sum + price, 0) / pricesOnly.length;

    const squaredDifferences = pricesOnly.map(price => Math.pow(price - mean, 2));
    const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / squaredDifferences.length;
    const stdDev = Math.sqrt(variance);

    // Normalize to 0-1 scale (assuming max possible volatility)
    return Math.min(1, stdDev / 10); // Adjust the divisor based on expected price ranges
  }

  private static generateForecast(
    prices: Array<{ date: string; price: number }>,
    trend: 'increasing' | 'decreasing' | 'stable'
  ): { nextWeek: number; nextMonth: number } {
    if (prices.length === 0) {
      return { nextWeek: 0, nextMonth: 0 };
    }

    const currentPrice = prices[0].price; // Newest price
    let growthFactor = 0;

    switch (trend) {
      case 'increasing':
        growthFactor = 0.02; // 2% growth
        break;
      case 'decreasing':
        growthFactor = -0.015; // 1.5% decrease
        break;
      case 'stable':
        growthFactor = 0.005; // Small positive bias
        break;
    }

    const nextWeek = currentPrice * (1 + growthFactor * 0.2); // Weekly growth factor
    const nextMonth = currentPrice * (1 + growthFactor); // Monthly growth factor

    return {
      nextWeek: parseFloat(nextWeek.toFixed(2)),
      nextMonth: parseFloat(nextMonth.toFixed(2))
    };
  }

  /**
   * Get price trend recommendations for a product
   */
  static async getPriceRecommendations(productId: string, currentPrice: number): Promise<{
    productId: string;
    currentPrice: number;
    recommendedPrice: number;
    confidence: number; // 0-1
    reasoning: string;
  }> {
    try {
      // This is a simplified recommendation based on trend analysis
      // In a real implementation, this would use more sophisticated models

      // Fetch the trend data
      const trendData = await this.getPriceTrends(productId, `Product ${productId}`, '30d');

      let recommendedPrice = currentPrice;
      let confidence = 0.7; // Default confidence
      let reasoning = '';

      if (trendData.trend === 'increasing' && trendData.volatility < 0.3) {
        // If prices are increasing steadily, consider raising our price
        recommendedPrice = currentPrice * 1.05; // 5% increase
        reasoning = 'Market prices are trending upward with low volatility, suggesting opportunity for price increase';
      } else if (trendData.trend === 'decreasing' && trendData.volatility < 0.3) {
        // If prices are decreasing steadily, consider matching or going lower
        recommendedPrice = currentPrice * 0.95; // 5% decrease
        reasoning = 'Market prices are trending downward, suggesting price adjustment to remain competitive';
      } else if (trendData.volatility > 0.5) {
        // High volatility means uncertain market, be cautious
        confidence = 0.4;
        reasoning = 'Market is highly volatile, recommend maintaining current pricing strategy until market stabilizes';
      } else {
        // Stable market, could optimize based on other factors
        recommendedPrice = currentPrice * 1.02; // Small increase
        reasoning = 'Market is stable, small price increase to optimize revenue';
      }

      return {
        productId,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        recommendedPrice: parseFloat(recommendedPrice.toFixed(2)),
        confidence,
        reasoning
      };
    } catch (error) {
      console.error('Error in price recommendations:', error);

      return {
        productId,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        recommendedPrice: currentPrice,
        confidence: 0,
        reasoning: 'Could not generate recommendations due to error in trend analysis'
      };
    }
  }
}