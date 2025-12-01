'use client'

import { Variants } from "framer-motion"

// Enhanced motion variants with scroll-based animations
export const scrollMotionVariants = {
  // Fade in from bottom on scroll
  fadeInUp: {
    initial: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    whileInView: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    viewport: { 
      once: true, 
      amount: 0.3 
    }
  },

  // Fade in from left on scroll
  fadeInLeft: {
    initial: { 
      opacity: 0, 
      x: -60,
      scale: 0.95
    },
    whileInView: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    viewport: { 
      once: true, 
      amount: 0.3 
    }
  },

  // Fade in from right on scroll
  fadeInRight: {
    initial: { 
      opacity: 0, 
      x: 60,
      scale: 0.95
    },
    whileInView: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    viewport: { 
      once: true, 
      amount: 0.3 
    }
  },

  // Scale in on scroll
  scaleIn: {
    initial: { 
      opacity: 0, 
      scale: 0.8
    },
    whileInView: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    viewport: { 
      once: true, 
      amount: 0.3 
    }
  },

  // Stagger container for multiple items
  staggerContainer: {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    },
    viewport: { 
      once: true, 
      amount: 0.2 
    }
  },

  // Stagger item for use with staggerContainer
  staggerItem: {
    initial: { 
      opacity: 0, 
      y: 40,
      scale: 0.95
    },
    whileInView: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
  }
}

// Enhanced hover animations
export const hoverMotionVariants = {
  // Subtle lift with shadow
  lift: {
    rest: { 
      y: 0, 
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: { 
      y: -8, 
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    tap: { 
      scale: 0.98,
      y: -4
    }
  },

  // Gentle scale with glow
  glow: {
    rest: { 
      scale: 1,
      filter: "brightness(1) saturate(1)"
    },
    hover: { 
      scale: 1.05,
      filter: "brightness(1.1) saturate(1.2)",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    tap: { 
      scale: 0.95
    }
  },

  // Tilt effect for cards
  tilt: {
    rest: { 
      rotateX: 0, 
      rotateY: 0, 
      scale: 1
    },
    hover: { 
      rotateX: 5, 
      rotateY: 5, 
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    tap: { 
      scale: 0.98
    }
  },

  // Float animation
  float: {
    rest: { 
      y: 0
    },
    hover: {
      y: [-2, -6, -2] as number[],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
  },

  // Pulse effect
  pulse: {
    rest: { 
      scale: 1
    },
    hover: {
      scale: [1, 1.05, 1] as number[],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
  },

  // Subtle hover effect
  subtle: {
    rest: { 
      scale: 1,
      opacity: 1
    },
    hover: { 
      scale: 1.02,
      opacity: 0.9,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    tap: { 
      scale: 0.98
    }
  }
}

// Page transition variants
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
    }
  }
}

// Utility function to create scroll-triggered motion props
export const createScrollMotion = (
  variant: keyof typeof scrollMotionVariants,
  customDelay = 0
) => {
  const motionVariant = scrollMotionVariants[variant]
  
  return {
    initial: motionVariant.initial,
    whileInView: {
      ...motionVariant.whileInView,
      transition: {
        ...motionVariant.whileInView.transition,
        delay: customDelay
      }
    },
    viewport: 'viewport' in motionVariant ? motionVariant.viewport : { once: true, amount: 0.3 }
  }
}

// Utility function to create hover motion props
export const createHoverMotion = (
  variant: keyof typeof hoverMotionVariants
) => {
  const motionVariant = hoverMotionVariants[variant]
  
  return {
    initial: "rest",
    whileHover: "hover",
    whileTap: "tap",
    variants: {
      rest: motionVariant.rest,
      hover: motionVariant.hover,
      tap: 'tap' in motionVariant ? motionVariant.tap : { scale: 0.95 }
    }
  }
}

// Combined motion props for common use cases
export const createCombinedMotion = (
  scrollVariant: keyof typeof scrollMotionVariants,
  hoverVariant: keyof typeof hoverMotionVariants,
  customDelay = 0
) => {
  const scrollMotion = createScrollMotion(scrollVariant, customDelay)
  const hoverMotion = createHoverMotion(hoverVariant)
  
  return {
    ...scrollMotion,
    ...hoverMotion,
    variants: {
      ...hoverMotion.variants,
      initial: scrollMotion.initial,
      whileInView: scrollMotion.whileInView
    }
  }
}

export default {
  scrollMotionVariants,
  hoverMotionVariants,
  pageTransitionVariants,
  createScrollMotion,
  createHoverMotion,
  createCombinedMotion
}