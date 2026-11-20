'use client';

// ---------------------------------------------------------------------------
// The calendar on the VSLs, directly under the pricing (Marcel, 2026-11-19).
//
// WHY IT IS HERE. The path used to be VSL → "See If Your Firm Qualifies" →
// a five-step qualifier on another page → the calendar on a third. Firms
// that could afford the work were falling out between the pages. Now every
// button on the VSL scrolls to #book: the price first, then this calendar,
// and Cal's own booking form (the questions are on the event type in Cal;
// see VSL_CAL_LINK in lib/demo-config) is the only thing to fill in.
//
// WHO RECORDS THE BOOKING. Not this component. A visitor here has no lead
// row and no session cookie, so there is nothing to authenticate a POST
// with, and an open endpoint would let anyone write bookings into GHL. Cal
// sends a signed webhook for every booking on the event type, and
// app/api/cal/booking does the database row, GHL and the CAPI events.
//
// WHAT THIS DOES SEND. Metadata Cal stores on the booking and hands back in
// that webhook: which VSL it was (angle), the visitor's Meta identifiers
// and UTMs, and the ids of the Schedule and Lead events the pixel fires
// here, so the server's CAPI copies deduplicate against them. Lead matters:
// it is the event the campaigns optimise for, and the qualifier that used
// to fire it is no longer in the path.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react';
import { Clock, Globe2 } from 'lucide-react';
import InlineCalEmbed from '@/components/InlineCalEmbed';
import { captureAttribution } from '@/lib/attribution';
import { generateEventId, trackMetaEvent } from '@/lib/meta-events';
import {
  BOOKING_CONFIRMED_B_PATH,
  VSL_BOOKING_CONTENT_NAME,
  VSL_CALL_MINUTES,
  VSL_CAL_LINK,
} from '@/lib/demo-config';

interface Prepared {
  metadata: Record<string, string>;
  scheduleEventId: string;
  leadEventId: string;
  timeZone: string;
}

/** "Eastern Time (America/New_York)", or the bare IANA id if the browser
 *  cannot name it. */
function describeTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return '';
    const long = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longGeneric' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value;
    return long && long !== tz ? `${long} (${tz.replace(/_/g, ' ')})` : tz.replace(/_/g, ' ');
  } catch {
    return '';
  }
}

export default function VslBooking({ angle }: { angle: string }) {
  // Built after mount: the event ids must be stable for the life of the
  // embed (Cal reads its config once), and attribution and the time zone
  // only exist in the browser.
  const [prepared, setPrepared] = useState<Prepared | null>(null);

  useEffect(() => {
    let a: ReturnType<typeof captureAttribution> | null = null;
    try {
      a = captureAttribution();
    } catch {
      a = null;
    }
    const scheduleEventId = generateEventId();
    const leadEventId = generateEventId();
    const metadata: Record<string, string> = {
      source: 'vsl',
      angle,
      schedule_event_id: scheduleEventId,
      lead_event_id: leadEventId,
    };
    const fields: Array<[string, string | null | undefined]> = [
      ['fbp', a?.fbp],
      ['fbc', a?.fbc],
      ['fbclid', a?.fbclid],
      ['utm_source', a?.utm_source],
      ['utm_medium', a?.utm_medium],
      ['utm_campaign', a?.utm_campaign],
      ['utm_content', a?.utm_content],
      ['utm_term', a?.utm_term],
      ['landing_page', a?.landing_page],
    ];
    for (const [k, v] of fields) if (v) metadata[k] = v;
    // The visitor's own browser, for Meta (2026-11-20). The booking reaches
    // the site through Cal's server, so this is the only way the site learns
    // it, and a website event (Schedule, Lead, and QualifiedLead later from
    // the GHL pipeline) needs it. Cal caps a value at 500 characters.
    try {
      if (navigator.userAgent) metadata.user_agent = navigator.userAgent.slice(0, 500);
    } catch {
      /* no navigator: leave it out */
    }
    setPrepared({ metadata, scheduleEventId, leadEventId, timeZone: describeTimeZone() });
  }, [angle]);

  const onBooked = useCallback(
    (data: any) => {
      if (!prepared) return;
      // Schedule is fired by InlineCalEmbed with scheduleEventId; Lead here.
      trackMetaEvent(
        'Lead',
        { content_name: VSL_BOOKING_CONTENT_NAME, content_category: 'Booking' },
        prepared.leadEventId,
      );

      // Cal's payload shape is not contractual; take a name if it has one.
      let name = '';
      try {
        const r = data?.booking?.responses ?? data?.responses ?? {};
        const raw = r?.name;
        name =
          (typeof raw === 'string' ? raw : raw?.firstName ? `${raw.firstName} ${raw.lastName ?? ''}` : '') ||
          data?.booking?.attendees?.[0]?.name ||
          '';
      } catch {
        name = '';
      }
      const qs = name.trim() ? `?name=${encodeURIComponent(name.trim())}` : '';
      // Cal is still showing its own confirmation; the same 1.8s the /call
      // pages wait, and only if Cal's "Redirect on booking" is left empty.
      window.setTimeout(() => {
        window.location.href = `${BOOKING_CONFIRMED_B_PATH}${qs}`;
      }, 1800);
    },
    [prepared],
  );

  return (
    // Tighter on a phone (Marcel, 2026-11-20): the price sits right above, and
    // the heading fits one line, so the calendar starts sooner.
    <div className="mx-auto mt-8 max-w-4xl sm:mt-12 md:mt-16">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400 sm:text-xs">
        Pick a time
      </p>
      <h3
        className="mt-2 text-balance text-center text-[1.3rem] text-white sm:mt-3 sm:text-2xl md:text-3xl"
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}
      >
        Book your CPA Acquisition Review
      </h3>
      <div className="mt-3 flex flex-col items-center justify-center gap-1.5 text-[13px] text-white/70 sm:mt-4 sm:flex-row sm:gap-5 sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-blue-400" aria-hidden="true" />
          {VSL_CALL_MINUTES}-minute video call
        </span>
        <span className="inline-flex max-w-[20rem] items-start gap-1.5 text-left sm:max-w-none sm:items-center">
          <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400 sm:mt-0" aria-hidden="true" />
          {prepared?.timeZone
            ? <>Times shown in your time zone: {prepared.timeZone}</>
            : 'Times shown in your time zone'}
        </span>
      </div>

      <div className="mt-4 sm:mt-6">
        {prepared ? (
          <InlineCalEmbed
            calLink={VSL_CAL_LINK}
            // Its own namespace: the global QualificationProvider handler
            // listens on the default one and redirects to /thank-you.
            namespace="vsl-booking"
            metadata={prepared.metadata}
            scheduleEventId={prepared.scheduleEventId}
            scheduleContentName={VSL_BOOKING_CONTENT_NAME}
            brandColor="#2563eb"
            bookedTitle="You're booked."
            onBooked={onBooked}
          />
        ) : (
          <div className="min-h-[520px] rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} />
        )}
      </div>
    </div>
  );
}
