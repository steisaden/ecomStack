'use client'

import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'

export default function SimpleCalendarTest() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple Calendar Test</h1>
      <p className="mb-6 text-gray-600">
        Testing enhanced date selection highlighting
      </p>
      
      <div className="border rounded-lg p-4 bg-white">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
      
      <div className="mt-4 p-3 bg-gray-100 rounded-md">
        <p className="text-sm">
          Selected: {date ? date.toDateString() : 'None'}
        </p>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <h2 className="font-semibold mb-2">What to look for:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Selected dates should have a prominent background</li>
          <li>Selected dates should have white text</li>
          <li>Selected dates should have a subtle shadow</li>
          <li>Selected dates should have bold text</li>
          <li>Selected dates should have a focus ring</li>
        </ul>
      </div>
    </div>
  )
}