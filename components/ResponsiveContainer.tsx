'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { containerClasses, spacingClasses, combineResponsiveClasses } from '@/lib/responsive'

interface ResponsiveContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'prose'
  spacing?: 'none' | 'small' | 'medium' | 'large'
  className?: string
  as?: React.ElementType
}

export default function ResponsiveContainer({
  children,
  size = 'xl',
  spacing = 'medium',
  className,
  as: Component = 'div'
}: ResponsiveContainerProps) {
  const spacingClass = {
    none: '',
    small: spacingClasses.sectionSmall,
    medium: spacingClasses.section,
    large: spacingClasses.sectionLarge,
  }[spacing]

  const containerClass = combineResponsiveClasses(
    containerClasses.base,
    containerClasses[size],
    spacingClass,
    className
  )

  return (
    <Component className={containerClass}>
      {children}
    </Component>
  )
}