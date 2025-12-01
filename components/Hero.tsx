'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createButton } from '@/lib/cecred-design-system'
import { useReducedMotion } from '@/lib/useReducedMotion'
import Image from 'next/image'

interface HeroProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink?: string
  onCtaClick?: () => void
  image?: string
  imageAlt?: string
}

export default function Hero({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink,
  onCtaClick,
  image,
  imageAlt = 'Premium self care products'
}: HeroProps) {
  const prefersReducedMotion = useReducedMotion()

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick()
    }
  }

  return (
    <section className="hero-section-retreat">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          <div className={prefersReducedMotion ? "" : "animate-fade-in"}>
            <h1 className="text-hero font-heading text-primary mb-6">
              {title}
            </h1>
            <p className="text-body-large text-darkGray mb-8 max-w-2xl">
              {subtitle}
            </p>
            {ctaLink ? (
              <Link
                href={ctaLink}
                className={cn(
                  createButton('primary'),
                  prefersReducedMotion 
                    ? "transition-colors duration-200" 
                    : "transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                )}
              >
                {ctaText}
              </Link>
            ) : (
              <button
                onClick={handleCtaClick}
                className={cn(
                  createButton('primary'),
                  prefersReducedMotion 
                    ? "transition-colors duration-200" 
                    : "transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                )}
              >
                {ctaText}
              </button>
            )}
          </div>
          
          {image && (
            <div className={cn(
              "relative h-64 md:h-96 lg:h-full rounded-lg overflow-hidden",
              prefersReducedMotion 
                ? "" 
                : "animate-fade-in"
            )}>
              <div className="w-full h-full">
                <Image
                  src={image}
                  alt={imageAlt}
                  width={600}
                  height={600}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
