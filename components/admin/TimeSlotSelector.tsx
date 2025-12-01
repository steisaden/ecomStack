'use client';

import { Button } from '@/components/ui/button';
import { to12HourFormat } from '@/lib/timeUtils';

interface TimeSlotSelectorProps {
  commonTimeSlots: string[];
  selectedSlots: string[];
  onToggleSlot: (slot: string) => void;
  title?: string;
  description?: string;
  className?: string;
}

export function TimeSlotSelector({
  commonTimeSlots,
  selectedSlots,
  onToggleSlot,
  title = "Select Time Slots",
  description,
  className = ""
}: TimeSlotSelectorProps) {
  return (
    <div className={className}>
      <h4 className="font-medium text-beauty-dark mb-3">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-beauty-muted mb-4">
          {description}
        </p>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {commonTimeSlots.map((slot) => (
          <Button
            key={slot}
            variant={selectedSlots.includes(slot) ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSlot(slot)}
            className={`text-sm transition-all duration-200 ${
              selectedSlots.includes(slot) 
                ? "bg-primary text-white shadow-md" 
                : "hover:bg-primary/10"
            }`}
          >
            {to12HourFormat(slot)}
          </Button>
        ))}
      </div>
    </div>
  );
}