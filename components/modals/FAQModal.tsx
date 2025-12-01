"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal"
import { HelpCircle, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface FAQModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: "ingredients",
    question: "What ingredients do you use in your products?",
    answer: "We use only the finest natural and organic ingredients, including cold-pressed oils, essential oils, and botanical extracts. All our products are free from parabens, sulfates, and synthetic fragrances. We provide a full ingredient list on each product page.",
    category: "Products"
  },
  {
    id: "skin-types",
    question: "Are your products suitable for all skin types?",
    answer: "Yes! Our products are formulated to be gentle and effective for all skin types, including sensitive skin. However, we always recommend doing a patch test before first use, especially if you have known allergies or very sensitive skin.",
    category: "Products"
  },
  {
    id: "cruelty-free",
    question: "Are your products cruelty-free?",
    answer: "Absolutely! We are 100% cruelty-free and never test on animals. We also work with suppliers who share our commitment to ethical practices.",
    category: "Products"
  },
  {
    id: "shipping-time",
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days. Orders are processed within 1-2 business days. Free shipping is available on orders over $75.",
    category: "Shipping"
  },
  {
    id: "international",
    question: "Do you ship internationally?",
    answer: "We currently ship to the United States and Canada. For international orders outside of North America, please contact us directly for shipping rates and availability.",
    category: "Shipping"
  },
  {
    id: "track-order",
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a tracking number via email. You can use this number to track your package on the carrier's website. You can also check your order status by logging into your account on our website.",
    category: "Orders"
  },
  {
    id: "change-order",
    question: "Can I change or cancel my order?",
    answer: "You can modify or cancel your order within 2 hours of placing it. After that, orders enter our fulfillment process and cannot be changed. Please contact us immediately if you need to make changes.",
    category: "Orders"
  },
  {
    id: "shelf-life",
    question: "What is the shelf life of your products?",
    answer: "Our products have a shelf life of 12-18 months when stored properly in a cool, dry place away from direct sunlight. Each product has an expiration date printed on the packaging.",
    category: "Usage"
  },
  {
    id: "storage",
    question: "How should I store my products?",
    answer: "Store products in a cool, dry place away from direct sunlight and heat. Keep containers tightly closed when not in use. Some oils may solidify in cold temperatures - this is normal and doesn't affect quality.",
    category: "Usage"
  }
]

const categories = ["All", "Products", "Shipping", "Orders", "Usage"]

export function FAQModal({ open, onOpenChange }: FAQModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const filteredFAQs = selectedCategory === "All" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory)

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-beauty-dark">
            <HelpCircle className="w-5 h-5 text-beauty-primary" />
            Frequently Asked Questions
          </ModalTitle>
          <ModalDescription>
            Find answers to common questions about our products, shipping, and policies.
          </ModalDescription>
        </ModalHeader>
        
        <div className="space-y-6 mt-4">
          {/* Category Filter */}
          <div>
            <h3 className="font-semibold text-beauty-dark mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-beauty-primary text-white"
                      : "bg-beauty-light text-beauty-dark hover:bg-beauty-primary/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="border border-beauty-light rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full p-4 text-left hover:bg-beauty-light/30 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-1 bg-beauty-primary/10 text-beauty-primary rounded-full font-medium">
                        {faq.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-beauty-dark">{faq.question}</h4>
                  </div>
                  {expandedItems.includes(faq.id) ? (
                    <ChevronDown className="w-5 h-5 text-beauty-muted flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-beauty-muted flex-shrink-0" />
                  )}
                </button>
                
                {expandedItems.includes(faq.id) && (
                  <div className="px-4 pb-4">
                    <div className="pt-2 border-t border-beauty-light/50">
                      <p className="text-beauty-muted text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-beauty-light/20 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-beauty-dark mb-2">Still have questions?</h4>
            <p className="text-beauty-muted text-sm mb-3">
              Can't find what you're looking for? Our customer service team is here to help!
            </p>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> support@goddesscare.com</p>
              <p><strong>Phone:</strong> 1-800-GODDESS</p>
              <p><strong>Live Chat:</strong> Available Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}