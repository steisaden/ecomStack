'use client'

import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Product {
  name: string
  price: number
  image?: string
}

interface StripeCheckoutProps {
  product: Product
}

export default function StripeCheckout({ product }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    
    try {
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            name: product.name,
            price: Math.round(product.price * 100), // Convert to cents
            image: product.image,
          }
        }),
      })

      const session = await response.json()

      if (session.error) {
        throw new Error(session.error)
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="w-full bg-white border border-sage-500 text-sage-600 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add to Cart
      </button>
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-gradient-to-r from-sage-500 to-sage-600 text-white shadow-md hover:shadow-lg hover:from-sage-600 hover:to-sage-700 py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Buy Now'}
      </button>
    </div>
  )
}