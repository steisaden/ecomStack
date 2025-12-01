import { cn } from "@/lib/utils"

// Glassmorphism utility classes
export const glassStyles = {
  // Base glass effect
  base: "backdrop-blur-md bg-white/10 border border-white/20",
  
  // Light glass variants
  light: "backdrop-blur-sm bg-white/5 border border-white/10",
  medium: "backdrop-blur-md bg-white/10 border border-white/20", 
  heavy: "backdrop-blur-lg bg-white/20 border border-white/30",
  
  // Dark glass variants  
  dark: "backdrop-blur-md bg-black/10 border border-white/10",
  darkMedium: "backdrop-blur-md bg-black/20 border border-white/20",
  darkHeavy: "backdrop-blur-lg bg-black/30 border border-white/30",
  
  // Colored glass variants using brand colors
  sage: "backdrop-blur-md bg-sage-500/10 border border-sage-300/20",
  beauty: "backdrop-blur-md bg-beauty-500/10 border border-beauty-300/20",
  lavender: "backdrop-blur-md bg-lavender-500/10 border border-lavender-300/20",
  
  // Card glass effects
  card: "backdrop-blur-md bg-white/5 border border-white/10 shadow-glass",
  cardHover: "backdrop-blur-lg bg-white/10 border border-white/20 shadow-card-hover",
  
  // Navigation glass effects
  nav: "backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm",
  navDark: "backdrop-blur-xl bg-black/80 border-b border-white/10 shadow-sm",
  
  // Button glass effects
  button: "backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20",
  buttonPrimary: "backdrop-blur-sm bg-sage-500/20 border border-sage-400/30 hover:bg-sage-500/30",
  buttonSecondary: "backdrop-blur-sm bg-beauty-500/20 border border-beauty-400/30 hover:bg-beauty-500/30",
} as const

// Neumorphism utility classes
export const neuStyles = {
  // Light neumorphism (for light backgrounds)
  light: "bg-gray-100 shadow-neumorphic border-0",
  lightInset: "bg-gray-100 shadow-neumorphic-inset border-0",
  lightSubtle: "bg-lightGray shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]",
  
  // Medium neumorphism
  medium: "bg-gray-200 shadow-[12px_12px_24px_#a3a3a3,-12px_-12px_24px_#ffffff]",
  mediumInset: "shadow-[inset_12px_12px_24px_#a3a3a3,inset_-12px_-12px_24px_#ffffff]",
  
  // Colored neumorphism variants
  sage: "bg-sage-100 shadow-[8px_8px_16px_#4a6144,-8px_-8px_16px_#70a870]",
  beauty: "bg-beauty-100 shadow-[8px_8px_16px_#d1477c,-8px_-8px_16px_#ff5dc4]",
  
  // Button neumorphism
  button: "bg-gray-100 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]",
  buttonPressed: "shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]",
} as const

// Combined utility functions
export const createGlassEffect = (
  variant: keyof typeof glassStyles = 'medium',
  customClasses?: string
) => {
  return cn(glassStyles[variant], customClasses)
}

export const createNeuEffect = (
  variant: keyof typeof neuStyles = 'light',
  customClasses?: string  
) => {
  return cn(neuStyles[variant], customClasses)
}

// Modern card variants
export const cardVariants = {
  glass: cn(
    glassStyles.card,
    "rounded-2xl p-6 transition-all duration-300",
    "hover:shadow-card-hover hover:backdrop-blur-lg hover:bg-white/10"
  ),
  
  neumorphic: cn(
    neuStyles.light,
    "rounded-2xl p-6 transition-all duration-300",
    "hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]"
  ),
  
  hybrid: cn(
    "rounded-2xl p-6 transition-all duration-300",
    "bg-white/5 backdrop-blur-md border border-white/10",
    "shadow-[4px_4px_8px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.1)]",
    "hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.15)]",
    "hover:backdrop-blur-lg hover:bg-white/10"
  ),
  
  modernSage: cn(
    "rounded-2xl p-6 transition-all duration-300",
    "bg-gradient-to-br from-sage-50/50 to-sage-100/30",
    "backdrop-blur-md border border-sage-200/30",
    "shadow-[4px_4px_12px_rgba(83,141,34,0.1),-2px_-2px_6px_rgba(255,255,255,0.5)]",
    "hover:shadow-[8px_8px_20px_rgba(83,141,34,0.15),-4px_-4px_10px_rgba(255,255,255,0.6)]",
    "hover:from-sage-50/70 hover:to-sage-100/50"
  ),
  
  modernBeauty: cn(
    "rounded-2xl p-6 transition-all duration-300",
    "bg-gradient-to-br from-beauty-50/50 to-beauty-100/30",
    "backdrop-blur-md border border-beauty-200/30", 
    "shadow-[4px_4px_12px_rgba(242,186,201,0.1),-2px_-2px_6px_rgba(255,255,255,0.5)]",
    "hover:shadow-[8px_8px_20px_rgba(242,186,201,0.15),-4px_-4px_10px_rgba(255,255,255,0.6)]",
    "hover:from-beauty-50/70 hover:to-beauty-100/50"
  )
} as const

// Modern button variants
export const buttonVariants = {
  glass: cn(
    glassStyles.button,
    "rounded-xl px-6 py-3 font-medium transition-all duration-300",
    "hover:scale-105 active:scale-95"
  ),
  
  glassPrimary: cn(
    glassStyles.buttonPrimary,
    "rounded-xl px-6 py-3 font-medium transition-all duration-300",
    "text-sage-700 hover:text-sage-800",
    "hover:scale-105 active:scale-95"
  ),
  
  glassSecondary: cn(
    glassStyles.buttonSecondary,
    "rounded-xl px-6 py-3 font-medium transition-all duration-300", 
    "text-beauty-700 hover:text-beauty-800",
    "hover:scale-105 active:scale-95"
  ),
  
  neumorphic: cn(
    neuStyles.button,
    "rounded-xl px-6 py-3 font-medium transition-all duration-300",
    "text-gray-700 hover:text-gray-800",
    "active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]"
  ),
  
  modern: cn(
    "rounded-xl px-6 py-3 font-medium transition-all duration-300",
    "bg-gradient-to-r from-sage-500 to-sage-600",
    "text-white shadow-lg hover:shadow-xl",
    "hover:from-sage-600 hover:to-sage-700",
    "hover:scale-105 active:scale-95",
    "backdrop-blur-sm border border-white/20"
  )
} as const

// Navigation variants
export const navVariants = {
  glass: cn(
    glassStyles.nav,
    "transition-all duration-300"
  ),
  
  floating: cn(
    "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
    "backdrop-blur-xl bg-white/10 border border-white/20",
    "rounded-full px-6 py-3 shadow-glass",
    "transition-all duration-300"
  ),
  
  minimal: cn(
    "backdrop-blur-md bg-white/5 border-b border-white/10",
    "transition-all duration-300"
  )
} as const

// Utility for responsive glass effects
export const responsiveGlass = {
  mobile: "backdrop-blur-sm bg-white/5 border border-white/10",
  tablet: "md:backdrop-blur-md md:bg-white/10 md:border-white/20", 
  desktop: "lg:backdrop-blur-lg lg:bg-white/15 lg:border-white/25"
} as const

export const combineResponsiveGlass = () => 
  cn(responsiveGlass.mobile, responsiveGlass.tablet, responsiveGlass.desktop)