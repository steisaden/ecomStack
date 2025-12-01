// Product categories for the beauty/skincare website
export enum ProductCategory {
  HAIR_CARE = 'hair-care',
  SKIN_CARE = 'skin-care', 
  MAKEUP = 'makeup',
  WELLNESS = 'wellness',
  GIFT_SETS = 'gift-sets'
}

// Bento grid item sizes
export enum BentoItemSize {
  SMALL = '1x1',
  TALL = '1x2', 
  WIDE = '2x1',
  LARGE = '2x2',
  FULL_WIDTH = '3x1'
}

// Card variants for different visual styles
export enum CardVariant {
  DEFAULT = 'default',
  FEATURED = 'featured',
  MINIMAL = 'minimal',
  GLASSMORPHIC = 'glassmorphic'
}

// Priority levels for content ordering
export enum ContentPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}