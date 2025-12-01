
'use client';

interface TimeSlotsProps {
  availableTimes: { [time: string]: string };
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
}

export function TimeSlots({ availableTimes, selectedTime, onSelectTime }: TimeSlotsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(availableTimes).map(([time, status]) => (
        <button
          key={time}
          disabled={status !== 'available'}
          onClick={() => onSelectTime(time)}
          className={`p-4 rounded-lg text-center font-bold 
            ${status === 'available' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
            ${status === 'booked' ? 'bg-red-500 text-white cursor-not-allowed' : ''}
            ${status === 'unavailable' ? 'bg-gray-400 text-white cursor-not-allowed' : ''}
            ${selectedTime === time ? 'ring-4 ring-blue-500' : ''}
          `}
        >
          {time}
        </button>
      ))}
    </div>
  );
}
