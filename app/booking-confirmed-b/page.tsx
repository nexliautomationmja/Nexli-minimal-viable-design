// ---------------------------------------------------------------------------
// The B variant of the booking confirmation page.
//
// Nothing in the app sends anyone here — Marcel points traffic at it by hand.
// /booking-confirmed remains the default destination for every booking.
//
// Suspense because the client reads ?name= via useSearchParams, same as A.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { Suspense } from 'react';
import BookingConfirmedB from '@/components/BookingConfirmedB';

export const metadata: Metadata = {
  title: 'Your Strategy Session Is Confirmed | Nexli',
  description: 'Everything in the engagement, before we speak.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/booking-confirmed-b' },
};

export default function BookingConfirmedBPage() {
  return (
    <Suspense fallback={null}>
      <BookingConfirmedB />
    </Suspense>
  );
}
