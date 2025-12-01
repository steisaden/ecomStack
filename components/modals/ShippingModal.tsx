"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal"
import { Truck, Clock, MapPin, Package } from "lucide-react"

interface ShippingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShippingModal({ open, onOpenChange }: ShippingModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <Truck className="w-5 h-5 text-beauty-primary" />
            Shipping Information
          </ModalTitle>
          <ModalDescription>
            Everything you need to know about our shipping policies and delivery options.
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-6 mt-4">
          {/* Shipping Options */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-beauty-primary" />
              Shipping Options
            </h3>
            <div className="space-y-3">
              <div className="border border-beauty-light rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-beauty-dark">Standard Shipping</h4>
                  <span className="text-beauty-primary font-semibold">$5.99</span>
                </div>
                <p className="text-beauty-muted text-sm">5-7 business days delivery</p>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-beauty-dark">Express Shipping</h4>
                  <span className="text-beauty-primary font-semibold">$12.99</span>
                </div>
                <p className="text-beauty-muted text-sm">2-3 business days delivery</p>
              </div>
              
              <div className="border border-beauty-light rounded-lg p-4 bg-beauty-light/30">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-beauty-dark">Free Shipping</h4>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <p className="text-beauty-muted text-sm">On orders over $75 • 5-7 business days</p>
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-beauty-primary" />
              Processing Time
            </h3>
            <div className="bg-beauty-light/20 rounded-lg p-4">
              <p className="text-beauty-muted text-sm">
                All orders are processed within 1-2 business days. Orders placed on weekends 
                or holidays will be processed the next business day.
              </p>
            </div>
          </div>

          {/* Shipping Areas */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-beauty-primary" />
              Shipping Areas
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-beauty-light/50">
                <span className="text-beauty-dark">United States</span>
                <span className="text-beauty-primary text-sm">Available</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-beauty-light/50">
                <span className="text-beauty-dark">Canada</span>
                <span className="text-beauty-primary text-sm">Available</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-beauty-dark">International</span>
                <span className="text-beauty-muted text-sm">Contact us for rates</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Tracking information will be provided via email once your order ships</li>
              <li>• Delivery times may vary during peak seasons and holidays</li>
              <li>• We are not responsible for delays caused by shipping carriers</li>
              <li>• P.O. Box addresses may have limited shipping options</li>
            </ul>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}