"use client";

import { useState, useRef, useEffect } from 'react';
import { YogaService, AddOnExperience } from '@/lib/types';
import { BookingForm } from './BookingForm';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useBookingCart } from '@/lib/contexts/BookingCartContext';
import { checkSlotAvailability, reserveTimeSlot, formatAvailabilityTime } from '@/lib/yoga/availability';

interface ServiceBookingPanelProps {
  service: YogaService;
  addOns: AddOnExperience[];
}

export default function ServiceBookingPanel({ service, addOns }: ServiceBookingPanelProps) {
  const { state: cartState, addService, addAddOn, removeAddOn } = useBookingCart();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'calendar' | 'form'>('calendar');
  const [isFlipped, setIsFlipped] = useState(false);
  const [availability, setAvailability] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [timeSlotHold, setTimeSlotHold] = useState<{ holdUntil: Date } | null>(null);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  async function loadAvailability() {
    if (!selectedDate) return;
    setIsLoading(true);
    setError(null);
    try {
      const startDate = new Date(selectedDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const params = new URLSearchParams({
        serviceId: service.sys.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`/api/yoga/availability?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      setError('Failed to load availability. Please try again.');
      console.error('Error loading availability:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (formData: any) => {
    // Require user to pick date and time before proceeding
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time for your session before continuing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAddOnObjects = addOns.filter(a => (formData.selectedAddOns || []).includes(a.sys.id));

      const res = await fetch('/api/create-yoga-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.sys.id,
          serviceName: service.name,
          servicePrice: service.price,
          selectedDate: selectedDate.toISOString(),
          selectedTime,
          customerInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            specialRequests: formData.specialRequests || '',
          },
          addOns: selectedAddOnObjects.map(a => ({
            id: a.sys.id,
            name: a.name,
            description: a.description,
            price: a.price,
          })),
          // Medical intake gets sent along and saved in metadata
          intake: {
            injuryHistory: formData.injuryHistory,
            pregnancyStatus: formData.pregnancyStatus,
            pregnancyWeeks: formData.pregnancyWeeks || '',
            medications: formData.medications,
            birthMonth: formData.birthMonth,
            birthDay: formData.birthDay,
          },
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || 'Failed to create checkout session');
      }

      const possibleUrls: Array<string | undefined> = [
        json.sessionUrl,
        json.url,
        typeof json.sessionId === 'string' && json.sessionId.startsWith('http') ? json.sessionId : undefined,
        typeof json.id === 'string' && json.id.startsWith('http') ? json.id : undefined,
      ];

      const redirectUrl = possibleUrls.find((u): u is string => typeof u === 'string' && u.length > 0);

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (json.sessionId) {
        console.log('Session created (mock):', json);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong creating your session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time for your session before continuing.');
      return;
    }
    setIsFlipped(true);
    setTimeout(() => {
      setCurrentStep('form');
      setIsFlipped(false);
    }, 400);
  };

  const handleBack = () => {
    setIsFlipped(true);
    setTimeout(() => {
      setCurrentStep('calendar');
      setIsFlipped(false);
    }, 400);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ perspective: 1000 }}
          className="w-full"
        >
          {currentStep === 'calendar' ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 sm:p-6 space-y-8 sm:space-y-10">
                  <h2 className="text-xl font-semibold text-center sm:text-left mb-4 sm:mb-6">Select Date & Time</h2>

                  {/* Availability calendar with proper mobile spacing */}
                  <div className="space-y-8 sm:space-y-10">
                    <AvailabilityCalendar
                      serviceId={service.sys.id}
                      onDateTimeSelect={(date, time) => {
                        setSelectedDate(date);
                        setSelectedTime(time);
                      }}
                    />
                  </div>

                  {/* Visual separator with extra spacing */}
                  <div className="relative py-6 sm:py-8 mb-4 sm:mb-6">
                    <div className="border-t border-gray-200 mx-4 sm:mx-6 md:mx-8"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white px-3 sm:px-4 text-xs sm:text-sm text-gray-500 font-medium">
                        Your Selection
                      </div>
                    </div>
                  </div>

                  {/* Selected summary with responsive spacing */}
                  <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 mb-8 sm:mb-10 mx-3 sm:mx-4 md:mx-6">
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Selected Date</div>
                        <div className="font-medium text-sm sm:text-base">
                          {selectedDate ? selectedDate.toDateString() : 'Please select a date'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Selected Time</div>
                        <div className="font-medium text-sm sm:text-base">
                          {selectedTime || 'Please select a time'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Summary with responsive spacing */}
                  <div className="bg-beauty-light p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl mb-8 sm:mb-10 mx-3 sm:mx-4 md:mx-6 mt-6 sm:mt-8">
                    <h3 className="text-lg font-semibold text-beauty-dark mb-4">
                      Booking Summary
                    </h3>
                    <div className="space-y-3 text-sm sm:text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium text-right">{service.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{service.duration} minutes</span>
                      </div>
                      <hr className="my-3 border-gray-300" />
                      <div className="flex justify-between items-center font-semibold text-beauty-primary text-base sm:text-lg">
                        <span>Price:</span>
                        <span>${service.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 sm:px-0">
                    <Button
                      onClick={handleContinue}
                      className="w-full py-3 text-base font-medium"
                      disabled={!selectedDate || !selectedTime}
                    >
                      Continue to Booking Form
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBack}
                      className="mr-2"
                    >
                      ← Back
                    </Button>
                    <h2 className="text-xl font-semibold">Complete Your Booking</h2>
                  </div>

                  <BookingForm
                    service={service}
                    addOns={addOns}
                    selectedDate={selectedDate ?? new Date()}
                    selectedTime={selectedTime}
                    onSubmit={handleSubmit}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Carousel Navigation Dots with improved spacing */}
      <div className="flex justify-center space-x-3 pt-4 pb-2">
        <button
          className={`w-3 h-3 rounded-full transition-colors duration-200 ${currentStep === 'calendar' ? 'bg-beauty-primary' : 'bg-gray-300'
            }`}
          onClick={() => currentStep !== 'calendar' && handleBack()}
          aria-label="Go to calendar step"
        />
        <button
          className={`w-3 h-3 rounded-full transition-colors duration-200 ${currentStep === 'form' ? 'bg-beauty-primary' : 'bg-gray-300'
            }`}
          onClick={() => currentStep !== 'form' && handleContinue()}
          aria-label="Go to form step"
          disabled={!selectedDate || !selectedTime}
        />
      </div>
    </div>
  );
}