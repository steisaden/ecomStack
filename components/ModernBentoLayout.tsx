'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BentoGrid } from "@/components/BentoGrid"
import { BentoCard } from "@/components/BentoCard"
import { ProductCard } from "@/components/ProductCard"
import { CategoryCard } from "@/components/CategoryCard"
import Link from "next/link"

import { RootComponentProps } from "@/lib/schema"
import { CardVariant, BentoItemSize } from "@/lib/enums"
import { AspectRatio } from "@radix-ui/react-aspect-ratio"
import { scrollMotionVariants, hoverMotionVariants, createScrollMotion } from "@/lib/motion-utils"
import { modernBentoTheme } from "@/lib/modernBentoTheme"

// Slightly more vibrant pastel rose-gold gradient for small cards
const roseGoldVibrantBg = 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)'

export interface ModernBentoLayoutProps extends RootComponentProps {
  className?: string
  animated?: boolean
  spacing?: 'tight' | 'normal' | 'relaxed'
  responsive?: boolean
  showFeaturedProducts?: boolean
  showCategories?: boolean
}

const ModernBentoLayout = React.forwardRef<HTMLDivElement, ModernBentoLayoutProps>(
  ({ 
    className,
    animated = true,
    spacing = 'normal',
    responsive = true,
    heroSection,
    featuredProduct,
    products,
    categories,
    specialOffers,
    bentoLayout, // destructure to avoid passing to DOM
    showFeaturedProducts = true,
    showCategories = true,
    ..._rest // do not spread onto DOM
  }, ref) => {
    
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08,
          delayChildren: 0.1
        }
      }
    }

    return (
      <div ref={ref as any} className={cn("w-full", className)}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-16 px-4 sm:px-6"
        >
          {/* Hero + Side Cards Section */}
          <motion.section className="space-y-6 mt-[15px]" {...createScrollMotion('fadeInUp', 0.15)}>
            <BentoGrid type="hero" spacing={spacing} animated={animated} className="max-w-6xl mx-auto">
              {/* Featured Product - Large Card */}
              <BentoCard
                variant={CardVariant.FEATURED}
                size="2x1"
                className="relative overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  {/* Hero Background Image */}
                  <div className="relative flex-1">
                    <AspectRatio ratio={16/10} className="h-full">
                      <img
                        src={heroSection.backgroundImage}
                        alt="Elegant beauty spa background by Jo Anaya on Unsplash"
                        className="h-full w-full object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Hero Content */}
                    <div className="absolute inset-0 flex flex-col justify=end p-8">
                      <div className="space-y-4 text-white">
                        <Badge variant="beauty" className="w-fit">
                          Featured Product
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold drop-shadow-xl">
                          {featuredProduct.name}
                        </h2>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-white">
                            ${featuredProduct.price}
                          </span>
                          {featuredProduct.originalPrice && (
                            <span className="text-lg text-white/70 line-through">
                              ${featuredProduct.originalPrice}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="glass"
                          size="lg"
                          rightIcon={<ArrowRight className="h-5 w-5" />}
                        >
                          {heroSection.ctaText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </BentoCard>

              {/* Quick Categories (Trending Now) */}
              <BentoCard variant={CardVariant.DEFAULT} size="1x1" className="relative overflow-hidden">
                <div className="relative h-full">
                  {/* Pastel rose gold background overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: roseGoldVibrantBg }}
                  />
                  <CardContent className="relative z-10 h-full flex flex-col justify-center p-6 text-center">
                    <Sparkle className="h-12 w-12 mx-auto mb-4 text-sage-600" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Trending Now
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Discover what&apos;s popular
                    </p>
                    <Button variant="default" size="sm">
                      Explore
                    </Button>
                  </CardContent>
                </div>
              </BentoCard>

              {/* Special Offers */}
              <BentoCard variant={CardVariant.DEFAULT} size="1x1" className="relative overflow-hidden">
                <div className="relative h-full">
                  {/* Pastel rose gold background overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: roseGoldVibrantBg }}
                  />
                  <CardContent className="relative z-10 h-full flex flex-col justify-center p-6 text-center">
                    <div className="space-y-3">
                      <Badge variant="destructive" className="mx-auto">
                        Special Offer
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {specialOffers.bundleDiscount}% Off Bundles
                      </h3>
                      <p className="text-sm text-gray-600">
                        {specialOffers.newCustomerOffer}
                      </p>
                      {specialOffers.freeShipping && (
                        <p className="text-xs text-sage-600 font-medium">
                          + Free Shipping
                        </p>
                      )}
                    </div>
                  </CardContent>
                </div>
              </BentoCard>
            </BentoGrid>
          </motion.section>

          {/* Blog Intro Section */}
          <motion.section className="max-w-6xl mx-auto" {...createScrollMotion('fadeInUp', 0.18)}>
            <Card className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50 shadow-sm">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(103,141,88,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(116,211,174,0.08),transparent_40%)]" />
              <CardContent className="relative z-10 p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                      <Sparkle className="h-4 w-4 text-sage-600" />
                      From the Blog
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Explore the Blog</h2>
                    <p className="text-gray-600">
                      Tutorials, routines, and inspiration to elevate your daily care—written by our team and community experts.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href="/blog">
                      <Button variant="default" rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Visit Blog
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Yoga Intro Section */}
          <motion.section className="max-w-6xl mx-auto" {...createScrollMotion('fadeInUp', 0.19)}>
            <Card className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50 shadow-sm">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(103,141,88,0.07),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(206,234,214,0.08),transparent_42%)]" />
              <CardContent className="relative z-10 p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                      <Sparkle className="h-4 w-4 text-sage-600" />
                      Wellness with Us
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Personalized Yoga Services</h2>
                    <p className="text-gray-600">
                      Private and small-group sessions designed to restore balance, build strength, and support your wellness journey.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href="/yoga-booking">
                      <Button variant="default" rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Book a Session
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* New: Blog + Yoga Links + Featured Yoga */}
          <motion.section className="space-y-6" {...createScrollMotion('fadeInUp', 0.2)}>
            <BentoGrid type="hero" spacing={spacing} animated={animated} className="max-w-6xl mx-auto">
              {/* Visit Blog - small card */}
              <Link href="/blog" className="contents">
                <BentoCard variant={CardVariant.MINIMAL} size="1x1" interactive={false}>
                  <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit the Blog</h3>
                    <p className="text-sm text-gray-600 mb-4">Beauty tips, wellness, and updates</p>
                    <Button variant="default" size="sm">Read Posts</Button>
                  </CardContent>
                </BentoCard>
              </Link>

              {/* Yoga Services - small card */}
              <Link href="/yoga-booking" className="contents">
                <BentoCard variant={CardVariant.MINIMAL} size="1x1" interactive={false}>
                  <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Yoga Services</h3>
                    <p className="text-sm text-gray-600 mb-4">Private and small group sessions</p>
                    <Button variant="default" size="sm">Explore Yoga</Button>
                  </CardContent>
                </BentoCard>
              </Link>

              {/* Featured Yoga - long card (clean minimal) */}
              <Link href="/yoga-booking/private-yoga" className="contents">
                <BentoCard variant={CardVariant.MINIMAL} size="2x1" interactive={false}>
                  <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Yoga Session</h3>
                    <p className="text-sm text-gray-600 mb-4">One-on-one practice tailored to your goals. Calm your mind and strengthen your body.</p>
                    <Button variant="default" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>Book Now</Button>
                  </CardContent>
                </BentoCard>
              </Link>
            </BentoGrid>
          </motion.section>

          {/* Products Showcase Section */}
          {showFeaturedProducts && (
            <motion.section 
              className="space-y-6"
              {...createScrollMotion('fadeInUp', 0.2)}
            >
              <motion.div 
                className="text-center space-y-2"
                variants={scrollMotionVariants.staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.h2 
                  className="text-section font-heading text-primary"
                  variants={scrollMotionVariants.staggerItem}
                >
                  Featured Products
                </motion.h2>
                <motion.p 
                  className="text-body text-dark-gray"
                  variants={scrollMotionVariants.staggerItem}
                >
                  Handpicked essentials for your beauty routine
                </motion.p>
              </motion.div>

              <BentoGrid 
                type="products" 
                spacing={spacing}
                animated={animated}
                className="max-w-6xl mx-auto"
              >
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    uniformHeight={true} // Apply uniform height only on home page
                  />
                ))}
              </BentoGrid>
            </motion.section>
          )}

          {/* Categories Grid Section */}
          {showCategories && (
            <motion.section 
              className="space-y-6"
              {...createScrollMotion('fadeInLeft', 0.3)}
            >
              <motion.div 
                className="text-center space-y-2"
                variants={scrollMotionVariants.staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-gray-900 drop-shadow-md"
                  variants={scrollMotionVariants.staggerItem}
                >
                  Shop by Category
                </motion.h2>
                <motion.p 
                  className="text-gray-600"
                  variants={scrollMotionVariants.fadeInUp}
                >
                  Find exactly what you&apos;re looking for
                </motion.p>
              </motion.div>

              <BentoGrid 
                type="gallery" 
                spacing={spacing}
                animated={animated}
                className="max-w-5xl mx-auto"
              >
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    variant="featured"
                  />
                ))}
              </BentoGrid>
            </motion.section>
          )}

          {/* Newsletter Section */}
          <motion.section 
            className="max-w-4xl mx-auto"
            {...createScrollMotion('scaleIn', 0.4)}
          >
            <BentoCard variant={CardVariant.FEATURED} size="3x1">
              <CardContent className="h-full flex flex-col md:flex-row items-center justify-between p-8 text=center md:text-left">
                <div className="space-y-3 mb-6 md:mb-0">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Stay in the Glow
                  </h3>
                  <p className="text-gray-600">
                    Get the latest beauty tips and exclusive offers delivered to your inbox
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                  <Button className="sm:w-auto" variant="default">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </BentoCard>
          </motion.section>
        </motion.div>
      </div>
    )
  }
)

ModernBentoLayout.displayName = "ModernBentoLayout"

export { ModernBentoLayout }