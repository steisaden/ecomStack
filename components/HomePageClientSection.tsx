'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BlogCard } from '@/components/BlogCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import HeroSection from '@/components/HeroSection'
import FusionProductsSection from '@/components/FusionProductsSection'
import YogaSection from '@/components/YogaSection'
import { createFusionEffect, createCustomFusion } from '@/lib/fusion-design'
import { staggerContainer, staggerItem, cardHoverVariants } from '@/lib/fusion-interactions'
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Sparkles, Heart } from 'lucide-react'
import type { Product, BlogPost, AboutContent } from '../lib/types'

interface HomePageClientSectionProps {
  products: Product[];
  posts: BlogPost[];
  aboutContent: AboutContent | null;
}

export default function HomePageClientSection({
  products,
  posts,
  aboutContent,
}: HomePageClientSectionProps) {
  const featuredProducts = products.slice(0, 4)
  const latestPosts = posts.slice(0, 2)

  return (
    <div className="bg-gradient-to-br from-champagne-200 via-champagne-300 to-champagne-400 min-h-screen">
      {/* Hero Section */}
      <HeroSection featuredProducts={featuredProducts} />

      {/* Products Section with Fusion Design */}
      <FusionProductsSection 
        products={products}
        title="Premium Beauty Essentials"
        subtitle="Discover our curated collection of natural beauty products, crafted with love to enhance your daily ritual"
      />

      {/* Newsletter Section with Fusion Design */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-asparagus-600/90 via-asparagus-500/90 to-celadon-500/90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        
        <div className="relative z-10 container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div variants={staggerItem}>
              <div className={createFusionEffect('light', 'sm', 'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-champagne-200/80 text-asparagus-800 text-sm font-semibold')}>
                <Mail className="w-4 h-4" />
                Stay Connected
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-3xl lg:text-5xl font-bold text-white mb-6"
              variants={staggerItem}
            >
              Join Our Beauty Community
            </motion.h2>
            
            <motion.p 
              className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed"
              variants={staggerItem}
            >
              Get exclusive access to beauty tips, new product launches, and special offers. 
              Join thousands of goddesses on their beauty journey.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              variants={staggerItem}
            >
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className={createCustomFusion({
                  glass: 'medium',
                  neomorphic: 'sm',
                  background: 'bg-white/20 border-white/30',
                  text: 'text-white placeholder:text-white/70',
                  border: 'rounded-xl',
                  hover: false
                })}
              />
              <Button 
                size="lg"
                className={createCustomFusion({
                  glass: 'medium',
                  neomorphic: 'md',
                  background: 'bg-celadon-400/90',
                  text: 'text-white font-semibold whitespace-nowrap',
                  hover: true
                })}
              >
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </motion.div>
            
            <motion.p 
              className="text-sm text-white/70 mt-4"
              variants={staggerItem}
            >
              No spam, unsubscribe at any time. We respect your privacy.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      {aboutContent && (
        <section className="relative py-16 lg:py-24 bg-gradient-to-br from-champagne-300/50 via-champagne-200/50 to-champagne-100/50">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(116,211,174,0.1)_0%,transparent_50%)]" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.h2 
                className="text-section font-heading text-primary mb-8"
                variants={staggerItem}
              >
                About Goddess Hair Studio
              </motion.h2>
              <motion.div 
                className={createCustomFusion({
                  glass: 'medium',
                  neomorphic: 'md',
                  background: 'bg-champagne-200/50',
                  border: 'rounded-2xl p-8',
                  hover: false
                })}
                variants={staggerItem}
              >
                <p className="text-lg text-asparagus-600 leading-relaxed mb-6">
                  {aboutContent.title || "We are passionate about natural beauty and creating products that enhance your unique radiance."}
                </p>
                {aboutContent.mission && (
                  <p className="text-asparagus-700 font-medium">
                    <span className="text-celadon-600 font-bold">Our Mission:</span> {aboutContent.mission}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Yoga Section */}
      <YogaSection />

      {/* Blog Section with Fusion Design (moved below Yoga) */}
      {latestPosts.length > 0 && (
        <section className="relative py-16 lg:py-24 bg-gradient-to-br from-champagne-400/30 via-champagne-300/50 to-champagne-200/30">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(103,141,88,0.1)_0%,transparent_50%)]" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.div variants={staggerItem}>
                <div className={createFusionEffect('light', 'sm', 'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-olivine-400/80 text-asparagus-800 text-sm font-semibold')}>
                  <Sparkles className="w-4 h-4" />
                  Latest Stories
                </div>
              </motion.div>
              <motion.h2 
                className="text-section font-heading text-primary mb-4"
                variants={staggerItem}
              >
                Beauty Tips & Insights
              </motion.h2>
              <motion.p 
                className="text-lg text-asparagus-600 max-w-2xl mx-auto"
                variants={staggerItem}
              >
                Discover expert tips, tutorials, and the latest trends in natural beauty
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {latestPosts.map((post, index) => (
                <motion.div
                  key={post.slug || index}
                  className={createCustomFusion({
                    glass: 'medium',
                    neomorphic: 'md',
                    background: 'bg-champagne-200/50',
                    border: 'rounded-2xl p-6 group',
                    hover: true
                  })}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  initial="initial"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlogCard
                    title={post.title}
                    description={post.excerpt}
                    publishedAt={post.publishedAt}
                    author={post.author?.name || 'Anonymous'}
                    image={post.featuredImage ? {
                      src: post.featuredImage.url,
                      alt: post.title
                    } : undefined}
                    categories={post.tags}
                    className="border-none bg-transparent shadow-none"
                    href={`/blog/${post.slug}`}
                  />
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Button 
                size="lg"
                className={createCustomFusion({
                  glass: 'medium',
                  neomorphic: 'md',
                  background: 'bg-asparagus-500/80',
                  text: 'text-white font-semibold',
                  hover: true
                })}
                asChild
              >
                <Link href="/blog">
                  <Heart className="w-5 h-5 mr-2" />
                  Read More Stories
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer with Contact Info */}
      <footer className="relative bg-gradient-to-br from-asparagus-800 via-asparagus-700 to-asparagus-600 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <motion.div
              className={createCustomFusion({
                glass: 'light',
                neomorphic: 'sm',
                background: 'bg-white/10',
                border: 'rounded-xl p-6',
                hover: false
              })}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl font-bold mb-4 text-celadon-300">Goddess Hair Studio</h3>
              <p className="text-white/80 mb-4">
                Transforming beauty routines with natural, sustainable products for the modern goddess.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-white/60 hover:text-celadon-300 transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-white/60 hover:text-celadon-300 transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-white/60 hover:text-celadon-300 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              className={createCustomFusion({
                glass: 'light',
                neomorphic: 'sm',
                background: 'bg-white/10',
                border: 'rounded-xl p-6',
                hover: false
              })}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-4 text-celadon-300">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-white/80 hover:text-white transition-colors">Products</Link></li>
                <li><Link href="/blog" className="text-white/80 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className={createCustomFusion({
                glass: 'light',
                neomorphic: 'sm',
                background: 'bg-white/10',
                border: 'rounded-xl p-6',
                hover: false
              })}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-4 text-celadon-300">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-celadon-300" />
                  <span className="text-white/80">hello@goddesshair.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-celadon-300" />
                  <span className="text-white/80">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-celadon-300" />
                  <span className="text-white/80">New York, NY</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-12 pt-8 border-t border-white/20">
            <p className="text-white/60">
              © 2024 Goddess Hair Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}