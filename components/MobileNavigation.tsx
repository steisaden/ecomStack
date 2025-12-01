'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { createGlassEffect } from '@/lib/glass-morphism'
import { 
  mobileMenuVariants, 
  fadeLeftVariants, 
  staggerContainer,
  staggerItem 
} from '@/lib/animations'

interface NavigationItem {
  id: string
  label: string
  href: string
  external?: boolean
  disabled?: boolean
  order: number
  children?: NavigationItem[]
}

interface MobileNavigationProps {
  items: NavigationItem[]
  className?: string
}

export default function MobileNavigation({ items, className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  // Filter out disabled items (should already be filtered in Header, but double-check)
  const enabledItems = items.filter(item => !item.disabled)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
    setExpandedItems(new Set())
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={cn('md:hidden', className)}>
      {/* Mobile menu button with glassmorphism */}
      <motion.button
        className={cn(
          createGlassEffect('light', 'p-3 rounded-xl hover:backdrop-blur-md hover:bg-white/30'),
          "text-sage-700 hover:text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 touch-manipulation transition-all duration-300"
        )}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div 
          className="relative"
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>

      {/* Mobile Navigation Overlay with glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Glassmorphism backdrop */}
            <motion.div 
              className={createGlassEffect('heavy', 'fixed inset-0 bg-black/40')}
              onClick={toggleMenu}
              aria-hidden="true"
              initial={{ backdropFilter: "blur(0px)" }}
              animate={{ backdropFilter: "blur(12px)" }}
              exit={{ backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Mobile menu panel with enhanced glassmorphism */}
            <motion.div 
              className={cn(
                "fixed top-0 right-0 h-full w-80 max-w-[85vw] shadow-2xl",
                createGlassEffect('heavy', 'border-l border-white/30 bg-white/95 backdrop-blur-xl')
              )}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
            >
              <div className="flex flex-col h-full">
                {/* Mobile menu header with glassmorphism */}
                <motion.div 
                  className={cn(
                    "flex items-center justify-between p-6 border-b border-white/20",
                    createGlassEffect('sage', '')
                  )}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 id="mobile-menu-title" className="text-sm font-semibold text-gray-900">
                    Navigation
                  </h2>
                  <motion.button
                    onClick={toggleMenu}
                    className={cn(
                      createGlassEffect('light', 'p-2 rounded-lg hover:backdrop-blur-md hover:bg-gray/20'),
                      "text-gray-700 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 touch-manipulation"
                    )}
                    aria-label="Close navigation menu"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </motion.button>
                </motion.div>
                
                {/* Mobile navigation links with staggered animations */}
                <nav className="flex-1 overflow-y-auto" id="mobile-menu" aria-label="Mobile navigation">
                  <motion.div 
                    className="px-4 py-6 space-y-2"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {enabledItems.map((item, index) => (
                      <motion.div key={item.id} variants={staggerItem}>
                        {item.children && item.children.length > 0 ? (
                          // Navigation item with children
                          <div>
                            <motion.button
                              onClick={() => toggleExpanded(item.id)}
                              className={cn(
                                'flex items-center justify-between w-full py-3 px-4 text-left text-sm font-medium rounded-xl transition-all duration-300 touch-manipulation',
                                createGlassEffect('light', 'hover:backdrop-blur-md hover:bg-white/30'),
                                isActiveLink(item.href)
                                  ? createGlassEffect('sage', 'shadow-glow-green font-semibold')
                                  : 'text-gray-700 hover:text-gray-900'
                              )}
                              aria-expanded={expandedItems.has(item.id)}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>{item.label}</span>
                              <motion.div
                                animate={{ rotate: expandedItems.has(item.id) ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                              </motion.div>
                            </motion.button>
                            
                            {/* Submenu with glassmorphism */}
                            <AnimatePresence>
                              {expandedItems.has(item.id) && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-4 pt-2 space-y-1">
                                    <motion.div
                                      whileHover={{ scale: 1.02, x: 2 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Link
                                        href={item.href}
                                        className={cn(
                                          'block py-2 px-4 text-xs font-medium rounded-lg transition-all duration-300',
                                          createGlassEffect('light', 'hover:backdrop-blur-sm hover:bg-white/20'),
                                          isActiveLink(item.href)
                                            ? createGlassEffect('sage', 'shadow-glow-green font-semibold')
                                            : 'text-gray-600 hover:text-gray-800'
                                        )}
                                        {...(item.external && {
                                          target: '_blank',
                                          rel: 'noopener noreferrer'
                                        })}
                                      >
                                        View All {item.label}
                                      </Link>
                                    </motion.div>
                                    
                                    {item.children?.filter(child => !child.disabled).map((child) => (
                                      <motion.div
                                        key={child.id}
                                        whileHover={{ scale: 1.02, x: 2 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <Link
                                          href={child.href}
                                          className={cn(
                                            'block py-2 px-4 text-xs rounded-lg transition-all duration-300',
                                            createGlassEffect('light', 'hover:backdrop-blur-sm hover:bg-white/20'),
                                            isActiveLink(child.href)
                                              ? createGlassEffect('sage', 'shadow-glow-green font-medium')
                                              : 'text-gray-600 hover:text-gray-800'
                                          )}
                                          {...(child.external && {
                                            target: '_blank',
                                            rel: 'noopener noreferrer'
                                          })}
                                        >
                                          {child.label}
                                        </Link>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          // Simple navigation link
                          <motion.div
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                'block py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 touch-manipulation',
                                createGlassEffect('light', 'hover:backdrop-blur-md hover:bg-white/30'),
                                isActiveLink(item.href)
                                  ? createGlassEffect('sage', 'shadow-glow-green border-l-4 border-sage-600 font-semibold')
                                  : 'text-gray-700 hover:text-gray-900'
                              )}
                              {...(item.external && {
                                target: '_blank',
                                rel: 'noopener noreferrer'
                              })}
                            >
                              {item.label}
                            </Link>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                    
                    {/* Yoga booking link */}
                    <motion.div variants={staggerItem}>
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href="/yoga-booking"
                          className={cn(
                            'block py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 touch-manipulation',
                            createGlassEffect('light', 'hover:backdrop-blur-md hover:bg-white/30'),
                            isActiveLink('/yoga-booking')
                              ? createGlassEffect('sage', 'shadow-glow-green border-l-4 border-sage-600 font-semibold')
                              : 'text-gray-700 hover:text-gray-900'
                          )}
                        >
                          Yoga
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}