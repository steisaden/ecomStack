"use client";

import { YogaService, AddOnExperience } from '@/lib/types';
import { YogaServiceCard } from './YogaServiceCard';
import ResponsiveGrid from '@/components/ResponsiveGrid';

interface YogaServicesGridProps {
  services: YogaService[];
  addOns: AddOnExperience[];
}

export function YogaServicesGrid({ services, addOns }: YogaServicesGridProps) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-beauty-muted">No yoga services available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-beauty-dark mb-6">
          Choose Your Yoga Experience
        </h2>
        <ResponsiveGrid>
          {services.map((service) => (
            <YogaServiceCard
              key={service.sys.id}
              service={service}
            />
          ))}
        </ResponsiveGrid>
      </div>

      {addOns && addOns.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-beauty-dark mb-6">
            Add-On Experiences
          </h2>
          <ResponsiveGrid>
            {addOns.map((addOn) => (
              <div key={addOn.sys.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-beauty-dark mb-2">
                  {addOn.name}
                </h3>
                <p className="text-beauty-muted mb-4">{addOn.description}</p>
                <div className="text-beauty-primary font-semibold">
                  ${addOn.price}
                </div>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      )}
    </div>
  );
}