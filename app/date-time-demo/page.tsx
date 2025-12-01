'use client';

import { useState } from 'react';
import { DateTimeSelector } from '@/components/ui/date-time-selector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';

export default function DateTimeDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Dynamic Date & Time Selection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <DateTimeSelector 
            onDateChange={(date) => setSelectedDate(date)}
            onTimeChange={(time) => setSelectedTime(time)}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Real-time Selection Display</CardTitle>
            <CardDescription>
              This card updates automatically as you select date and time values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Selected Date:</h3>
                <p className="text-xl font-bold">
                  {selectedDate 
                    ? format(selectedDate, 'EEEE, MMMM d, yyyy') 
                    : 'No date selected'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Selected Time:</h3>
                <p className="text-xl font-bold">
                  {selectedTime || 'No time selected'}
                </p>
              </div>
              
              {selectedDate && selectedTime && (
                <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
                  <h3 className="text-sm font-medium text-green-800">Your Selection:</h3>
                  <p className="text-lg font-medium text-green-700">
                    {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}