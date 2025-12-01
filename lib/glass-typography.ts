/**
 * Enhanced Typography System for Glass Backgrounds
 * Provides specialized typography utilities for maximum readability on glassmorphism components
 */

import { cn } from "@/lib/utils"
import { glossyTypography } from "@/lib/bento-grid"

// Text shadow utilities for enhanced readability
export const textShadows = {
  // Light text shadows for dark text on light/glass backgrounds
  white: "text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8), 0 0 4px rgba(255, 255, 255, 0.6)",
  lightGray: "text-shadow: 0 1px 2px rgba(248, 250, 252, 0.8), 0 0 4px rgba(248, 250, 252, 0.6)",
  
  // Dark text shadows for light text on dark/overlay backgrounds  
  black: "text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6)",
  darkGray: "text-shadow: 0 1px 2px rgba(31, 41, 55, 0.8), 0 0 4px rgba(31, 41, 55, 0.6)",
  
  // Enhanced shadows for maximum contrast
  strongWhite: "text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.7), 0 1px 0 rgba(255, 255, 255, 0.5)",
  strongBlack: "text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.7), 0 1px 0 rgba(0, 0, 0, 0.5)",
  
  // Glow effects for special emphasis
  glow: "text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)",
  colorGlow: "text-shadow: 0 0 10px rgba(83, 141, 34, 0.6), 0 0 20px rgba(83, 141, 34, 0.4), 0 0 30px rgba(83, 141, 34, 0.2)",
} as const

// Background overlay utilities for text readability
export const textBackgrounds = {
  // Light overlays for dark text
  lightOverlay: "bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg",
  lightOverlayStrong: "bg-white/40 backdrop-blur-md px-4 py-2 rounded-xl",
  
  // Dark overlays for light text
  darkOverlay: "bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg",
  darkOverlayStrong: "bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl",
  
  // Gradient overlays for enhanced readability
  gradientLight: "bg-gradient-to-r from-white/30 via-white/20 to-white/30 backdrop-blur-sm px-4 py-2 rounded-xl",
  gradientDark: "bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-sm px-4 py-2 rounded-xl",
  
  // Brand-colored overlays
  sageOverlay: "bg-sage-100/60 backdrop-blur-sm px-3 py-1.5 rounded-lg",
  beautyOverlay: "bg-beauty-100/60 backdrop-blur-sm px-3 py-1.5 rounded-lg",
} as const

// Typography utility functions
export const createGlassText = (
  category: keyof typeof glossyTypography,
  variant: string,
  options: {
    shadow?: keyof typeof textShadows
    background?: keyof typeof textBackgrounds
    customClasses?: string
  } = {}
) => {
  const baseClasses = glossyTypography[category]?.[variant as keyof typeof glossyTypography[typeof category]] || ""
  
  const shadowClasses = options.shadow ? `[${textShadows[options.shadow]}]` : ""
  const backgroundClasses = options.background ? textBackgrounds[options.background] : ""
  
  return cn(baseClasses, shadowClasses, backgroundClasses, options.customClasses)
}

// Predefined glass text combinations for common use cases
export const glassTextPresets = {
  // Hero section text
  heroTitle: createGlassText("responsive", "heroLarge", { 
    shadow: "strongWhite",
    customClasses: "relative z-10" 
  }),
  heroSubtitle: createGlassText("responsive", "bodyLarge", { 
    shadow: "white",
    background: "lightOverlay" 
  }),
  
  // Card text
  cardTitle: createGlassText("context", "cardTitle", { shadow: "white" }),
  cardDescription: createGlassText("body", "primary", { shadow: "white" }),
  cardPrice: createGlassText("context", "price", { shadow: "white" }),
  
  // Button text
  buttonPrimary: createGlassText("context", "button", { shadow: "strongBlack" }),
  buttonSecondary: createGlassText("glass", "interactive", { shadow: "white" }),
  
  // Badge text
  badgeText: createGlassText("context", "badge", { shadow: "strongBlack" }),
  
  // Overlay text (for images)
  overlayTitle: createGlassText("heading", "contrast", { 
    shadow: "strongBlack",
    background: "darkOverlay" 
  }),
  overlayDescription: createGlassText("body", "overlay", { shadow: "strongBlack" }),
  
  // Navigation text
  navLink: createGlassText("glass", "link", { shadow: "white" }),
  navActive: createGlassText("brand", "sageContrast", { shadow: "white" }),
  
  // Form text
  formLabel: createGlassText("body", "primary", { shadow: "white" }),
  formHelper: createGlassText("glass", "caption", { shadow: "white" }),
  
  // Status text
  statusSuccess: cn(
    "text-green-800 font-semibold drop-shadow-md",
    textBackgrounds.lightOverlay,
    `[${textShadows.white}]`
  ),
  statusError: cn(
    "text-red-800 font-semibold drop-shadow-md",
    textBackgrounds.lightOverlay,
    `[${textShadows.white}]`
  ),
  statusWarning: cn(
    "text-amber-800 font-semibold drop-shadow-md",
    textBackgrounds.lightOverlay,
    `[${textShadows.white}]`
  ),
} as const

// Responsive typography utilities
export const responsiveGlassText = {
  // Scale text appropriately for different screen sizes
  hero: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
  display: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  heading: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  subheading: "text-xl sm:text-2xl md:text-3xl",
  body: "text-base sm:text-lg md:text-xl",
  caption: "text-sm sm:text-base",
  
  // Line height adjustments for readability
  heroLineHeight: "leading-tight sm:leading-tight md:leading-none",
  headingLineHeight: "leading-tight sm:leading-snug",
  bodyLineHeight: "leading-relaxed sm:leading-loose",
} as const

// Animation-ready text classes
export const animatedGlassText = {
  // Fade in with enhanced readability
  fadeIn: cn(
    glassTextPresets.cardDescription,
    "opacity-0 animate-in fade-in duration-500 fill-mode-forwards"
  ),
  
  // Slide up with readability
  slideUp: cn(
    glassTextPresets.cardTitle,
    "translate-y-4 opacity-0 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-forwards"
  ),
  
  // Scale in for emphasis
  scaleIn: cn(
    glassTextPresets.heroTitle,
    "scale-95 opacity-0 animate-in zoom-in fade-in duration-1000 fill-mode-forwards"
  ),
} as const

// Accessibility helpers
export const accessibleGlassText = {
  // High contrast mode support
  highContrast: "contrast-more:text-black contrast-more:bg-white contrast-more:drop-shadow-none",
  
  // Reduced motion support
  reducedMotion: "motion-reduce:transition-none motion-reduce:animation-none",
  
  // Focus states
  focusVisible: "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500",
  
  // Screen reader support
  srOnly: "sr-only",
  notSrOnly: "not-sr-only",
} as const

// Export comprehensive text utility
export const glassText = {
  ...glassTextPresets,
  responsive: responsiveGlassText,
  animated: animatedGlassText,
  accessible: accessibleGlassText,
  create: createGlassText,
  shadows: textShadows,
  backgrounds: textBackgrounds,
} as const

// Utility function to get optimal text styling based on background
export const getOptimalTextStyling = (
  backgroundType: "light" | "dark" | "glass" | "image" | "gradient",
  textImportance: "primary" | "secondary" | "accent" = "primary"
) => {
  const styleMap = {
    light: {
      primary: glassTextPresets.cardTitle,
      secondary: glassTextPresets.cardDescription,
      accent: createGlassText("brand", "sage", { shadow: "white" })
    },
    dark: {
      primary: glassTextPresets.overlayTitle,
      secondary: glassTextPresets.overlayDescription,
      accent: createGlassText("heading", "contrast", { shadow: "strongBlack" })
    },
    glass: {
      primary: glassTextPresets.cardTitle,
      secondary: glassTextPresets.cardDescription,
      accent: createGlassText("brand", "sageContrast", { shadow: "white" })
    },
    image: {
      primary: glassTextPresets.overlayTitle,
      secondary: glassTextPresets.overlayDescription,
      accent: createGlassText("heading", "contrast", { shadow: "strongBlack", background: "darkOverlay" })
    },
    gradient: {
      primary: createGlassText("heading", "primary", { shadow: "strongWhite", background: "gradientLight" }),
      secondary: createGlassText("body", "readable", { shadow: "white" }),
      accent: createGlassText("brand", "beautyContrast", { shadow: "white" })
    }
  }
  
  return styleMap[backgroundType][textImportance]
}

export default glassText