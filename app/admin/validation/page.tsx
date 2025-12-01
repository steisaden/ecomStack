import { Metadata } from 'next'
import ProductValidationDashboard from '@/components/admin/ProductValidationDashboard'

export const metadata: Metadata = {
  title: 'Product Validation | Admin Dashboard',
  description: 'Monitor and manage product validation status for curated products display'
}

export default function ValidationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductValidationDashboard />
    </div>
  )
}