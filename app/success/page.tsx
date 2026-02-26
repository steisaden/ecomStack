
import Stripe from 'stripe';
import { Suspense } from 'react';
import Link from 'next/link';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function getSession(session_id: string) {
  if (!session_id) {
    return null;
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product', 'customer'],
    });
    return session;
  } catch (error) {
    console.error('Error retrieving session:', error);
    return null;
  }
}

function OrderDetails({ session }: { session: Stripe.Checkout.Session | null }) {
  if (!session) {
    return (
      <div className="text-center">
        <p className="text-red-500">Could not retrieve order details.</p>
      </div>
    );
  }

  const customer = session.customer as Stripe.Customer;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Order Details</h2>
      <div className="p-4 bg-light-gray rounded-lg">
        <p><strong>Order ID:</strong> {session.id}</p>
        {customer && <p><strong>Customer:</strong> {customer.name}</p>}
        {customer && <p><strong>Email:</strong> {customer.email}</p>}
        <p><strong>Total:</strong> ${(session.amount_total! / 100).toFixed(2)}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Items</h3>
        {session.line_items?.data.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.description}</span>
            <span>x{item.quantity}</span>
            <span>${(item.amount_total / 100).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const session_id = resolvedParams.session_id as string | undefined;
  const session = await getSession(session_id || '');

  return (
    <div className="container section-spacing text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-hero font-heading text-primary mb-2">
            Order Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. You&apos;ll receive a confirmation email shortly.
          </p>
        </div>

        <Suspense fallback={<div>Loading order details...</div>}>
          <OrderDetails session={session} />
        </Suspense>

        <div className="space-y-4 mt-8">
          <Link href="/products" className="btn-primary block">
            Continue Shopping
          </Link>
          <Link href="/" className="btn-secondary block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
