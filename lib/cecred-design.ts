import { cn } from "@/lib/utils"

// CECRED Design System v2.0 - Modern Ecommerce Framework
// Glassmorphism + Neumorphism Hybrid Design System

// Core Glassmorphism Effects
export const glassStyles = {
  // Base Glass Effect
  base: "backdrop-blur-[20px] bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
  
  // Glass Variants
  light: "backdrop-blur-[10px] bg-white/5 border border-white/10 shadow-[0_4px_16px_0_rgba(31,38,135,0.2)]",
  medium: "backdrop-blur-[15px] bg-white/8 border border-white/15 shadow-[0_6px_24px_0_rgba(31,38,135,0.3)]",
  heavy: "backdrop-blur-[25px] bg-white/15 border border-white/25 shadow-[0_12px_40px_0_rgba(31,38,135,0.5)]",
  
  // Colored Glass Variants
  primary: "backdrop-blur-[15px] bg-primary-500/10 border border-primary-300/20 shadow-[0_8px_32px_0_rgba(58,129,52,0.15)]",
  neutral: "backdrop-blur-[15px] bg-neutral-100/10 border border-neutral-300/20 shadow-[0_8px_32px_0_rgba(45,45,45,0.1)]",
  accent: "backdrop-blur-[15px] bg-accent-coral/10 border border-accent-coral/20 shadow-[0_8px_32px_0_rgba(255,107,107,0.15)]",
} as const

// Neumorphism Effects  
export const neuStyles = {
  // Soft Neumorphism (Light backgrounds)
  soft: "bg-neutral-100 shadow-[20px_20px_60px_#d1d1d1,-20px_-20px_60px_#ffffff]",
  softInset: "bg-neutral-100 shadow-[inset_20px_20px_60px_#d1d1d1,inset_-20px_-20px_60px_#ffffff]",
  
  // Medium Neumorphism
  medium: "bg-neutral-200 shadow-[8px_8px_16px_#c4c4c4,-8px_-8px_16px_#ffffff]",
  mediumInset: "shadow-[inset_8px_8px_16px_#c4c4c4,inset_-8px_-8px_16px_#ffffff]",
  
  // Primary Colored Neumorphism
  primary: "bg-primary-100 shadow-[8px_8px_16px_rgba(58,129,52,0.1),-8px_-8px_16px_rgba(255,255,255,0.7)]",
  primaryInset: "shadow-[inset_8px_8px_16px_rgba(58,129,52,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.7)]",
} as const

// Hybrid Glassmorphism + Neumorphism
export const hybridStyles = {
  // Glass-Neumorphic Combined Effect
  base: "bg-primary-100/15 backdrop-blur-[10px] border border-primary-200/20 shadow-[8px_8px_16px_rgba(58,129,52,0.1),-8px_-8px_16px_rgba(255,255,255,0.7),inset_1px_1px_0_rgba(255,255,255,0.3)]",
  
  // Elevated Card
  elevated: "bg-white/10 backdrop-blur-[15px] border border-white/20 shadow-[0_20px_40px_rgba(58,129,52,0.15),8px_8px_16px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.5)]",
  
  // Product Card Style
  product: "bg-white/8 backdrop-blur-[12px] border border-primary-200/15 shadow-[0_8px_32px_rgba(58,129,52,0.1),4px_4px_12px_rgba(0,0,0,0.05),-4px_-4px_12px_rgba(255,255,255,0.8)]",
  
  // Blog Card Style
  blog: "bg-neutral-50/20 backdrop-blur-[8px] border border-neutral-200/30 shadow-[0_6px_24px_rgba(45,45,45,0.08),6px_6px_12px_rgba(0,0,0,0.03),-6px_-6px_12px_rgba(255,255,255,0.9)]",
} as const

// Button Styles
export const buttonStyles = {
  // Primary CECRED Button
  primary: "bg-primary-700 hover:bg-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95",
  
  // Glass Button
  glass: "backdrop-blur-[10px] bg-white/10 border border-white/20 text-primary-700 font-medium hover:bg-primary-50/20 transition-all duration-200",
  
  // Neumorphic Button
  neumorphic: "bg-neutral-100 text-primary-700 font-medium shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all duration-200",
  
  // Hybrid Button
  hybrid: "bg-primary-100/20 backdrop-blur-[8px] border border-primary-200/30 text-primary-700 font-medium shadow-[4px_4px_8px_rgba(58,129,52,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[2px_2px_4px_rgba(58,129,52,0.15),-2px_-2px_4px_rgba(255,255,255,0.9)] transition-all duration-200",
} as const

// Card Styles
export const cardStyles = {
  // Glass Product Card
  product: cn(
    hybridStyles.product,
    "rounded-3xl p-6 transition-all duration-300",
    "hover:transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(58,129,52,0.15)]"
  ),
  
  // Glass Blog Card
  blog: cn(
    hybridStyles.blog,
    "rounded-2xl overflow-hidden transition-all duration-300",
    "hover:transform hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(45,45,45,0.12)]"
  ),
  
  // Hero Card
  hero: cn(
    hybridStyles.elevated,
    "rounded-3xl p-12 transition-all duration-500",
    "hover:shadow-[0_32px_64px_rgba(58,129,52,0.2)]"
  ),
  
  // Feature Card
  feature: cn(
    hybridStyles.base,
    "rounded-2xl p-8 transition-all duration-300",
    "hover:bg-primary-100/20 hover:border-primary-200/25"
  ),
} as const

// Utility Functions
export const createGlass = (
  variant: keyof typeof glassStyles = 'base',
  customClasses?: string
) => {
  return cn(glassStyles[variant], customClasses)
}

export const createNeu = (
  variant: keyof typeof neuStyles = 'soft',
  customClasses?: string  
) => {
  return cn(neuStyles[variant], customClasses)
}

export const createHybrid = (
  variant: keyof typeof hybridStyles = 'base',
  customClasses?: string
) => {
  return cn(hybridStyles[variant], customClasses)
}

export const createButton = (
  variant: keyof typeof buttonStyles = 'primary',
  customClasses?: string
) => {
  return cn(buttonStyles[variant], customClasses)
}

export const createCard = (
  variant: keyof typeof cardStyles = 'product',
  customClasses?: string
) => {
  return cn(cardStyles[variant], customClasses)
}

// Animation Variants for Framer Motion
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  slideIn: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  hoverScale: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  
  tapScale: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}

// Responsive Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Bento Grid Templates
export const bentoTemplates = {
  hero: "grid-cols-12 gap-6",
  products: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  blog: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
  masonry: "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6",
} as const

export default {
  glassStyles,
  neuStyles, 
  hybridStyles,
  buttonStyles,
  cardStyles,
  createGlass,
  createNeu,
  createHybrid,
  createButton,
  createCard,
  motionVariants,
  breakpoints,
  bentoTemplates
}