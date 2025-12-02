import { headers } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Force dynamic rendering for admin routes that use authentication
export const dynamic = 'force-dynamic';

export default async function AdminProductsLayout({
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
    <div className="admin-products-layout">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div>
            <h1 className="text-2xl font-bold">Product Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage your direct and affiliate products
            </p>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
}