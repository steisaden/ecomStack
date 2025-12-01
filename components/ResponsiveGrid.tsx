'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { gridClasses, combineResponsiveClasses } from '@/lib/responsive'

interface ResponsiveGridProps {
  children: React.ReactNode
  variant?: 'products' | 'blog' | 'features' | 'custom'
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'small' | 'medium' | 'large'
  className?: string
}

export default function ResponsiveGrid({
  children,
  variant = 'custom',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'medium',
  className
}: ResponsiveGridProps) {
  const gapClass = {
    small: 'gap-4 md:gap-6',
    medium: 'gap-6 md:gap-8',
    large: 'gap-8 md:gap-10 lg:gap-12',
  }[gap]

  let gridClass = ''

  if (variant === 'custom') {
    const mobileClass = `grid-cols-${columns.mobile}`
    const tabletClass = columns.tablet ? `md:grid-cols-${columns.tablet}` : ''
    const desktopClass = columns.desktop ? `lg:grid-cols-${columns.desktop}` : ''
    
    gridClass = combineResponsiveClasses(
      'grid',
      mobileClass,
      tabletClass,
      desktopClass,
      gapClass
    )
  } else {
    const variantClasses = gridClasses[variant]
    gridClass = combineResponsiveClasses(
      'grid',
      variantClasses.mobile,
      variantClasses.tablet,
      variantClasses.desktop,
      gapClass
    )
  }

  return (
    <div className={cn(gridClass, className)}>
      {children}
    </div>
  )
}