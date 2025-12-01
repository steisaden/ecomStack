
import fs from 'fs/promises';
import path from 'path';
import { Availability } from './types';

const availabilityPath = path.join(process.cwd(), 'data', 'availability.json');

async function readAvailabilityFile(): Promise<Availability> {
  try {
    const data = await fs.readFile(availabilityPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty object
      return {};
    }
    console.error('Error reading availability data:', error);
    return {};
  }
}

export async function getAvailability(serviceId?: string): Promise<any> {
  const allAvailability = await readAvailabilityFile();
  if (serviceId) {
    return allAvailability[serviceId] || {};
  }
  return allAvailability;
}

export async function updateAllAvailability(
  allAvailability: Availability
): Promise<void> {
  try {
    const data = JSON.stringify(allAvailability, null, 2);
    await fs.writeFile(availabilityPath, data, 'utf-8');
  } catch (error) {
    console.error('Error writing availability data:', error);
  }
}

export async function validateAvailability(
  serviceId: string,
  date: string,
  time: string
): Promise<boolean> {
  const serviceAvailability = await getAvailability(serviceId);
  return serviceAvailability[date]?.[time] === 'available';
}
