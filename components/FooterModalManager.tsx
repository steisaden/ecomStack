"use client"

import { useState } from "react"
import { ShippingModal } from "./modals/ShippingModal"
import { ReturnsModal } from "./modals/ReturnsModal"
import { FAQModal } from "./modals/FAQModal"
import { SupportModal } from "./modals/SupportModal"
import { PrivacyModal } from "./modals/PrivacyModal"
import { TermsModal } from "./modals/TermsModal"
import { CookiesModal } from "./modals/CookiesModal"
import { ContactModal } from "./modals/ContactModal"

export type ModalType = 
  | 'shipping' 
  | 'returns' 
  | 'faq' 
  | 'support' 
  | 'privacy' 
  | 'terms' 
  | 'cookies' 
  | 'contact'

interface FooterModalManagerProps {
  children: (openModal: (type: ModalType) => void) => React.ReactNode
}

export function FooterModalManager({ children }: FooterModalManagerProps) {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null)

  const openModal = (type: ModalType) => {
    setActiveModal(type)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <>
      {children(openModal)}
      
      <ShippingModal 
        open={activeModal === 'shipping'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      
      <ReturnsModal 
        open={activeModal === 'returns'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      
      <FAQModal 
        open={activeModal === 'faq'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      
      <SupportModal 
        open={activeModal === 'support'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      
      <PrivacyModal 
        open={activeModal === 'privacy'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      
      <TermsModal 
        open={activeModal === 'terms'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      
      <CookiesModal 
        open={activeModal === 'cookies'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      
      <ContactModal 
        open={activeModal === 'contact'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
    </>
  )
}