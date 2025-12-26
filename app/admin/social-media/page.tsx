import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SocialMediaClient from './SocialMediaClient';

export const dynamic = 'force-dynamic';

export default async function SocialMediaSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <SocialMediaClient user={user} />;
}
