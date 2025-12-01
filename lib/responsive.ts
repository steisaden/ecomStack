/**
 * Responsive Layout Utilities
 * Mobile-first responsive design system with touch-friendly interactions
 */

import React from 'react'

export interface ResponsiveBreakpoints {
  sm: number    // 640px
  md: number    // 768px
  lg: number    // 1024px
  xl: number    // 1280px
  '2xl': number // 1536px
}

export const breakpoints: ResponsiveBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export type BreakpointKey = keyof ResponsiveBreakpoints

/**
 * Hook to get current screen size and breakpoint
 */
export function useResponsive() {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const [dimensions, setDimensions] = React.useState({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    if (!hasMounted) return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize(); // Set initial dimensions
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasMounted]);

  if (!hasMounted) {
    return {
      width: 0,
      height: 0,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      currentBreakpoint: 'sm' as BreakpointKey,
      isBreakpoint: (bp: BreakpointKey) => false,
      isAboveBreakpoint: (bp: BreakpointKey) => false,
      isBelowBreakpoint: (bp: BreakpointKey) => true,
    };
  }

  const getCurrentBreakpoint = (): BreakpointKey => {
    const { width } = dimensions
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    return 'sm'
  }

  const isBreakpoint = (bp: BreakpointKey): boolean => {
    return getCurrentBreakpoint() === bp
  }

  const isAboveBreakpoint = (bp: BreakpointKey): boolean => {
    return dimensions.width >= breakpoints[bp]
  }

  const isBelowBreakpoint = (bp: BreakpointKey): boolean => {
    return dimensions.width < breakpoints[bp]
  }

  return {
    width: dimensions.width,
    height: dimensions.height,
    isMobile: dimensions.width < breakpoints.md,
    isTablet: dimensions.width >= breakpoints.md && dimensions.width < breakpoints.lg,
    isDesktop: dimensions.width >= breakpoints.lg,
    currentBreakpoint: getCurrentBreakpoint(),
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
  }
}

/**
 * Responsive container classes with proper padding and max-widths
 */
export const containerClasses = {
  base: 'mx-auto px-4 sm:px-6 lg:px-8',
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md', 
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
  prose: 'max-w-prose',
}

/**
 * Responsive grid classes for different layouts
 */
export const gridClasses = {
  // Product grids
  products: {
    mobile: 'grid-cols-2 gap-4',
    tablet: 'md:grid-cols-3 md:gap-6',
    desktop: 'lg:grid-cols-4 lg:gap-8',
  },
  // Blog/content grids
  blog: {
    mobile: 'grid-cols-1 gap-6',
    tablet: 'md:grid-cols-2 md:gap-8',
    desktop: 'lg:grid-cols-3 lg:gap-10',
  },
  // Feature grids
  features: {
    mobile: 'grid-cols-1 gap-8',
    tablet: 'md:grid-cols-2 md:gap-12',
    desktop: 'lg:grid-cols-3 lg:gap-16',
  },
}

/**
 * Touch-friendly interaction classes
 */
export const touchClasses = {
  // Minimum touch target size (44px)
  touchTarget: 'min-h-[44px] min-w-[44px]',
  // Touch-friendly padding
  touchPadding: 'p-3 sm:p-2',
  // Touch-friendly spacing
  touchSpacing: 'space-y-4 sm:space-y-3',
  // Touch-friendly buttons
  touchButton: 'py-3 px-6 text-base sm:py-2 sm:px-4 sm:text-sm',
}

/**
 * Responsive typography classes
 */
export const typographyClasses = {
  hero: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
  heading1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  heading2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  heading3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  heading4: 'text-lg sm:text-xl md:text-2xl',
  heading5: 'text-base sm:text-lg md:text-xl',
  heading6: 'text-sm sm:text-base md:text-lg',
  body: 'text-base sm:text-base md:text-lg',
  bodySmall: 'text-sm sm:text-sm md:text-base',
  caption: 'text-xs sm:text-xs md:text-sm',
}

/**
 * Responsive spacing classes
 */
export const spacingClasses = {
  section: 'py-12 sm:py-16 md:py-20 lg:py-24',
  sectionSmall: 'py-8 sm:py-12 md:py-16',
  sectionLarge: 'py-16 sm:py-20 md:py-24 lg:py-32',
  element: 'mb-6 sm:mb-8 md:mb-10',
  elementSmall: 'mb-4 sm:mb-6 md:mb-8',
  elementLarge: 'mb-8 sm:mb-10 md:mb-12 lg:mb-16',
}

/**
 * Device orientation utilities
 */
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

/**
 * Utility to combine responsive classes
 */
export function combineResponsiveClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Responsive image classes
 */
export const imageClasses = {
  responsive: 'w-full h-auto',
  aspectSquare: 'aspect-square object-cover',
  aspectVideo: 'aspect-video object-cover',
  aspectPortrait: 'aspect-[3/4] object-cover',
  aspectLandscape: 'aspect-[4/3] object-cover',
}

/**
 * Responsive layout patterns
 */
export const layoutPatterns = {
  // Hero section
  hero: combineResponsiveClasses(
    containerClasses.base,
    containerClasses.xl,
    spacingClasses.sectionLarge,
    'text-center'
  ),
  // Content section
  content: combineResponsiveClasses(
    containerClasses.base,
    containerClasses.lg,
    spacingClasses.section
  ),
  // Two column layout
  twoColumn: 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center',
  // Three column layout
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12',
  // Four column layout
  fourColumn: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8',
}