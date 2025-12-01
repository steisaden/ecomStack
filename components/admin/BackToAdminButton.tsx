'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BackToAdminButtonProps {
  href?: string
  className?: string
  onClick?: () => void
}

export function BackToAdminButton({ 
  href = '/admin', 
  className = '',
  onClick
}: BackToAdminButtonProps) {
  const baseClasses = "inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
  const combinedClasses = `${baseClasses} ${className}`.trim()

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={combinedClasses}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Admin Dashboard
      </button>
    )
  }

  return (
    <Link 
      href={href}
      className={combinedClasses}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Admin Dashboard
    </Link>
  )
}