
import { cn } from "@/lib/utils"
import { Loader2, Settings } from "lucide-react"

interface LoadingSpinnerProps {
  size?: number | string
  color?: string
  className?: string
  variant?: 'default' | 'global-settings' | 'inline'
  label?: string
}

export function LoadingSpinner({
  size = 24,
  color = "currentColor",
  className,
  variant = 'default',
  label = "Loading",
}: LoadingSpinnerProps) {
  if (variant === 'global-settings') {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8", className)}>
        <div className="relative">
          <Settings 
            className="animate-spin text-sage-600" 
            size={typeof size === 'number' ? size + 8 : size}
          />
          <div className="absolute inset-0 animate-pulse">
            <div className="w-full h-full rounded-full border-2 border-sage-200 border-t-sage-600 animate-spin" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3 animate-pulse">
          Loading site settings...
        </p>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2
          className="animate-spin text-sage-600"
          size={16}
          role="progressbar"
          aria-label={label}
        />
        <span className="text-sm text-gray-600">{label}...</span>
      </div>
    )
  }

  // Default variant
  return (
    <Loader2
      className={cn("animate-spin", className)}
      size={size}
      color={color}
      role="progressbar"
      aria-label={label}
    />
  )
}

/**
 * Specialized loading spinner for global settings context
 * Shows a settings icon with loading animation
 */
export function GlobalSettingsSpinner({ 
  className,
  message = "Loading settings"
}: { 
  className?: string
  message?: string 
}) {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className="text-center">
        <div className="relative inline-block mb-2">
          <Settings className="w-8 h-8 text-sage-600 animate-spin" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-600 animate-pulse">{message}...</p>
      </div>
    </div>
  )
}
