'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { SimpleCalendar } from '@/components/ui/simple-calendar';
import { CalendarFixed } from '@/components/ui/calendar-fixed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [clickLog, setClickLog] = useState<string[]>([]);

  const handleDateSelect = (date: Date | undefined) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
    setClickLog(prev => [...prev, `Selected: ${date ? date.toDateString() : 'undefined'} at ${new Date().toLocaleTimeString()}`]);
  };

  const handleDayClick = (date: Date) => {
    console.log('Day clicked:', date);
    setClickLog(prev => [...prev, `Clicked: ${date.toDateString()} at ${new Date().toLocaleTimeString()}`]);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Calendar Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Component</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              onDayClick={handleDayClick}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Selected Date:</h3>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {selectedDate ? selectedDate.toDateString() : 'None selected'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Click Log:</h3>
                <div className="text-sm bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                  {clickLog.length === 0 ? (
                    <p className="text-gray-500">No clicks recorded yet</p>
                  ) : (
                    clickLog.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setClickLog([])}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Clear Log
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test with different calendar configurations */}
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Simple Calendar Test</h2>
          <Card>
            <CardContent className="p-4">
              <SimpleCalendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  console.log('Simple calendar - Date selected:', date);
                  setSelectedDate(date);
                  setClickLog(prev => [...prev, `Simple Calendar: ${date ? date.toDateString() : 'undefined'} at ${new Date().toLocaleTimeString()}`]);
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Fixed Calendar Test</h2>
          <Card>
            <CardContent className="p-4">
              <CalendarFixed
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  console.log('Fixed calendar - Date selected:', date);
                  setSelectedDate(date);
                  setClickLog(prev => [...prev, `Fixed Calendar: ${date ? date.toDateString() : 'undefined'} at ${new Date().toLocaleTimeString()}`]);
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}