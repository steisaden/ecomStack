'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { WorkingCalendar } from '@/components/ui/working-calendar';
import { Button } from '@/components/ui/button';
// Removed getAvailability import - now using API

interface AvailabilityCalendarProps {
  serviceId: string;
  onDateTimeSelect: (date: Date, time: string) => void;
}

export function AvailabilityCalendar({ serviceId, onDateTimeSelect }: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, serviceId]);

  const loadAvailableSlots = async (date: Date) => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(
        `/api/yoga-availability?serviceId=${serviceId}&date=${date.toISOString()}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      console.log('Availability API response:', data);
      
      if (data.success) {
        // Use the actual available slots from the API response
        setAvailableSlots(data.data.availableSlots || []);
      } else {
        console.error('API returned error:', data.error);
        setAvailableSlots([]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request timed out while loading availability');
      } else {
        console.error('Error loading availability:', error);
      }
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onDateTimeSelect(selectedDate, time);
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Calendar Section with jade background */}
      <div className="calendar-jade-bg rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px]">
            <WorkingCalendar
              selected={selectedDate}
              onSelect={(date) => {
                console.log('AvailabilityCalendar - Date selected:', date);
                setSelectedDate(date);
                // Call onDateTimeSelect if we also have a selected time
                if (selectedTime && date) {
                  onDateTimeSelect(date, selectedTime);
                }
              }}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="w-full border-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Time Selection Section - Completely separate with clear spacing */}
      {selectedDate && (
        <div className="w-full space-y-4 sm:space-y-6 mt-8 sm:mt-10">
          <h3 className="text-lg sm:text-xl font-semibold text-beauty-dark text-center px-4">
            Available Times
          </h3>
          {loading ? (
            <div className="text-center py-8 sm:py-10">
              <p className="text-beauty-muted text-sm sm:text-base">Loading available times...</p>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="px-4 sm:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    onClick={() => handleTimeSelect(slot)}
                    className={`text-sm font-medium py-3 px-4 h-auto rounded-lg transition-all duration-200 min-h-[44px] ${
                      selectedTime === slot 
                        ? 'bg-primary text-white shadow-md scale-105' 
                        : 'hover:bg-primary/10 hover:scale-102'
                    }`}
                  >
                    {formatTime(slot)}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-beauty-muted text-center py-8 sm:py-10 border border-dashed border-gray-300 rounded-lg sm:rounded-xl p-6 sm:p-8 mx-4 sm:mx-6">
              <p className="mb-2 text-sm sm:text-base">No available times for this date.</p>
              <p className="text-xs sm:text-sm text-gray-500">Please select another date from the calendar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}