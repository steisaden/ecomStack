'use client'

import React from 'react';
import { Calendar } from '@/components/ui/calendar';

export default function CalendarStylingTest() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Calendar Styling Test</h1>
        <p className="text-gray-600 mb-6 text-center">
          This test verifies the enhanced date selection highlighting.
        </p>
        
        <div className="mb-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 mb-2">What to Look For:</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>Selected dates should have a prominent background color</li>
            <li>Selected dates should have white text for better contrast</li>
            <li>Selected dates should have a subtle shadow for depth</li>
            <li>Selected dates should have bold text for emphasis</li>
            <li>Selected dates should have a ring indicator for focus state</li>
          </ul>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Selected date: {date ? date.toDateString() : 'None'}
          </p>
        </div>
      </div>
    </div>
  );
}