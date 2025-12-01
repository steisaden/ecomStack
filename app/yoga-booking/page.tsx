import { Suspense } from 'react';
import { getYogaServices, getAddOnExperiences } from '@/lib/yoga';
import { YogaServicesGrid } from '@/components/yoga/YogaServicesGrid';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { performanceMonitor } from '@/lib/performance';

export const metadata = {
  title: 'Yoga Booking | Goddess Care Co',
  description: 'Book your personalized yoga sessions and wellness experiences',
};

// Add revalidation for better caching
export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function YogaBookingPage() {
  const stopTimer = performanceMonitor.startTimer('yoga-booking-page');
  
  try {
    // Use Promise.all for parallel data fetching
    const [yogaServices, addOnExperiences] = await Promise.all([
      getYogaServices(),
      getAddOnExperiences()
    ]);

    stopTimer();
    
    return (
      <ResponsiveContainer>
        <div className="py-8">
          <div className="text-center mb-12">
            <h1 className="text-hero font-heading text-primary mb-4">
              Yoga & Wellness Booking
            </h1>
            <p className="text-lg text-beauty-muted max-w-2xl mx-auto">
              Discover inner peace and physical wellness through our personalized yoga sessions
            </p>
          </div>

          <Suspense fallback={<div className="text-center">Loading services...</div>}>
            <YogaServicesGrid 
              services={yogaServices} 
              addOns={addOnExperiences} 
            />
          </Suspense>
        </div>
      </ResponsiveContainer>
    );
  } catch (error) {
    stopTimer();
    console.error('Error loading yoga services:', error);
    return (
      <ResponsiveContainer>
        <div className="py-8 text-center">
          <h1 className="text-hero font-heading text-primary mb-4">
            Yoga & Wellness Booking
          </h1>
          <p className="text-beauty-muted">
            We&apos;re having trouble loading our services. Please try again later.
          </p>
        </div>
      </ResponsiveContainer>
    );
  }
}