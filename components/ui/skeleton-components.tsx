import React from 'react'
import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

/**
 * Comprehensive error display component for global settings failures
 * Provides different error states and recovery options
 */
export function GlobalSettingsErrorDisplay({ 
  error,
  onRetry,
  variant = 'full'
}: { 
  error: Error
  onRetry?: () => void
  variant?: 'full' | 'inline' | 'minimal'
}) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-lightGray rounded-md p-2">
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>Settings unavailable</span>
        <button 
          onClick={handleRetry}
          className="text-sage-600 hover:text-sage-700 underline ml-2"
        >
          Retry
        </button>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800 mb-1">
              Settings temporarily unavailable
            </h3>
            <p className="text-sm text-amber-700 mb-3">
              Using default settings. Some features may be limited.
            </p>
            <button 
              onClick={handleRetry}
              className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded transition-colors"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Full variant (default)
  return <GlobalSettingsErrorFallback error={error} onRetry={onRetry} />
}

/**
 * Header skeleton component for loading states
 * Shows placeholder elements while global settings are loading
 * Matches the actual Header component structure for seamless loading experience
 */
export function HeaderSkeleton({ className }: { className?: string }) {
  return (
    <header data-testid="header-skeleton" className={cn(
      "header-retreat z-50 bg-gradient-to-r from-retreat-100 via-lavender-50 to-sage-50 border-b border-retreat-200",
      className
    )}>
      <div className="container">
        <nav className="flex items-center justify-between py-4 sm:py-6 lg:py-8" role="navigation" aria-label="Loading navigation">
          {/* Logo skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="h-8 w-32 sm:h-10 sm:w-36" />
          </div>
          
          {/* Desktop navigation skeleton */}
          <div className="hidden md:flex items-center space-x-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
          
          {/* Mobile menu button skeleton */}
          <div className="md:hidden">
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </nav>
      </div>
    </header>
  )
}

/**
 * Footer skeleton component for loading states
 * Shows placeholder elements while global settings are loading
 * Matches the actual Footer component structure for seamless loading experience
 */
export function FooterSkeleton({ className }: { className?: string }) {
  return (
    <footer className={cn(
      "bg-lightGray border-t border-gray-100",
      className
    )}>
      <div className="container">
        <div className="py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand and Contact Section */}
            <div className="md:col-span-2 lg:col-span-1">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full max-w-md mb-6" />
              <Skeleton className="h-4 w-full max-w-md mb-6" />
              
              {/* Contact Information skeleton */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Skeleton className="w-4 h-4 mr-3 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="w-4 h-4 mr-3 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-start">
                  <Skeleton className="w-4 h-4 mr-3 mt-0.5 rounded-full" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
            </div>

            {/* Additional Sections */}
            {[1, 2].map((section) => (
              <div key={section} className="lg:col-span-1">
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((link) => (
                    <Skeleton key={link} className="h-4 w-20" />
                  ))}
                </div>
              </div>
            ))}

            {/* Social Media Section */}
            <div className="md:col-span-2 lg:col-span-1">
              <Skeleton className="h-4 w-20 mb-4" />
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((social) => (
                  <Skeleton key={social} className="h-8 w-8 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <Skeleton className="h-4 w-64" />
              
              {/* Legal Links */}
              <div className="flex space-x-6">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-4 w-16" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/**
 * Navigation skeleton for mobile menu
 */
export function NavigationSkeleton() {
  return (
    <nav className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </nav>
  )
}

/**
 * Hero section skeleton for homepage loading
 */
export function HeroSkeleton() {
  return (
    <section className="relative bg-gray-100 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Hero title skeleton */}
          <Skeleton className="h-12 w-96 mx-auto mb-6" />
          
          {/* Hero subtitle skeleton */}
          <Skeleton className="h-6 w-64 mx-auto mb-8" />
          
          {/* CTA buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Social links skeleton
 */
export function SocialLinksSkeleton() {
  return (
    <div className="flex space-x-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-8 w-8 rounded-full" />
      ))}
    </div>
  )
}

/**
 * Contact info skeleton
 */
export function ContactInfoSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-56" />
    </div>
  )
}

/**
 * Logo skeleton
 */
export function LogoSkeleton() {
  return <Skeleton className="h-8 w-32" />
}

/**
 * Default fallback component for error states
 * Displays when global settings fail to load completely
 * Provides graceful degradation with retry functionality
 */
export function GlobalSettingsErrorFallback({ 
  error,
  onRetry 
}: { 
  error?: Error
  onRetry?: () => void 
}) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-retreat-100 via-lavender-50 to-sage-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-sage-100 to-lavender-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="h-8 w-8 text-sage-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Settings Temporarily Unavailable
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We&apos;re having trouble loading the site settings. The site is still functional with default settings.
          </p>
        </div>
        
        {error && (
          <details className="text-left text-sm text-gray-500 mb-6 bg-lightGray rounded-lg p-4">
            <summary className="cursor-pointer font-medium hover:text-gray-700 transition-colors">
              Technical Details
            </summary>
            <pre className="mt-3 p-3 bg-white rounded text-xs overflow-auto border border-gray-200 font-mono">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={handleRetry}
            className="btn-primary-retreat flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-secondary-retreat"
          >
            Continue to Site
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  )
}

/**
 * Loading indicator for global settings dependent components
 * Shows a subtle loading state while settings are being fetched
 */
export function GlobalSettingsLoadingIndicator({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-sage-200 border-t-sage-600",
        sizeClasses[size]
      )} />
    </div>
  )
}

/**
 * Inline loading state for components that depend on global settings
 * Provides a seamless loading experience without layout shift
 */
export function InlineGlobalSettingsLoader({ 
  loading,
  error,
  children,
  fallback,
  errorFallback
}: {
  loading: boolean
  error?: Error | null
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}) {
  if (error && errorFallback) {
    return <>{errorFallback}</>
  }
  
  if (loading) {
    return fallback ? <>{fallback}</> : <GlobalSettingsLoadingIndicator />
  }
  
  return <>{children}</>
}

/**
 * Generic loading state for global settings dependent components
 * Enhanced with better animation and accessibility
 */
export function GlobalSettingsLoadingSkeleton({ 
  children, 
  loading,
  className 
}: { 
  children: React.ReactNode
  loading: boolean
  className?: string 
}) {
  if (loading) {
    return (
      <div className={cn("animate-pulse", className)} role="status" aria-label="Loading">
        {children}
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
  
  return <>{children}</>
}

/**
 * Page-level loading skeleton for when entire page depends on global settings
 * Provides a complete page structure while settings load
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-retreat-100 via-lavender-50 to-sage-50">
      <HeaderSkeleton />
      
      <main className="container py-16">
        {/* Hero section skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-96 mx-auto mb-6" />
          <Skeleton className="h-6 w-64 mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
        
        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <Skeleton className="h-48 w-full mb-4 rounded" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </main>
      
      <FooterSkeleton />
    </div>
  )
}