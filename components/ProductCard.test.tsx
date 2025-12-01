import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProductCard } from './ProductCard'

// Mock the useReducedMotion hook
jest.mock('@/lib/useReducedMotion', () => ({
  useReducedMotion: () => false
}))

// Mock the cn function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

// Mock the createButton and createCard functions
jest.mock('@/lib/cecred-design-system', () => ({
  createButton: () => 'btn-class',
  createCard: () => 'card-class'
}))

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 29.99,
    image: 'test-image.jpg',
    category: 'HAIR_CARE',
    rating: 4.5,
    isNew: true,
    isBestSeller: false
  }

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} uniformHeight={false} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByAltText('Test Product')).toBeInTheDocument()
  })

  it('displays NEW badge when product is new', () => {
    render(<ProductCard product={mockProduct} uniformHeight={false} />)
    
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('does not display BEST badge when product is not best seller', () => {
    render(<ProductCard product={mockProduct} uniformHeight={false} />)
    
    expect(screen.queryByText('BEST')).not.toBeInTheDocument()
  })

  it('displays BEST badge when product is best seller', () => {
    const bestSellerProduct = {
      ...mockProduct,
      isBestSeller: true
    }
    
    render(<ProductCard product={bestSellerProduct} uniformHeight={false} />)
    
    expect(screen.getByText('BEST')).toBeInTheDocument()
  })
})