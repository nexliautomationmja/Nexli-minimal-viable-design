'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { generateEventId, trackMetaEvent } from '@/lib/meta-events';

interface InlineCalEmbedProps {
  /** Cal.com link, e.g. "nexli-automation-6fgn8j/nexli-demo". */
  calLink: string;
  /** Unique Cal namespace so this embed never collides with the global modal. */
  namespace: string;
  /** API route that records the booking; receives { session_id | lead_token, event_id, booking_uid, start_time }. */
  bookedEndpoint: string;
  name: string;
  email: string;
  /** Paid Stripe session id — doubles as authentication for bookedEndpoint. */
  sessionId?: string;
  /**
   * Signed demo-funnel lead cookie. When supplied it is posted as
   * `lead_token` instead of `session_id`, so unpaid funnel pages can
   * authenticate the booking callback the same way.
   */
  leadToken?: string;
  /** Prefilled Cal.com notes. */
  notes?: string;
  /** Meta pixel Schedule event content_name. */
  scheduleContentName?: string;
  /**
   * Cal's own accent, used for the selected day and the confirm button.
   * Defaults to the value the embed shipped with, so existing callers are
   * unchanged; pages with a different CTA colour pass their own.
   */
  brandColor?: string;
  /** Copy shown after a successful booking. */
  bookedTitle?: string;
  bookedBody?: string;
  onBooked?: () => void;
}

/**
 * Inline Cal.com embed for post-purchase pages. Uses its own namespace so it
 * never collides with the QualificationProvider modal, and skips the
 * qualification gate entirely — the buyer has already paid.
 */
const InlineCalEmbed: React.FC<InlineCalEmbedProps> = ({
  calLink,
  namespace,
  bookedEndpoint,
  name,
  email,
  sessionId,
  leadToken,
  notes,
  scheduleContentName = 'Kickoff Call',
  brandColor = '#3b82f6',
  bookedTitle = "You're booked.",
  bookedBody,
  onBooked,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const bookedRef = useRef(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    // Same loader as QualificationProvider — idempotent if already on the page.
    (function (C: any, A: string, L: string) {
      const p = function (a: any, ar: any) { a.q.push(ar); };
      const d = C.document;
      C.Cal = C.Cal || function () {
        const cal = C.Cal;
        const ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const ns = ar[1];
          api.q = api.q || [];
          if (typeof ns === 'string') {
            cal.ns[ns] = cal.ns[ns] || api;
            p(cal.ns[ns], ar);
            p(cal, ['initNamespace', ns]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');

    const Cal = (window as any).Cal;
    Cal('init', namespace, { origin: 'https://app.cal.com' });

    const ns = Cal.ns[namespace];
    ns('inline', {
      elementOrSelector: containerRef.current,
      calLink,
      config: {
        name,
        email,
        notes: notes || '',
        layout: 'month_view',
        // theme is set once in the ns('ui') call below — setting it in both
        // places let them drift apart.
      },
    });
    ns('ui', {
      theme: 'dark',
      // Cal's month_view puts the event-type panel in a second column. Inside
      // our ~800px container that squeezed the month grid into a cramped strip,
      // which is what made the embed look broken. The visitor has already read
      // the duration and the agenda in our own copy above it, so hide it and
      // let the calendar have the full width.
      hideEventTypeDetails: true,
      cssVarsPerTheme: { dark: { 'cal-brand': brandColor }, light: { 'cal-brand': brandColor } },
    });
    ns('on', {
      action: 'bookingSuccessful',
      callback: (e: any) => {
        if (bookedRef.current) return;
        bookedRef.current = true;

        const data = e?.detail?.data ?? {};
        const scheduleEventId = generateEventId();
        trackMetaEvent(
          'Schedule',
          { content_name: scheduleContentName, content_category: 'Booking' },
          scheduleEventId
        );

        fetch(bookedEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(leadToken ? { lead_token: leadToken } : { session_id: sessionId }),
            event_id: scheduleEventId,
            booking_uid: data.uid ?? data.booking?.uid ?? '',
            start_time: data.date ?? data.booking?.startTime ?? '',
          }),
        }).catch(() => {});

        setBooked(true);
        onBooked?.();
      },
    });

    const el = containerRef.current;
    return () => {
      if (el) el.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (booked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-8 sm:p-10 text-center"
        style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}
      >
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
        >
          <CalendarCheck size={32} className="text-green-400" />
        </div>
        <h3
          className="text-xl sm:text-2xl font-black text-white mb-2"
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          {bookedTitle}
        </h3>
        <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {bookedBody || `The calendar invite is on its way to ${email}.`}
        </p>
      </motion.div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[520px] rounded-2xl"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
    />
  );
};

export default InlineCalEmbed;
