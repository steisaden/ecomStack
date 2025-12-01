'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { createButton } from '@/lib/cecred-design-system'
import { useReducedMotion } from '@/lib/useReducedMotion'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const prefersReducedMotion = useReducedMotion()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  return (
    <section className="bg-accent py-16 md:py-24">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-section font-heading text-primary mb-4">
            Join Our Community
          </h2>
          <p className="text-body text-darkGray mb-8">
            Subscribe to our newsletter for exclusive offers, new product launches, and wellness tips.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-grow px-6 py-4 text-body rounded-sm border border-gray focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <button
              type="submit"
              className={cn(
                createButton('primary'),
                "w-full sm:w-auto",
                prefersReducedMotion 
                  ? "transition-colors duration-200" 
                  : "transition-all duration-300 hover:shadow-lg"
              )}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}