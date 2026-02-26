'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/lib/responsive'
import { cardVariants, createGlassEffect } from '@/lib/glass-morphism'
import { 
  staggerContainer, 
  staggerItem,
  createViewportAnimation,
  glassCardHoverVariants
} from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { Calendar, User, Clock } from 'lucide-react'
import ResponsiveGrid from './ResponsiveGrid'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  publishedAt?: string
  sys: {
    createdAt: string
  }
  featuredImage?: {
    url: string
  }
  author?: {
    name: string
  }
}

interface BlogGridProps {
  posts: BlogPost[]
  className?: string
  showViewAllButton?: boolean
  maxItems?: number
  layout?: 'grid' | 'masonry' | 'featured'
}

export default function BlogGrid({ 
  posts, 
  className, 
  showViewAllButton = false,
  maxItems,
  layout = 'grid'
}: BlogGridProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  const displayPosts = maxItems ? posts.slice(0, maxItems) : posts
  
  // Modern blog card with glassmorphism and animations
  const BlogCard = ({ post, featured = false }: { post: BlogPost, featured?: boolean }) => (
    <motion.article 
      variants={staggerItem}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        cardVariants.modernBeauty,
        'overflow-hidden group h-full flex flex-col',
        featured && 'md:col-span-2 lg:col-span-2'
      )}
    >
      {post.featuredImage && (
        <div className={cn(
          'relative overflow-hidden',
          featured ? 'aspect-[16/9] lg:aspect-[21/9]' : 'aspect-[4/3]'
        )}>
          <img 
            src={post.featuredImage.url.startsWith('//') ? `https:${post.featuredImage.url}` : post.featuredImage.url}
            alt={post.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Glassmorphism overlay on hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-beauty-500/0 via-white/5 to-beauty-500/0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3"
            initial={{ x: "-100%" }}
            whileHover={{ x: "300%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          
          {/* Category badge */}
          <motion.div 
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={createGlassEffect('beauty', 'text-beauty-700 text-xs px-3 py-1.5 rounded-full font-semibold shadow-glow-pink')}>
              Blog
            </div>
          </motion.div>
        </div>
      )}
      
      <div className={cn(
        'p-6 flex-1 flex flex-col',
        featured && 'lg:p-8'
      )}>
        {/* Enhanced metadata with icons */}
        <motion.div 
          className={createGlassEffect('light', 'flex items-center gap-3 text-xs text-beauty-600 mb-4 p-2 rounded-lg')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-beauty-500" />
            <time dateTime={post.publishedAt || post.sys?.createdAt} className="font-medium">
              {new Date(post.publishedAt || post.sys?.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          </div>
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-sage-500" />
              <span className="font-medium">{post.author.name}</span>
            </div>
          )}
        </motion.div>
        
        <motion.h3 
          className={cn(
            'font-bold text-beauty-800 line-clamp-2 mb-3 flex-none',
            featured ? 'text-xl lg:text-2xl lg:mb-4' : 'text-lg'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {post.title}
        </motion.h3>
        
        <motion.p 
          className={cn(
            'text-beauty-600 mb-6 flex-1',
            featured ? 'text-base line-clamp-4' : 'text-sm line-clamp-3'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {post.excerpt}
        </motion.p>
        
        <motion.div
          className="mt-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="glassSecondary" 
            size="sm" 
            className="group transition-all duration-300 hover:shadow-glow-pink"
            asChild
          >
            <Link href={`/blog/${post.slug}`}>
              <span className="group-hover:mr-1 transition-all duration-300">Read More</span>
              <motion.span
                className="inline-block"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.article>
  )

  // Featured layout with one large post and smaller ones
  if (layout === 'featured' && displayPosts.length > 0) {
    const [featuredPost, ...otherPosts] = displayPosts
    
    return (
      <motion.div 
        className={className}
        {...createViewportAnimation(staggerContainer, 0.1)}
      >
        <div className="space-y-8 lg:space-y-12">
          {/* Featured Post */}
          <motion.div variants={staggerItem}>
            <BlogCard post={featuredPost} featured={true} />
          </motion.div>
          
          {/* Other Posts */}
          {otherPosts.length > 0 && (
            <motion.div variants={staggerItem}>
              <ResponsiveGrid 
                variant="blog" 
                gap={isMobile ? 'medium' : 'large'}
                className="gap-6 lg:gap-8"
              >
                {otherPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </ResponsiveGrid>
            </motion.div>
          )}
        </div>
        
        {showViewAllButton && (
          <motion.div 
            className="text-center mt-12 lg:mt-16"
            variants={staggerItem}
          >
            <Button 
              variant="glass" 
              size="lg" 
              className="px-12 py-4 text-base hover:shadow-glow-beauty"
              asChild
            >
              <Link href="/blog">
                Read All Articles
              </Link>
            </Button>
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Standard grid layout
  return (
    <motion.div 
      className={className}
      {...createViewportAnimation(staggerContainer, 0.1)}
    >
      <ResponsiveGrid 
        variant="blog" 
        gap={isMobile ? 'medium' : 'large'}
        className="gap-6 lg:gap-8"
      >
        {displayPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </ResponsiveGrid>
      
      {showViewAllButton && (
        <motion.div 
          className="text-center mt-12 lg:mt-16"
          {...createViewportAnimation(staggerItem, 0.2)}
        >
          <Button 
            variant="glass" 
            size="lg" 
            className="px-12 py-4 text-base hover:shadow-glow-beauty"
            asChild
          >
            <Link href="/blog">
              Read All Articles
            </Link>
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}