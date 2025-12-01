'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect user's motion preferences
 * Returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment and matchMedia is available
    if (typeof window === 'undefined' || !window.matchMedia) {
      setPrefersReducedMotion(false)
      return
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Add event listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Hook that returns animation duration based on motion preferences
 * Returns 0 if user prefers reduced motion, otherwise returns the provided duration
 */
export function useAnimationDuration(duration: number): number {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion ? 0 : duration
}

/**
 * Hook that returns animation classes based on motion preferences
 * Returns empty string if user prefers reduced motion, otherwise returns the provided classes
 */
export function useAnimationClasses(classes: string): string {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion ? '' : classes
}

/**
 * Utility function to conditionally apply animations based on motion preferences
 */
export function withReducedMotion<T>(
  normalValue: T,
  reducedValue: T,
  prefersReducedMotion: boolean
): T {
  return prefersReducedMotion ? reducedValue : normalValue
}