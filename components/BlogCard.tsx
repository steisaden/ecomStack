
import * as React from "react"
import { motion } from "framer-motion"
import { ContentCard, ContentCardProps } from "./ContentCard"
import { Button } from "./ui/button"
import { createGlassEffect } from "@/lib/glass-morphism"
import { Calendar, User, Clock } from "lucide-react"

export interface BlogCardProps extends Omit<ContentCardProps, 'variant'> {
  author?: string
  publishedAt?: string
  readTime?: string
  categories?: string[]
}

export const BlogCard = React.forwardRef<HTMLDivElement, BlogCardProps>(
  ({ author, publishedAt, readTime, categories, actions, ...props }, ref) => {
    const metadata = (author || publishedAt || readTime) ? (
      <motion.div 
        className={createGlassEffect('light', 'flex items-center gap-3 text-xs text-sage-600 mb-3 p-2 rounded-lg')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {publishedAt && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-beauty-500" />
            <time dateTime={publishedAt} className="font-medium">
              {new Date(publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          </div>
        )}
        {author && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-sage-500" />
            <span className="font-medium">{author}</span>
          </div>
        )}
        {readTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-beauty-500" />
            <span className="font-medium">{readTime}</span>
          </div>
        )}
      </motion.div>
    ) : null
    
    const categoryBadges = categories && categories.length > 0 ? (
      <motion.div 
        className="absolute top-4 right-4 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className={createGlassEffect('beauty', 'text-beauty-700 text-xs px-3 py-1.5 rounded-full font-semibold shadow-glow-pink')}>
          {categories[0]}
        </div>
      </motion.div>
    ) : null
    
    const defaultActions = actions || (
      <Button 
        variant="glassSecondary" 
        size="sm" 
        className="group transition-all duration-300 hover:shadow-glow-pink"
      >
        <span className="group-hover:mr-1 transition-all duration-300">Read More</span>
        <motion.span
          className="inline-block"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          →
        </motion.span>
      </Button>
    )
    
    return (
      <ContentCard
        ref={ref}
        variant="blog"
        metadata={metadata}
        actions={defaultActions}
        badge={categoryBadges}
        {...props}
      />
    )
  }
)

BlogCard.displayName = "BlogCard"
