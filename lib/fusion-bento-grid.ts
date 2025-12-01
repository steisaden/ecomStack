/**
 * Fusion Bento Grid System - E-commerce Optimized
 * 3x3 responsive grid layouts with glassmorphism + neumorphism
 */

import { fusionVariants, createFusionEffect } from './fusion-design'

// Bento grid layout types for e-commerce
export type BentoLayoutType = 
  | 'hero' | 'products' | 'categories' | 'featured'
  | 'blog' | 'testimonials' | 'newsletter' | 'services'

// Grid item sizes
export type BentoItemSize = 
  | '1x1' | '1x2' 
  | '2x1' | '2x2'
  | '3x1'

// Responsive breakpoints
export type BreakpointConfig = {
  mobile: string
  tablet: string
  desktop: string
  large?: string
}

/**
 * Core 3x3 Bento Grid System
 * Optimized for e-commerce with featured products, categories, and content
 */
export const fusionBentoLayouts = {
  // Hero section layout - featured product + supporting content
  hero: {
    mobile: "grid grid-cols-1 gap-4 min-h-[600px]",
    tablet: "grid grid-cols-2 gap-6 min-h-[500px]",
    desktop: "grid grid-cols-3 grid-rows-2 gap-8 min-h-[600px]",
    large: "grid grid-cols-3 grid-rows-2 gap-10 min-h-[700px]"
  },
  
  // Product showcase - 1x1 featured + 2x1 grid layout
  products: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-3 gap-8",
    large: "grid grid-cols-3 gap-10"
  },
  
  // Category filters - compact 1x1 grid
  categories: {
    mobile: "grid grid-cols-2 gap-3",
    tablet: "grid grid-cols-3 gap-4",
    desktop: "grid grid-cols-3 gap-6",
  },
  
  // Featured collections - mixed layout
  featured: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-3 grid-rows-2 gap-8",
  },
  
  // Blog/content layout
  blog: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-3 gap-8",
  },
  
  // Testimonials layout
  testimonials: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-3 gap-8",
  },
  
  // Newsletter layout
  newsletter: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-1 gap-6",
    desktop: "grid grid-cols-1 gap-8",
  },
  
  // Services layout
  services: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-3 gap-8",
  }
} as const

/**
 * Bento Grid Item Configurations
 * Defines how items span across the 3x3 grid
 */
export const bentoItemConfigs = {
  // 1x1 items (standard cards)
  "1x1": {
    mobile: "col-span-1 row-span-1",
    tablet: "col-span-1 row-span-1", 
    desktop: "col-span-1 row-span-1",
    class: "min-h-[280px]"
  },
  
  // 1x2 items (tall cards)
  "1x2": {
    mobile: "col-span-1 row-span-1",
    tablet: "col-span-1 row-span-2",
    desktop: "col-span-1 row-span-2",
    class: "min-h-[280px] md:min-h-[580px]"
  },
  
  // 2x1 items (wide cards)
  "2x1": {
    mobile: "col-span-1 row-span-1",
    tablet: "col-span-2 row-span-1",
    desktop: "col-span-2 row-span-1", 
    class: "min-h-[280px]"
  },
  
  // 2x2 items (large featured)
  "2x2": {
    mobile: "col-span-1 row-span-1",
    tablet: "col-span-2 row-span-2",
    desktop: "col-span-2 row-span-2",
    class: "min-h-[280px] md:min-h-[580px]"
  },
  
  // 3x1 items (full width)
  "3x1": {
    mobile: "col-span-1 row-span-1",
    tablet: "col-span-2 row-span-1",
    desktop: "col-span-3 row-span-1",
    class: "min-h-[200px]"
  },
} as const

/**
 * E-commerce Specific Grid Patterns
 */
export const ecommerceGridPatterns = {
  // Hero section with featured product
  heroShowcase: {
    layout: fusionBentoLayouts.hero,
    items: [
      { id: 'featured-product', size: '2x2' as BentoItemSize, priority: 1 },
      { id: 'category-quick', size: '1x1' as BentoItemSize, priority: 2 },
      { id: 'trending-now', size: '1x1' as BentoItemSize, priority: 3 },
    ]
  },
  
  // Product grid with featured item
  productShowcase: {
    layout: fusionBentoLayouts.products,
    items: [
      { id: 'featured-product', size: '1x1' as BentoItemSize, priority: 1 },
      { id: 'product-grid', size: '2x1' as BentoItemSize, priority: 2 },
    ]
  },
  
  // Category navigation
  categoryGrid: {
    layout: fusionBentoLayouts.categories,
    items: [
      { id: 'hair-care', size: '1x1' as BentoItemSize },
      { id: 'skin-care', size: '1x1' as BentoItemSize },
      { id: 'makeup', size: '1x1' as BentoItemSize },
    ]
  },
  
  // Full page layout
  fullPageLayout: {
    layout: fusionBentoLayouts.featured,
    items: [
      { id: 'hero', size: '2x2' as BentoItemSize, priority: 1 },
      { id: 'categories', size: '1x1' as BentoItemSize, priority: 2 },
      { id: 'featured-collection', size: '1x1' as BentoItemSize, priority: 3 },
      { id: 'newsletter', size: '3x1' as BentoItemSize, priority: 4 },
    ]
  }
}

/**
 * Generate responsive bento grid classes
 */
export function generateBentoGrid(layout: BentoLayoutType): string {
  const config = fusionBentoLayouts[layout]
  if (!config) {
    console.warn(`Unknown bento layout: ${layout}. Using default.`)
    return 'grid grid-cols-1 gap-4'
  }
  
  return [
    config.mobile,
    `md:${config.tablet.replace('grid ', '')}`,
    `lg:${config.desktop.replace('grid ', '')}`,
    'large' in config && config.large ? `xl:${config.large.replace('grid ', '')}` : ''
  ].filter(Boolean).join(' ')
}

/**
 * Generate bento item classes
 */
export function generateBentoItem(
  size: BentoItemSize,
  variant: 'card' | 'featured' | 'minimal' = 'card',
  customClass?: string
): string {
  const itemConfig = bentoItemConfigs[size]
  if (!itemConfig) {
    console.warn(`Unknown bento item size: ${size}. Using default.`)
    return 'col-span-1 row-span-1 min-h-[280px]'
  }
  
  // Map variants to actual fusion card variants
  const variantMap = {
    'card': 'default',
    'featured': 'featured',
    'minimal': 'minimal'
  }
  
  const fusionEffect = fusionVariants.card[variantMap[variant] as keyof typeof fusionVariants.card]
  
  return [
    itemConfig.mobile,
    `md:${itemConfig.tablet}`,
    `lg:${itemConfig.desktop}`,
    itemConfig.class,
    fusionEffect,
    'transition-all duration-500 ease-out',
    'hover:scale-[1.02] hover:z-10',
    customClass
  ].filter(Boolean).join(' ')
}

/**
 * Fusion Bento Grid Component Props Interface
 */
export interface FusionBentoGridProps {
  layout: BentoLayoutType
  className?: string
  children: React.ReactNode
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Fusion Bento Item Props Interface
 */
export interface FusionBentoItemProps {
  size: BentoItemSize
  variant?: 'card' | 'featured' | 'minimal'
  className?: string
  children: React.ReactNode
  priority?: number
  interactive?: boolean
  loading?: boolean
}

/**
 * Generate layout with automatic item placement
 */
export function generateAutoLayout(
  items: Array<{ size: BentoItemSize; priority?: number }>,
  layout: BentoLayoutType
) {
  // Sort by priority
  const sortedItems = [...items].sort((a, b) => (a.priority || 999) - (b.priority || 999))
  
  // Generate grid placement
  const gridClasses = generateBentoGrid(layout)
  
  return {
    containerClass: gridClasses,
    itemClasses: sortedItems.map(item => generateBentoItem(item.size))
  }
}

/**
 * Responsive spacing utilities
 */
export const bentoSpacing = {
  gap: {
    sm: 'gap-3 md:gap-4 lg:gap-6',
    md: 'gap-4 md:gap-6 lg:gap-8', 
    lg: 'gap-6 md:gap-8 lg:gap-10',
    xl: 'gap-8 md:gap-10 lg:gap-12'
  },
  padding: {
    sm: 'p-4 md:p-6',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
    xl: 'p-10 md:p-12'
  }
}

/**
 * Animation utilities for bento items
 */
export const bentoAnimations = {
  stagger: {
    container: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { staggerChildren: 0.1 }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  
  hover: {
    scale: 'hover:scale-[1.02]',
    lift: 'hover:translate-y-[-4px]',
    glow: 'hover:shadow-[0_0_30px_rgba(116,211,174,0.4)]',
    glass: 'hover:bg-opacity-60 hover:backdrop-blur-md'
  },
  
  loading: {
    skeleton: 'animate-pulse bg-champagne-200/50',
    shimmer: 'animate-shimmer'
  }
}

/**
 * Utility function to create responsive bento layouts
 */
export function createResponsiveBento(config: {
  layout: BentoLayoutType
  items: Array<{
    size: BentoItemSize
    variant?: 'card' | 'featured' | 'minimal'
    priority?: number
  }>
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const { layout, items, spacing = 'md' } = config
  
  return {
    containerClass: [
      generateBentoGrid(layout),
      bentoSpacing.gap[spacing],
      'w-full'
    ].join(' '),
    
    itemClasses: items.map(item => 
      generateBentoItem(item.size, item.variant, 'group')
    )
  }
}