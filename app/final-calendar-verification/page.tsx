'use client'

import React from 'react'
import { Calendar } from '@/components/ui/calendar'

export default function FinalCalendarVerification() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Final Calendar Component Verification</h1>
      <p>
        This simple page verifies that the enhanced calendar component is working.
        Selected dates should now be more visually distinct.
      </p>
      
      <div style={{ marginTop: '2rem', maxWidth: '350px' }}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
        />
      </div>
      
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5' }}>
        <p>
          Selected date: {date ? date.toDateString() : 'None'}
        </p>
      </div>
      
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e0f0ff' }}>
        <h2>What to look for:</h2>
        <ul>
          <li>Selected dates should have a prominent colored background</li>
          <li>Selected dates should have contrasting text color</li>
          <li>Selected dates should have a subtle shadow</li>
          <li>Selected dates should have bold text</li>
          <li>Selected dates should have a focus ring</li>
        </ul>
      </div>
    </div>
  )
}