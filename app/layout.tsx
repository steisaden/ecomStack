import './globals.css'
import { inter, playfair_display } from '@/lib/fonts'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { globalSettingsService } from '@/lib/contentful'
import { GlobalSettings } from '@/lib/types'
import ResourcePreloader, { PerformanceHints } from '@/components/ResourcePreloader'

import { GlobalSettingsProvider } from '@/context/GlobalSettingsContext'
import { CartProvider } from '@/context/CartContext'
import { WebSiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData'
import { ClientToaster } from '@/components/ClientToaster'
import ClientHead from '@/components/ClientHead'
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  // Centralized metadata generation logic
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    applicationName: 'Goddess Care Co',
    openGraph: {
      type: 'website',
      siteName: 'Goddess Care Co',
      title: 'Goddess Care Co',
      description: 'Premium handcrafted oils and beauty essentials for radiant skin and hair',
      images: ['/og.png']
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Goddess Care Co',
      description: 'Premium handcrafted oils and beauty essentials for radiant skin and hair',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch global settings server-side to provide as initial data
  let initialSettings: GlobalSettings | undefined = undefined
  try {
    initialSettings = await globalSettingsService.getSettingsWithFallback()
  } catch (error) {
    console.error('Error fetching initial global settings in layout:', error)
    // initialSettings remains undefined, provider will handle loading
  }

  return (
    <html lang="en" className={`${inter.variable} ${playfair_display.variable} font-body`}>
      <head>
        <WebSiteStructuredData globalSettings={initialSettings} />
        <OrganizationStructuredData globalSettings={initialSettings} />
        <PerformanceHints />
      </head>
      <ClientHead />
      <body className="relative min-h-screen text-gray-900 bg-mint-25" style={{ isolation: 'isolate' }} suppressHydrationWarning>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ResourcePreloader />
        <GlobalSettingsProvider initialSettings={initialSettings}>
          <CartProvider>
            <Header />

            {/* Main Content */}
            <main id="main-content" className="min-h-screen">
              {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Toast Notifications */}
            <ClientToaster />
          </CartProvider>
        </GlobalSettingsProvider>
      </body>
    </html>
  )
}
