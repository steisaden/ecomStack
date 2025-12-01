import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorDisplayProps {
  message?: string
  error?: Error
  onRetry?: () => void
}

export function ErrorDisplay({ message, error, onRetry }: ErrorDisplayProps) {
  const errorMessage = message || error?.message || 'An unexpected error occurred'

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-600 mb-4 max-w-md">
        {errorMessage}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )
}