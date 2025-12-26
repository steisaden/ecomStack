import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AboutPageClient from './AboutPageClient';

export const dynamic = 'force-dynamic';

export default async function AboutPageManagement() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <AboutPageClient user={user} />;
}
