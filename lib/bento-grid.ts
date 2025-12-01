import { cn } from "@/lib/utils"

// Bento box grid system for flexible layouts with enhanced responsive support
export const bentoGrids = {
  // Hero section layouts with improved mobile experience
  hero: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-4 grid-rows-1 gap-8",
    large: "grid grid-cols-6 grid-rows-1 gap-10",
    layout: {
      // Main hero card spans multiple columns/rows
      main: "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2 xl:col-span-4 xl:row-span-2",
      // Secondary cards for smaller content
      secondary: "col-span-1 row-span-1 lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1",
      // Feature cards for highlights
      feature: "col-span-1 row-span-1 md:col-span-1 lg:col-span-2 lg:row-span-1 xl:col-span-2 xl:row-span-1",
      // Wide accent cards
      accent: "col-span-1 row-span-1 md:col-span-2 lg:col-span-4 lg:row-span-1 xl:col-span-6 xl:row-span-1",
    }
  },

  // Product section layouts with optimized responsive behavior
  products: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6", 
    desktop: "grid grid-cols-4 gap-6",
    large: "grid grid-cols-6 gap-8",
    layout: {
      // Standard product card
      standard: "col-span-1 row-span-1",
      // Featured product spans 2 columns
      featured: "col-span-1 row-span-1 md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-2",
      // Large showcase product
      showcase: "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2 xl:col-span-3 xl:row-span-2",
      // Small highlight product
      highlight: "col-span-1 row-span-1 lg:col-span-1 lg:row-span-1",
      // Wide product banner
      banner: "col-span-1 row-span-1 md:col-span-2 lg:col-span-4 lg:row-span-1 xl:col-span-6 xl:row-span-1",
    }
  },

  // Blog section layouts with reading-optimized layouts
  blog: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-3 gap-6",
    large: "grid grid-cols-4 gap-8",
    layout: {
      // Featured blog post
      featured: "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2",
      // Standard blog card
      standard: "col-span-1 row-span-1",
      // Small highlight card
      highlight: "col-span-1 row-span-1 lg:row-span-1",
      // Wide article preview
      wide: "col-span-1 row-span-1 md:col-span-2 lg:col-span-3 lg:row-span-1 xl:col-span-4 xl:row-span-1",
    }
  },

  // Services section layouts
  services: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-6 grid-rows-3 gap-6",
    large: "grid grid-cols-8 grid-rows-4 gap-8",
    layout: {
      // Main service showcase
      main: "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-3 xl:col-span-4 xl:row-span-3",
      // Secondary service cards
      secondary: "col-span-1 row-span-1 lg:col-span-2 lg:row-span-1 xl:col-span-2 xl:row-span-1",
      // Small service highlights
      highlight: "col-span-1 row-span-1 lg:col-span-1 lg:row-span-1",
      // Feature service
      feature: "col-span-1 row-span-1 md:col-span-2 lg:col-span-3 lg:row-span-2 xl:col-span-4 xl:row-span-2",
    }
  },

  // Gallery/Portfolio layouts
  gallery: {
    mobile: "grid grid-cols-2 gap-2",
    tablet: "grid grid-cols-3 gap-4",
    desktop: "grid grid-cols-5 gap-4",
    large: "grid grid-cols-7 gap-6",
    layout: {
      // Featured image
      featured: "col-span-2 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-3",
      // Standard image
      standard: "col-span-1 row-span-1",
      // Portrait image
      portrait: "col-span-1 row-span-2",
      // Landscape image
      landscape: "col-span-2 row-span-1",
      // Wide panoramic
      panoramic: "col-span-2 row-span-1 md:col-span-3 lg:col-span-5 lg:row-span-1 xl:col-span-7 xl:row-span-1",
    }
  },

  // Custom flexible grid with more options
  custom: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "grid grid-cols-2 gap-6",
    desktop: "grid grid-cols-12 gap-6",
    large: "grid grid-cols-16 gap-8",
  },

  // Compact layouts for dense content
  compact: {
    mobile: "grid grid-cols-2 gap-2",
    tablet: "grid grid-cols-4 gap-3",
    desktop: "grid grid-cols-6 gap-4",
    large: "grid grid-cols-8 gap-4",
  },

  // Masonry-style layouts
  masonry: {
    mobile: "columns-1 gap-4",
    tablet: "columns-2 gap-6",
    desktop: "columns-3 gap-6",
    large: "columns-4 gap-8",
  }
} as const

// Glossy glass card system with enhanced readability
export const glossyGlassCards = {
  // Base glossy glass effects
  base: cn(
    "backdrop-blur-xl bg-gradient-to-br from-white/20 via-white/10 to-white/5",
    "border border-white/30 shadow-2xl shadow-black/10",
    "relative overflow-hidden rounded-3xl",
    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
  ),

  // Enhanced readability versions
  readable: cn(
    "backdrop-blur-xl bg-gradient-to-br from-white/30 via-white/20 to-white/15",
    "border border-white/40 shadow-2xl shadow-black/20",
    "relative overflow-hidden rounded-3xl",
    // Enhanced text readability overlay
    "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/20 after:via-transparent after:to-white/10 after:pointer-events-none"
  ),

  // Sage-themed glossy cards
  sage: cn(
    "backdrop-blur-xl bg-gradient-to-br from-sage-500/20 via-white/15 to-sage-300/10",
    "border border-sage-300/40 shadow-2xl shadow-sage-500/20",
    "relative overflow-hidden rounded-3xl",
    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-sage-400/30 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
  ),

  // Beauty-themed glossy cards  
  beauty: cn(
    "backdrop-blur-xl bg-gradient-to-br from-beauty-500/20 via-white/15 to-beauty-300/10",
    "border border-beauty-300/40 shadow-2xl shadow-beauty-500/20",
    "relative overflow-hidden rounded-3xl",
    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-beauty-400/30 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
  ),

  // High contrast for maximum readability
  contrast: cn(
    "backdrop-blur-xl bg-gradient-to-br from-white/40 via-white/30 to-white/20",
    "border border-white/50 shadow-2xl shadow-black/30",
    "relative overflow-hidden rounded-3xl",
    // Strong readability overlay
    "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/30 after:via-black/10 after:to-white/20 after:pointer-events-none"
  ),

  // Product showcase cards
  product: cn(
    "backdrop-blur-xl bg-gradient-to-br from-white/25 via-white/15 to-white/10",
    "border border-white/35 shadow-2xl shadow-black/15",
    "relative overflow-hidden rounded-3xl group",
    "hover:shadow-3xl hover:shadow-sage-500/20 transition-all duration-500",
    // Product-specific overlay for image readability
    "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/40 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
  ),

  // Blog cards with reading optimization
  blog: cn(
    "backdrop-blur-xl bg-gradient-to-br from-white/35 via-white/25 to-white/15",
    "border border-white/45 shadow-2xl shadow-black/20",
    "relative overflow-hidden rounded-3xl",
    // Reading-optimized overlay
    "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/25 after:via-transparent after:to-white/15 after:pointer-events-none"
  )
} as const

// Typography system for enhanced readability on glass
export const glossyTypography = {
  // Headings with enhanced contrast and readability
  heading: {
    primary: "text-gray-900 font-bold tracking-tight drop-shadow-lg text-shadow-white",
    secondary: "text-gray-800 font-semibold tracking-tight drop-shadow-md text-shadow-white",
    accent: "text-sage-700 font-bold tracking-tight drop-shadow-md text-shadow-white",
    beauty: "text-beauty-700 font-bold tracking-tight drop-shadow-md text-shadow-white",
    contrast: "text-white font-bold tracking-tight drop-shadow-xl text-shadow-black",
    // Large display headings
    display: "text-gray-900 font-extrabold tracking-tighter drop-shadow-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent",
    hero: "text-gray-900 font-black tracking-tight drop-shadow-2xl bg-gradient-to-br from-sage-800 via-gray-900 to-beauty-800 bg-clip-text text-transparent"
  },

  // Body text optimized for glass backgrounds
  body: {
    primary: "text-gray-800 font-medium leading-relaxed drop-shadow-md text-shadow-white",
    secondary: "text-gray-700 font-normal leading-relaxed drop-shadow-sm text-shadow-white",
    light: "text-gray-600 font-normal leading-relaxed drop-shadow-sm",
    muted: "text-gray-500 font-normal leading-relaxed",
    // Enhanced readability variants
    readable: "text-gray-900 font-medium leading-relaxed drop-shadow-lg bg-white/60 px-1 py-0.5 rounded backdrop-blur-sm",
    contrast: "text-white font-medium leading-relaxed drop-shadow-xl text-shadow-black",
    overlay: "text-white font-semibold leading-relaxed drop-shadow-2xl text-shadow-black bg-black/20 px-2 py-1 rounded backdrop-blur-sm"
  },

  // Special text effects for glass cards with enhanced visibility
  glass: {
    title: "text-gray-900 font-bold tracking-tight drop-shadow-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent relative before:absolute before:inset-0 before:bg-white/40 before:blur-sm before:-z-10",
    subtitle: "text-gray-800 font-semibold drop-shadow-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent",
    body: "text-gray-700 font-medium leading-relaxed drop-shadow-md text-shadow-white",
    caption: "text-gray-600 font-medium text-sm drop-shadow-sm text-shadow-white",
    // Interactive text with hover effects
    interactive: "text-gray-800 font-medium drop-shadow-md text-shadow-white hover:text-sage-700 hover:drop-shadow-lg transition-all duration-300",
    link: "text-sage-700 font-semibold drop-shadow-md text-shadow-white hover:text-sage-800 hover:drop-shadow-lg underline-offset-2 hover:underline transition-all duration-300"
  },

  // Brand-colored text for cards with enhanced readability
  brand: {
    sage: "text-sage-800 font-bold drop-shadow-lg bg-gradient-to-r from-sage-800 to-sage-600 bg-clip-text text-transparent",
    beauty: "text-beauty-800 font-bold drop-shadow-lg bg-gradient-to-r from-beauty-800 to-beauty-600 bg-clip-text text-transparent",
    // High contrast brand variants
    sageContrast: "text-sage-900 font-bold drop-shadow-xl text-shadow-white bg-sage-100/60 px-2 py-1 rounded backdrop-blur-sm",
    beautyContrast: "text-beauty-900 font-bold drop-shadow-xl text-shadow-white bg-beauty-100/60 px-2 py-1 rounded backdrop-blur-sm"
  },

  // Specialized variants for different contexts
  context: {
    // Card titles with maximum readability
    cardTitle: "text-gray-900 font-bold tracking-tight drop-shadow-xl text-shadow-white bg-white/30 px-3 py-1.5 rounded-lg backdrop-blur-sm",
    cardSubtitle: "text-gray-700 font-semibold drop-shadow-md text-shadow-white",
    // Badge text
    badge: "text-white font-bold text-xs tracking-wide drop-shadow-lg text-shadow-black",
    // Button text
    button: "text-white font-semibold tracking-wide drop-shadow-md text-shadow-black",
    // Price display
    price: "text-sage-800 font-bold tracking-tight drop-shadow-lg text-shadow-white",
    // Rating text
    rating: "text-amber-700 font-semibold drop-shadow-md text-shadow-white",
    // Metadata text
    metadata: "text-gray-600 font-medium text-sm drop-shadow-sm text-shadow-white"
  },

  // Responsive typography variants
  responsive: {
    // Hero titles that scale properly
    heroLarge: "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight drop-shadow-2xl bg-gradient-to-br from-sage-800 via-gray-900 to-beauty-800 bg-clip-text text-transparent",
    heroMedium: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-xl text-gray-900 text-shadow-white",
    // Section headings
    sectionLarge: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-lg text-gray-900 text-shadow-white",
    sectionMedium: "text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight drop-shadow-md text-gray-800 text-shadow-white",
    // Body text
    bodyLarge: "text-lg md:text-xl font-medium leading-relaxed drop-shadow-md text-gray-800 text-shadow-white",
    bodyMedium: "text-base md:text-lg font-normal leading-relaxed drop-shadow-sm text-gray-700 text-shadow-white"
  }
} as const

// Bento box grid component utilities
export const createBentoGrid = (
  type: keyof typeof bentoGrids,
  responsive = true
) => {
  const grid = bentoGrids[type]
  
  // Add safety check for undefined grid
  if (!grid) {
    console.warn(`Bento grid type "${type}" not found, using default grid`)
    const defaultGrid = bentoGrids.custom
    if (responsive) {
      return cn(
        defaultGrid.mobile,
        `md:${defaultGrid.tablet.replace('grid ', '')}`,
        `lg:${defaultGrid.desktop.replace('grid ', '')}`
      )
    }
    return defaultGrid.desktop
  }
  
  if (responsive) {
    return cn(
      grid.mobile,
      `md:${grid.tablet.replace('grid ', '')}`,
      `lg:${grid.desktop.replace('grid ', '')}`
    )
  }
  
  return grid.desktop
}

// Create glossy glass card with specific theme
export const createGlossyCard = (
  variant: keyof typeof glossyGlassCards = 'base',
  customClasses?: string
) => {
  return cn(glossyGlassCards[variant], customClasses)
}

// Create typography for glass backgrounds
export const createGlossyText = (
  category: keyof typeof glossyTypography,
  variant: string,
  customClasses?: string
) => {
  const textStyles = glossyTypography[category]
  if (textStyles && typeof textStyles === 'object' && variant in textStyles) {
    return cn((textStyles as any)[variant], customClasses)
  }
  return cn(customClasses)
}

// Bento box layout presets for common patterns
export const bentoLayouts = {
  // Hero section with main content + 2 sidebars
  heroLayout: {
    container: createBentoGrid('hero'),
    main: bentoGrids.hero.layout.main,
    sidebar1: bentoGrids.hero.layout.secondary,
    sidebar2: bentoGrids.hero.layout.feature,
  },

  // Products showcase with featured + 3 standard
  productsLayout: {
    container: createBentoGrid('products'),
    featured: bentoGrids.products.layout.featured,
    standard: bentoGrids.products.layout.standard,
  },

  // Blog section with featured + grid
  blogLayout: {
    container: createBentoGrid('blog'),
    featured: bentoGrids.blog.layout.featured,
    standard: bentoGrids.blog.layout.standard,
  },

  // Services overview
  servicesLayout: {
    container: createBentoGrid('services'),
    main: bentoGrids.services.layout.main,
    secondary: bentoGrids.services.layout.secondary,
    highlight: bentoGrids.services.layout.highlight,
  }
} as const

// Animation variants for bento cards
export const bentoAnimations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  card: {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120
      }
    }
  },

  hover: {
    rest: { 
      scale: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0
    },
    hover: { 
      scale: 1.02,
      y: -8,
      rotateX: 5,
      rotateY: 5,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  }
} as const