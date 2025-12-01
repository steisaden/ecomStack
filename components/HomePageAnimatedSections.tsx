'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { createButton } from '@/lib/cecred-design-system'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Calendar, Droplets } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/fusion-interactions'
import { createScrollMotion } from '@/lib/motion-utils'

export function PhilosophySection() {
  return (
    <motion.section 
      className="py-16 md:py-24 bg-light-gray" 
      {...createScrollMotion('fadeInUp', 0.05)}
    >
      <div className="container">
        <motion.div 
          className="max-w-3xl mx-auto text-center" 
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 className="text-section font-heading text-primary mb-6" variants={staggerItem}>
            Our Philosophy
          </motion.h2>
          <motion.p className="text-body text-dark-gray mb-8" variants={staggerItem}>
            We believe true beauty radiates from alignment—where wellness, confidence, and intention meet. Our mission is to empower you to be the best version of yourself, with luxury essentials that nurture your body, refine your routine, and restore balance.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={staggerItem}>
            <Link href="/about" className={cn(createButton('primary'), 'w-full sm:w-auto inline-flex items-center justify-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]')}>
              Learn More
            </Link>
            <Link href="/blog" className={cn(createButton('outline'), 'w-full sm:w-auto inline-flex items-center justify-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]')}>
              Wellness Journal
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export function YogaSection() {
  return (
    <motion.section 
      className="py-16 md:py-24" 
      {...createScrollMotion('fadeInUp', 0.05)}
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <motion.div 
            className="relative order-2 lg:order-1" 
            {...createScrollMotion('fadeInLeft')}
          >
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-72 sm:h-96">
                <Image
                  src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1600&auto=format&fit=crop"
                  alt="Person practicing yoga in a calm studio"
                  fill
                  className="object-cover will-change-transform transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
              </div>
            </div>
            <div className="absolute -top-3 -left-3">
              <Badge className="px-3 py-1">Yoga & Wellness</Badge>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div 
            className="order-1 lg:order-2" 
            {...createScrollMotion('fadeInRight', 0.05)}
          >
            <h2 className="text-section font-heading text-primary mb-4">Yoga, Elevated</h2>
            <p className="text-body text-dark-gray mb-6 max-w-xl">
              Experience mindful movement enhanced by carefully curated sessions for you. Our small-group classes and private sessions are designed to nurture the body, calm the mind, and elevate your everyday well-being.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <motion.div 
                className="flex items-center p-4 rounded-lg bg-light-gray" 
                whileHover={{ y: -2 }} 
                transition={{ duration: 0.2 }}
              >
                <Clock className="h-5 w-5 mr-3" />
                <span className="text-sm">60–90 min sessions</span>
              </motion.div>
              <motion.div 
                className="flex items-center p-4 rounded-lg bg-light-gray" 
                whileHover={{ y: -2 }} 
                transition={{ duration: 0.2 }}
              >
                <Users className="h-5 w-5 mr-3" />
                <span className="text-sm">Small groups or 1:1</span>
              </motion.div>
              <motion.div 
                className="flex items-center p-4 rounded-lg bg-light-gray" 
                whileHover={{ y: -2 }} 
                transition={{ duration: 0.2 }}
              >
                <Droplets className="h-5 w-5 mr-3" />
                <span className="text-sm">Therapeutic essential oils</span>
              </motion.div>
              <motion.div 
                className="flex items-center p-4 rounded-lg bg-light-gray" 
                whileHover={{ y: -2 }} 
                transition={{ duration: 0.2 }}
              >
                <Calendar className="h-5 w-5 mr-3" />
                <span className="text-sm">Flexible scheduling</span>
              </motion.div>
            </div>

            <Link 
              href="/yoga-booking" 
              className={cn(createButton('primary'), 'w-full sm:w-auto inline-flex items-center justify-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]')}
            >
              Book a Session
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
