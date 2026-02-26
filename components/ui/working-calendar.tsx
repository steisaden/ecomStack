'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkingCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function WorkingCalendar({ selected, onSelect, disabled, className }: WorkingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const days: (Date | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const handleDateClick = (date: Date) => {
    console.log('WorkingCalendar: Date clicked:', date);
    if (onSelect) {
      onSelect(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isSelected = (date: Date) => {
    return selected &&
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear();
  };

  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('p-3 border rounded-lg bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-sm font-semibold">
          {monthNames[month]} {year}
        </h2>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isDisabled(date)}
                className={cn(
                  'w-full h-full text-sm rounded-md transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  isSelected(date) && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  isToday(date) && !isSelected(date) && 'bg-accent text-accent-foreground',
                  isDisabled(date) && 'text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent',
                  !isDisabled(date) && 'cursor-pointer'
                )}
              >
                {date.getDate()}
              </button>
            ) : (
              <div></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}