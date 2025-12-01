import { Suspense } from 'react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ConfirmationPageProps {
  searchParams: Promise<{
    session_id?: string;
    booking_ref?: string;
  }>;
}

export default async function YogaBookingConfirmation({ searchParams }: ConfirmationPageProps) {
  const { session_id, booking_ref } = await searchParams;

  return (
    <ResponsiveContainer>
      <div className="py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-hero font-heading text-primary mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-beauty-muted">
              Thank you for booking your yoga session with us.
            </p>
          </div>

          {booking_ref && (
            <div className="bg-beauty-light p-6 rounded-lg mb-8">
              <h2 className="text-lg font-semibold text-beauty-dark mb-2">
                Booking Reference
              </h2>
              <p className="text-2xl font-mono font-bold text-beauty-primary">
                {booking_ref}
              </p>
              <p className="text-sm text-beauty-muted mt-2">
                Please save this reference number for your records
              </p>
            </div>
          )}

          <div className="bg-white border border-beauty-light rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-beauty-dark mb-4">
              What&apos;s Next?
            </h3>
            <ul className="space-y-3 text-beauty-muted">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-beauty-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>You&apos;ll receive a confirmation email with your booking details shortly</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-beauty-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>We&apos;ll send you a reminder 24 hours before your session</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-beauty-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Please arrive 10 minutes early to prepare for your session</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-beauty-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Bring comfortable clothing and a water bottle</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-beauty-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Bring your yoga mat</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-beauty-muted">
              Questions about your booking? Contact us at{' '}
              <a href="mailto:bookings@goddesshairandbeauty.com" className="text-beauty-primary hover:underline">
                bookings@goddesshairandbeauty.com
              </a>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/yoga-booking">
                  Book Another Session
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  Return to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}