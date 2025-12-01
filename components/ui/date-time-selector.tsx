'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface DateTimeSelectorProps {
  onDateChange?: (date: Date | undefined) => void;
  onTimeChange?: (time: string) => void;
  initialDate?: Date;
  initialTime?: string;
}

export function DateTimeSelector({ 
  onDateChange, 
  onTimeChange, 
  initialDate, 
  initialTime 
}: DateTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || '');
  
  // Generate time slots with 30-minute intervals from 9 AM to 8 PM
  const timeSlots = [];
  for (let i = 9; i <= 20; i++) {
    const hour = i;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    
    timeSlots.push(`${displayHour}:00 ${period}`);
    timeSlots.push(`${displayHour}:30 ${period}`);
  }

  // Update handlers with immediate feedback
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (onTimeChange) {
      onTimeChange(time);
    }
  };

  // Reset selections
  const handleReset = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    if (onDateChange) onDateChange(undefined);
    if (onTimeChange) onTimeChange('');
  };

  // Effect to handle initial values
  useEffect(() => {
    if (initialDate && !selectedDate) {
      setSelectedDate(initialDate);
    }
    if (initialTime && !selectedTime) {
      setSelectedTime(initialTime);
    }
  }, [initialDate, initialTime]);

  return (
    <Card className="border rounded-lg overflow-hidden shadow-md">
      <CardContent className="p-0">
        {/* Stack vertically on mobile, side by side on desktop */}
        <div className="flex flex-col sm:flex-row">
          {/* Date selection section */}
          <div className="p-4 sm:w-1/2">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-medium">Selected Date</Label>
            </div>
            <div className="h-8 mb-4">
              {selectedDate ? (
                <p className="text-lg font-medium text-primary">{format(selectedDate, 'MMMM d, yyyy')}</p>
              ) : (
                <p className="text-lg text-gray-500">Please select a date</p>
              )}
            </div>
            <div className="mt-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
          </div>
          
          {/* Time selection section */}
          <div className="p-4 border-t sm:border-t-0 sm:border-l sm:w-1/2">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-medium">Selected Time</Label>
            </div>
            <div className="h-8 mb-4">
              {selectedTime ? (
                <p className="text-lg font-medium text-primary">{selectedTime}</p>
              ) : (
                <p className="text-lg text-gray-500">Please select a time</p>
              )}
            </div>
            <div className="mt-2">
              <Select value={selectedTime} onValueChange={handleTimeSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]" align="center" side="bottom">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-8 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-xs"
                >
                  Reset Selections
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}