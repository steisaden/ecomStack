import { Variants, Transition } from 'framer-motion'

// Easing curves for modern animations
export const easings = {
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  spring: { type: "spring", damping: 25, stiffness: 120 },
  springBouncy: { type: "spring", damping: 10, stiffness: 100 },
  springSnappy: { type: "spring", damping: 30, stiffness: 400 },
} as const

// Common transition configurations
export const transitions: Record<string, Transition> = {
  fast: { duration: 0.2, ease: easings.easeOutQuart },
  medium: { duration: 0.3, ease: easings.easeOutQuart },
  slow: { duration: 0.5, ease: easings.easeOutExpo },
  spring: easings.spring,
  springBouncy: easings.springBouncy,
  springSnappy: easings.springSnappy,
}

// Fade animations
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

export const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

export const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

// Scale animations
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
}

export const scaleSpringVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: easings.springBouncy
  },
  exit: { opacity: 0, scale: 0.5 }
}

// Card hover animations
export const cardHoverVariants: Variants = {
  rest: { 
    scale: 1, 
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  hover: { 
    scale: 1.02, 
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: transitions.medium
  },
  tap: { 
    scale: 0.98,
    transition: transitions.fast
  }
}

export const glassCardHoverVariants: Variants = {
  rest: { 
    scale: 1, 
    y: 0,
    backdropFilter: "blur(8px)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
  },
  hover: { 
    scale: 1.02, 
    y: -6,
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    transition: transitions.medium
  },
  tap: { 
    scale: 0.98,
    transition: transitions.fast
  }
}

// Button animations
export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: transitions.fast
  },
  tap: { 
    scale: 0.95,
    transition: transitions.fast
  }
}

export const glassButtonVariants: Variants = {
  rest: { 
    scale: 1,
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)"
  },
  hover: { 
    scale: 1.05,
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    transition: transitions.medium
  },
  tap: { 
    scale: 0.95,
    transition: transitions.fast
  }
}

// Stagger animations for lists
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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.medium
  }
}

// Navigation animations
export const navItemVariants: Variants = {
  rest: { 
    color: "var(--foreground)",
    borderBottomColor: "transparent"
  },
  hover: { 
    color: "hsl(var(--primary))",
    borderBottomColor: "hsl(var(--primary))",
    transition: transitions.fast
  }
}

export const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: transitions.medium
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: transitions.medium
  }
}

// Hero section animations
export const heroVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

export const heroTitleVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      ...transitions.slow,
      delay: 0.2
    }
  }
}

export const heroSubtitleVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      ...transitions.medium,
      delay: 0.4
    }
  }
}

export const heroButtonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      ...transitions.spring,
      delay: 0.6
    }
  }
}

// Loading animations
export const loadingSpinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Glassmorphism shimmer effect
export const glassShimmerVariants: Variants = {
  animate: {
    x: ["0%", "100%"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Page transition animations
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
}

export const pageTransition: Transition = {
  type: "tween",
  ease: easings.easeOutQuart,
  duration: 0.4
}

// Utility function to create viewport animations
export const createViewportAnimation = (
  variants: Variants,
  threshold = 0.1,
  once = true
) => ({
  initial: "hidden",
  whileInView: "visible",
  viewport: { once, amount: threshold },
  variants
})

// Utility function for hover effects
export const createHoverAnimation = (
  restState: object,
  hoverState: object,
  tapState?: object
) => ({
  initial: "rest",
  whileHover: "hover",
  whileTap: tapState ? "tap" : undefined,
  variants: {
    rest: restState,
    hover: hoverState,
    ...(tapState && { tap: tapState })
  }
})