"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal"
import { FileText, AlertTriangle, Scale, CreditCard } from "lucide-react"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <FileText className="w-5 h-5 text-beauty-primary" />
            Terms of Service
          </ModalTitle>
          <ModalDescription>
            Last updated: January 2024. Please read these terms carefully before using our services.
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-6 mt-4 text-sm">
          {/* Introduction */}
          <div>
            <p className="text-beauty-muted leading-relaxed">
              Welcome to Goddess Hair & Beauty. These Terms of Service (&quot;Terms&quot;) govern your use of our website and services. 
              By accessing or using our website, you agree to be bound by these Terms. If you do not agree to these Terms, 
              please do not use our services.
            </p>
          </div>

          {/* Acceptance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Acceptance of Terms</h3>
            </div>
            <p className="text-blue-800 text-sm">
              By using our website, creating an account, or making a purchase, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms and our Privacy Policy.
            </p>
          </div>

          {/* Use of Website */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Use of Our Website</h3>
            <div className="space-y-3">
              <div className="border border-beauty-light rounded-lg p-4">
                <h4 className="font-medium text-beauty-dark mb-2">Permitted Uses</h4>
                <ul className="text-beauty-muted space-y-1 text-sm">
                  <li>• Browse and purchase products for personal use</li>
                  <li>• Create an account to manage orders and preferences</li>
                  <li>• Contact customer service for support</li>
                  <li>• Subscribe to newsletters and promotional communications</li>
                </ul>
              </div>
              
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Prohibited Uses
                </h4>
                <ul className="text-red-800 space-y-1 text-sm">
                  <li>• Reselling products without authorization</li>
                  <li>• Using automated systems to access our website</li>
                  <li>• Attempting to hack or compromise our systems</li>
                  <li>• Posting false or misleading reviews</li>
                  <li>• Violating any applicable laws or regulations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Account Terms */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Account Terms</h3>
            <div className="bg-beauty-light/20 rounded-lg p-4">
              <ul className="text-beauty-muted space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span>You must be at least 18 years old to create an account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span>You are responsible for maintaining the security of your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span>You must provide accurate and complete information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span>You are responsible for all activities under your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-beauty-primary">•</span>
                  <span>We reserve the right to suspend or terminate accounts that violate these Terms</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Orders and Payments */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-beauty-primary" />
              Orders and Payments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-beauty-light rounded-lg p-4">
                <h4 className="font-medium text-beauty-dark mb-2">Order Processing</h4>
                <ul className="text-beauty-muted space-y-1 text-xs">
                  <li>• All orders are subject to acceptance and availability</li>
                  <li>• We reserve the right to refuse or cancel orders</li>
                  <li>• Prices are subject to change without notice</li>
                  <li>• Orders are processed within 1-2 business days</li>
                </ul>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-4">
                <h4 className="font-medium text-beauty-dark mb-2">Payment Terms</h4>
                <ul className="text-beauty-muted space-y-1 text-xs">
                  <li>• Payment is due at the time of order</li>
                  <li>• We accept major credit cards and PayPal</li>
                  <li>• All payments are processed securely</li>
                  <li>• Refunds are processed according to our return policy</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Product Information</h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Accuracy Disclaimer</h4>
                <p className="text-yellow-800 text-sm">
                  We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant 
                  that product descriptions or other content is accurate, complete, reliable, or error-free.
                </p>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-4">
                <h4 className="font-medium text-beauty-dark mb-2">Product Usage</h4>
                <ul className="text-beauty-muted space-y-1 text-sm">
                  <li>• Products are intended for external use only unless specified</li>
                  <li>• Perform a patch test before first use</li>
                  <li>• Discontinue use if irritation occurs</li>
                  <li>• Keep products away from children</li>
                  <li>• Follow all usage instructions and warnings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Intellectual Property</h3>
            <div className="bg-beauty-light/20 rounded-lg p-4">
              <p className="text-beauty-muted text-sm mb-2">
                All content on our website, including text, images, logos, and designs, is protected by copyright, 
                trademark, and other intellectual property laws.
              </p>
              <ul className="text-beauty-muted space-y-1 text-sm">
                <li>• You may not reproduce, distribute, or modify our content without permission</li>
                <li>• Our trademarks and logos may not be used without written consent</li>
                <li>• User-generated content may be used by us for marketing purposes</li>
              </ul>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Limitation of Liability</h3>
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
              <p className="text-orange-800 text-sm">
                <strong>Important:</strong> To the fullest extent permitted by law, Goddess Hair & Beauty shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages, including but not limited to 
                loss of profits, data, or use, arising out of or relating to your use of our products or services.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Governing Law</h3>
            <div className="border border-beauty-light rounded-lg p-4">
              <p className="text-beauty-muted text-sm">
                These Terms are governed by and construed in accordance with the laws of [State/Country], 
                without regard to its conflict of law provisions. Any disputes arising under these Terms 
                shall be resolved in the courts of [Jurisdiction].
              </p>
            </div>
          </div>

          {/* Changes to Terms */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Changes to Terms</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately 
                upon posting on our website. Your continued use of our services after changes are posted 
                constitutes acceptance of the modified Terms.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-beauty-light/20 rounded-lg p-4">
            <h4 className="font-medium text-beauty-dark mb-2">Questions About These Terms?</h4>
            <p className="text-beauty-muted text-sm mb-2">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> legal@goddesscare.com</p>
              <p><strong>Phone:</strong> 1-800-GODDESS</p>
              <p><strong>Mail:</strong> Goddess Hair & Beauty, Legal Department, [Address]</p>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}