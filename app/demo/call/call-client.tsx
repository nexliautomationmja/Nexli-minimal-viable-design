'use client';

// ---------------------------------------------------------------------------
// Demo funnel page 4A — the qualified path.
//
// Mirrors the VSL pages' running order (video → CTA → what you get → how it
// gets built → guarantees → projection → book) minus the qualifier: this
// visitor already cleared /demo/qualify, so every CTA drops them straight on
// the calendar instead of reopening the gate they just walked through.
//
// No price anywhere. The number belongs on the call.
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MuxPlayer from '@mux/mux-player-react';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Clapperboard,
  Clock3,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCalPopup } from '@/components/CalPopupButton';
import GuaranteeSection from '@/components/GuaranteeSection';
import TransformationCards, {
  DEFAULT_TRANSFORMATION_CARDS,
  GlowTile,
  ShimmerBadge,
} from '@/components/TransformationCards';
import AnimatedNumber from '@/components/AnimatedNumber';
import AdsDashboard from '@/components/demo/AdsDashboard';
import { useVideoTracking } from '@/lib/use-video-tracking';
import { trackMetaEvent } from '@/lib/meta-events';
import {
  BOOKING_CONFIRMED_PATH,
  DEMO_CAL_LINK,
  DEMO_CAL_NAMESPACE,
  DEMO_OFFER_VIDEO_PLAYBACK_ID,
  DEMO_OFFER_VIDEO_TITLE,
} from '@/lib/demo-config';

const OUTFIT: React.CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

/** Anchor the CTAs scroll to. */
const BOOK_ID = 'book';

// The four VSL cards, plus what each one actually ships. Bullets only, kept
// short and collapsed by default — the point is to answer "what do I get"
// without turning the page into a spec sheet.
const CALL_CARDS = DEFAULT_TRANSFORMATION_CARDS.map((c) => ({ ...c }));
CALL_CARDS[0].details = [
  'A custom firm site built around your advisory offer',
  'Landing pages for each campaign we run',
  'Copy, design, build and hosting — all handled',
];
CALL_CARDS[1].details = [
  'Meta campaigns targeting owners and high earners',
  'Creative written and tested for you',
  'Campaign and creative reporting you can actually read',
];
CALL_CARDS[2].details = [
  'Missed-call text-back within seconds',
  '24/7 intake that answers and qualifies',
  'Booking and nurture sequences that run themselves',
];
CALL_CARDS[3].details = [
  'Income and savings-potential screening before they book',
  'Your criteria, applied to every lead',
  'The client portal where the engagement actually runs',
];

// The 14-day guarantee is only believable if the visitor can see what fits
// inside it — so this section stays. What changed is the subject of every
// sentence: each step names what the firm HAS at the end of it, not what we
// did to get there.
const BUILD = [
  {
    n: '01',
    title: 'You have a firm that looks worth $15,000',
    body: 'Website, landing pages, booking flow and the client portal behind them — built around your services, your pricing and your process. A prospect who lands on it stops shopping on price.',
  },
  {
    n: '02',
    title: 'You stop losing the leads you already get',
    body: 'Missed calls get texted back in seconds, enquiries get answered at 11pm, documents chase themselves. Nothing dies in an inbox on the days your team is buried.',
  },
  {
    n: '03',
    title: 'Your calendar starts filling with advisory work',
    body: 'Business owners and high earners who are shopping for tax advisory — not a cheap return — booking themselves in. 50 of them qualified inside your first 90 days.',
  },
];

// Sized off the guarantee so the two sections cannot contradict each other.
// Wears the same glow-tile treatment as the cards above, with the numbers
// counting up once they are actually on screen.
const PROJECTION = [
  {
    Icon: Users,
    accent: '#60a5fa',
    tileBg: '#0a1628',
    glowRgba: 'rgba(96, 165, 250, 0.5)',
    conicStops: '#60a5fa, #3b82f6, #60a5fa',
    starClass: 'text-blue-400 fill-blue-400',
    labelClass: 'text-blue-300',
    badge: 'Guaranteed',
    value: 50,
    format: (n: number) => Math.round(n).toLocaleString('en-US'),
    label: 'Qualified leads',
    sub: 'Inside 90 days, or we keep working free',
  },
  {
    Icon: Clock3,
    accent: '#06B6D4',
    tileBg: '#0a2832',
    glowRgba: 'rgba(6, 182, 212, 0.5)',
    conicStops: '#06B6D4, #3B82F6, #8B5CF6, #06B6D4',
    starClass: 'text-cyan-400 fill-cyan-400',
    labelClass: 'text-cyan-300',
    badge: 'To launch',
    value: 14,
    format: (n: number) => `${Math.round(n)} days`,
    label: 'Whole funnel live',
    sub: 'Or a $1,000 credit on your next month',
  },
  {
    Icon: TrendingUp,
    accent: '#a78bfa',
    tileBg: '#1a0a28',
    glowRgba: 'rgba(167, 139, 250, 0.5)',
    conicStops: '#a78bfa, #8b5cf6, #a78bfa',
    starClass: 'text-purple-400 fill-purple-400',
    labelClass: 'text-purple-300',
    badge: 'Per engagement',
    value: 15000,
    format: (n: number) => `$${Math.round(n).toLocaleString('en-US')}`,
    label: 'Average advisory fee',
    sub: 'Across a $5,000 to $25,000 range',
  },
  {
    Icon: ShieldCheck,
    accent: '#fbbf24',
    tileBg: '#1a1400',
    glowRgba: 'rgba(251, 191, 36, 0.5)',
    conicStops: '#fbbf24, #f59e0b, #fbbf24',
    starClass: 'text-yellow-400 fill-yellow-400',
    labelClass: 'text-yellow-300',
    badge: 'If we miss',
    value: 0,
    format: (n: number) => `$${Math.round(n).toLocaleString('en-US')}`,
    label: 'Extra you pay',
    sub: 'No new fees, no renegotiation',
  },
];

export interface DemoCallClientProps {
  firstName: string;
  fullName: string;
  email: string;
  leadToken: string;
  notes: string;
}

/** Bottom bar, same pattern as the VSL pages — but it opens the calendar, it does not gate. */
const StickyBook: React.FC<{ onBook: () => void; hidden: boolean }> = ({ onBook, hidden }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && !hidden && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[100] border-t"
          style={{
            backgroundColor: 'rgba(10,15,28,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
            <p className="hidden sm:block text-sm md:text-base font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              You already qualified. All that is left is a time.
            </p>
            <button
              onClick={onBook}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 sm:px-7 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 group cursor-pointer"
            >
              Book the call that starts the 50
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DemoCallClient: React.FC<DemoCallClientProps> = ({
  firstName,
  fullName,
  email,
  leadToken,
  notes,
}) => {
  const { videoRef, handlers } = useVideoTracking(
    'demo_offer_session_id',
    'demo_offer',
    email,
  );

  useEffect(() => {
    trackMetaEvent('ViewContent', {
      content_name: 'Demo Offer — Advisory Engine',
      content_category: 'Funnel',
    });
  }, []);

  // One Cal instance for all three CTAs — the button under the video, the
  // block at the bottom and the sticky bar. Sharing it means one booking
  // handler, so /api/demo/booked cannot be hit twice.
  const { open: openCal, booked, ready: calReady } = useCalPopup({
    calLink: DEMO_CAL_LINK,
    namespace: DEMO_CAL_NAMESPACE,
    bookedEndpoint: '/api/demo/booked',
    name: fullName,
    email,
    leadToken,
    notes,
    scheduleContentName: 'Advisory Engine Growth Call',
    // Hand them straight to the call-prep page: welcome video, the Rainmaker
    // walkthrough and the intel form. The beat is there because Cal's modal is
    // still on top showing its own confirmation — navigating instantly yanks
    // them out mid-sentence — and it gives the booked POST extra headroom on
    // top of its keepalive flag.
    onBooked: () => {
      const qs = new URLSearchParams();
      if (fullName) qs.set('name', fullName);
      if (email) qs.set('email', email);
      const query = qs.toString();
      window.setTimeout(() => {
        window.location.href = query
          ? `${BOOKING_CONFIRMED_PATH}?${query}`
          : BOOKING_CONFIRMED_PATH;
      }, 1800);
    },
  });

  return (
    <>
      {/* ── Offer video ────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-8 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl md:rounded-[2.5rem] border shadow-2xl overflow-hidden bg-[#050505]"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none bg-blue-500/5" />
            <div className="relative z-10 p-2.5 sm:p-4 md:p-8">
              {DEMO_OFFER_VIDEO_PLAYBACK_ID ? (
                <MuxPlayer
                  ref={videoRef}
                  playbackId={DEMO_OFFER_VIDEO_PLAYBACK_ID}
                  metadata={{ video_title: DEMO_OFFER_VIDEO_TITLE }}
                  streamType="on-demand"
                  accentColor="#3b82f6"
                  className="w-full rounded-xl md:rounded-2xl"
                  style={{ aspectRatio: '16/9' }}
                  onPlay={handlers.onPlay}
                  onPause={handlers.onPause}
                  onTimeUpdate={handlers.onTimeUpdate}
                  onEnded={handlers.onEnded}
                />
              ) : (
                <div
                  className="w-full rounded-xl md:rounded-2xl border flex flex-col items-center justify-center text-center px-6"
                  style={{
                    aspectRatio: '16/9',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="w-14 h-14 mb-4 rounded-2xl flex items-center justify-center border"
                    style={{
                      backgroundColor: 'rgba(59,130,246,0.1)',
                      borderColor: 'rgba(59,130,246,0.25)',
                    }}
                  >
                    <Clapperboard size={26} className="text-blue-400" />
                  </div>
                  <p className="text-base md:text-xl font-black text-white" style={OUTFIT}>
                    Offer video coming soon
                  </p>
                  <p className="mt-2 text-xs md:text-sm max-w-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {DEMO_OFFER_VIDEO_TITLE} is being finished. Go ahead and grab a time below —
                    we will walk you through the whole thing live.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── The button directly under the video ──────────────────────── */}
          <div className="mt-6 md:mt-8 text-center">
            <button
              onClick={openCal}
              disabled={!calReady}
              className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group cursor-pointer"
            >
              <CalendarDays size={22} aria-hidden="true" />
              Book the call that starts the 50
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-3 text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              You already qualified — no second form. 45 minutes, camera on, no high-pressure pitch.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── What you actually get ──────────────────────────────────────── */}
      {/* Same section the VSL offer page runs, so a visitor who came through
          the ads sees the thing they already recognise. Cards are shared via
          components/TransformationCards so the two cannot drift; only the
          heading is local, because this page uses Outfit and the VSL page Syne. */}
      <section className="relative z-10 px-4 pt-10 md:pt-16 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.18em] text-blue-400"
              style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }}
            >
              <Megaphone size={13} aria-hidden="true" />
              The Digital Rainmaker System
            </span>
            <h2
              className="mt-5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4 text-white"
              style={OUTFIT}
            >
              50 advisory leads in 90 days.{' '}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Here is what produces them.
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Four pieces, none of which you touch. Tap any one to see what ships with it — otherwise
              just know the number above is what they add up to.
            </p>
          </motion.div>

          <TransformationCards cards={CALL_CARDS} expandable />
        </div>
      </section>

      {/* ── How it gets built ──────────────────────────────────────────── */}
      <section
        className="relative z-10 px-4 py-12 md:py-20 border-y"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white mb-3"
            style={OUTFIT}
          >
            What your firm looks like 14 days from now
          </motion.h2>
          <p className="text-center text-sm sm:text-base max-w-2xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Three things have to be true before a $15,000 client books themselves into your calendar.
            Inside 14 days all three are — and the 90-day clock on your 50 leads starts the day the
            funnel goes live, because there is nothing to send traffic through until it does.
          </p>

          <div className="space-y-4">
            {BUILD.map((b, i) => (
              <motion.div
                key={b.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 sm:gap-6 rounded-2xl border p-5 sm:p-6"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <span
                  className="shrink-0 text-lg sm:text-xl font-black text-blue-400"
                  style={OUTFIT}
                >
                  {b.n}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white" style={OUTFIT}>
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {b.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The ads half, shown rather than described ──────────────────── */}
      <section className="relative z-10 px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.18em] text-blue-400"
              style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }}
            >
              <BarChart3 size={13} aria-hidden="true" />
              The ads, running
            </span>
            <h2
              className="mt-5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4 text-white"
              style={OUTFIT}
            >
              What those leads are actually worth to you.
            </h2>
            <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Every lead, every campaign, every dollar — in one place you can read in ten seconds.
              Move the close rate to your own and it tells you what the 50 are worth to your firm.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'circOut' }}
          >
            <AdsDashboard />
          </motion.div>

          <p className="mt-4 text-center text-[11px] sm:text-xs leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sample figures from a firm at the pace we guarantee — 50 qualified leads across 90 days.
            Spend and close rate vary by market; the leads are the part we put in writing.
          </p>
        </div>
      </section>

      {/* ── The two written guarantees ─────────────────────────────────── */}
      <GuaranteeSection accent="blue" hideCta />

      {/* ── The 90 days, in numbers ────────────────────────────────────── */}
      <section className="relative z-10 px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white mb-10"
            style={OUTFIT}
          >
            Your first 90 days, in four numbers
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {PROJECTION.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'circOut', delay: i * 0.08 }}
                className="rounded-2xl md:rounded-3xl border p-5 sm:p-7 flex flex-col items-center text-center bg-gradient-to-br from-slate-900 to-slate-950"
                style={{ borderColor: `${m.accent}33` }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="mb-4"
                >
                  <GlowTile Icon={m.Icon} accent={m.accent} tileBg={m.tileBg} glowRgba={m.glowRgba} />
                </motion.div>

                <ShimmerBadge conicStops={m.conicStops} starClass={m.starClass} labelClass={m.labelClass}>
                  {m.badge}
                </ShimmerBadge>

                <p className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black text-white" style={OUTFIT}>
                  <AnimatedNumber value={m.value} format={m.format} animateOnView duration={900} />
                </p>
                <p className="mt-1 text-xs sm:text-sm font-bold" style={{ color: m.accent }}>
                  {m.label}
                </p>
                <p className="mt-1.5 text-[11px] sm:text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {m.sub}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Book the call ──────────────────────────────────────────────── */}
      {/* A button, not an embedded calendar. useCalPopup opens Cal as an
          overlay and keeps the bookingSuccessful callback, which is what fires
          the Meta Schedule conversion and tags the lead in GoHighLevel. */}
      <section id={BOOK_ID} className="relative z-10 px-4 pb-24 md:pb-32 scroll-mt-8">
        <div
          className="max-w-4xl mx-auto rounded-3xl border px-6 sm:px-10 py-10 sm:py-14 text-center"
          style={{
            background:
              'linear-gradient(140deg, rgba(37,99,235,0.18) 0%, rgba(255,255,255,0.03) 55%, rgba(6,182,212,0.12) 100%)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          {booked ? (
            <>
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
              >
                <CalendarCheck size={32} className="text-green-400" aria-hidden="true" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white" style={OUTFIT}>
                You&apos;re booked, {firstName}.
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                The calendar invite is on its way to {email}. Bring your last twelve months of
                new-client numbers — we build the plan live on the call.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white" style={OUTFIT}>
                {firstName}, this is where the 50 starts.
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                45 minutes, camera on, your answers already in front of us. You leave knowing exactly
                what 50 qualified leads would be worth to your firm, whether or not you work with us.
              </p>

              <div className="mt-8">
                <button
                  onClick={openCal}
                  disabled={!calReady}
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group cursor-pointer"
                >
                  <CalendarDays size={22} aria-hidden="true" />
                  Book the call that starts the 50
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <p className="mt-4 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Straight to the calendar — nothing else to fill in.
              </p>
            </>
          )}
        </div>
      </section>

      <StickyBook onBook={openCal} hidden={booked || !calReady} />
    </>
  );
};

export default DemoCallClient;
