'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createHybrid, createCard, createButton, motionVariants, bentoTemplates } from '@/lib/cecred-design'
import { useReducedMotion } from '@/lib/useReducedMotion'

interface CecredLayoutProps {
  children: React.ReactNode
  className?: string
  variant?: 'hero' | 'products' | 'blog' | 'about'
}

interface CecredCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'product' | 'blog' | 'hero' | 'feature'
  span?: 'small' | 'medium' | 'large' | 'full'
  hover?: boolean
}

interface CecredButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'glass' | 'neumorphic' | 'hybrid'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

// CECRED Button Component
export const CecredButton: React.FC<CecredButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  onClick,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion()
  
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm rounded-xl',
    md: 'py-3 px-6 text-base rounded-2xl',
    lg: 'py-4 px-8 text-lg rounded-2xl'
  }
  
  return (
    <motion.button
      className={cn(
        createButton(variant),
        sizeClasses[size],
        'font-semibold transition-all duration-200',
        className
      )}
      onClick={onClick}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// CECRED Card Component
export const CecredCard: React.FC<CecredCardProps> = ({
  children,
  className,
  variant = 'product',
  span = 'medium',
  hover = true,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion()
  
  const spanClasses = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-3',
    full: 'col-span-full'
  }
  
  return (
    <motion.div
      className={cn(
        createCard(variant),
        spanClasses[span],
        className
      )}
      variants={motionVariants.fadeIn}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={hover && !prefersReducedMotion ? {
        y: -8,
        transition: { duration: 0.3 }
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// CECRED Layout Container
export const CecredLayout: React.FC<CecredLayoutProps> = ({
  children,
  className,
  variant = 'hero',
  ...props
}) => {
  return (
    <motion.div
      className={cn(
        'min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      {...props}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className={cn(
            'grid gap-6',
            bentoTemplates[variant]
          )}
          variants={motionVariants.staggerContainer}
          initial="initial"
          animate="animate"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  )
}

// Hero Section Component
export const CecredHero: React.FC<{
  title: string
  subtitle: string
  ctaText: string
  onCtaClick?: () => void
  image?: string
}> = ({ title, subtitle, ctaText, onCtaClick, image }) => {
  return (
    <CecredCard variant="hero" span="full" className="relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={motionVariants.slideIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-900 mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-neutral-700 mb-8 leading-relaxed">
            {subtitle}
          </p>
          <CecredButton
            variant="primary"
            size="lg"
            onClick={onCtaClick}
            className="mb-4"
          >
            {ctaText}
          </CecredButton>
        </motion.div>
        
        {image && (
          <motion.div
            className="relative h-64 md:h-96 lg:h-full"
            variants={motionVariants.scaleIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <img
              src={image}
              alt="Hero"
              className="w-full h-full object-cover rounded-2xl"
            />
          </motion.div>
        )}
      </div>
    </CecredCard>
  )
}

// Feature Grid Component
export const CecredFeatureGrid: React.FC<{
  features: Array<{
    id: string
    title: string
    description: string
    icon?: React.ReactNode
    image?: string
  }>
}> = ({ features }) => {
  return (
    <>
      {features.map((feature, index) => (
        <CecredCard
          key={feature.id}
          variant="feature"
          span="small"
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            {feature.icon && (
              <div className="text-primary-600 mb-4 flex justify-center">
                {feature.icon}
              </div>
            )}
            {feature.image && (
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-32 object-cover rounded-xl mb-4"
              />
            )}
            <h3 className="text-xl font-semibold text-primary-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        </CecredCard>
      ))}
    </>
  )
}

// Product Showcase Component
export const CecredProductShowcase: React.FC<{
  products: Array<{
    id: string
    name: string
    price: string
    image: string
    description?: string
  }>
}> = ({ products }) => {
  return (
    <>
      {products.map((product, index) => (
        <CecredCard
          key={product.id}
          variant="product"
          span="small"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-2xl mb-4"
            />
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-700">
                {product.price}
              </span>
              <CecredButton variant="glass" size="sm">
                Add to Cart
              </CecredButton>
            </div>
          </motion.div>
        </CecredCard>
      ))}
    </>
  )
}

export default {
  CecredLayout,
  CecredCard,
  CecredButton,
  CecredHero,
  CecredFeatureGrid,
  CecredProductShowcase
}