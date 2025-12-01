"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Headphones, Mail, Clock } from "lucide-react"
import { useState } from "react"

interface SupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    subject: "",
    message: "",
    priority: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Support form submitted:", formData)
    // Reset form and close modal
    setFormData({
      name: "",
      email: "",
      orderNumber: "",
      subject: "",
      message: "",
      priority: ""
    })
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <Headphones className="w-5 h-5 text-beauty-primary" />
            Customer Support
          </ModalTitle>
          <ModalDescription>
            Get help with your order, products, or account. We&apos;re here to assist you!
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-6 mt-4">
          {/* Contact Options */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-4">Contact Options</h3>
            <div className="flex justify-center">
              <div className="border border-beauty-light rounded-lg p-6 text-center max-w-md">
                <Mail className="w-12 h-12 text-beauty-primary mx-auto mb-4" />
                <h4 className="font-medium text-beauty-dark mb-3 text-lg">Email Support</h4>
                <p className="text-beauty-muted text-base mb-3">goddesshairandbodycare@gmail.com</p>
                <p className="text-sm text-beauty-muted">We respond within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Support Hours</h4>
            </div>
            <div className="text-blue-800 text-sm space-y-1">
              <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST</p>
              <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM EST</p>
              <p><strong>Sunday:</strong> Closed</p>
              <p className="text-xs mt-2">Emergency support available 24/7 for order issues</p>
            </div>
          </div>

          {/* Support Form */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-4">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderNumber">Order Number (Optional)</Label>
                  <Input
                    id="orderNumber"
                    value={formData.orderNumber}
                    onChange={(e) => handleInputChange("orderNumber", e.target.value)}
                    placeholder="e.g., GC-12345"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General inquiry</SelectItem>
                      <SelectItem value="medium">Medium - Order question</SelectItem>
                      <SelectItem value="high">High - Urgent issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Please provide details about your inquiry..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <Button type="submit" className="w-full bg-beauty-primary hover:bg-beauty-primary/90">
                Send Message
              </Button>
            </form>
          </div>

          {/* Common Issues */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Common Issues</h3>
            <div className="space-y-2">
              <details className="border border-beauty-light rounded-lg">
                <summary className="p-3 cursor-pointer hover:bg-beauty-light/30 font-medium text-beauty-dark">
                  Order Status & Tracking
                </summary>
                <div className="px-3 pb-3 text-beauty-muted text-sm">
                  <p>You can track your order using the tracking number sent to your email. If you can&apos;t find it, check your spam folder or contact us with your order number.</p>
                </div>
              </details>
              
              <details className="border border-beauty-light rounded-lg">
                <summary className="p-3 cursor-pointer hover:bg-beauty-light/30 font-medium text-beauty-dark">
                  Product Allergies & Reactions
                </summary>
                <div className="px-3 pb-3 text-beauty-muted text-sm">
                  <p>If you experience any allergic reactions, discontinue use immediately and contact us. We offer full refunds for products that cause allergic reactions.</p>
                </div>
              </details>
              
              <details className="border border-beauty-light rounded-lg">
                <summary className="p-3 cursor-pointer hover:bg-beauty-light/30 font-medium text-beauty-dark">
                  Account & Login Issues
                </summary>
                <div className="px-3 pb-3 text-beauty-muted text-sm">
                  <p>Having trouble logging in? Try resetting your password or contact us if you need help accessing your account.</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}