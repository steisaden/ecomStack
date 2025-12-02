import { headers } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Force dynamic rendering for admin routes that use authentication
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check authentication at layout level for extra security
  const user = await getCurrentUser();
  
  if (!user) {
    console.warn('Unauthorized access attempt to admin section - redirecting to login');
    redirect('/login');
  }

  // Verify user has appropriate role
  if (user.role !== 'admin' && user.role !== 'editor') {
    console.warn(`User ${user.username} with insufficient role ${user.role} attempted to access admin section`);
    redirect('/login');
  }

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}

// Add metadata for admin pages
export const metadata = {
  title: 'Admin Dashboard - Goddess Care Co',
  description: 'Administrative interface for content and sales management',
  robots: 'noindex, nofollow', // Prevent search engine indexing
};
