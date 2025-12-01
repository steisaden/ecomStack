'use client'

import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { BentoCard, BentoCardProps } from "@/components/BentoCard"
import { CardVariant } from "@/lib/enums"
import { useReducedMotion } from "@/lib/useReducedMotion"
import { createGlossyCard, createGlossyText } from "@/lib/bento-grid"
import { createGlassEffect } from "@/lib/glass-morphism"
import { 
  cardHoverVariants, 
  fadeUpVariants, 
  createViewportAnimation,
  staggerItem
} from "@/lib/animations"
import { Badge } from "@/components/ui/badge"

export interface ContentCardProps {
  title: string
  content?: React.ReactNode
  description?: string
  image?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  actions?: React.ReactNode
  variant?: 'default' | 'featured' | 'minimal' | 'product' | 'blog' | 'service'
  size?: 'small' | 'medium' | 'large' | 'featured'
  href?: string
  className?: string
  imageClassName?: string
  contentClassName?: string
  onClick?: () => void
  loading?: boolean
  badge?: React.ReactNode
  metadata?: React.ReactNode
  layout?: 'vertical' | 'horizontal' | 'overlay'
}

const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  ({
    title,
    content,
    description,
    image,
    actions,
    variant = 'default',
    size = 'medium',
    href,
    className,
    imageClassName,
    contentClassName,
    onClick,
    loading = false,
    badge,
    metadata,
    layout = 'vertical',
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    
    // Map ContentCard variants to BentoCard variants
    const variantMapping: Record<string, CardVariant> = {
      default: CardVariant.DEFAULT,
      featured: CardVariant.FEATURED, 
      minimal: CardVariant.MINIMAL,
      product: CardVariant.DEFAULT,
      blog: CardVariant.DEFAULT,
      service: CardVariant.GLASSMORPHIC
    }
    
    // Map ContentCard sizes to BentoCard sizes
    const sizeMapping: Record<string, BentoCardProps['size']> = {
      small: '1x1',
      medium: '1x1', 
      large: '2x1',
      featured: '2x2'
    }
    
    // Enhanced content with metadata integration
    const enhancedContent = (
      <div className={cn("space-y-4", contentClassName)}>
        {metadata && (
          <motion.div 
            className={createGlassEffect('light', 'p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {metadata}
          </motion.div>
        )}
        
        {content && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: content ? 0.2 : 0.1 }}
          >
            {content}
          </motion.div>
        )}
      </div>
    )
    
    // Enhanced badge with glassmorphism
    const enhancedBadge = badge ? (
      <div className={createGlassEffect('light', 'px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30')}>
        {badge}
      </div>
    ) : undefined
    
    return (
      <motion.div
        ref={ref}
        className={cn("h-full", className)}
        {...(!prefersReducedMotion ? {
          variants: staggerItem,
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.1 }
        } : {})}
        {...props}
      >
        <BentoCard
          variant={variantMapping[variant] || CardVariant.DEFAULT}
          size={sizeMapping[size] || '1x1'}
          interactive={true}
          loading={loading}
          className="h-full"
          onClick={onClick}
        >
          <div className="h-full flex flex-col">
            {/* Image */}
            {image && (
              <div className="relative flex-1 overflow-hidden rounded-t-2xl">
                <img
                  src={image.src}
                  alt={image.alt}
                  className={cn("w-full h-full object-cover", imageClassName)}
                  width={image.width}
                  height={image.height}
                />
              </div>
            )}
            
            {/* Content */}
            <div className={cn("flex-1 p-6 space-y-4", contentClassName)}>
              {/* Badge */}
              {enhancedBadge && (
                <div className="flex justify-start">
                  {enhancedBadge}
                </div>
              )}
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              
              {/* Description */}
              {description && (
                <p className="text-sm text-gray-600">
                  {description}
                </p>
              )}
              
              {/* Enhanced Content */}
              {enhancedContent}
              
              {/* Actions */}
              {actions && (
                <div className="pt-4">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </BentoCard>
      </motion.div>
    )
  }
)

ContentCard.displayName = "ContentCard"

export { ContentCard }