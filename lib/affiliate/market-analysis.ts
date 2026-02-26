import { AffiliateProduct, AIRecommendation } from '../types';

interface MarketTrend {
  category: string;
  growth: number; // percentage
  averagePrice: number;
  seasonality: {
    peak: string[];
    low: string[];
  };
  competitionLevel: 'low' | 'medium' | 'high';
}

interface MarketAnalysis {
  trends: MarketTrend[];
  recommendations: AIRecommendation[];
  opportunities: {
    category: string;
    reason: string;
    confidence: number;
  }[];
}

export async function analyzeMarketTrends(products: AffiliateProduct[]): Promise<MarketAnalysis> {
  // Group products by category
  const categories = Array.from(new Set(products.map(p => p.category || 'Uncategorized')));

  const trends: MarketTrend[] = categories.map(category => {
    const categoryProducts = products.filter(p => (p.category || 'Uncategorized') === category);
    const avgPrice = categoryProducts.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : p.price?.amount || 0), 0) / categoryProducts.length;

    return {
      category,
      growth: calculateCategoryGrowth(categoryProducts),
      averagePrice: avgPrice,
      seasonality: determineCategorySeasonality(category),
      competitionLevel: determineCompetitionLevel(categoryProducts)
    };
  });

  return {
    trends,
    recommendations: generateRecommendations(products, trends),
    opportunities: identifyOpportunities(trends)
  };
}

function calculateCategoryGrowth(products: AffiliateProduct[]): number {
  // Calculate growth based on revenue trends
  const recentRevenue = products.reduce((sum, p) => sum + (p.performance.revenue || 0), 0);
  // In a real implementation, this would compare against historical data
  return 5; // Example: 5% growth
}

function determineCategorySeasonality(category: string): { peak: string[]; low: string[] } {
  // Predefined seasonality patterns
  const seasonality: Record<string, { peak: string[]; low: string[] }> = {
    'Skincare': {
      peak: ['Summer', 'Winter'],
      low: ['Spring', 'Fall']
    },
    'Hair Care': {
      peak: ['Spring', 'Summer'],
      low: ['Winter']
    },
    'Wellness': {
      peak: ['January', 'September'],
      low: ['December']
    },
    'Beauty Tools': {
      peak: ['November', 'December'],
      low: ['July', 'August']
    },
    'default': {
      peak: ['December'],
      low: ['January']
    }
  };

  return seasonality[category] || seasonality.default;
}

function determineCompetitionLevel(products: AffiliateProduct[]): 'low' | 'medium' | 'high' {
  const avgCommissionRate = products.reduce((sum, p) => sum + p.commissionRate, 0) / products.length;

  if (avgCommissionRate > 15) return 'low';
  if (avgCommissionRate > 8) return 'medium';
  return 'high';
}

function generateRecommendations(products: AffiliateProduct[], trends: MarketTrend[]): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // Analyze high-performing products
  const highPerformers = products.filter(p =>
    p.performance.conversionRate > 0.02 || p.performance.revenue > 1000
  );

  // Generate recommendations based on performance
  highPerformers.forEach(product => {
    recommendations.push({
      productId: product.id,
      title: `Optimize ${product.title}`,
      reason: `High conversion rate of ${(product.performance.conversionRate * 100).toFixed(1)}%`,
      confidence: 0.85,
      predictedPerformance: {
        clicks: Math.round(product.performance.clicks * 1.2),
        conversions: Math.round(product.performance.conversions * 1.3),
        revenue: Math.round(product.performance.revenue * 1.25)
      },
      suggestedAction: 'optimize'
    });
  });

  // Add seasonal recommendations
  const currentMonth = new Date().getMonth();
  const upcomingSeasons = getUpcomingSeasons(currentMonth);

  trends.forEach(trend => {
    if (trend.seasonality.peak.some(season => upcomingSeasons.includes(season))) {
      recommendations.push({
        productId: null,
        title: `${trend.category} Season Prep`,
        reason: `Upcoming peak season for ${trend.category}`,
        confidence: 0.75,
        predictedPerformance: {
          clicks: 200,
          conversions: 40,
          revenue: 1200
        },
        suggestedAction: 'promote'
      });
    }
  });

  return recommendations;
}

function identifyOpportunities(trends: MarketTrend[]): { category: string; reason: string; confidence: number; }[] {
  return trends
    .filter(trend => trend.growth > 0 && trend.competitionLevel !== 'high')
    .map(trend => ({
      category: trend.category,
      reason: `Growing market (${trend.growth}% growth) with ${trend.competitionLevel} competition`,
      confidence: trend.competitionLevel === 'low' ? 0.9 : 0.7
    }));
}

function getUpcomingSeasons(currentMonth: number): string[] {
  const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
  const currentSeason = Math.floor(((currentMonth + 1) % 12) / 3);
  const nextSeason = (currentSeason + 1) % 4;

  return [seasons[currentSeason], seasons[nextSeason]];
}