'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, PlayCircle, CalendarCheck, ArrowDown, Mail } from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';
import { trackMetaEvent } from '@/lib/meta-events';
import { useVideoTracking } from '@/lib/use-video-tracking';
import {
  ROADMAP_MUX_FULL_PLAYBACK_ID,
  ROADMAP_PDF_PATH,
  ROADMAP_PRODUCT_ID,
  ROADMAP_PRODUCT_NAME,
} from '@/lib/roadmap-config';
import RoadmapLogo from '@/components/RoadmapLogo';
import RoadmapCalInline from '@/components/RoadmapCalInline';

interface RoadmapThankYouProps {
  sessionId: string;
  firstName: string;
  lastName: string;
  email: string;
  purchaseEventId: string;
  amount: number;
  currency: string;
}

const StepBadge: React.FC<{ n: number; label: string; Icon: React.ElementType; tone?: 'blue' | 'green' }> = ({
  n,
  label,
  Icon,
  tone = 'blue',
}) => (
  <div className="flex items-center gap-3 mb-5">
    <span
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
      style={{ backgroundColor: tone === 'green' ? '#059669' : '#2563eb' }}
    >
      {n}
    </span>
    <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.15em] uppercase" style={{ color: tone === 'green' ? '#34d399' : '#60a5fa' }}>
      <Icon size={16} />
      {label}
    </span>
  </div>
);

export default function RoadmapThankYou({
  sessionId,
  firstName,
  lastName,
  email,
  purchaseEventId,
  amount,
  currency,
}: RoadmapThankYouProps) {
  const fired = useRef(false);
  const { videoRef, handlers } = useVideoTracking('roadmap_access_session_id', 'roadmap_access', email);

  // Browser-side Purchase with the same event_id as the server webhook → dedup.
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const guardKey = `roadmap_purchase_fired:${sessionId}`;
    try {
      if (sessionStorage.getItem(guardKey)) return;
      sessionStorage.setItem(guardKey, '1');
    } catch {
      // storage unavailable — fire anyway; server-side dedup still applies
    }

    trackMetaEvent(
      'Purchase',
      {
        content_name: ROADMAP_PRODUCT_NAME,
        content_type: 'product',
        content_ids: [ROADMAP_PRODUCT_ID],
        value: amount,
        currency,
        num_items: 1,
      },
      purchaseEventId
    );
  }, [sessionId, purchaseEventId, amount, currency]);

  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-20">
      <RoadmapLogo />

      {/* Confirmation header */}
      <section className="relative pt-28 pb-10 md:pt-36 md:pb-14 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] bg-emerald-500/8" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
          >
            <CheckCircle size={40} className="text-green-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            You&apos;re in{firstName ? `, ${firstName}` : ''}.{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Here&apos;s your roadmap.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Three steps. Do them in order and you&apos;ll get the most out of the next 30 minutes.
            Book the call first while the calendar is open, then watch and download.
          </motion.p>
          <motion.a
            href="#watch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-1.5 mt-5 text-xs sm:text-sm font-medium hover:text-white transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Skip to the roadmap <ArrowDown size={14} />
          </motion.a>
        </div>
      </section>

      {/* Step 1 — Book */}
      <section className="relative px-4 pb-10 md:pb-14">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl md:rounded-[2rem] border p-5 sm:p-8 md:p-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(59,130,246,0.3)' }}
          >
            <StepBadge n={1} label="Book your Scaling Strategy Call" Icon={CalendarCheck} />
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-black leading-tight mb-3"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Turn the roadmap into <span className="text-blue-400">your</span> plan.
            </h2>
            <p className="text-sm sm:text-base mb-6 max-w-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Roadmap buyers get a free 30-minute strategy call. We map the steps in the video
              onto your firm, your numbers, and your capacity. No pitch unless you ask for one.
            </p>
            <RoadmapCalInline name={fullName} email={email} sessionId={sessionId} />
          </motion.div>
        </div>
      </section>

      {/* Step 2 — Watch */}
      <section id="watch" className="relative px-4 pb-10 md:pb-14 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl md:rounded-[2rem] border p-5 sm:p-8 md:p-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <StepBadge n={2} label="Watch the Roadmap" Icon={PlayCircle} />
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-[#050505] border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <MuxPlayer
                ref={videoRef}
                playbackId={ROADMAP_MUX_FULL_PLAYBACK_ID}
                metadata={{ video_title: `${ROADMAP_PRODUCT_NAME} - Full Walkthrough`, viewer_user_id: email }}
                streamType="on-demand"
                accentColor="#3b82f6"
                className="w-full"
                style={{ aspectRatio: '16/9' }}
                onPlay={handlers.onPlay}
                onPause={handlers.onPause}
                onTimeUpdate={handlers.onTimeUpdate}
                onEnded={handlers.onEnded}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step 3 — Download */}
      <section className="relative px-4 pb-10 md:pb-14">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl md:rounded-[2rem] border p-5 sm:p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex-1">
              <StepBadge n={3} label="Download the workbook" Icon={Download} />
              <h2
                className="text-xl sm:text-2xl font-black leading-tight mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                The PDF version, with the worksheets.
              </h2>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Every step from the video plus the 90-day planning worksheets. Print it, mark it up,
                bring it to the call.
              </p>
            </div>
            <a
              href={ROADMAP_PDF_PATH}
              download
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 rounded-full text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 shrink-0"
            >
              <Download size={20} />
              Download PDF
            </a>
          </motion.div>
        </div>
      </section>

      {/* What happens next */}
      <section className="relative px-4 pt-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <Mail size={14} />
            Your access link and receipt were sent to {email || 'your email'}. Bookmark this page.
          </p>
        </div>
      </section>
    </div>
  );
}
