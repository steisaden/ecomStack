'use client'

import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { createBentoGrid, bentoAnimations } from "@/lib/bento-grid"

export interface BentoGridProps {
  children: React.ReactNode
  type?: 'hero' | 'products' | 'blog' | 'services' | 'gallery' | 'custom' | 'compact' | 'masonry'
  className?: string
  animated?: boolean
  spacing?: 'tight' | 'normal' | 'relaxed'
  responsive?: boolean
  breakpoints?: {
    mobile?: string
    tablet?: string  
    desktop?: string
    large?: string
  }
  autoFlow?: 'row' | 'column' | 'dense'
  minItemWidth?: string
  maxRows?: number
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ 
    children, 
    type = 'custom', 
    className, 
    animated = true, 
    spacing = 'normal',
    responsive = true,
    breakpoints,
    autoFlow = 'row',
    minItemWidth,
    maxRows,
    ...props 
  }, ref) => {
    
    const spacingVariants = {
      tight: "gap-2 md:gap-3 lg:gap-4",
      normal: "gap-4 md:gap-6 lg:gap-8", 
      relaxed: "gap-6 md:gap-8 lg:gap-12"
    }
    
    const autoFlowVariants = {
      row: "grid-flow-row",
      column: "grid-flow-col",
      dense: "grid-flow-row-dense"
    }
    
    // Use custom breakpoints if provided, otherwise use preset layouts
    const getGridClasses = () => {
      if (breakpoints) {
        const mobileClass = breakpoints.mobile || "grid grid-cols-1"
        const tabletClass = breakpoints.tablet ? `md:${breakpoints.tablet.replace('grid ', '')}` : ""
        const desktopClass = breakpoints.desktop ? `lg:${breakpoints.desktop.replace('grid ', '')}` : ""
        const largeClass = breakpoints.large ? `xl:${breakpoints.large.replace('grid ', '')}` : ""
        
        return cn(mobileClass, tabletClass, desktopClass, largeClass)
      }
      
      if (type === 'custom') {
        // Dynamic grid based on content and constraints
        let baseClass = "grid"
        
        if (minItemWidth) {
          baseClass += ` grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`
        } else {
          baseClass += " grid-cols-1 md:grid-cols-2 lg:grid-cols-12"
        }
        
        if (maxRows) {
          baseClass += ` grid-rows-${maxRows}`
        }
        
        return baseClass
      }
      
      return createBentoGrid(type, responsive)
    }
    
    const gridClasses = getGridClasses()
    
    const motionProps = animated ? {
      variants: bentoAnimations.container,
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, amount: 0.1 }
    } : {}
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          gridClasses,
          spacingVariants[spacing],
          autoFlowVariants[autoFlow],
          "w-full",
          type === 'masonry' && "break-inside-avoid",
          className
        )}
        style={{
          ...(type === 'masonry' && {
            columnFill: 'balance',
            columnGap: spacing === 'tight' ? '1rem' : spacing === 'relaxed' ? '3rem' : '2rem'
          })
        }}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

BentoGrid.displayName = "BentoGrid"

// Preset bento box layouts for common patterns
export const BentoLayout = {
  // Hero section layout
  Hero: ({ children, className, ...props }: Omit<BentoGridProps, 'type'>) => (
    <BentoGrid type="hero" className={className} {...props}>
      {children}
    </BentoGrid>
  ),
  
  // Products showcase layout
  Products: ({ children, className, ...props }: Omit<BentoGridProps, 'type'>) => (
    <BentoGrid type="products" className={className} {...props}>
      {children}
    </BentoGrid>
  ),
  
  // Blog section layout
  Blog: ({ children, className, ...props }: Omit<BentoGridProps, 'type'>) => (
    <BentoGrid type="blog" className={className} {...props}>
      {children}
    </BentoGrid>
  ),
  
  // Services overview layout
  Services: ({ children, className, ...props }: Omit<BentoGridProps, 'type'>) => (
    <BentoGrid type="services" className={className} {...props}>
      {children}
    </BentoGrid>
  ),
  
  // Custom flexible layout
  Custom: ({ children, className, ...props }: Omit<BentoGridProps, 'type'>) => (
    <BentoGrid type="custom" className={className} {...props}>
      {children}
    </BentoGrid>
  )
}

// Utility components for common bento box grid items with responsive support
export const BentoGridItem = {
  // Main feature item (spans multiple columns)
  Feature: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 md:col-span-2 lg:col-span-6 lg:row-span-2 xl:col-span-6 xl:row-span-2", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Standard item
  Standard: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 lg:col-span-3 xl:col-span-3", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Wide item (2 columns)
  Wide: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 md:col-span-2 lg:col-span-6 xl:col-span-8", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Tall item (2 rows)
  Tall: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 lg:col-span-3 lg:row-span-2 xl:col-span-3 xl:row-span-2", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Small highlight item
  Small: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 lg:col-span-2 xl:col-span-2", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Full width item
  Full: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 md:col-span-2 lg:col-span-12 xl:col-span-16", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Hero main content area
  Hero: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2 xl:col-span-4 xl:row-span-2", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Sidebar item
  Sidebar: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 row-span-1 lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Product showcase
  ProductShowcase: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2 xl:col-span-3 xl:row-span-2", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Blog featured
  BlogFeatured: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-2", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Gallery portrait
  GalleryPortrait: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 row-span-2 lg:col-span-1 lg:row-span-2 xl:col-span-1 xl:row-span-2", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Gallery landscape
  GalleryLandscape: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 row-span-1 md:col-span-2 lg:col-span-2 lg:row-span-1 xl:col-span-3 xl:row-span-1", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Service main
  ServiceMain: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div 
      className={cn(
        "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-3 xl:col-span-4 xl:row-span-3", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  ),
  
  // Flexible item with custom responsive behavior
  Flexible: ({ 
    children, 
    className, 
    mobile = "col-span-1",
    tablet = "md:col-span-1", 
    desktop = "lg:col-span-1",
    large = "xl:col-span-1",
    ...props 
  }: React.HTMLAttributes<HTMLDivElement> & {
    mobile?: string
    tablet?: string
    desktop?: string
    large?: string
  }) => (
    <div 
      className={cn(
        mobile, tablet, desktop, large, 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export { BentoGrid }