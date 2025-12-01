/**
 * Converts a time string in 24-hour format (HH:MM) to 12-hour format with AM/PM
 * @param timeString - Time in HH:MM format (e.g. "14:30")
 * @returns Time in 12-hour format with AM/PM (e.g. "2:30 PM")
 */
export function to12HourFormat(timeString: string): string {
  // Split the time string to get hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Validate inputs
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time format');
  }
  
  // Determine AM or PM
  const period = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12; // 0 hour should be 12 in 12-hour format
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Converts a time string in 12-hour format back to 24-hour format (HH:MM)
 * @param timeString - Time in 12-hour format with AM/PM (e.g. "2:30 PM")
 * @returns Time in HH:MM format (e.g. "14:30")
 */
export function to24HourFormat(timeString: string): string {
  // Use regex to extract hours, minutes, and period (AM/PM)
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = timeString.match(timeRegex);
  
  if (!match) {
    throw new Error('Invalid 12-hour time format');
  }
  
  let [_, hours, minutes, period] = match;
  let hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  period = period.toUpperCase();
  
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    throw new Error('Invalid time values');
  }
  
  // Convert to 24-hour format
  if (period === 'AM' && hour === 12) {
    hour = 0; // 12 AM is 00 in 24-hour format
  } else if (period === 'PM' && hour !== 12) {
    hour += 12; // Add 12 hours for PM times except 12 PM
  }
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Compares two time strings in HH:MM format for sorting
 * @param timeA - First time string in HH:MM format
 * @param timeB - Second time string in HH:MM format
 * @returns -1 if A is earlier, 0 if equal, 1 if A is later
 */
export function compareTimeStrings(timeA: string, timeB: string): number {
  const [hoursA, minutesA] = timeA.split(':').map(Number);
  const [hoursB, minutesB] = timeB.split(':').map(Number);
  
  if (hoursA !== hoursB) {
    return hoursA - hoursB;
  }
  return minutesA - minutesB;
}

/**
 * Sorts an array of time strings in HH:MM format chronologically
 * @param timeArray - Array of time strings in HH:MM format
 * @returns New array with times sorted chronologically
 */
export function sortTimeStrings(timeArray: string[]): string[] {
  return [...timeArray].sort(compareTimeStrings);
}