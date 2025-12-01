import { AffiliateProductsManager } from '@/components/admin/AffiliateProductsManager'
import { BackToAdminButton } from '@/components/admin/BackToAdminButton'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Manage Affiliate Products | Admin',
  description: 'Edit, archive, and delete affiliate products',
}

export default function ManageAffiliateProductsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <BackToAdminButton />
      
      <div className="mt-8">
        <AffiliateProductsManager />
      </div>
    </div>
  )
}
