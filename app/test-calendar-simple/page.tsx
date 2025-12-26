'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { WorkingCalendar } from '@/components/ui/working-calendar';

export default function TestCalendarSimple() {
  const [selectedDate1, setSelectedDate1] = useState<Date | undefined>();
  const [selectedDate2, setSelectedDate2] = useState<Date | undefined>();
  const [selectedDate3, setSelectedDate3] = useState<Date | undefined>();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Calendar Test - Simple</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Raw DayPicker */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Raw DayPicker (Should Work)</h2>
          <div className="border p-4 rounded">
            <DayPicker
              mode="single"
              selected={selectedDate1}
              onSelect={(date) => {
                console.log('Raw DayPicker selected:', date);
                setSelectedDate1(date);
              }}
            />
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm">{"Selected: "}{selectedDate1 ? selectedDate1.toDateString() : `None`}</p>
          </div>
        </div>

        {/* Our Calendar Component */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Our Calendar Component</h2>
          <div className="border p-4 rounded">
            <Calendar
              mode="single"
              selected={selectedDate2}
              onSelect={(date) => {
                console.log('Our Calendar selected:', date);
                setSelectedDate2(date);
              }}
            />
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm">{"Selected: "}{selectedDate2 ? selectedDate2.toDateString() : 'None'}</p>
          </div>
        </div>

        {/* Working Calendar Component */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Working Calendar (Guaranteed)</h2>
          <div className="border p-4 rounded">
            <WorkingCalendar
              selected={selectedDate3}
              onSelect={(date) => {
                console.log('Working Calendar selected:', date);
                setSelectedDate3(date);
              }}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm">{"Selected: "}{selectedDate3 ? selectedDate3.toDateString() : 'None'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click on any date in both calendars</li>
          <li>Check that the selected date appears below each calendar</li>
          <li>Check the browser console for debug messages</li>
          <li>If the raw DayPicker works but our Calendar doesn&apos;t, there&apos;s an issue with our wrapper</li>
        </ol>
      </div>
    </div>
  );
}