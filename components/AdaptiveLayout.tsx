'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useResponsive, useOrientation } from '@/lib/responsive'

interface AdaptiveLayoutProps {
  children: React.ReactNode
  mobileLayout?: React.ReactNode
  tabletLayout?: React.ReactNode
  desktopLayout?: React.ReactNode
  className?: string
  handleOrientationChange?: boolean
}

export default function AdaptiveLayout({
  children,
  mobileLayout,
  tabletLayout,
  desktopLayout,
  className,
  handleOrientationChange = true
}: AdaptiveLayoutProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const orientation = useOrientation()

  // Determine which layout to render based on screen size
  const renderLayout = () => {
    if (isDesktop && desktopLayout) {
      return desktopLayout
    }
    
    if (isTablet && tabletLayout) {
      return tabletLayout
    }
    
    if (isMobile && mobileLayout) {
      return mobileLayout
    }
    
    // Fallback to children
    return children
  }

  // Apply orientation-specific classes if enabled
  const orientationClasses = handleOrientationChange ? {
    'orientation-portrait': orientation === 'portrait',
    'orientation-landscape': orientation === 'landscape',
  } : {}

  return (
    <div className={cn(
      'adaptive-layout',
      orientationClasses,
      className
    )}>
      {renderLayout()}
    </div>
  )
}

// Specialized layout components for different screen sizes
export const MobileLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('mobile-layout block md:hidden', className)}>
    {children}
  </div>
)

export const TabletLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('tablet-layout hidden md:block lg:hidden', className)}>
    {children}
  </div>
)

export const DesktopLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('desktop-layout hidden lg:block', className)}>
    {children}
  </div>
)

// Responsive content wrapper that adapts based on screen size
export const ResponsiveContent = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  const responsiveClasses = cn(
    'responsive-content',
    {
      'mobile-optimized': isMobile,
      'tablet-optimized': isTablet,
      'desktop-optimized': isDesktop,
    },
    className
  )
  
  return (
    <div className={responsiveClasses}>
      {children}
    </div>
  )
}