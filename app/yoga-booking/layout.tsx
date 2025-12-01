"use client";

import { BookingCartProvider } from '@/lib/contexts/BookingCartContext';

export default function YogaBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BookingCartProvider>{children}</BookingCartProvider>;
}
