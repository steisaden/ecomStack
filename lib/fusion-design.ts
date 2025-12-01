/**
 * Fusion Design System - Glassmorphism + Neumorphism Utilities
 * Combines translucent glass effects with 3D neomorphic shadows
 */

import { theme } from './theme'

// Glass effect variants
export type GlassVariant = 'subtle' | 'light' | 'medium' | 'strong' | 'intense'
export type NeomorphicSize = 'sm' | 'md' | 'lg' | 'xl'
export type FusionVariant = 'card' | 'button' | 'input' | 'nav' | 'hero' | 'product'

/**
 * Create glassmorphism effect with specified opacity and blur
 */
export function createGlassmorphism(
  variant: GlassVariant = 'medium',
  customOpacity?: number,
  customBlur?: number
): string {
  const variants = {
    subtle: { opacity: 0.1, blur: 4 },
    light: { opacity: 0.2, blur: 8 },
    medium: { opacity: 0.3, blur: 10 },
    strong: { opacity: 0.4, blur: 16 },
    intense: { opacity: 0.5, blur: 20 },
  }
  
  const { opacity, blur } = variants[variant]
  const finalOpacity = customOpacity ?? opacity
  const finalBlur = customBlur ?? blur
  
  return [
    `bg-white bg-opacity-${Math.round(finalOpacity * 100)}`,
    `backdrop-blur-${finalBlur <= 4 ? 'sm' : finalBlur <= 8 ? 'md' : finalBlur <= 12 ? 'lg' : 'xl'}`,
    'border border-white border-opacity-20',
  ].join(' ')
}

/**
 * Create neumorphism shadow effects
 */
export function createNeumorphism(size: NeomorphicSize = 'md'): string {
  const shadows = {
    sm: 'shadow-[2px_2px_6px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.8)]',
    md: 'shadow-[4px_4px_12px_rgba(0,0,0,0.15),-4px_-4px_12px_rgba(255,255,255,0.9)]',
    lg: 'shadow-[8px_8px_24px_rgba(0,0,0,0.2),-8px_-8px_24px_rgba(255,255,255,1)]',
    xl: 'shadow-[12px_12px_32px_rgba(0,0,0,0.25),-12px_-12px_32px_rgba(255,255,255,1)]',
  }
  
  return shadows[size]
}

/**
 * Create inset neumorphism for pressed states
 */
export function createNeumorphismInset(size: NeomorphicSize = 'md'): string {
  const shadows = {
    sm: 'shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),inset_-2px_-2px_6px_rgba(255,255,255,0.8)]',
    md: 'shadow-[inset_4px_4px_12px_rgba(0,0,0,0.15),inset_-4px_-4px_12px_rgba(255,255,255,0.9)]',
    lg: 'shadow-[inset_8px_8px_24px_rgba(0,0,0,0.2),inset_-8px_-8px_24px_rgba(255,255,255,1)]',
    xl: 'shadow-[inset_12px_12px_32px_rgba(0,0,0,0.25),inset_-12px_-12px_32px_rgba(255,255,255,1)]',
  }
  
  return shadows[size]
}

/**
 * Create fusion effect combining glass and neomorphic styles
 */
export function createFusionEffect(
  glassVariant: GlassVariant = 'medium',
  neomorphicSize: NeomorphicSize = 'md',
  customClass?: string
): string {
  const glass = createGlassmorphism(glassVariant)
  const neomorphic = createNeumorphism(neomorphicSize)
  
  return [glass, neomorphic, customClass].filter(Boolean).join(' ')
}

/**
 * Pre-configured fusion variants for common components
 */
export const fusionVariants = {
  // Card variants
  card: {
    default: createFusionEffect('medium', 'md', 'rounded-2xl bg-champagne-300/40'),
    featured: createFusionEffect('strong', 'lg', 'rounded-3xl bg-champagne-200/50'),
    minimal: createFusionEffect('light', 'sm', 'rounded-xl bg-champagne-400/30'),
  },
  
  // Button variants
  button: {
    primary: createFusionEffect('medium', 'md', 'rounded-xl bg-celadon-400/80 text-white'),
    secondary: createFusionEffect('light', 'sm', 'rounded-lg bg-asparagus-500/70 text-white'),
    accent: createFusionEffect('medium', 'md', 'rounded-xl bg-olivine-400/80 text-asparagus-800'),
    destructive: createFusionEffect('medium', 'md', 'rounded-xl bg-coral-500/80 text-white'),
  },
  
  // Input variants
  input: {
    default: createFusionEffect('light', 'sm', 'rounded-lg bg-champagne-200/60 border-olivine-400/50'),
    focused: createFusionEffect('medium', 'md', 'rounded-lg bg-champagne-100/70 border-celadon-400/70'),
  },
  
  // Navigation variants
  nav: {
    bar: createFusionEffect('strong', 'md', 'rounded-2xl bg-champagne-300/80'),
    item: createFusionEffect('light', 'sm', 'rounded-lg bg-champagne-200/50'),
    active: createFusionEffect('medium', 'md', 'rounded-lg bg-celadon-400/60'),
  },
  
  // Hero section variants
  hero: {
    main: createFusionEffect('strong', 'xl', 'rounded-3xl bg-champagne-200/60'),
    secondary: createFusionEffect('medium', 'lg', 'rounded-2xl bg-champagne-300/50'),
  },
  
  // Product variants
  product: {
    card: createFusionEffect('medium', 'md', 'rounded-2xl bg-champagne-300/50'),
    featured: createFusionEffect('strong', 'lg', 'rounded-3xl bg-champagne-200/60'),
    badge: createFusionEffect('light', 'sm', 'rounded-full bg-coral-500/80 text-white'),
  },
}

/**
 * Hover and interaction effects
 */
export const fusionInteractions = {
  // Hover effects
  hover: {
    lift: 'hover:translate-y-[-4px] hover:shadow-[8px_8px_24px_rgba(0,0,0,0.2),-8px_-8px_24px_rgba(255,255,255,1)] transition-all duration-300',
    glow: 'hover:shadow-[0_0_30px_rgba(116,211,174,0.4)] transition-all duration-300',
    scale: 'hover:scale-[1.02] transition-transform duration-300',
    glass: 'hover:bg-opacity-50 hover:backdrop-blur-md transition-all duration-300',
  },
  
  // Press effects
  press: {
    inset: 'active:shadow-[inset_4px_4px_12px_rgba(0,0,0,0.15),inset_-4px_-4px_12px_rgba(255,255,255,0.9)]',
    scale: 'active:scale-[0.98] transition-transform duration-150',
  },
  
  // Focus effects
  focus: {
    ring: 'focus:ring-4 focus:ring-celadon-400/50 focus:outline-none',
    glow: 'focus:shadow-[0_0_20px_rgba(116,211,174,0.6)] focus:outline-none',
  },
}

/**
 * Responsive fusion utilities
 */
export const responsiveFusion = {
  // Mobile-first responsive glass effects
  mobile: createFusionEffect('light', 'sm'),
  tablet: createFusionEffect('medium', 'md'),
  desktop: createFusionEffect('strong', 'lg'),
  
  // Adaptive sizing
  adaptive: 'sm:' + createFusionEffect('light', 'sm') + ' md:' + createFusionEffect('medium', 'md') + ' lg:' + createFusionEffect('strong', 'lg'),
}

/**
 * Animation classes for fusion effects
 */
export const fusionAnimations = {
  // Entry animations
  fadeIn: 'animate-glass-fade',
  slideUp: 'animate-fade-in-up',
  scaleIn: 'animate-scale-in',
  
  // Interaction animations
  hover: 'animate-fusion-hover',
  press: 'animate-neomorphic-press',
  shimmer: 'animate-shimmer',
  
  // Continuous animations
  float: 'animate-float',
  glow: 'animate-pulse-glow',
  bounce: 'animate-micro-bounce',
}

/**
 * Color-aware fusion utilities
 */
export const coloredFusion = {
  celadon: createFusionEffect('medium', 'md', 'bg-celadon-400/60 text-white'),
  asparagus: createFusionEffect('medium', 'md', 'bg-asparagus-500/60 text-white'),
  olivine: createFusionEffect('medium', 'md', 'bg-olivine-400/60 text-asparagus-800'),
  champagne: createFusionEffect('medium', 'md', 'bg-champagne-300/60 text-asparagus-800'),
  coral: createFusionEffect('medium', 'md', 'bg-coral-500/60 text-white'),
}

/**
 * Utility function to create custom fusion combinations
 */
export function createCustomFusion({
  glass = 'medium',
  neomorphic = 'md',
  background = 'bg-champagne-300/40',
  border = 'rounded-2xl',
  text = 'text-asparagus-800',
  hover = true,
  animation,
}: {
  glass?: GlassVariant
  neomorphic?: NeomorphicSize
  background?: string
  border?: string
  text?: string
  hover?: boolean
  animation?: keyof typeof fusionAnimations
}): string {
  const base = createFusionEffect(glass, neomorphic, `${background} ${border} ${text}`)
  const hoverEffect = hover ? fusionInteractions.hover.lift : ''
  const animationClass = animation ? fusionAnimations[animation] : ''
  
  return [base, hoverEffect, animationClass].filter(Boolean).join(' ')
}

/**
 * Export theme integration
 */
export { theme }
export type { Theme } from './theme'