
import React, { Component, ErrorInfo, ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      // Fallback UI if an error occurs
      return (
        <div className="flex items-center justify-center min-h-[300px] p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md w-full" role="alert">
            <strong className="font-bold">Something went wrong!</strong>
            <span className="block sm:inline"> {this.state.error?.message || "An unexpected error has occurred."}</span>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 p-2 bg-red-900/20 rounded-md text-xs overflow-auto text-red-700">
                <code>{this.state.error.stack}</code>
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
