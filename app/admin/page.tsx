import Dashboard from '@/legacy_pages/admin/Dashboard';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();
  // Note: user is already checked in layout.tsx, but we can pass it if we need it.
  // Currently Dashboard doesn't use it, but we'll pass it for future proofing
  return <Dashboard user={user} />;
}
