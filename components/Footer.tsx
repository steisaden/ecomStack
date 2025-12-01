'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { createHybrid, createButton } from '@/lib/cecred-design'
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  Heart,
  Linkedin,
  Youtube
} from 'lucide-react'
import { useGlobalSettingsWithFallback } from '@/context/GlobalSettingsContext'
import { FooterModalManager, type ModalType } from './FooterModalManager'

import { GlobalSettings } from '@/lib/types'
import type { SocialLink as GlobalSocialLink, ContactInfo as GlobalContactInfo, FooterSection as GlobalFooterSection } from '@/lib/types'

interface SocialLink {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  external?: boolean
}

interface FooterSection {
  id: string
  title: string
  links: Array<{
    id: string
    label: string
    href: string
    external?: boolean
  }>
}

interface FooterProps {
  className?: string
}

// Patreon icon component
const PatreonIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 4.36 20.136.48 15.385.48z"/>
  </svg>
)

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

// Pinterest icon component  
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
  </svg>
)

const createSocialLinksFromGlobalSettings = (globalSocialLinks: GlobalSocialLink[]): SocialLink[] => {
  const iconMap: Record<string, React.ReactNode> = {
    facebook: <Facebook className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
    tiktok: <TikTokIcon className="w-5 h-5" />,
    pinterest: <PinterestIcon className="w-5 h-5" />,
    patreon: <PatreonIcon className="w-5 h-5" />
  }
  
  return globalSocialLinks.map((link, index) => ({
    id: `social-${index}`,
    label: link.platform.charAt(0).toUpperCase() + link.platform.slice(1),
    href: link.url,
    icon: iconMap[link.platform.toLowerCase()] || <ExternalLink className="w-5 h-5" />,
    external: true
  }))
}

const transformGlobalFooterSections = (globalSections: GlobalFooterSection[]): FooterSection[] => {
  return globalSections
    .sort((a, b) => a.order - b.order)
    .map((section, index) => ({
      id: `footer-section-${index}`,
      title: section.title,
      links: section.links.map((link, linkIndex) => ({
        id: `footer-link-${index}-${linkIndex}`,
        label: link.label,
        href: link.href,
        external: link.external || false
      }))
    }))
}

// Links that should open modals instead of navigating to pages
const modalLinks: Record<string, ModalType> = {
  '/shipping': 'shipping',
  '/returns': 'returns',
  '/faq': 'faq',
  '/support': 'support',
  '/contact': 'contact',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/cookies': 'cookies'
}

const getDefaultFooterSections = (): FooterSection[] => [
  {
    id: 'quick-links',
    title: 'Quick Links',
    links: [
      { id: 'products', label: 'Products', href: '/products' },
      { id: 'blog', label: 'Blog', href: '/blog' },
      { id: 'about', label: 'About', href: '/about' },
      { id: 'contact', label: 'Contact', href: '/contact' }
    ]
  },
  {
    id: 'customer-care',
    title: 'Customer Care',
    links: [
      { id: 'shipping', label: 'Shipping Info', href: '/shipping' },
      { id: 'returns', label: 'Returns', href: '/returns' },
      { id: 'faq', label: 'FAQ', href: '/faq' },
      { id: 'support', label: 'Support', href: '/support' }
    ]
  }
]

export default function Footer({ className }: FooterProps) {
  const prefersReducedMotion = useReducedMotion()
  const globalSettings = useGlobalSettingsWithFallback()
  
  // Transform global settings data for component use
  const contactInfo = globalSettings.contactInfo
  const socialLinks = createSocialLinksFromGlobalSettings(globalSettings.socialLinks)
  const footerSections = globalSettings.footerSections.length > 0 
    ? transformGlobalFooterSections(globalSettings.footerSections)
    : getDefaultFooterSections()
  const copyrightText = globalSettings.copyrightText
  const siteTitle = globalSettings.siteTitle

  const handleLinkClick = (href: string, external: boolean, openModal: (type: ModalType) => void) => {
    // Check if this link should open a modal
    if (modalLinks[href]) {
      openModal(modalLinks[href])
      return
    }
    
    // Handle external links
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
    
    // Handle regular navigation
    window.location.href = href
  }

  const handleContactClick = (type: 'email' | 'phone', value: string) => {
    if (type === 'email') {
      window.location.href = `mailto:${value}`
    } else if (type === 'phone') {
      window.location.href = `tel:${value}`
    }
  }

  const handleSocialClick = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = href
    }
  }

  return (
    <FooterModalManager>
      {(openModal) => (
        <footer className={cn(
          "bg-gradient-to-br from-neutral-50 to-primary-50/30",
          createHybrid('blog', 'border-t border-primary-200/20 shadow-lg'),
          className
        )}>
          <div className="container">
            <div className="py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand and Contact Section */}
            <div className="md:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block" aria-label={`${siteTitle} Home`}>
                <Image
                  src="/images/GoddessLogo.jpg"
                  alt={`${siteTitle} logo`}
                  width={360}
                  height={128}
                  className="h-20 w-auto object-contain"
                  priority
                />
              </Link>
              <p className="text-body text-darkGray max-w-md mb-6 leading-relaxed">
                Handcrafted with love, our premium oils and beauty essentials are designed to nourish your natural radiance.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-3">
                {contactInfo.email && (
                  <button
                    onClick={() => handleContactClick('email', contactInfo.email!)}
                    className={cn(
                      "flex items-center text-darkGray hover:text-primary group -mx-2 px-2 py-1 rounded-md",
                      prefersReducedMotion 
                        ? "transition-colors duration-200" 
                        : "transition-all duration-300 hover:translate-x-1"
                    )}
                    aria-label={`Send email to ${contactInfo.email}`}
                  >
                    <Mail className={cn(
                      "w-4 h-4 mr-3 text-gray group-hover:text-primary",
                      prefersReducedMotion 
                        ? "transition-colors duration-200" 
                        : "transition-all duration-300 group-hover:scale-110"
                    )} />
                    <span className="text-sm relative">
                      {contactInfo.email}
                      {!prefersReducedMotion && (
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                      )}
                    </span>
                  </button>
                )}
                
                {contactInfo.phone && (
                  <button
                    onClick={() => handleContactClick('phone', contactInfo.phone!)}
                    className={cn(
                      "flex items-center text-darkGray hover:text-black group -mx-2 px-2 py-1 rounded-md",
                      prefersReducedMotion 
                        ? "transition-colors duration-200" 
                        : "transition-all duration-300 hover:translate-x-1"
                    )}
                    aria-label={`Call ${contactInfo.phone}`}
                  >
                    <Phone className={cn(
                      "w-4 h-4 mr-3 text-gray group-hover:text-primary",
                      prefersReducedMotion 
                        ? "transition-colors duration-200" 
                        : "transition-all duration-300 group-hover:scale-110"
                    )} />
                    <span className="text-sm relative">
                      {contactInfo.phone}
                      {!prefersReducedMotion && (
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                      )}
                    </span>
                  </button>
                )}
                
                {contactInfo.address && (
                  <div className="flex items-start text-darkGray group">
                    <MapPin className="w-4 h-4 mr-3 text-gray mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{contactInfo.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Sections */}
            {footerSections.map((section) => (
              <div key={section.id} className="lg:col-span-1">
                <h4 className="text-sm font-heading font-semibold text-primary mb-4 tracking-wide uppercase">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      {modalLinks[link.href] || link.external ? (
                        <button
                          onClick={() => handleLinkClick(link.href, link.external || false, openModal)}
                          className={cn(
                            "text-darkGray hover:text-black flex items-center group text-left",
                            prefersReducedMotion 
                              ? "transition-colors duration-200" 
                              : "transition-all duration-300 hover:translate-x-1"
                          )}
                        >
                          <span className="relative">
                            {link.label}
                            {!prefersReducedMotion && (
                              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            )}
                          </span>
                          {link.external && (
                            <ExternalLink className={cn(
                              "w-3 h-3 ml-1 opacity-0 group-hover:opacity-100",
                              prefersReducedMotion 
                                ? "transition-opacity duration-200" 
                                : "transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-110"
                            )} />
                          )}
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className={cn(
                            "text-darkGray hover:text-black relative group",
                            prefersReducedMotion 
                              ? "transition-colors duration-200" 
                              : "transition-all duration-300 hover:translate-x-1"
                          )}
                        >
                          <span className="relative">
                            {link.label}
                            {!prefersReducedMotion && (
                              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            )}
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Social Media Section - Mobile: Full width, Desktop: Last column */}
            <div className="md:col-span-2 lg:col-span-1">
              <h4 className="text-sm font-heading font-semibold text-primary mb-4 tracking-wide uppercase">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <button
                    key={social.id}
                    onClick={() => handleSocialClick(social.href, social.external)}
                    className={cn(
                      "text-gray hover:text-primary p-2 rounded-full hover:bg-gray-100",
                      prefersReducedMotion 
                        ? "transition-colors duration-200" 
                        : "transition-all duration-300 hover:shadow-md hover:scale-110 hover:-translate-y-1 active:scale-95"
                    )}
                    aria-label={`Follow us on ${social.label}`}
                  >
                    <div className={prefersReducedMotion ? "" : "transition-transform duration-300 hover:rotate-12"}>
                      {social.icon}
                    </div>
                  </button>
                ))}
              </div>
              

            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-lightGray mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray text-center md:text-left">
                {copyrightText}
              </p>
              
              {/* Legal Links */}
              <div className="flex space-x-6 text-sm">
                <button 
                  onClick={() => openModal('privacy')}
                  className="text-gray hover:text-darkGray transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => openModal('terms')}
                  className="text-gray hover:text-darkGray transition-colors"
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => openModal('cookies')}
                  className="text-gray hover:text-darkGray transition-colors"
                >
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
            </div>
          </div>
        </footer>
      )}
    </FooterModalManager>
  )
}