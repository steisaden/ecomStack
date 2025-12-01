/**
 * Typography utility functions and constants
 */

// Typography variant types
export type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'display-large' | 'display-medium' | 'display-small'
  | 'body-large' | 'body' | 'body-small'
  | 'caption' | 'hero' | 'section'

// Font weight constants
export const FONT_WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const

// Typography scale constants
export const TYPOGRAPHY_SCALE = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
  '7xl': '4.5rem',    // 72px
  '8xl': '6rem',      // 96px
  '9xl': '8rem',      // 128px
} as const

// Line height constants
export const LINE_HEIGHTS = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const

// Letter spacing constants
export const LETTER_SPACING = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

/**
 * Get the appropriate HTML element for a typography variant
 */
export function getElementForVariant(variant: TypographyVariant): React.ElementType {
  const elementMap: Record<TypographyVariant, React.ElementType> = {
    'h1': 'h1',
    'h2': 'h2',
    'h3': 'h3',
    'h4': 'h4',
    'h5': 'h5',
    'h6': 'h6',
    'display-large': 'h1',
    'display-medium': 'h2',
    'display-small': 'h3',
    'body-large': 'p',
    'body': 'p',
    'body-small': 'p',
    'caption': 'span',
    'hero': 'h1',
    'section': 'h2',
  }
  
  return elementMap[variant]
}

/**
 * Get the CSS class for a typography variant
 */
export function getClassForVariant(variant: TypographyVariant): string {
  const classMap: Record<TypographyVariant, string> = {
    'h1': 'heading-1',
    'h2': 'heading-2',
    'h3': 'heading-3',
    'h4': 'heading-4',
    'h5': 'heading-5',
    'h6': 'heading-6',
    'display-large': 'text-display-large',
    'display-medium': 'text-display-medium',
    'display-small': 'text-display-small',
    'body-large': 'text-body-large',
    'body': 'text-body',
    'body-small': 'text-body-small',
    'caption': 'text-caption',
    'hero': 'text-hero',
    'section': 'text-section',
  }
  
  return classMap[variant]
}

/**
 * Combine multiple class names, filtering out empty strings
 */
export function combineClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Check if a variant is a heading variant
 */
export function isHeadingVariant(variant: TypographyVariant): boolean {
  return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'display-large', 'display-medium', 'display-small', 'hero', 'section'].includes(variant)
}

/**
 * Check if a variant is a body text variant
 */
export function isBodyVariant(variant: TypographyVariant): boolean {
  return ['body-large', 'body', 'body-small', 'caption'].includes(variant)
}

/**
 * Get responsive font sizes for a given variant
 */
export function getResponsiveSizes(variant: TypographyVariant): {
  mobile: string
  tablet?: string
  desktop?: string
  large?: string
} {
  const responsiveMap: Record<TypographyVariant, {
    mobile: string
    tablet?: string
    desktop?: string
    large?: string
  }> = {
    'h1': {
      mobile: TYPOGRAPHY_SCALE['4xl'],
      tablet: TYPOGRAPHY_SCALE['5xl'],
      desktop: TYPOGRAPHY_SCALE['6xl'],
      large: TYPOGRAPHY_SCALE['7xl']
    },
    'h2': {
      mobile: TYPOGRAPHY_SCALE['3xl'],
      tablet: TYPOGRAPHY_SCALE['4xl'],
      desktop: TYPOGRAPHY_SCALE['5xl'],
      large: TYPOGRAPHY_SCALE['6xl']
    },
    'h3': {
      mobile: TYPOGRAPHY_SCALE['2xl'],
      tablet: TYPOGRAPHY_SCALE['3xl'],
      desktop: TYPOGRAPHY_SCALE['4xl']
    },
    'h4': {
      mobile: TYPOGRAPHY_SCALE.xl,
      desktop: TYPOGRAPHY_SCALE['2xl']
    },
    'h5': {
      mobile: TYPOGRAPHY_SCALE.lg
    },
    'h6': {
      mobile: TYPOGRAPHY_SCALE.base
    },
    'display-large': {
      mobile: TYPOGRAPHY_SCALE['6xl'],
      tablet: TYPOGRAPHY_SCALE['7xl'],
      desktop: TYPOGRAPHY_SCALE['8xl'],
      large: TYPOGRAPHY_SCALE['9xl']
    },
    'display-medium': {
      mobile: TYPOGRAPHY_SCALE['5xl'],
      tablet: TYPOGRAPHY_SCALE['6xl'],
      desktop: TYPOGRAPHY_SCALE['7xl'],
      large: TYPOGRAPHY_SCALE['8xl']
    },
    'display-small': {
      mobile: TYPOGRAPHY_SCALE['4xl'],
      tablet: TYPOGRAPHY_SCALE['5xl'],
      desktop: TYPOGRAPHY_SCALE['6xl']
    },
    'hero': {
      mobile: TYPOGRAPHY_SCALE['4xl'],
      tablet: TYPOGRAPHY_SCALE['5xl'],
      desktop: TYPOGRAPHY_SCALE['6xl']
    },
    'section': {
      mobile: TYPOGRAPHY_SCALE['2xl'],
      tablet: TYPOGRAPHY_SCALE['3xl']
    },
    'body-large': {
      mobile: TYPOGRAPHY_SCALE.lg
    },
    'body': {
      mobile: TYPOGRAPHY_SCALE.base
    },
    'body-small': {
      mobile: TYPOGRAPHY_SCALE.sm
    },
    'caption': {
      mobile: TYPOGRAPHY_SCALE.xs
    }
  }
  
  return responsiveMap[variant]
}

/**
 * Typography configuration object for easy access
 */
export const TYPOGRAPHY_CONFIG = {
  variants: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'display-large', 'display-medium', 'display-small',
    'body-large', 'body', 'body-small',
    'caption', 'hero', 'section'
  ] as const,
  
  headingVariants: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'display-large', 'display-medium', 'display-small',
    'hero', 'section'
  ] as const,
  
  bodyVariants: [
    'body-large', 'body', 'body-small', 'caption'
  ] as const,
  
  displayVariants: [
    'display-large', 'display-medium', 'display-small'
  ] as const
} as const