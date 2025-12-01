'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { createGlassEffect } from '@/lib/glass-morphism'
import { 
  navItemVariants, 
  fadeDownVariants, 
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

interface DesktopNavigationProps {
  items: NavigationItem[]
  className?: string
}

export default function DesktopNavigation({ items, className }: DesktopNavigationProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Filter out disabled items (should already be filtered in Header, but double-check)
  const enabledItems = items.filter(item => !item.disabled)

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn('hidden md:flex', className)}
    >
      <NavigationMenu>
        <NavigationMenuList>
          {enabledItems.map((item, index) => (
            <motion.div key={item.id} variants={staggerItem}>
              <NavigationMenuItem>
                {item.children && item.children.length > 0 ? (
                  // Navigation item with dropdown
                  <>
                    <NavigationMenuTrigger
                      className={cn(
                        navigationMenuTriggerStyle(),
                        createGlassEffect('light', 'border-0 hover:backdrop-blur-md hover:bg-white/20'),
                        'transition-all duration-300 hover:shadow-glass hover:scale-105 hover:-translate-y-1',
                        'relative group overflow-hidden',
                        isActiveLink(item.href) && createGlassEffect('sage', 'shadow-glow-green font-medium')
                      )}
                    >
                      <span className="relative z-10 text-sage-700 font-medium text-xs">{item.label}</span>
                      
                      {/* Glassmorphism hover overlay */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-sage-500/10 via-white/20 to-beauty-500/10 opacity-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "300%" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </NavigationMenuTrigger>
                    
                    <NavigationMenuContent>
                      <motion.div 
                        className={cn(
                          "grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]",
                          createGlassEffect('medium', 'border shadow-glass')
                        )}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="row-span-3">
                          <NavigationMenuLink asChild>
                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link
                                className={cn(
                                  "flex h-full w-full select-none flex-col justify-end rounded-xl p-6 no-underline outline-none focus:shadow-md",
                                  createGlassEffect('sage', 'hover:shadow-glow-green transition-all duration-300')
                                )}
                                href={item.href}
                              >
                                <div className="mb-2 mt-4 text-sm font-semibold text-sage-800">
                                  {item.label}
                                </div>
                                <p className="text-xs leading-tight text-sage-600 font-medium">
                                  Explore our {item.label.toLowerCase()} section
                                </p>
                              </Link>
                            </motion.div>
                          </NavigationMenuLink>
                        </div>
                        
                        <div className="grid gap-2">
                          {item.children?.filter(child => !child.disabled).map((child, childIndex) => (
                            <motion.div
                              key={child.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: childIndex * 0.05 }}
                            >
                              <NavigationMenuLink asChild>
                                <motion.div
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Link
                                    href={child.href}
                                    className={cn(
                                      "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300",
                                      createGlassEffect('light', 'hover:backdrop-blur-md hover:bg-white/30'),
                                      'hover:shadow-glass hover:text-sage-700',
                                      isActiveLink(child.href) && createGlassEffect('sage', 'shadow-glow-green font-medium')
                                    )}
                                    {...(child.external && {
                                      target: '_blank',
                                      rel: 'noopener noreferrer'
                                    })}
                                  >
                                    <div className="text-xs font-medium leading-none text-sage-700">
                                      {child.label}
                                    </div>
                                  </Link>
                                </motion.div>
                              </NavigationMenuLink>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  // Simple navigation link
                  <NavigationMenuLink asChild>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          createGlassEffect('light', 'border-0 hover:backdrop-blur-md hover:bg-white/20'),
                          'transition-all duration-300 hover:shadow-glass relative group overflow-hidden',
                          isActiveLink(item.href) && createGlassEffect('sage', 'shadow-glow-green font-medium')
                        )}
                        {...(item.external && {
                          target: '_blank',
                          rel: 'noopener noreferrer'
                        })}
                      >
                        <span className="relative z-10 text-sage-700 font-medium text-xs">{item.label}</span>
                        
                        {/* Glassmorphism hover overlay */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-sage-500/10 via-white/20 to-beauty-500/10 opacity-0"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "300%" }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </Link>
                    </motion.div>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            </motion.div>
          ))}
          
          {/* Yoga booking link */}
          <motion.div variants={staggerItem}>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/yoga-booking"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      createGlassEffect('light', 'border-0 hover:backdrop-blur-md hover:bg-white/20'),
                      'transition-all duration-300 hover:shadow-glass relative group overflow-hidden',
                      isActiveLink('/yoga-booking') && createGlassEffect('sage', 'shadow-glow-green font-medium')
                    )}
                  >
                    <span className="relative z-10 text-sage-700 font-medium text-xs">Yoga</span>
                    
                    {/* Glassmorphism hover overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-sage-500/10 via-white/20 to-beauty-500/10 opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "300%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </Link>
                </motion.div>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </motion.div>
        </NavigationMenuList>
      </NavigationMenu>
    </motion.div>
  )
}