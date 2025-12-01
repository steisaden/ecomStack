import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to convert a string to a URL-friendly slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

// Helper to get base URL for API calls, handling both client and server environments
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin
  }
  
  // Server-side - use environment variable or default to localhost
  return process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.VERCEL_URL ? 
         `https://${process.env.VERCEL_URL}` : 
         'http://localhost:3000'
}