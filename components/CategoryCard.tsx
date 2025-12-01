'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryProps } from "@/lib/schema"
import { createScrollMotion, createHoverMotion, createCombinedMotion } from "@/lib/motion-utils"

export interface CategoryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  category: CategoryProps
  variant?: 'default' | 'featured' | 'minimal'
}

const CategoryCard = React.forwardRef<HTMLDivElement, CategoryCardProps>(
  ({ 
    className, 
    category,
    variant = 'default',
    onClick,
    onMouseEnter,
    onMouseLeave,
    ...props 
  }, ref) => {
    
    const [imageLoaded, setImageLoaded] = React.useState(false)

    const cardVariants = {
      default: "backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15",
      featured: "backdrop-blur-lg bg-gradient-to-br from-white/25 to-white/15 border border-white/30 shadow-xl",
      minimal: "backdrop-blur-sm bg-white/5 border border-white/10"
    }

    const handleCategoryClick = () => {
      // Navigate to category page
      console.log('Navigate to category:', category.category)
    }

    return (
      <motion.div
        ref={ref}
        className={cn("group relative cursor-pointer h-full", className)}
        {...createCombinedMotion('fadeInRight', 'tilt')}
        onClick={(e) => {
          handleCategoryClick()
          onClick?.(e)
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Card className={cn(
          // Ensure consistent height and rounding
          "h-[280px] overflow-hidden rounded-2xl border-0 transition-all duration-300",
          cardVariants[variant],
          "hover:shadow-xl hover:shadow-black/10"
        )}>
          {/* Category Image */}
          <div className="relative h-full overflow-hidden rounded-2xl">
            <motion.img
              src={category.image}
              alt={`${category.name} by Alexis Duckett on Unsplash`}
              className={cn(
                // Force image to fully cover the 280px height without clipping corners
                "h-full w-full object-cover rounded-2xl transition-all duration-500",
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
              )}
              style={{ width: '100%', height: '100%' }}
              onLoad={() => setImageLoaded(true)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xl drop-shadow-lg">
                  {category.name}
                </h3>
                <p className="text-white/90 text-sm drop-shadow-md">
                  {category.productCount} products
                </p>
                
                {/* Explore Button */}
                <Button
                  variant="glass"
                  size="sm"
                  className="mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCategoryClick()
                  }}
                >
                  Explore Collection
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }
)

CategoryCard.displayName = "CategoryCard"

export { CategoryCard }