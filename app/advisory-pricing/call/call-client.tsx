'use client';

// ---------------------------------------------------------------------------
// The calendar, and nothing else.
//
// This route used to render DemoCallClient — a second full VSL, ~5,800px of
// desktop scroll before the booking button, with no calendar on the page at
// all. Almost all of it repeated the VSL the visitor had just watched
// (it rendered the same guarantee block, since removed), and it opened with the
// older Jasmine $8,000-era video, so a firm heard $15,000 in the VSL and then
// $8,000 thirty seconds later.
//
// A qualified firm has already had the pitch. What is left is picking a time,
// so the calendar is the page. DemoCallClient is untouched and still serves
// /demo/call.
//
// InlineCalEmbed owns the booked state, the Meta Schedule event and the POST
// to bookedEndpoint; this component only supplies the identity and decides
// where to go afterwards.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import InlineCalEmbed from '@/components/InlineCalEmbed';
import { BOOKING_CONFIRMED_PATH, DEMO_CAL_LINK } from '@/lib/demo-config';

export interface AdvisoryCallClientProps {
  fullName: string;
  email: string;
  /** Signed lead cookie — authenticates the booking callback. */
  leadToken: string;
  /** Call-prep block prefilled into Cal's notes field. */
  notes: string;
}

export default function AdvisoryCallClient({
  fullName,
  email,
  leadToken,
  notes,
}: AdvisoryCallClientProps) {
  const onBooked = useCallback(() => {
    // Cal is still showing its own confirmation at this point, so the same
    // 1800ms the popup flow used — redirecting instantly reads as a glitch,
    // and it gives the keepalive POST headroom to land.
    const qs = new URLSearchParams();
    if (fullName) qs.set('name', fullName);
    if (email) qs.set('email', email);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';

    window.setTimeout(() => {
      window.location.href = `${BOOKING_CONFIRMED_PATH}${suffix}`;
    }, 1800);
  }, [fullName, email]);

  return (
    <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20">
      <InlineCalEmbed
        calLink={DEMO_CAL_LINK}
        // Its own namespace, which is what keeps this off the global
        // QualificationProvider modal handler running on `nexli-demo`.
        namespace="advisory-growth-call"
        bookedEndpoint="/api/advisory-pricing/booked"
        name={fullName}
        email={email}
        leadToken={leadToken}
        notes={notes}
        scheduleContentName="Advisory Engine Growth Call"
        // The funnel blue. The embed defaults to #3b82f6, a shade off every
        // other CTA in this funnel.
        brandColor="#2563eb"
        bookedTitle="You're booked."
        onBooked={onBooked}
      />
    </section>
  );
}
