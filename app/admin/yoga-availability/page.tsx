import { YogaAvailabilityManager } from '@/components/admin/YogaAvailabilityManager';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getYogaServices } from '@/lib/yoga';


// Force dynamic rendering for admin routes that use authentication
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Yoga Availability Management | Admin',
  description: 'Manage yoga service availability and bookings',
};

export default async function YogaAvailabilityPage() {
  const initialYogaServices = await getYogaServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-primary">
          Yoga Availability Management
        </h1>
        <p className="text-beauty-muted mt-2">
          Manage your yoga service availability and view upcoming bookings
        </p>
      </div>

      <YogaAvailabilityManager initialYogaServices={initialYogaServices} />
    </div>
  );
}