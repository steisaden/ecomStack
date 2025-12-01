import OpenAI from 'openai';
import { Product, AffiliateProduct } from './types';
import { getProducts } from './contentful';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const DEFAULT_MAX_TOKENS = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 6000);

/**
 * AI-powered product recommendation service
 */
export class AIRecommendationService {
  /**
   * Generate personalized product recommendations for a user based on their preferences
   */
  static async generateRecommendations(
    userPreferences: {
      categories?: string[];
      priceRange?: { min: number; max: number };
      keywords?: string[];
      previousPurchases?: string[];
      browsingHistory?: string[];
    },
    products: Product[] = []
  ): Promise<Product[]> {
    try {
      if (products.length === 0) {
        products = await getProducts();
      }

      // Create a prompt for OpenAI to generate recommendations
      const prompt = this.buildRecommendationPrompt(userPreferences, products);
      
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert product recommendation engine for a natural beauty and wellness e-commerce site. 
            Your goal is to analyze user preferences and recommend products that best match their needs. 
            Consider factors like product categories, price points, descriptions, and how well they match the user's preferences. 
            Always prioritize products that align with natural, organic beauty and wellness themes.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: DEFAULT_MAX_TOKENS,
        temperature: 0.7,
      });

      const result = response.choices[0]?.message?.content?.trim();
      
      if (!result) {
        throw new Error('No recommendations generated');
      }

      // Parse the result to extract product IDs
      const recommendedProductIds = this.parseRecommendationResult(result, products);

      // Return products in the recommended order
      return recommendedProductIds
        .map(id => products.find(p => p.sys.id === id))
        .filter(Boolean) as Product[];
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      // Fallback to simple recommendation logic if AI fails
      return this.fallbackRecommendations(userPreferences, products);
    }
  }

  /**
   * Generate product descriptions with sentiment analysis
   */
  static async generateSentimentAnalyzedDescription(
    product: Product,
    originalDescription?: string
  ): Promise<{
    enhancedDescription: string;
    sentimentScore: number;
    sentimentLabel: 'positive' | 'neutral' | 'negative';
    emotionalTriggers: string[];
  }> {
    try {
      const description = originalDescription || product.description;
      
      const prompt = `
        Analyze the following product description for sentiment and enhance it:
        
        Product: ${product.title}
        Description: ${description}
        
        Please provide:
        1. An enhanced version of the description that evokes positive emotions and encourages purchase
        2. A sentiment score from -1 (very negative) to 1 (very positive) based on the emotional impact
        3. Identify emotional triggers used in the enhanced description (e.g., trust, excitement, exclusivity)
        
        Enhanced description should focus on benefits, use power words, and appeal to the natural beauty/wellness audience.
      `;

      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert in marketing copywriting and sentiment analysis. 
            Your task is to analyze product descriptions, evaluate their emotional impact, 
            and enhance them to improve their appeal to customers while maintaining accuracy about the product.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: DEFAULT_MAX_TOKENS,
        temperature: 0.8,
      });

      const result = response.choices[0]?.message?.content?.trim();
      
      if (!result) {
        throw new Error('No sentiment analysis generated');
      }

      // Parse the result to extract the different components
      const parsed = this.parseSentimentResult(result);
      
      return {
        enhancedDescription: parsed.enhancedDescription,
        sentimentScore: parsed.sentimentScore,
        sentimentLabel: this.scoreToLabel(parsed.sentimentScore),
        emotionalTriggers: parsed.emotionalTriggers
      };
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      
      // Fallback response
      return {
        enhancedDescription: originalDescription || product.description,
        sentimentScore: 0.5,
        sentimentLabel: 'positive',
        emotionalTriggers: []
      };
    }
  }

  /**
   * Analyze product descriptions for emotional impact and suggest improvements
   */
  static async analyzeProductEmotionalImpact(products: Product[]): Promise<Array<{
    productId: string;
    title: string;
    originalSentiment: number;
    suggestedImprovements: string[];
    impactScore: number;
  }>> {
    try {
      const prompt = `
        Analyze the emotional impact of the following product descriptions:
        
        ${products.map(p => `ID: ${p.sys.id}, Title: ${p.title}, Description: ${p.description}`).join('\n\n')}
        
        For each product, provide:
        1. The product ID
        2. A sentiment score from -1 (negative) to 1 (positive) based on the description's emotional impact
        3. Suggestions for improving the emotional impact of the description
        4. An impact score from 0-100 based on how likely the description is to convert browsers to buyers
        
        Format the response as JSON.
      `;

      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert in emotional marketing and copywriting analysis. 
            You evaluate product descriptions based on their emotional appeal and potential to drive conversions.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: DEFAULT_MAX_TOKENS,
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });

      const result = response.choices[0]?.message?.content?.trim();
      
      if (!result) {
        throw new Error('No emotional impact analysis generated');
      }

      const parsedResult = JSON.parse(result);
      return parsedResult.analyses || [];
    } catch (error) {
      console.error('Error in emotional impact analysis:', error);
      return products.map(p => ({
        productId: p.sys.id,
        title: p.title,
        originalSentiment: 0.5,
        suggestedImprovements: [],
        impactScore: 50
      }));
    }
  }

  private static buildRecommendationPrompt(userPreferences: any, products: Product[]): string {
    let prompt = `Based on the following user preferences, recommend the top 5-10 products from the list:\n\n`;
    
    if (userPreferences.categories?.length) {
      prompt += `Preferred categories: ${userPreferences.categories.join(', ')}\n`;
    }
    
    if (userPreferences.priceRange) {
      prompt += `Price range: $${userPreferences.priceRange.min} - $${userPreferences.priceRange.max}\n`;
    }
    
    if (userPreferences.keywords?.length) {
      prompt += `Keywords of interest: ${userPreferences.keywords.join(', ')}\n`;
    }
    
    if (userPreferences.previousPurchases?.length) {
      prompt += `Previously purchased products: ${userPreferences.previousPurchases.join(', ')}\n`;
    }
    
    if (userPreferences.browsingHistory?.length) {
      prompt += `Browsing history: ${userPreferences.browsingHistory.join(', ')}\n`;
    }
    
    prompt += `\nAvailable products:\n`;
    products.forEach(product => {
      prompt += `- ID: ${product.sys.id}, Title: ${product.title}, Description: ${product.description}, Price: $${product.price}, Category: ${product.category?.name || 'N/A'}\n`;
    });
    
    prompt += `\nProvide a JSON list of product IDs in order of recommendation, with brief reasons for each recommendation.`;
    
    return prompt;
  }

  private static parseRecommendationResult(result: string, products: Product[]): string[] {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 10); // Return top 10
      } else if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        return parsed.recommendations.slice(0, 10);
      }
    } catch (e) {
      // If not JSON, try to extract product IDs from plain text
      const idMatches = result.match(/(prod_|item_|product_)?[a-zA-Z0-9]+/g);
      if (idMatches) {
        return idMatches
          .map(id => id.replace(/^(prod_|item_|product_)/, ''))
          .filter(id => products.some(p => p.sys.id === id));
      }
    }
    
    // Fallback: return all product IDs
    return products.map(p => p.sys.id);
  }

  private static parseSentimentResult(result: string): {
    enhancedDescription: string;
    sentimentScore: number;
    emotionalTriggers: string[];
  } {
    // This is a simplified parser - in a real implementation, you'd want more robust parsing
    const lines = result.split('\n');
    
    let enhancedDescription = '';
    let sentimentScore = 0.5;
    const emotionalTriggers: string[] = [];
    
    let inDescription = false;
    for (const line of lines) {
      if (line.includes('Enhanced description:') || line.includes('Enhanced Version:')) {
        inDescription = true;
        enhancedDescription = line.replace(/.*:/, '').trim();
        continue;
      }
      
      if (inDescription && !line.startsWith('Sentiment score') && !line.startsWith('Emotional triggers')) {
        enhancedDescription += ' ' + line.trim();
        continue;
      }
      
      if (inDescription && (line.startsWith('Sentiment score') || line.startsWith('Emotional triggers'))) {
        inDescription = false;
      }
      
      if (line.includes('Sentiment score:') || line.includes('Sentiment:')) {
        const match = line.match(/[-+]?\d*\.?\d+/);
        if (match) {
          sentimentScore = Math.max(-1, Math.min(1, parseFloat(match[0])));
        }
      }
      
      if (line.includes('Emotional triggers:') || line.includes('Emotional appeals:')) {
        const triggers = line.replace(/.*:/, '').split(',').map(t => t.trim());
        emotionalTriggers.push(...triggers);
      }
    }
    
    return {
      enhancedDescription: enhancedDescription || result.substring(0, 500),
      sentimentScore,
      emotionalTriggers: emotionalTriggers.filter(t => t.length > 0)
    };
  }

  private static scoreToLabel(score: number): 'positive' | 'neutral' | 'negative' {
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }

  private static fallbackRecommendations(
    userPreferences: any,
    products: Product[]
  ): Product[] {
    // Simple fallback logic: filter by category and sort by relevance
    let filteredProducts = [...products];

    if (userPreferences.categories?.length) {
      filteredProducts = filteredProducts.filter(p => 
        userPreferences.categories.some((cat: string) => 
          p.category?.name.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    if (userPreferences.priceRange) {
      filteredProducts = filteredProducts.filter(p => 
        p.price && 
        p.price >= userPreferences.priceRange.min && 
        p.price <= userPreferences.priceRange.max
      );
    }

    // Sort by a combination of factors
    filteredProducts.sort((a, b) => {
      // Priority given to products with more descriptive text
      const aLength = a.description.length;
      const bLength = b.description.length;
      return bLength - aLength;
    });

    return filteredProducts.slice(0, 10);
  }
}
