import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const asin = searchParams.get('asin')
  const category = searchParams.get('category') || 'beauty'
  
  // Generate a placeholder image URL based on category and ASIN
  const placeholderUrl = generatePlaceholderUrl(asin, category)
  
  // Redirect to the placeholder image
  return NextResponse.redirect(placeholderUrl)
}

function generatePlaceholderUrl(asin: string | null, category: string): string {
  // ASIN-specific images for verified products
  const asinImageMap: Record<string, string> = {
    // Skincare
    'B074FVTQD4': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&auto=format&q=80',
    'B00TTD9BRC': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80',
    'B01N9SPQHQ': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80',
    'B07BHHQZPX': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80',
    'B00NR1YQK4': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop&auto=format&q=80',
    
    // Hair Care
    'B00CMBRE0A': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
    'B00CMBRE1O': 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=400&fit=crop&auto=format&q=80',
    'B01FQPVJ8Y': 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=400&h=400&fit=crop&auto=format&q=80',
    'B01FQPVJ9C': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
    
    // Beauty Tools
    'B07DLKYZ8Q': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80',
    'B08R7GY3ZD': 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format&q=80',
    
    // Wellness
    'B00CKQZPXS': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80',
    'B00JEEYNOW': 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&auto=format&q=80',
    
    // Body Care
    'B00A8S6HM4': 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop&auto=format&q=80',
    'B00A2Y8M5M': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop&auto=format&q=80'
  }
  
  // Return ASIN-specific image if available
  if (asin && asinImageMap[asin]) {
    return asinImageMap[asin]
  }
  
  // Category-specific fallback images
  const categoryImages: Record<string, string> = {
    'skincare': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=80',
    'hair care': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&auto=format&q=80',
    'beauty tools': 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format&q=80',
    'wellness': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format&q=80',
    'body care': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop&auto=format&q=80',
    'organic products': 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop&auto=format&q=80'
  }
  
  return categoryImages[category.toLowerCase()] || categoryImages['skincare']
}