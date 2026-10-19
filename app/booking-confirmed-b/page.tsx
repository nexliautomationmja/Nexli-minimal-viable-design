// ---------------------------------------------------------------------------
// The B variant of the booking confirmation page.
//
// This is where the advisory funnel lands every booking: the call page's
// onBooked redirect comes here, and the resume_url in the confirmation email
// and the Cal reminders points here too. /booking-confirmed (A) is now only
// reached by the retired demo funnel.
//
// Ungated on purpose. The resume link has to open on a phone that has never
// visited the site, and the page shows nothing that isn't already in the
// pitch — so it reads ?name= and falls back to a generic greeting.
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
