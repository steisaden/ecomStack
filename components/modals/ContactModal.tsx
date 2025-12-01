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
import { Mail, Clock, Send, MessageSquare } from "lucide-react"
import { useState } from "react"

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Contact form submitted:", formData)
    // Reset form and close modal
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: ""
    })
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <MessageSquare className="w-5 h-5 text-beauty-primary" />
            Contact Us
          </ModalTitle>
          <ModalDescription>
            Get in touch with our team. We&apos;d love to hear from you and help with any questions you may have.
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-6 mt-4">
          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-4">Get in Touch</h3>
            <div className="flex justify-center">
              <div className="border border-beauty-light rounded-lg p-6 text-center max-w-md">
                <Mail className="w-12 h-12 text-beauty-primary mx-auto mb-4" />
                <h4 className="font-medium text-beauty-dark mb-3 text-lg">Email Us</h4>
                <p className="text-beauty-muted text-base mb-3">goddesshairandbodycare@gmail.com</p>
                <p className="text-sm text-beauty-muted">We respond within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-beauty-light/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-beauty-primary" />
              <h4 className="font-medium text-beauty-dark">Business Hours</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between py-1">
                  <span className="text-beauty-dark">Monday - Friday</span>
                  <span className="text-beauty-muted">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-beauty-dark">Saturday</span>
                  <span className="text-beauty-muted">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-beauty-dark">Sunday</span>
                  <span className="text-beauty-muted">Closed</span>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-green-800 text-xs">
                  <strong>Quick Response:</strong> For urgent inquiries, use our live chat feature 
                  available during business hours for immediate assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
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
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inquiryType">Inquiry Type</Label>
                  <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange("inquiryType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="product">Product Information</SelectItem>
                      <SelectItem value="order">Order Support</SelectItem>
                      <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="media">Media & Press</SelectItem>
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
                  placeholder="Tell us more about your inquiry..."
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <Button type="submit" className="w-full bg-beauty-primary hover:bg-beauty-primary/90">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          {/* FAQ Link */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Before you contact us...</h4>
            <p className="text-blue-800 text-sm mb-3">
              Check out our FAQ section for quick answers to common questions about orders, 
              shipping, returns, and product information.
            </p>
            <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
              View FAQ
            </Button>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-medium text-beauty-dark mb-3">Follow Us</h4>
            <p className="text-beauty-muted text-sm mb-3">
              Stay connected with us on social media for the latest updates, beauty tips, and exclusive offers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-beauty-primary hover:text-beauty-primary/80 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" className="text-beauty-primary hover:text-beauty-primary/80 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-beauty-primary hover:text-beauty-primary/80 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}