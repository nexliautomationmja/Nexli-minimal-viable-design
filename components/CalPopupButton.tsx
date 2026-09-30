'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { generateEventId, trackMetaEvent } from '@/lib/meta-events';

export interface UseCalPopupOptions {
  /** Cal.com link, e.g. "nexli-automation-6fgn8j/nexli-demo". */
  calLink: string;
  /** Unique Cal namespace so this never collides with the global modal. */
  namespace: string;
  /** API route that records the booking. */
  bookedEndpoint: string;
  name: string;
  email: string;
  /** Signed demo-funnel lead cookie, posted back as `lead_token`. */
  leadToken?: string;
  /** Paid Stripe session id, posted back as `session_id`. */
  sessionId?: string;
  /** Prefilled Cal.com notes. */
  notes?: string;
  /** Meta pixel Schedule event content_name. */
  scheduleContentName?: string;
  /** Copy shown in place of the button after a successful booking. */
  bookedTitle?: string;
  bookedBody?: string;
  onBooked?: () => void;
}

export interface CalPopupButtonProps extends UseCalPopupOptions {
  /** Rendered inside the button. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Opens Cal.com as an overlay instead of embedding a calendar in the page.
 *
 * Why a popup and not a link to cal.com: the `bookingSuccessful` callback below
 * is what stamps `bookedCallAt` on the lead, fires the Meta CAPI `Schedule`
 * conversion with an event_id for pixel dedup, and adds the `call booked` tag
 * in GoHighLevel. A plain anchor to cal.com throws all three away, including
 * the conversion signal Meta optimises ad spend against. The overlay keeps the
 * visitor on our page and keeps the attribution.
 *
 * QualificationProvider runs its own global `bookingSuccessful` handler, but it
 * early-returns on /demo* paths, so there is no double fire here.
 */
/**
 * Initialises the Cal embed once and hands back an `open()` that pops the
 * overlay. A page with several "book a time" affordances calls this once and
 * wires every button to the same instance, so they cannot drift out of sync
 * or register duplicate booking handlers.
 */
export function useCalPopup({
  calLink,
  namespace,
  bookedEndpoint,
  name,
  email,
  leadToken,
  sessionId,
  notes,
  scheduleContentName = 'Advisory Engine Growth Call',
  onBooked,
}: UseCalPopupOptions) {
  const bookedRef = useRef(false);
  const [booked, setBooked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Same loader as QualificationProvider and InlineCalEmbed — idempotent if
    // the script is already on the page.
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
    ns('ui', {
      theme: 'dark',
      hideEventTypeDetails: false,
      cssVarsPerTheme: { dark: { 'cal-brand': '#2563eb' }, light: { 'cal-brand': '#2563eb' } },
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
          scheduleEventId,
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
          // onBooked may navigate away (the demo funnel sends people to
          // /booking-confirmed). Without keepalive the browser cancels this
          // in flight and we silently lose the Schedule event and the GHL tag.
          keepalive: true,
        }).catch(() => {});

        setBooked(true);
        onBooked?.();
      },
    });
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = useCallback(() => {
    const Cal = (window as any).Cal;
    if (Cal?.ns?.[namespace]) {
      Cal.ns[namespace]('modal', {
        calLink,
        config: { name, email, notes: notes || '', layout: 'month_view', theme: 'dark' },
      });
      return;
    }
    // The embed script never loaded (blocked, offline, slow). Better to send
    // them to Cal than to leave a dead button — we lose the conversion event,
    // which is why this is the fallback and not the default.
    window.location.href = `https://cal.com/${calLink}`;
  }, [calLink, name, email, notes, namespace]);

  return { open, booked, ready };
}

const CalPopupButton: React.FC<CalPopupButtonProps> = ({ children, className, ...opts }) => {
  const { open, booked, ready } = useCalPopup(opts);
  const { bookedTitle = "You're booked.", bookedBody, email } = opts;

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
    <button type="button" onClick={open} disabled={!ready} className={className}>
      {children}
    </button>
  );
};

export default CalPopupButton;
