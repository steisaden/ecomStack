'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { createCard, motionVariants } from "@/lib/cecred-design"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { scrollMotionVariants, createScrollMotion, createHoverMotion } from "@/lib/motion-utils"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

interface AboutContent {
  title?: string
  mainContent?: {
    content?: Array<{
      content?: Array<{
        value?: string
      }>
    }>
  }
  mission?: string
  vision?: string
  image?: {
    url: string
    title?: string
  }
}

interface AboutPageClientProps {
  aboutContent: AboutContent | null
}

export default function AboutPageClient({ aboutContent }: AboutPageClientProps) {
  return (
    <motion.div 
      className="max-w-5xl mx-auto"
      variants={scrollMotionVariants.staggerContainer}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Hero Section with CÉCRED Typography */}
      <motion.div 
        className="text-center mb-16"
        variants={scrollMotionVariants.staggerItem}
      >
        <h1 className="font-heading text-5xl md:text-7xl font-bold text-gray-900 mb-6 drop-shadow-lg">
          {aboutContent?.title || "About Us"}
        </h1>
        <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full" />
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Content Side */}
        <motion.div 
          variants={scrollMotionVariants.staggerItem}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <Card className={createCard('feature', 'h-full')}>
            <CardContent className="p-8 md:p-12">
              {aboutContent?.mainContent ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-700 font-body leading-relaxed"
                >
                  {documentToReactComponents(aboutContent.mainContent as any)}
                </div>
              ) : (
                <p className="text-lg text-gray-700 font-body leading-relaxed">
                  Our story and mission information will appear here once added in Contentful. 
                  We are dedicated to creating beautiful, sustainable beauty products that enhance 
                  your natural radiance.
                </p>
              )}
              
              {/* Mission & Vision */}
              <div className="space-y-8 mt-8">
                {aboutContent?.mission && (
                  <div>
                    <h2 className="font-heading text-2xl font-semibold mb-4 text-gray-900">Our Mission</h2>
                    <p className="text-gray-700 font-body leading-relaxed">{aboutContent.mission}</p>
                  </div>
                )}
                
                {aboutContent?.vision && (
                  <div>
                    <h2 className="font-heading text-2xl font-semibold mb-4 text-gray-900">Our Vision</h2>
                    <p className="text-gray-700 font-body leading-relaxed">{aboutContent.vision}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Image Side */}
        <motion.div 
          variants={scrollMotionVariants.staggerItem}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <Card className={createCard('hero', 'h-full overflow-hidden')}>
            <CardContent className="p-0 h-full">
              {aboutContent?.image ? (
                <img 
                  src={aboutContent.image.url}
                  alt={aboutContent.image.title || "About Us"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full min-h-[400px] bg-gradient-to-br from-primary-100 via-accent-100 to-primary-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-16 h-16 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-primary-800 font-body text-lg font-medium">Your brand story image will go here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Back to Home Button */}
      <motion.div 
        className="text-center"
        variants={scrollMotionVariants.staggerItem}
      >
        <Button 
          asChild
          className="bg-primary-700 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Link href="/">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}
