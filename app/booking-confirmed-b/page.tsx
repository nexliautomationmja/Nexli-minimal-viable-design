// ---------------------------------------------------------------------------
// The booking confirmation page. The only one — /booking-confirmed (A) was
// deleted and now 308s here.
//
// Every booking lands here: the call page's onBooked redirect, and the
// resume_url in the confirmation email and the Cal reminders.
//
// The -b in the path is vestigial, from when this was the B arm of a split
// test that never ran. Kept because resume URLs already issued to real
// contacts encode it, and those tokens live for 30 days.
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
