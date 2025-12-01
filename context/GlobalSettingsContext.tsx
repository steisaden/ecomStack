'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, Component, ErrorInfo } from 'react'
import type { GlobalSettings } from '@/lib/types'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/types'
import { GlobalSettingsErrorFallback } from '@/components/ui/skeleton-components'

// Context value interface
export interface GlobalSettingsContextValue {
  settings: GlobalSettings | null
  loading: boolean
  error: Error | null
  revalidate: () => Promise<void>
}

// Create the context
const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(null)

// Provider props interface
interface GlobalSettingsProviderProps {
  children: ReactNode
  initialSettings?: GlobalSettings
}

// Error boundary state interface
interface GlobalSettingsErrorBoundaryState {
  hasError: boolean
  error?: Error
}

// Error boundary props interface
interface GlobalSettingsErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error?: Error }>
}

// Import the DefaultGlobalSettingsFallback from skeleton components
// This component is now defined in components/ui/skeleton-components.tsx

/**
 * Error boundary component for graceful error recovery
 * Catches errors in the global settings context and provides fallback UI
 */
export class GlobalSettingsErrorBoundary extends Component<
  GlobalSettingsErrorBoundaryProps,
  GlobalSettingsErrorBoundaryState
> {
  constructor(props: GlobalSettingsErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): GlobalSettingsErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and error reporting service
    console.error('Global Settings Error Boundary caught an error:', error, errorInfo)
    
    // Here you could send the error to an error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || GlobalSettingsErrorFallback
      return <FallbackComponent error={this.state.error} />
    }

    return this.props.children
  }
}

/**
 * Global Settings Provider Component
 * Manages global settings state and provides it to child components
 */
export function GlobalSettingsProvider({ children, initialSettings }: GlobalSettingsProviderProps) {
  const [settings, setSettings] = useState<GlobalSettings | null>(initialSettings || null)
  const [loading, setLoading] = useState(!initialSettings)
  const [error, setError] = useState<Error | null>(null)

  // Function to load settings (client-side fallback only)
  const loadSettings = async () => {
    if (loading) return;
    try {
      setLoading(true)
      setError(null)
      
      // For client-side, we'll rely on the initialSettings passed from server
      // If no initial settings, use defaults
      if (!initialSettings) {
        // Simulate network delay for loading state
        await new Promise(resolve => setTimeout(resolve, 100));
        setSettings(DEFAULT_GLOBAL_SETTINGS)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load global settings')
      setError(error)
      console.error('Error loading global settings:', error)
      
      // Set default settings as fallback
      setSettings(DEFAULT_GLOBAL_SETTINGS)
    } finally {
      setLoading(false)
    }
  }

  // Function to revalidate settings (client-side - triggers page refresh)
  const revalidate = async () => {
    try {
      // For client-side revalidation, we'll trigger a page refresh
      // In a real implementation, you might call an API route
      window.location.reload()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to revalidate global settings')
      setError(error)
      console.error('Error revalidating global settings:', error)
    }
  }

  // Load settings on mount if not provided initially
  useEffect(() => {
    if (!initialSettings) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [initialSettings]);

  // Context value
  const contextValue: GlobalSettingsContextValue = {
    settings,
    loading,
    error,
    revalidate
  }

  return (
    <GlobalSettingsContext.Provider value={contextValue}>
      {children}
    </GlobalSettingsContext.Provider>
  )
}

/**
 * Custom hook for consuming global settings
 * Provides type-safe access to global settings context
 */
export function useGlobalSettings(): GlobalSettingsContextValue {
  const context = useContext(GlobalSettingsContext)
  
  if (!context) {
    throw new Error('useGlobalSettings must be used within a GlobalSettingsProvider')
  }
  
  return context
}

/**
 * Hook for accessing settings with guaranteed non-null return
 * Returns default settings if actual settings are not available
 */
export function useGlobalSettingsWithFallback(): GlobalSettings {
  const { settings, loading } = useGlobalSettings()
  
  // Return settings if available, otherwise return defaults
  if (settings) {
    return settings
  }
  
  // If still loading, return defaults to prevent null reference errors
  if (loading) {
    return DEFAULT_GLOBAL_SETTINGS
  }
  
  // Fallback to defaults
  return DEFAULT_GLOBAL_SETTINGS
}

/**
 * Hook for accessing specific parts of global settings
 * Useful for components that only need certain settings
 */
export function useGlobalSettingsSelector<T>(
  selector: (settings: GlobalSettings) => T
): T {
  const settings = useGlobalSettingsWithFallback()
  return selector(settings)
}

// Convenience hooks for common settings
export function useSiteTitle(): string {
  return useGlobalSettingsSelector(settings => settings.siteTitle)
}

export function useNavigation() {
  return useGlobalSettingsSelector(settings => settings.navigation)
}

export function useSocialLinks() {
  return useGlobalSettingsSelector(settings => settings.socialLinks)
}

export function useContactInfo() {
  return useGlobalSettingsSelector(settings => settings.contactInfo)
}

export function useHeroContent() {
  return useGlobalSettingsSelector(settings => settings.heroContent)
}

export function useFooterSections() {
  return useGlobalSettingsSelector(settings => settings.footerSections)
}