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
  /**
   * E.164 only (+15551234567). Prefills Cal's phone field, which is what
   * its SMS reminders are sent to — so a wrong value here is worse than a
   * blank one. Pass it through toE164() in lib/contact-validation; that
   * returns '' rather than guessing, and '' is skipped below.
   *
   * Requires a phone question to exist on the event type (Cal: Event Type
   * > Advanced > Booking Questions). Cal drops a prefill for a field it
   * does not have, with no error anywhere — if the number is not landing,
   * check the event type before suspecting this code.
   */
  phone?: string;
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

/** How long to wait for Cal's iframe before offering the direct link. */
const STALL_MS = 8000;

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
  phone,
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
  /**
   * 'loading' until Cal injects its iframe, 'stalled' if it never does.
   *
   * The container used to be an empty 520px box with a faint background and
   * nothing in it. When Cal's script does not run — an ad blocker or privacy
   * extension (cal.com is on several common blocklists), a corporate network,
   * an outage — a qualified lead who has just answered five questions lands
   * on a blank grey rectangle with no way to book and no way to tell anyone.
   */
  const [status, setStatus] = useState<'loading' | 'ready' | 'stalled'>('loading');

  /**
   * The same booking page, opened directly. cal.com/<link> is the public
   * host; app.cal.com is what the embed iframe uses. Prefills carry over so
   * the lead does not retype what they just gave us.
   */
  const fallbackUrl = (() => {
    const qs = new URLSearchParams();
    if (name) qs.set('name', name);
    if (email) qs.set('email', email);
    if (phone) qs.set('attendeePhoneNumber', phone);
    if (notes) qs.set('notes', notes);
    const q = qs.toString();
    return `https://cal.com/${calLink}${q ? `?${q}` : ''}`;
  })();

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
        // Cal's identifier for the phone question. Omitted entirely when
        // blank — passing '' makes Cal render the field as touched-and-
        // empty, which trips its own validation before the visitor has
        // typed anything.
        ...(phone ? { attendeePhoneNumber: phone } : {}),
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
          // onBooked usually navigates (the advisory call page redirects to
          // /booking-confirmed-b 1.8s from here), and a normal fetch is
          // cancelled when the page unloads. Without keepalive the booking
          // silently never records: no booked_call_at, no "call booked" tag,
          // no CAPI Schedule, and nothing anywhere says it failed.
          keepalive: true,
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

    // Watch for Cal's iframe rather than trusting the script to have run.
    const el = containerRef.current;
    const started = Date.now();
    const poll = window.setInterval(() => {
      if (el?.querySelector('iframe')) {
        setStatus('ready');
        window.clearInterval(poll);
      } else if (Date.now() - started > STALL_MS) {
        setStatus('stalled');
        window.clearInterval(poll);
      }
    }, 400);

    return () => {
      window.clearInterval(poll);
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
      className="relative w-full min-h-[520px] rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      {/* Cal injects into this. Anything React renders inside it would be
          wiped, so the states below are siblings laid over the top. */}
      <div ref={containerRef} className="w-full" />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" aria-live="polite">
          <span
            className="h-7 w-7 animate-spin rounded-full border-2 border-white/15"
            style={{ borderTopColor: brandColor }}
            aria-hidden="true"
          />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Loading the calendar…
          </p>
        </div>
      )}

      {status === 'stalled' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center" role="alert">
          <CalendarCheck size={26} style={{ color: brandColor }} aria-hidden="true" />
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            The calendar did not load. An ad blocker or privacy extension will usually do
            this — open it directly instead and your time is still held.
          </p>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: brandColor }}
          >
            Open the booking page
          </a>
        </div>
      )}
    </div>
  );
};

export default InlineCalEmbed;
