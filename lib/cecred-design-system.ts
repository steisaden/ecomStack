import { cn } from "@/lib/utils"

// CÉCRED Design System - Modern Ecommerce Framework
// Implementation of the design system with Playfair Display and Inter fonts

// Color Palette Utilities
export const colorPalette = {
  // Core CÉCRED Colors
  primary: "#3A8134",
  primaryLight: "#57B450",
  accent: "#AAC5A6",
  black: "#000000",
  darkGray: "#4B4B4B",
  gray: "#7C7C7C",
  lightGray: "#F5F5F5",
  white: "#FFFFFF",
  
  // Enhanced Green Accent Palette
  sage: "#87A96B",
  sageLight: "#A4C085",
  sageDark: "#6B8E4F",
  emerald: "#10B981",
  emeraldLight: "#34D399",
  emeraldDark: "#059669",
  forest: "#228B22",
  forestLight: "#32CD32",
  forestDark: "#006400",
  mint: "#22C55E",
  mintLight: "#4ADE80",
  mintDark: "#16A34A",
} as const

// Typography System
export const typography = {
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  sizes: {
    xs: "0.75rem",      // 12px
    sm: "0.875rem",     // 14px
    base: "1rem",       // 16px
    lg: "1.125rem",     // 18px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.25rem",   // 36px
    "5xl": "2.5rem",    // 40px
    "6xl": "2.75rem",   // 44px
    "7xl": "3.5rem",    // 56px
  },
  weights: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const

// Spacing System
export const spacing = {
  xs: "0.25rem",      // 4px
  sm: "0.5rem",       // 8px
  base: "1rem",       // 16px
  lg: "1.5rem",       // 24px
  xl: "2rem",         // 32px
  "2xl": "3rem",      // 48px
  "3xl": "4rem",      // 64px
  "4xl": "6rem",      // 96px
} as const

// Border Radius System
export const borderRadius = {
  sm: "0.125rem",     // 2px
  base: "0.25rem",    // 4px
  md: "0.375rem",     // 6px
  lg: "0.5rem",       // 8px
  xl: "0.75rem",      // 12px
  "2xl": "1rem",      // 16px
  full: "9999px",
} as const

// Shadow System
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
} as const

// Button Styles
export const buttonStyles = {
  primary: "bg-primary text-white hover:bg-primaryLight focus:ring-primary",
  secondary: "border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  outline: "border border-gray-300 text-gray-700 hover:border-black hover:text-black focus:ring-gray-500",
  ghost: "text-primary hover:bg-primary/10 focus:ring-primary",
  
  // Enhanced Green Accent Buttons
  sage: "bg-sage text-white hover:bg-sageLight focus:ring-sage",
  emerald: "bg-emerald text-white hover:bg-emeraldLight focus:ring-emerald",
  forest: "bg-forest text-white hover:bg-forestLight focus:ring-forest",
  mint: "bg-mint text-white hover:bg-mintLight focus:ring-mint",
  sageOutline: "border border-sage text-sage hover:bg-sage hover:text-white focus:ring-sage",
  emeraldOutline: "border border-emerald text-emerald hover:bg-emerald hover:text-white focus:ring-emerald",
} as const

// Card Styles
export const cardStyles = {
  base: "bg-white rounded-lg shadow-md border border-lightGray transition-all duration-300",
  elevated: "bg-white rounded-lg shadow-lg border border-lightGray transition-all duration-300 hover:shadow-xl",
  accent: "bg-accent rounded-lg border border-accent transition-all duration-300",
  
  // Enhanced Green Accent Cards
  sage: "bg-sage/10 rounded-lg border border-sage/20 transition-all duration-300 hover:bg-sage/20",
  emerald: "bg-emerald/10 rounded-lg border border-emerald/20 transition-all duration-300 hover:bg-emerald/20",
  forest: "bg-forest/10 rounded-lg border border-forest/20 transition-all duration-300 hover:bg-forest/20",
  mint: "bg-mint/10 rounded-lg border border-mint/20 transition-all duration-300 hover:bg-mint/20",
  sageGradient: "bg-gradient-to-br from-sage/20 to-sageLight/20 rounded-lg border border-sage/30 transition-all duration-300",
  emeraldGradient: "bg-gradient-to-br from-emerald/20 to-emeraldLight/20 rounded-lg border border-emerald/30 transition-all duration-300",
} as const

// Utility Functions
export const createButton = (
  variant: keyof typeof buttonStyles = 'primary',
  customClasses?: string
) => {
  return cn(
    "px-6 py-3 text-base font-medium tracking-wide uppercase transition-all duration-300 min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2",
    buttonStyles[variant],
    customClasses
  )
}

export const createCard = (
  variant: keyof typeof cardStyles = 'base',
  customClasses?: string
) => {
  return cn(
    cardStyles[variant],
    "hover-lift",
    customClasses
  )
}

// Hover Effects
export const hoverEffects = {
  lift: "hover-lift",
  glow: "hover-glow",
  scale: "hover-scale",
  
  // Enhanced Green Accent Hover Effects
  sageGlow: "hover:shadow-lg hover:shadow-sage/25 transition-all duration-300",
  emeraldGlow: "hover:shadow-lg hover:shadow-emerald/25 transition-all duration-300",
  forestGlow: "hover:shadow-lg hover:shadow-forest/25 transition-all duration-300",
  mintGlow: "hover:shadow-lg hover:shadow-mint/25 transition-all duration-300",
  greenShimmer: "hover:bg-gradient-to-r hover:from-sage hover:via-emerald hover:to-mint transition-all duration-500",
} as const

// Responsive Utilities
export const responsiveUtils = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-12 sm:py-16 md:py-20 lg:py-24",
  sectionSm: "py-8 sm:py-12 md:py-16",
  sectionLg: "py-16 sm:py-20 md:py-24 lg:py-32",
} as const

// Animation Utilities
export const animationUtils = {
  fadeIn: "animate-fade-in",
  staggerFadeIn: "animate-stagger-fade-in",
  slideInLeft: "animate-slide-in-left",
  slideInRight: "animate-slide-in-right",
} as const

export default {
  colorPalette,
  typography,
  spacing,
  borderRadius,
  shadows,
  buttonStyles,
  cardStyles,
  createButton,
  createCard,
  hoverEffects,
  responsiveUtils,
  animationUtils,
}