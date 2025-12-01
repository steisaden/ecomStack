"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal"
import { RotateCcw, Calendar, CheckCircle, XCircle } from "lucide-react"

interface ReturnsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReturnsModal({ open, onOpenChange }: ReturnsModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <RotateCcw className="w-5 h-5 text-beauty-primary" />
            Returns & Exchanges
          </ModalTitle>
          <ModalDescription>
            Our hassle-free return policy ensures your complete satisfaction.
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-6 mt-4">
          {/* Return Policy */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-beauty-primary" />
              Return Policy
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>30-Day Return Window:</strong> You have 30 days from the date of delivery 
                to return any unused products in their original packaging.
              </p>
            </div>
          </div>

          {/* What Can Be Returned */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              What Can Be Returned
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-800 text-sm">Unopened products in original packaging</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-800 text-sm">Products that caused allergic reactions (with proof)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-800 text-sm">Defective or damaged products</span>
              </div>
            </div>
          </div>

          {/* What Cannot Be Returned */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              What Cannot Be Returned
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-red-800 text-sm">Opened or used products (hygiene reasons)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-red-800 text-sm">Products without original packaging</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-red-800 text-sm">Custom or personalized products</span>
              </div>
            </div>
          </div>

          {/* Return Process */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Return Process</h3>
            <div className="space-y-3">
              <div className="flex gap-4 p-4 border border-beauty-light rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-beauty-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-beauty-dark">Contact Us</h4>
                  <p className="text-beauty-muted text-sm">Email us at returns@goddesscare.com with your order number</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 border border-beauty-light rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-beauty-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-beauty-dark">Get Return Label</h4>
                  <p className="text-beauty-muted text-sm">We&apos;ll send you a prepaid return shipping label</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 border border-beauty-light rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-beauty-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-beauty-dark">Ship It Back</h4>
                  <p className="text-beauty-muted text-sm">Package securely and ship using our provided label</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 border border-beauty-light rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-beauty-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-beauty-dark">Get Refund</h4>
                  <p className="text-beauty-muted text-sm">Refund processed within 5-7 business days after we receive the item</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-beauty-light/20 rounded-lg p-4">
            <h4 className="font-medium text-beauty-dark mb-2">Need Help?</h4>
            <p className="text-beauty-muted text-sm mb-2">
              Contact our customer service team for any questions about returns or exchanges.
            </p>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> returns@goddesscare.com</p>
              <p><strong>Phone:</strong> 1-800-GODDESS</p>
              <p><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}