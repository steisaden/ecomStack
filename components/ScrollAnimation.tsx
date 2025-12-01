'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion, useAnimationDuration } from '@/lib/useReducedMotion'

interface ScrollAnimationProps {
  children: React.ReactNode
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in' | 'slide-up'
  delay?: number
  duration?: number
  threshold?: number
  className?: string
  once?: boolean
}

export default function ScrollAnimation({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.1,
  className,
  once = true
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const animationDuration = useAnimationDuration(duration)
  const animationDelay = useAnimationDuration(delay)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, animationDelay)
          
          if (once) {
            observer.unobserve(entry.target)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [animationDelay, threshold, once])

  const animationClasses = {
    'fade-up': {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    'fade-down': {
      initial: 'opacity-0 -translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    'fade-left': {
      initial: 'opacity-0 translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    'fade-right': {
      initial: 'opacity-0 -translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    'scale-in': {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100'
    },
    'slide-up': {
      initial: 'translate-y-full',
      animate: 'translate-y-0'
    }
  }

  const { initial, animate } = animationClasses[animation]

  // If user prefers reduced motion, skip animations
  if (prefersReducedMotion) {
    return (
      <div ref={elementRef} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-out',
        isVisible ? animate : initial,
        className
      )}
      style={{
        transitionDuration: `${animationDuration}ms`
      }}
    >
      {children}
    </div>
  )
}

// Stagger animation component for lists
interface StaggerAnimationProps {
  children: React.ReactNode[]
  staggerDelay?: number
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in'
  className?: string
}

export function StaggerAnimation({
  children,
  staggerDelay = 100,
  animation = 'fade-up',
  className
}: StaggerAnimationProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ScrollAnimation
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          once={true}
        >
          {child}
        </ScrollAnimation>
      ))}
    </div>
  )
}

// Parallax scroll effect component
interface ParallaxScrollProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function ParallaxScroll({
  children,
  speed = 0.5,
  className
}: ParallaxScrollProps) {
  const [offsetY, setOffsetY] = useState(0)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        const scrolled = window.pageYOffset
        const rate = scrolled * -speed
        setOffsetY(rate)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        transform: `translateY(${offsetY}px)`
      }}
    >
      {children}
    </div>
  )
}