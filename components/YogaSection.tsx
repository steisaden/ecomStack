'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import ResponsiveContainer from './ResponsiveContainer'

export default function YogaSection() {
  return (
    <div className="bg-lightGray">
      <ResponsiveContainer className="py-16 text-center">
        <h2 className="text-section font-heading text-primary">Ready to find your inner peace?</h2>
        <p className="mt-4 text-lg leading-6 text-gray-600">Explore our yoga classes and book your next session with us.</p>
        <Button asChild className="mt-8">
          <Link href="/yoga-booking">Book a Yoga Session</Link>
        </Button>
      </ResponsiveContainer>
    </div>
  )
}
