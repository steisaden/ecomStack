'use client'

import { useEffect, useState } from 'react';
import ContentfulProducts from '../../components/ContentfulProducts';
import ContentfulBlogPosts from '../../components/ContentfulBlogPosts';
import StripeOrders from '../../components/StripeOrders';
import DashboardStatistics from '../../components/DashboardStatistics';
import LogoutButton from '../../components/LogoutButton';
import { useRouter } from 'next/navigation';
import CreateContentTypeForm from '../../components/CreateContentTypeForm';
import { ProductIntegrationStatus } from '../../components/admin/ProductIntegrationStatus';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info } from 'lucide-react';

const SHOW_PRODUCT_INTEGRATION = false;
const SHOW_AMAZON_PAAPI_CARD = false;
const SHOW_SALES_ANALYTICS = false;

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Client-side authentication check
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const userData = await response.json();
        if (!userData.user || (userData.user.role !== 'admin' && userData.user.role !== 'editor')) {
          router.push('/login');
          return;
        }

        setUser(userData.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      {/* Security headers are handled by middleware, but we can add meta tags for additional security */}
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-hero font-heading text-primary">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Welcome, {user.username} ({user.role})
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Session info for security awareness */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between text-sm text-blue-800">
            <span>🔒 Secure session active</span>
            <span>Session expires automatically for security</span>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Admin Tools</h2>
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-md border border-beauty-light w-full">
              <h3 className="text-xl font-semibold text-beauty-dark mb-3">
                Yoga Availability
              </h3>
              <p className="text-beauty-muted mb-6 text-base">
                Manage yoga service availability and view upcoming bookings
              </p>
              <a
                href="/admin/yoga-availability"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-base font-medium"
              >
                Manage Availability
              </a>
            </div>

            {/* Social Media Accounts */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-beauty-light w-full">
              <h3 className="text-xl font-semibold text-beauty-dark mb-3">
                Social Media Accounts
              </h3>
              <p className="text-beauty-muted mb-6 text-base">
                Manage your social media links and presence across platforms
              </p>
              <a
                href="/admin/social-media"
                className="inline-flex items-center px-6 py-3 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors text-base font-medium"
              >
                Manage Social Accounts
              </a>
            </div>

            {/* About Page Management */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-beauty-light w-full">
              <h3 className="text-xl font-semibold text-beauty-dark mb-3">
                About Page Image
              </h3>
              <p className="text-beauty-muted mb-6 text-base">
                Update the hero image displayed on the About page
              </p>
              <a
                href="/admin/about-page"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base font-medium"
              >
                Manage About Image
              </a>
            </div>



            {/* Affiliate Products */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-beauty-light w-full">
              <h3 className="text-xl font-semibold text-beauty-dark mb-3">
                Products Management
              </h3>
              <p className="text-beauty-muted mb-6 text-base">
                Manage all products (regular and affiliate) - they appear together on the main products page after validation
              </p>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="/admin/affiliate-products/manage"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-base font-medium"
                >
                  Manage Affiliate Products
                </a>
                <a
                  href="/admin/affiliate-products/add-manual"
                  className="inline-flex items-center px-6 py-3 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors text-base font-medium"
                >
                  Add New Product
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Note: Automatic Amazon API fetching requires PA-API access (3 sales in 180 days)
              </p>
            </div>

            {/* Yoga Services Management */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-beauty-light w-full">
              <h3 className="text-xl font-semibold text-beauty-dark mb-3">
                Yoga Services Management
              </h3>
              <p className="text-beauty-muted mb-6 text-base">
                Manage yoga services, sessions, and wellness offerings for your clients.
              </p>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="/admin/yoga-services"
                  className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-base font-medium"
                >
                  Manage Yoga Services
                </a>
              </div>
            </div>

            {/* AI System Rules */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-beauty-light w-full">
              <h3 className="text-xl font-semibold text-beauty-dark mb-3">
                AI System Rules
              </h3>
              <p className="text-beauty-muted mb-6 text-base">
                Configure guidance for AI-generated content and tooling. Currently blank—add rules when ready.
              </p>
              <a
                href="/admin/ai-rules"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-base font-medium"
              >
                Open AI Rules
              </a>
            </div>



            {/* Contentful Content Types */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-beauty-light w-full relative">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <Info className="h-5 w-5" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How to use the Contentful Content Types Section</DialogTitle>
                  </DialogHeader>
                  <div className="prose">
                    <p>This section allows you to manage your Contentful content types directly from the admin panel.</p>
                    <h4>Key Functionalities:</h4>
                    <ul>
                      <li>
                        <strong>Bootstrap Required Types:</strong> This button will create the essential content types (`aboutPage` and `socialMediaSettings`) that are required for the website to function correctly. Use this if you are setting up a new Contentful space.
                      </li>
                      <li>
                        <strong>Create Content Type Form:</strong> This form allows you to create new content types with custom fields.
                      </li>
                    </ul>
                    <h4>Best Practices:</h4>
                    <ul>
                      <li>
                        <strong>Plan your content model:</strong> Before creating content types, it is best to have a clear idea of the content you want to manage.
                      </li>
                      <li>
                        <strong>Use descriptive names:</strong> Give your content types and fields clear and descriptive names.
                      </li>
                      <li>
                        <strong>Be mindful of field types:</strong> Choose the appropriate field type for your content (e.g., Text, Rich Text, Media).
                      </li>
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
              <h3 className="text-xl font-semibold text-beauty-dark mb-3">Contentful Content Types</h3>
              <p className="text-beauty-muted mb-6 text-base">
                Create Contentful content types directly from the admin panel.
              </p>
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/contentful/bootstrap', { method: 'POST' });
                      const data = await res.json();
                      if (!res.ok || !data.success) {
                        alert(`Bootstrap completed with issues: ${JSON.stringify(data, null, 2)}`);
                      } else {
                        alert('Successfully bootstrapped content types: aboutPage, socialMediaSettings');
                      }
                    } catch (e: any) {
                      alert('Bootstrap failed: ' + (e?.message || 'Unknown error'));
                    }
                  }}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-base font-medium"
                >
                  Bootstrap Required Types
                </button>

                <CreateContentTypeForm />
              </div>
            </div>

            {/* Product Integration Status (temporarily hidden) */}
            {SHOW_PRODUCT_INTEGRATION && <ProductIntegrationStatus />}

            {/* Amazon PA-API Configuration (temporarily hidden) */}
            {SHOW_AMAZON_PAAPI_CARD && (
              <div className="bg-white p-8 rounded-lg shadow-md border border-beauty-light w-full">
                <h3 className="text-xl font-semibold text-beauty-dark mb-3">
                  Amazon PA-API Configuration
                </h3>
                <p className="text-beauty-muted mb-6 text-base">
                  Manage your Amazon Product Advertising API credentials and settings.
                </p>
                <a
                  href="/admin/amazon-paapi-config"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-base font-medium"
                >
                  Configure PA-API
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Comprehensive Dashboard Statistics */}
        <div className="mb-8">
          <DashboardStatistics />
        </div>

        {/* Main Dashboard Grid */}
        <div className="space-y-8">
          {/* Contentful Products Section */}
          <div className="w-full">
            <ContentfulProducts />
          </div>

          {/* Stripe Dashboard Section (temporarily hidden) */}
          {SHOW_SALES_ANALYTICS && (
            <div className="w-full">
              <StripeOrders />
            </div>
          )}

          {/* Contentful Blog Posts Section */}
          <div className="w-full">
            <ContentfulBlogPosts />
          </div>
        </div>
      </div>
    </>
  );
}
