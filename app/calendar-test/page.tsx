import React from 'react';
import { Calendar } from '@/components/ui/calendar';

export default function CalendarTest() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Calendar Component Test</h1>
      <p className="mb-4">This page tests the enhanced date selection highlighting.</p>
      
      <div className="border rounded-lg p-4 max-w-md">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Selected date: {date ? date.toDateString() : 'None'}
        </p>
      </div>
    </div>
  );
}