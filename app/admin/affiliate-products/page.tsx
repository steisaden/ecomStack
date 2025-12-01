import { redirect } from 'next/navigation'

// This page now redirects to the simplified Amazon product adder
// which is the only affiliate product functionality we want to keep
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Affiliate Products | Admin',
  description: 'Manage affiliate products and discover new opportunities from our curated catalog',
}

export default function AffiliateProductsPage() {
  // Redirect to the simplified Amazon product adder page
  redirect('/admin/affiliate-products/add-amazon')
}