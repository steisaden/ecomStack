'use client'

import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { modernBentoTheme } from "@/lib/modernBentoTheme"
import { CardVariant } from "@/lib/enums"
import { createCombinedMotion, createScrollMotion } from "@/lib/motion-utils"

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
   variant?: CardVariant
   size?: '1x1' | '1x2' | '2x1' | '2x2' | '3x1'
   interactive?: boolean
   loading?: boolean
   priority?: number
   glassmorphic?: boolean
 }

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ 
    className, 
    variant = CardVariant.DEFAULT, 
    size = '1x1',
    interactive = true,
    loading = false,
    glassmorphic = false,
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
   }, ref) => {
    
    const sizeClasses = {
      '1x1': 'col-span-1 row-span-1 h-[280px]',
      '1x2': 'col-span-1 row-span-1 md:row-span-2 h-[280px] md:h-[580px]',
      '2x1': 'col-span-1 md:col-span-2 row-span-1 h-[280px]',
      '2x2': 'col-span-1 md:col-span-2 row-span-1 md:row-span-2 h-[280px] md:h-[580px]',
      // Unify height to 280px for consistency across cards
      '3x1': 'col-span-1 md:col-span-2 lg:col-span-3 row-span-1 h-[280px]'
    }

    const variantStyles = {
      [CardVariant.DEFAULT]: cn(
        'bg-white border border-opacity-40',
        'shadow-lg hover:shadow-xl transition-all duration-300'
      ),
      [CardVariant.FEATURED]: cn(
        'bg-gradient-to-br from-white to-sage-50',
        'border border-opacity-40 shadow-xl hover:shadow-2xl',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500'
      ),
      [CardVariant.MINIMAL]: cn(
        'bg-white border border-opacity-40',
        'shadow-sm hover:shadow-md transition-all duration-200'
      ),
      [CardVariant.GLASSMORPHIC]: cn(
        'backdrop-blur-xl bg-gradient-to-br from-white/25 via-white/15 to-white/10',
        'border border-opacity-40 shadow-2xl',
        'relative overflow-hidden',
        'hover:shadow-3xl transition-all duration-500'
      )
    }

    const glassStyle = glassmorphic ? {
      background: modernBentoTheme.glass.medium.background,
      backdropFilter: modernBentoTheme.glass.medium.backdropFilter,
      boxShadow: modernBentoTheme.glass.medium.boxShadow
    } : {}

    if (loading) {
      return (
        <div 
          className={cn(
            sizeClasses[size],
            'animate-pulse bg-champagne-200/50 rounded-2xl',
            className
          )}
        />
      )
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          sizeClasses[size],
          'group relative',
          className
        )}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...(interactive 
          ? createCombinedMotion('scaleIn', 'glow') 
          : createScrollMotion('scaleIn')
        )}
      >
        <Card 
          className={cn(
            'h-full w-full rounded-2xl p-0 overflow-hidden',
            variantStyles[variant],
            interactive && 'cursor-pointer hover:scale-[1.02] transition-transform duration-300'
          )}
          style={glassStyle}
        >
          {children}
        </Card>
      </motion.div>
    )
  }
)

BentoCard.displayName = 'BentoCard'

export { BentoCard }