'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { generateEventId, trackMetaEvent } from '@/lib/meta-events';
import { ROADMAP_CAL_LINK, ROADMAP_CAL_NAMESPACE } from '@/lib/roadmap-config';

interface RoadmapCalInlineProps {
  name: string;
  email: string;
  sessionId: string;
  onBooked?: () => void;
}

/**
 * Inline Cal.com embed for roadmap buyers. Uses its own namespace so it never
 * collides with the global QualificationProvider modal, and skips the
 * qualification gate entirely — the buyer has already paid.
 */
const RoadmapCalInline: React.FC<RoadmapCalInlineProps> = ({ name, email, sessionId, onBooked }) => {
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
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ['initNamespace', namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');

    const Cal = (window as any).Cal;
    Cal('init', ROADMAP_CAL_NAMESPACE, { origin: 'https://app.cal.com' });

    const ns = Cal.ns[ROADMAP_CAL_NAMESPACE];
    ns('inline', {
      elementOrSelector: containerRef.current,
      calLink: ROADMAP_CAL_LINK,
      config: {
        name,
        email,
        notes: 'CPA Scaling Roadmap buyer',
        layout: 'month_view',
        theme: 'dark',
      },
    });
    ns('ui', {
      theme: 'dark',
      hideEventTypeDetails: false,
      cssVarsPerTheme: { dark: { 'cal-brand': '#3b82f6' } },
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
          { content_name: 'Roadmap Buyer Strategy Call', content_category: 'Booking' },
          scheduleEventId
        );

        fetch('/api/roadmap/booked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
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
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          You&apos;re booked.
        </h3>
        <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
          The calendar invite is on its way to {email}. Watch the roadmap below before the call —
          we&apos;ll build on it together.
        </p>
      </motion.div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[640px] rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
    />
  );
};

export default RoadmapCalInline;
