import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { getYogaServiceBySlug, getAddOnExperiences } from '@/lib/yoga';
import ServiceBookingPanel from '@/components/yoga/ServiceBookingPanel';
import { Card, CardContent } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function YogaServiceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const service = await getYogaServiceBySlug(slug);
  if (!service) return notFound();

  const allAddOns = await getAddOnExperiences();
  const applicableAddOns = allAddOns.filter(a =>
    a.applicableServices?.includes('All Services') || a.applicableServices?.includes(service.name)
  );

  return (
    <ResponsiveContainer>
      <div className="py-8">
        <div className="mb-6">
          <Link href="/yoga-booking" className="text-sm text-beauty-primary hover:underline">← Back to Yoga Booking</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="h-fit">
            <CardContent className="p-6">
              {service.image && (
                <div className="relative w-full h-80 rounded-lg overflow-hidden">
                  <Image src={service.image.url} alt={service.name} fill className="object-cover" />
                </div>
              )}
              <h1 className="text-hero font-heading text-blue-600 mt-6">{service.name}</h1>
              <p className="text-beauty-muted mt-4">{service.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-beauty-muted">Duration: {service.duration} minutes</span>
                <span className="text-2xl font-semibold text-beauty-primary">${service.price}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <ServiceBookingPanel service={service} addOns={applicableAddOns} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveContainer>
  );
}