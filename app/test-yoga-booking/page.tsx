'use client';

import { useState } from 'react';
import { AvailabilityCalendar } from '@/components/yoga/AvailabilityCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestYogaBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleDateTimeSelect = (date: Date, time: string) => {
    console.log('Date/Time selected:', date, time);
    setSelectedDate(date);
    setSelectedTime(time);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Yoga Booking Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Availability Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Availability Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar
              serviceId="test-service-id"
              onDateTimeSelect={handleDateTimeSelect}
            />
          </CardContent>
        </Card>

        {/* Selection Display */}
        <Card>
          <CardHeader>
            <CardTitle>Selection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Selected Date:</h3>
                <p>{selectedDate ? selectedDate.toDateString() : 'No date selected'}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Selected Time:</h3>
                <p>{selectedTime || 'No time selected'}</p>
              </div>

              <div className="p-3 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p className="text-sm">{"Check the browser console for detailed logs"}</p>
                <p className="text-sm">{"API calls and responses will be logged there"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">Steps to test:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>{"Click on any date in the calendar (should highlight in blue)"}</li>
              <li>{"Check that available time slots appear below the calendar"}</li>
              <li>{"Click on a time slot"}</li>
              <li>{`Verify both date and time appear in the "Selection Status" card`}</li>
              <li>{"Check browser console for API calls and responses"}</li>
            </ol>
            
            <h4 className="font-semibold mt-4">If calendar doesn't work:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{"Check browser console for JavaScript errors"}</li>
              <li>{"Try clicking different parts of the date cells"}</li>
              <li>{"Test on different browsers (Chrome, Firefox, Safari)"}</li>
              <li>{"Test on mobile device or mobile emulation"}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}