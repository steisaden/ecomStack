'use client'

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

export default function CalendarHighlightingTest() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar Highlighting Test</h1>
        <p className="text-gray-600 mb-8">Testing enhanced date selection highlighting</p>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Single Date Selection</h2>
          <div className="border rounded-lg p-4 inline-block">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Selected date: <span className="font-medium">{date ? date.toDateString() : 'None'}</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What to Look For</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Selected dates should have a prominent background color</li>
            <li>Selected dates should have white text for better contrast</li>
            <li>Selected dates should have a subtle shadow for depth</li>
            <li>Selected dates should have bold text for emphasis</li>
            <li>Selected dates should have a ring indicator for focus state</li>
            <li>All styling should be consistent with the overall design system</li>
          </ul>
        </div>
      </div>
    </div>
  );
}