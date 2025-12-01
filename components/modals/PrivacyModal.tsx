"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal"
import { Shield, Eye, Lock, UserCheck } from "lucide-react"

interface PrivacyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <Shield className="w-5 h-5 text-beauty-primary" />
            Privacy Policy
          </ModalTitle>
          <ModalDescription>
            Last updated: January 2024. Learn how we collect, use, and protect your personal information.
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-6 mt-4 text-sm">
          {/* Introduction */}
          <div>
            <p className="text-beauty-muted leading-relaxed">
              At Goddess Hair & Beauty, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
            </p>
          </div>

          {/* Information We Collect */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-beauty-primary" />
              Information We Collect
            </h3>
            <div className="space-y-4">
              <div className="border border-beauty-light rounded-lg p-4">
                <h4 className="font-medium text-beauty-dark mb-2">Personal Information</h4>
                <ul className="text-beauty-muted space-y-1 text-sm">
                  <li>• Name, email address, and phone number</li>
                  <li>• Billing and shipping addresses</li>
                  <li>• Payment information (processed securely by our payment providers)</li>
                  <li>• Account credentials and preferences</li>
                </ul>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-4">
                <h4 className="font-medium text-beauty-dark mb-2">Automatically Collected Information</h4>
                <ul className="text-beauty-muted space-y-1 text-sm">
                  <li>• IP address and browser information</li>
                  <li>• Device information and operating system</li>
                  <li>• Website usage patterns and preferences</li>
                  <li>• Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-beauty-primary" />
              How We Use Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-medium text-green-900 mb-1">Order Processing</h4>
                  <p className="text-green-800 text-xs">Process and fulfill your orders, handle payments, and provide customer service</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-1">Communication</h4>
                  <p className="text-blue-800 text-xs">Send order confirmations, shipping updates, and respond to inquiries</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="font-medium text-purple-900 mb-1">Personalization</h4>
                  <p className="text-purple-800 text-xs">Customize your shopping experience and recommend relevant products</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h4 className="font-medium text-orange-900 mb-1">Marketing</h4>
                  <p className="text-orange-800 text-xs">Send promotional emails and newsletters (with your consent)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-beauty-primary" />
              How We Protect Your Data
            </h3>
            <div className="bg-beauty-light/20 rounded-lg p-4">
              <ul className="text-beauty-muted space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span><strong>Encryption:</strong> All sensitive data is encrypted using industry-standard SSL/TLS protocols</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span><strong>Secure Storage:</strong> Personal information is stored on secure servers with restricted access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span><strong>Payment Security:</strong> We never store credit card information on our servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span><strong>Regular Audits:</strong> We conduct regular security audits and updates</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Your Privacy Rights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-beauty-light rounded-lg p-3">
                <h4 className="font-medium text-beauty-dark mb-1">Access & Correction</h4>
                <p className="text-beauty-muted text-xs">Request access to your personal data and correct any inaccuracies</p>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-3">
                <h4 className="font-medium text-beauty-dark mb-1">Data Deletion</h4>
                <p className="text-beauty-muted text-xs">Request deletion of your personal information (subject to legal requirements)</p>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-3">
                <h4 className="font-medium text-beauty-dark mb-1">Marketing Opt-out</h4>
                <p className="text-beauty-muted text-xs">Unsubscribe from marketing communications at any time</p>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-3">
                <h4 className="font-medium text-beauty-dark mb-1">Data Portability</h4>
                <p className="text-beauty-muted text-xs">Request a copy of your data in a portable format</p>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Cookies & Tracking</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-2">
                We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content.
              </p>
              <div className="text-yellow-800 text-xs space-y-1">
                <p><strong>Essential Cookies:</strong> Required for website functionality</p>
                <p><strong>Analytics Cookies:</strong> Help us understand how you use our site</p>
                <p><strong>Marketing Cookies:</strong> Used to show relevant advertisements</p>
              </div>
            </div>
          </div>

          {/* Third Parties */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Third-Party Services</h3>
            <div className="space-y-2 text-beauty-muted text-sm">
              <p>We work with trusted third-party services to provide our services:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Payment Processors:</strong> Stripe, PayPal (for secure payment processing)</li>
                <li>• <strong>Shipping Partners:</strong> UPS, FedEx, USPS (for order fulfillment)</li>
                <li>• <strong>Analytics:</strong> Google Analytics (for website performance)</li>
                <li>• <strong>Email Service:</strong> Mailchimp (for newsletters and communications)</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-beauty-light/20 rounded-lg p-4">
            <h4 className="font-medium text-beauty-dark mb-2">Questions About Privacy?</h4>
            <p className="text-beauty-muted text-sm mb-2">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> privacy@goddesscare.com</p>
              <p><strong>Phone:</strong> 1-800-GODDESS</p>
              <p><strong>Mail:</strong> Goddess Hair & Beauty, Privacy Department, [Address]</p>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}