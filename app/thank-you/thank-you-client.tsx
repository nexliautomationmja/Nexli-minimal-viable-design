'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { trackMetaEvent, generateEventId } from '@/lib/meta-events';

export default function ThankYouClient() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Fire QualifiedLead event — anyone reaching this page passed qualification + booked
    const leadEventId = generateEventId();
    trackMetaEvent('QualifiedLead', {
      content_name: 'Strategy Session Booking',
      content_category: 'Booking',
    }, leadEventId);

    // Fire Schedule event with dedup eventId
    const scheduleEventId = generateEventId();
    trackMetaEvent('Schedule', {
      content_name: 'Strategy Session Booking',
    }, scheduleEventId);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="logo-grad-ty" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
              <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-ty)" />
              <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4" />
            </svg>
            <span
              className="text-xl font-black tracking-tighter text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              NEXLI
            </span>
          </div>
        </div>

        {/* Confirmation */}
        <div
          className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
        >
          <CheckCircle size={40} className="text-green-400" />
        </div>

        <h1
          className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          You&apos;re All Set.
        </h1>

        <p className="text-base sm:text-lg mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Your strategy session has been booked.
        </p>
        <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Check your email for the calendar invite and details. We&apos;ll be in touch before your call.
        </p>

        <a
          href="/booking-confirmed"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/20 group"
        >
          Prepare for Your Call
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>

        <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          We only partner with established CPA firms. No high-pressure pitch.
        </p>
      </div>
    </div>
  );
}
