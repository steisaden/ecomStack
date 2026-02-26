import { createClient as createManagementClient } from 'contentful-management';
import { Availability } from './types';

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache
let cache: { data: Availability; expires: number } | null = null;

function hasContentfulConfig() {
  return (
    !!process.env.CONTENTFUL_MANAGEMENT_TOKEN &&
    !!process.env.CONTENTFUL_SPACE_ID
  );
}

function getEnvId() {
  return (process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master').trim();
}

function getManagementClient() {
  if (!hasContentfulConfig()) return null;
  return createManagementClient({
    accessToken: (process.env.CONTENTFUL_MANAGEMENT_TOKEN || '').trim(),
  });
}

async function fetchAvailabilityFromContentful(serviceId?: string): Promise<Availability> {
  const client = getManagementClient();
  if (!client) return {};

  const space = await client.getSpace((process.env.CONTENTFUL_SPACE_ID || '').trim());
  const environment = await space.getEnvironment(getEnvId());

  const query: any = { content_type: 'yogaAvailability', limit: 1000 };
  if (serviceId) {
    query['fields.serviceId'] = serviceId;
  }

  const entries = await environment.getEntries(query);
  const availability: Availability = {};

  for (const item of entries.items as any[]) {
    const fields = item.fields || {};
    const sid = fields.serviceId?.['en-US'];
    const date = fields.date?.['en-US'];
    const timeSlots = fields.timeSlots?.['en-US'] || {};
    if (!sid || !date) continue;
    availability[sid] = availability[sid] || {};
    availability[sid][date] = timeSlots;
  }

  return availability;
}

async function upsertAvailabilityToContentful(allAvailability: Availability) {
  const client = getManagementClient();
  if (!client) return;
  const space = await client.getSpace((process.env.CONTENTFUL_SPACE_ID || '').trim());
  const environment = await space.getEnvironment(getEnvId());

  for (const [serviceId, dates] of Object.entries(allAvailability)) {
    for (const [date, timeSlots] of Object.entries(dates)) {
      const existing = await environment.getEntries({
        content_type: 'yogaAvailability',
        'fields.serviceId': serviceId,
        'fields.date': date,
        limit: 1,
      });

      if (existing.items.length > 0) {
        const entry = existing.items[0] as any;
        entry.fields.timeSlots = { 'en-US': timeSlots };
        const updatedEntry = await entry.update();
        await updatedEntry.publish();
      } else {
        const entry = await environment.createEntry('yogaAvailability', {
          fields: {
            serviceId: { 'en-US': serviceId },
            date: { 'en-US': date },
            timeSlots: { 'en-US': timeSlots },
          },
        });
        await entry.publish();
      }
    }
  }
}

export async function getAvailability(serviceId?: string): Promise<any> {
  const now = Date.now();
  if (cache && cache.expires > now) {
    const data = cache.data;
    return serviceId ? data[serviceId] || {} : data;
  }

  const availability = await fetchAvailabilityFromContentful();
  cache = { data: availability, expires: now + CACHE_TTL_MS };
  return serviceId ? availability[serviceId] || {} : availability;
}

export async function updateAllAvailability(allAvailability: Availability): Promise<void> {
  await upsertAvailabilityToContentful(allAvailability);
  cache = null;
}

export async function validateAvailability(
  serviceId: string,
  date: string,
  time: string
): Promise<boolean> {
  const serviceAvailability = await getAvailability(serviceId);
  return serviceAvailability[date]?.[time] === 'available';
}
