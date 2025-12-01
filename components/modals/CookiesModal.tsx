"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Cookie, Settings, Eye, BarChart3, Target } from "lucide-react"
import { useState } from "react"

interface CookiesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CookiesModal({ open, onOpenChange }: CookiesModalProps) {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    marketing: true,
    functional: true
  })

  const handlePreferenceChange = (type: keyof typeof preferences, value: boolean) => {
    if (type === 'essential') return // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [type]: value }))
  }

  const handleSavePreferences = () => {
    // Save preferences to localStorage or send to server
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences))
    console.log('Cookie preferences saved:', preferences)
    onOpenChange(false)
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    setPreferences(allAccepted)
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted))
    onOpenChange(false)
  }

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    setPreferences(essentialOnly)
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly))
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <Cookie className="w-5 h-5 text-beauty-primary" />
            Cookie Policy & Preferences
          </ModalTitle>
          <ModalDescription>
            Manage your cookie preferences and learn how we use cookies to improve your experience.
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-6 mt-4">
          {/* What are Cookies */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">What are Cookies?</h3>
            <div className="bg-beauty-light/20 rounded-lg p-4">
              <p className="text-beauty-muted text-sm leading-relaxed">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better browsing experience by remembering your preferences, 
                analyzing how you use our site, and personalizing content and advertisements.
              </p>
            </div>
          </div>

          {/* Cookie Categories */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-beauty-primary" />
              Cookie Categories & Preferences
            </h3>
            
            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="border border-beauty-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-beauty-dark">Essential Cookies</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Always Active</span>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-beauty-muted text-sm mb-2">
                  These cookies are necessary for the website to function properly. They enable core functionality 
                  such as security, network management, and accessibility.
                </p>
                <div className="text-xs text-beauty-muted">
                  <strong>Examples:</strong> Session management, security tokens, load balancing
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-beauty-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-beauty-dark">Analytics Cookies</h4>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('analytics', !preferences.analytics)}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? 'bg-beauty-primary justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
                <p className="text-beauty-muted text-sm mb-2">
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously.
                </p>
                <div className="text-xs text-beauty-muted">
                  <strong>Examples:</strong> Google Analytics, page views, bounce rate, traffic sources
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-beauty-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-beauty-dark">Marketing Cookies</h4>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('marketing', !preferences.marketing)}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? 'bg-beauty-primary justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
                <p className="text-beauty-muted text-sm mb-2">
                  These cookies are used to deliver advertisements more relevant to you and your interests. 
                  They also help limit the number of times you see an advertisement.
                </p>
                <div className="text-xs text-beauty-muted">
                  <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting campaigns
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="border border-beauty-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-beauty-dark">Functional Cookies</h4>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('functional', !preferences.functional)}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.functional ? 'bg-beauty-primary justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
                <p className="text-beauty-muted text-sm mb-2">
                  These cookies enable enhanced functionality and personalization, such as remembering 
                  your preferences and providing personalized content.
                </p>
                <div className="text-xs text-beauty-muted">
                  <strong>Examples:</strong> Language preferences, shopping cart contents, chat widgets
                </div>
              </div>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Third-Party Cookies</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-3">
                Some cookies are set by third-party services that appear on our pages. We use the following third-party services:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded p-3">
                  <h4 className="font-medium text-yellow-900 mb-1">Google Analytics</h4>
                  <p className="text-yellow-800">Website traffic analysis and user behavior tracking</p>
                </div>
                <div className="bg-white rounded p-3">
                  <h4 className="font-medium text-yellow-900 mb-1">Facebook Pixel</h4>
                  <p className="text-yellow-800">Conversion tracking and targeted advertising</p>
                </div>
                <div className="bg-white rounded p-3">
                  <h4 className="font-medium text-yellow-900 mb-1">Stripe</h4>
                  <p className="text-yellow-800">Secure payment processing and fraud prevention</p>
                </div>
                <div className="bg-white rounded p-3">
                  <h4 className="font-medium text-yellow-900 mb-1">Mailchimp</h4>
                  <p className="text-yellow-800">Email marketing and newsletter management</p>
                </div>
              </div>
            </div>
          </div>

          {/* Managing Cookies */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Managing Your Cookies</h3>
            <div className="space-y-3">
              <div className="border border-beauty-light rounded-lg p-4">
                <h4 className="font-medium text-beauty-dark mb-2">Browser Settings</h4>
                <p className="text-beauty-muted text-sm">
                  You can control and delete cookies through your browser settings. Please note that removing 
                  or blocking cookies may impact your user experience and some features may not work properly.
                </p>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-4">
                <h4 className="font-medium text-beauty-dark mb-2">Opt-Out Links</h4>
                <div className="space-y-1 text-sm">
                  <p><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-beauty-primary hover:underline">Google Analytics Opt-out</a></p>
                  <p><a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer" className="text-beauty-primary hover:underline">Facebook Ad Preferences</a></p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-beauty-light">
            <Button 
              onClick={handleAcceptAll}
              className="flex-1 bg-beauty-primary hover:bg-beauty-primary/90"
            >
              Accept All Cookies
            </Button>
            <Button 
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1"
            >
              Reject Non-Essential
            </Button>
            <Button 
              onClick={handleSavePreferences}
              variant="outline"
              className="flex-1"
            >
              Save Preferences
            </Button>
          </div>

          {/* Last Updated */}
          <div className="text-center text-xs text-beauty-muted pt-2 border-t border-beauty-light">
            Last updated: January 2024 • <a href="/privacy" className="text-beauty-primary hover:underline">Privacy Policy</a>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}