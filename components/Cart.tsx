
'use client'

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Force test mode to match the secret key's mode
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
        stripeAccount: undefined,
        apiVersion: undefined,
        locale: 'auto',
      })
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <ShoppingCart className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              {cartItems.map((item) => (
                <div key={item.name} className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.name, parseInt(e.target.value))}
                      className="w-12 text-center border rounded-md mr-2"
                    />
                    <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.name)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button className="w-full mt-4" onClick={handleCheckout} disabled={loading}>
                  {loading ? 'Loading...' : 'Checkout'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
