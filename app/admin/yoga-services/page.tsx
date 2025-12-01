import { YogaServicesManager } from '@/components/admin/YogaServicesManager'
import { BackToAdminButton } from '@/components/admin/BackToAdminButton'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Manage Yoga Services | Admin',
  description: 'Manage yoga services and wellness offerings',
}

export default function YogaServicesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <BackToAdminButton />
      
      <div className="mt-8">
        <YogaServicesManager />
      </div>
    </div>
  )
}
