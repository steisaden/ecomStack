/**
 * Fusion Micro-Interactions System
 * Advanced micro-interactions for glassmorphism + neumorphism design
 */

import { Variants } from 'framer-motion'

// Animation timing constants
export const ANIMATION_TIMING = {
  fast: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  medium: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bouncy: { type: 'spring', stiffness: 400, damping: 17 },
} as const

/**
 * Card Hover Animations
 * Enhanced card interactions with lift, glow, and scale effects
 */
export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.15), -4px -4px 12px rgba(255, 255, 255, 0.9)',
    transition: ANIMATION_TIMING.medium
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '8px 8px 24px rgba(0, 0, 0, 0.2), -8px -8px 24px rgba(255, 255, 255, 1)',
    transition: ANIMATION_TIMING.medium
  },
  tap: {
    scale: 0.98,
    y: 0,
    boxShadow: 'inset 4px 4px 12px rgba(0, 0, 0, 0.15), inset -4px -4px 12px rgba(255, 255, 255, 0.9)',
    transition: ANIMATION_TIMING.fast
  }
}

export const productCardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    rotateY: 0,
    transition: ANIMATION_TIMING.medium
  },
  hover: {
    scale: 1.03,
    y: -6,
    rotateY: 2,
    transition: ANIMATION_TIMING.medium
  },
  tap: {
    scale: 0.97,
    transition: ANIMATION_TIMING.fast
  }
}

export const featuredCardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    backgroundPosition: '0% 50%',
    transition: ANIMATION_TIMING.medium
  },
  hover: {
    scale: 1.01,
    y: -2,
    backgroundPosition: '100% 50%',
    transition: ANIMATION_TIMING.slow
  }
}

/**
 * Button Scale Animations
 * Sophisticated button interactions with scale, glow, and rotation
 */
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
    rotateZ: 0,
    transition: ANIMATION_TIMING.medium
  },
  hover: {
    scale: 1.05,
    rotateZ: 1,
    transition: ANIMATION_TIMING.spring
  },
  tap: {
    scale: 0.95,
    rotateZ: 0,
    transition: ANIMATION_TIMING.fast
  },
  loading: {
    scale: 1,
    rotateZ: 360,
    transition: { duration: 1, ease: 'linear', repeat: Infinity }
  }
}

export const ctaButtonVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 15px 0 rgba(116, 211, 174, 0.3)',
    transition: ANIMATION_TIMING.medium
  },
  hover: {
    scale: 1.08,
    boxShadow: '0 6px 25px 0 rgba(116, 211, 174, 0.5)',
    transition: ANIMATION_TIMING.spring
  },
  tap: {
    scale: 0.92,
    transition: ANIMATION_TIMING.fast
  }
}

export const iconButtonVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
    transition: ANIMATION_TIMING.medium
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: ANIMATION_TIMING.bouncy
  },
  tap: {
    scale: 0.9,
    rotate: -5,
    transition: ANIMATION_TIMING.fast
  }
}

/**
 * Star Rating Animations
 * Dynamic star fill animations with stagger and glow effects
 */
export const starContainerVariants: Variants = {
  initial: {
    opacity: 0.8
  },
  hover: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

export const starVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
    fill: '#e5e5e5',
    transition: ANIMATION_TIMING.medium
  },
  filled: {
    scale: 1.1,
    rotate: 180,
    fill: '#74d3ae',
    transition: ANIMATION_TIMING.spring
  },
  hover: {
    scale: 1.2,
    rotate: 360,
    fill: '#74d3ae',
    filter: 'drop-shadow(0 0 8px rgba(116, 211, 174, 0.8))',
    transition: ANIMATION_TIMING.bouncy
  }
}

export const starFillVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0
  },
  filled: {
    pathLength: 1,
    opacity: 1,
    transition: { ...ANIMATION_TIMING.medium, delay: 0.2 }
  },
  hover: {
    pathLength: 1,
    opacity: 1,
    transition: ANIMATION_TIMING.fast
  }
}

/**
 * Product Image Interactions
 * Subtle zoom and reveal animations for product images
 */
export const imageHoverVariants: Variants = {
  initial: {
    scale: 1,
    filter: 'brightness(1) saturate(1)',
    transition: ANIMATION_TIMING.medium
  },
  hover: {
    scale: 1.05,
    filter: 'brightness(1.1) saturate(1.2)',
    transition: ANIMATION_TIMING.medium
  }
}

export const imageRevealVariants: Variants = {
  initial: {
    clipPath: 'inset(0 100% 0 0)',
    transition: ANIMATION_TIMING.slow
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    transition: ANIMATION_TIMING.slow
  }
}

/**
 * Badge and Tag Animations
 * Dynamic badge animations for sales, new items, etc.
 */
export const badgeVariants: Variants = {
  initial: {
    scale: 0,
    rotate: -10,
    opacity: 0
  },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: ANIMATION_TIMING.bouncy
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: ANIMATION_TIMING.spring
  }
}

export const saleBadgeVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
    background: 'linear-gradient(45deg, #dd9787, #f4a691)'
  },
  animate: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse'
    }
  }
}

/**
 * Navigation Animations
 * Smooth navigation transitions and menu animations
 */
export const navItemVariants: Variants = {
  initial: {
    y: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transition: ANIMATION_TIMING.medium
  },
  hover: {
    y: -2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transition: ANIMATION_TIMING.medium
  },
  active: {
    y: 0,
    backgroundColor: 'rgba(116, 211, 174, 0.3)',
    transition: ANIMATION_TIMING.medium
  }
}

export const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: ANIMATION_TIMING.medium
  },
  open: {
    opacity: 1,
    height: 'auto',
    transition: { ...ANIMATION_TIMING.medium, staggerChildren: 0.1 }
  }
}

export const dropdownVariants: Variants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: ANIMATION_TIMING.fast
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...ANIMATION_TIMING.medium, staggerChildren: 0.05 }
  }
}

/**
 * Form Interactions
 * Enhanced form field and validation animations
 */
export const inputVariants: Variants = {
  initial: {
    borderColor: 'rgba(166, 196, 138, 0.3)',
    boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.8)',
    transition: ANIMATION_TIMING.medium
  },
  focus: {
    borderColor: 'rgba(116, 211, 174, 0.7)',
    boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.15), -4px -4px 12px rgba(255, 255, 255, 0.9), 0 0 0 3px rgba(116, 211, 174, 0.2)',
    transition: ANIMATION_TIMING.medium
  },
  error: {
    borderColor: 'rgba(221, 151, 135, 0.7)',
    boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.8), 0 0 0 3px rgba(221, 151, 135, 0.2)',
    transition: ANIMATION_TIMING.medium
  }
}

export const labelVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    color: '#678d58',
    transition: ANIMATION_TIMING.medium
  },
  focus: {
    scale: 0.85,
    y: -24,
    color: '#74d3ae',
    transition: ANIMATION_TIMING.medium
  }
}

/**
 * Loading and State Animations
 */
export const loadingVariants: Variants = {
  initial: {
    opacity: 0.6,
    backgroundPosition: '200% 0'
  },
  animate: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity
    }
  }
}

export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.4
  },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
}

/**
 * Page Transition Animations
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.6, 1]
    }
  }
}

/**
 * Utility function to create custom micro-interactions
 */
export function createCustomInteraction({
  hover = {},
  tap = {},
  initial = {},
  timing = ANIMATION_TIMING.medium
}) {
  return {
    initial: { ...initial },
    whileHover: { ...hover, transition: timing },
    whileTap: { ...tap, transition: ANIMATION_TIMING.fast }
  }
}

/**
 * Reduced motion variants for accessibility
 */
export const reducedMotionVariants = {
  cardHover: {
    initial: { opacity: 0.9 },
    hover: { opacity: 1 },
    tap: { opacity: 0.8 }
  },
  button: {
    initial: { opacity: 1 },
    hover: { opacity: 0.9 },
    tap: { opacity: 0.8 }
  },
  star: {
    initial: { fill: '#e5e5e5' },
    filled: { fill: '#74d3ae' },
    hover: { fill: '#74d3ae' }
  }
}

/**
 * Export animation presets for easy usage
 */
export const fusionAnimationPresets = {
  // Card interactions
  productCard: cardHoverVariants,
  featuredCard: featuredCardVariants,
  
  // Button interactions  
  primaryButton: ctaButtonVariants,
  secondaryButton: buttonVariants,
  iconButton: iconButtonVariants,
  
  // Star rating
  starRating: starVariants,
  starContainer: starContainerVariants,
  
  // Form elements
  input: inputVariants,
  label: labelVariants,
  
  // Navigation
  navItem: navItemVariants,
  dropdown: dropdownVariants,
  
  // Loading states
  skeleton: skeletonVariants,
  shimmer: loadingVariants,
  
  // Page transitions
  page: pageVariants
}

/**
 * Container and item stagger animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: ANIMATION_TIMING.medium
  }
}