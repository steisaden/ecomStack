'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { 
  Menu, 
  X, 
  Search
} from 'lucide-react'

import Cart from '@/components/Cart'
import { SearchModal } from '@/components/modals/SearchModal'
import { useGlobalSettingsWithFallback } from '@/context/GlobalSettingsContext'

interface NavLink {
  id: string
  label: string
  href: string
}

const navLinks: NavLink[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'products', label: 'Products', href: '/products' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'yoga', label: 'Yoga', href: '/yoga' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const globalSettings = useGlobalSettingsWithFallback()
  const siteTitle = globalSettings.siteTitle || 'Goddess Care Co'
  const pathname = usePathname() || '/'

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="header-retreat sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b border-lightGray">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Home" className="inline-flex items-center" prefetch={false}>
              <Image
                src="/images/GoddessLogo.jpg"
                alt="Goddess Care Co logo"
                width={320}
                height={96}
                priority
                className="h-20 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8" aria-label="Primary">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'nav-link text-sm font-medium text-darkGray hover:text-primary transition-colors duration-200 tracking-wide',
                    prefersReducedMotion 
                      ? 'transition-colors duration-200' 
                      : 'transition-all duration-300 hover:translate-y-[-2px]',
                    isActive && 'text-primary underline-offset-8 underline decoration-2'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button 
              className={cn(
                "p-2 text-gray-600 hover:text-primary rounded-full",
                prefersReducedMotion 
                  ? "transition-colors duration-200" 
                  : "transition-all duration-300 hover:scale-110"
              )}
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Cart />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className={cn(
                "p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100",
                prefersReducedMotion 
                  ? "transition-colors duration-200" 
                  : "transition-all duration-300"
              )}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav 
            className={cn(
              "md:hidden absolute top-16 inset-x-0 bg-white border-t border-lightGray shadow-lg",
              prefersReducedMotion 
                ? "transition-opacity duration-200" 
                : "transition-all duration-300 ease-in-out"
            )}
            aria-label="Mobile primary"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="block px-3 py-2 text-base font-medium text-darkGray hover:text-primary hover:bg-lightGray rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t border-lightGray flex space-x-4">
                <button 
                  className={cn(
                    "p-2 text-gray-600 hover:text-primary rounded-full",
                    prefersReducedMotion 
                      ? "transition-colors duration-200" 
                      : "transition-all duration-300 hover:scale-110"
                  )}
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </button>
                <Cart />
              </div>
            </div>
          </nav>
        )}
      </div>
      
      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  )
}
