'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { AvailabilityCalendar } from '@/components/yoga/AvailabilityCalendar';
import { CalendarVerification } from '@/components/CalendarVerification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalendarFixTestPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [yogaDate, setYogaDate] = useState<Date | undefined>();
  const [yogaTime, setYogaTime] = useState<string>('');

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Calendar Fix Verification</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Calendar Test */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Calendar Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  console.log('Basic calendar - Date selected:', date);
                  setSelectedDate(date);
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="w-full"
              />
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">Selected Date:</p>
                <p className="text-sm">{selectedDate ? selectedDate.toDateString() : 'None selected'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yoga Availability Calendar Test */}
        <Card>
          <CardHeader>
            <CardTitle>Yoga Availability Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AvailabilityCalendar
                serviceId="test-service"
                onDateTimeSelect={(date, time) => {
                  console.log('Yoga calendar - Date/Time selected:', date, time);
                  setYogaDate(date);
                  setYogaTime(time);
                }}
              />
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">Selected Date & Time:</p>
                <p className="text-sm">Date: {yogaDate ? yogaDate.toDateString() : 'None selected'}</p>
                <p className="text-sm">Time: {yogaTime || 'None selected'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Click on any date in either calendar</p>
            <p>2. Check that the selected date appears in the gray box below each calendar</p>
            <p>3. Check the browser console for debug messages</p>
            <p>4. For the yoga calendar, also select a time slot if available</p>
            <p>5. Verify that both date and time selection work properly</p>
          </div>
        </CardContent>
      </Card>

      {/* Automated Verification */}
      <div className="mt-8">
        <CalendarVerification />
      </div>

      {/* Mobile Test Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Mobile Responsiveness Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p>Test the calendar on different screen sizes:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Desktop (1024px+): Full layout with side-by-side calendars</li>
              <li>Tablet (768px-1023px): Stacked layout</li>
              <li>Mobile (320px-767px): Single column, touch-friendly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}