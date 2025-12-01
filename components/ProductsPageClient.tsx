'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { motionVariants } from "@/lib/cecred-design"
import { scrollMotionVariants, createScrollMotion, createHoverMotion } from "@/lib/motion-utils"
import ProductsPageClientSection from '@/components/ProductsPageClientSection'
import { Product } from '@/lib/types'

interface ProductsPageClientProps {
  products: Product[]
}

export default function ProductsPageClient({ products }: ProductsPageClientProps) {
  return (
    <>
      <motion.div 
        className="text-center mb-16"
        variants={scrollMotionVariants.staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Hero Section with CÉCRED Typography */}
        <motion.div variants={scrollMotionVariants.staggerItem}>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-gray-900 mb-6 drop-shadow-lg">
            Our Collection
          </h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full mb-8" />
          <p className="font-body text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Handcrafted with love and formulated with the finest natural ingredients 
            to enhance your natural beauty and nourish your skin.
          </p>
        </motion.div>
      </motion.div>
      
      {/* Products Section */}
      <motion.div
        variants={scrollMotionVariants.staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.1 }}
      >
        <ProductsPageClientSection initialProducts={products} />
      </motion.div>
    </>
  )
}