'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, X, ChevronDown, Lock, ShieldCheck, FileText,
  Map as MapIcon, Target, Layers, CalendarCheck, Sparkles, TrendingUp, Clock, Users,
  BadgeDollarSign, Video, AlertCircle,
} from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';
import { trackMetaEvent, generateEventId } from '@/lib/meta-events';
import { getAttribution } from '@/lib/attribution';
import { useVideoTracking } from '@/lib/use-video-tracking';
import {
  ROADMAP_ANCHOR_PRICE_DISPLAY,
  ROADMAP_CURRENCY,
  ROADMAP_MUX_TEASER_PLAYBACK_ID,
  ROADMAP_PRICE_DISPLAY,
  ROADMAP_PRICE_VALUE,
  ROADMAP_PRODUCT_ID,
  ROADMAP_PRODUCT_NAME,
} from '@/lib/roadmap-config';
import { Timeline } from './ui/Timeline';
import { useTheme } from './ThemeProvider';
import { trustLogos } from './TrustLogos';
import RoadmapLogo from './RoadmapLogo';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────
const scrollToCheckout = () => {
  document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group cursor-pointer';

const SectionHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight text-center ${className}`}
    style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
  >
    {children}
  </motion.h2>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: HERO — Eyebrow + headline + teaser video + price anchor + CTA
// ─────────────────────────────────────────────────────────────────────────────
const HeroSection: React.FC = () => {
  const { videoRef, handlers } = useVideoTracking('roadmap_session_id', 'roadmap');

  return (
    <section className="relative pt-24 pb-14 md:pt-32 md:pb-20 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] bg-blue-500/8" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Eyebrow — rainmaker-style shimmer badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative inline-flex items-center mb-6 md:mb-8 rounded-full overflow-hidden p-[1.5px]"
        >
          <span
            className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] opacity-80"
            style={{ background: 'conic-gradient(from 0deg at 50% 50%, #3B82F6, #8B5CF6, #06B6D4, #F59E0B, #3B82F6)' }}
          />
          <span
            className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40"
            style={{ background: 'conic-gradient(from 0deg at 50% 50%, #3B82F6, #8B5CF6, #06B6D4, #F59E0B, #3B82F6)' }}
          />
          <span className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0f1c]">
            <MapIcon size={14} className="text-blue-400" />
            <span className="text-white text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
              For Established CPA Firm Owners
            </span>
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6 md:mb-8"
          style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
        >
          The Step-by-Step Roadmap to Scale Your CPA Firm{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Without Hiring, Discounting, or Working More Hours
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          A 60-minute video walkthrough plus a PDF workbook showing exactly how established firms
          stop competing for the $800 client and get positioned for the $8,000 one. Instant access
          for {ROADMAP_PRICE_DISPLAY}.
        </motion.p>

        {/* Teaser video */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl mx-auto mb-10 md:mb-12"
        >
          <div className="relative rounded-2xl md:rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden bg-[#050505]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none bg-blue-500/5" />
            <div className="relative z-10 p-2.5 sm:p-4 md:p-8">
              <MuxPlayer
                ref={videoRef}
                playbackId={ROADMAP_MUX_TEASER_PLAYBACK_ID}
                metadata={{ video_title: `${ROADMAP_PRODUCT_NAME} - Sales Page` }}
                streamType="on-demand"
                accentColor="#3b82f6"
                className="w-full rounded-xl md:rounded-2xl"
                style={{ aspectRatio: '16/9' }}
                onPlay={handlers.onPlay}
                onPause={handlers.onPause}
                onTimeUpdate={handlers.onTimeUpdate}
                onEnded={handlers.onEnded}
              />
            </div>
          </div>
        </motion.div>

        {/* Price anchor + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3 text-sm sm:text-base">
            <span className="line-through" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {ROADMAP_ANCHOR_PRICE_DISPLAY}
            </span>
            <span className="font-black text-white text-2xl sm:text-3xl" style={{ fontFamily: "'Syne', sans-serif" }}>
              {ROADMAP_PRICE_DISPLAY}
            </span>
            <span className="text-xs font-bold tracking-wide uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
              Launch price
            </span>
          </div>
          <button onClick={scrollToCheckout} className={PRIMARY_BTN}>
            Get Instant Access — {ROADMAP_PRICE_DISPLAY}
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Secure checkout via Stripe. 30-day money-back guarantee. Watch immediately.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BAR — same marquee as the VSL pages
// ─────────────────────────────────────────────────────────────────────────────
const TrustBar: React.FC = () => (
  <section className="relative py-8 sm:py-12 overflow-hidden">
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-center mb-6 sm:mb-8 px-4"
      style={{ color: 'rgba(255,255,255,0.35)' }}
    >
      The same infrastructure we build for clients, built on:
    </motion.p>
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 z-10" style={{ background: 'linear-gradient(to right, #0a0f1c, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 z-10" style={{ background: 'linear-gradient(to left, #0a0f1c, transparent)' }} />
      <div className="flex animate-roadmap-marquee">
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="flex shrink-0 items-center gap-14 sm:gap-20 md:gap-24 px-7 sm:px-10">
            {trustLogos.map((partner, i) => (
              <div key={`${setIndex}-${i}`} className="shrink-0 opacity-50 hover:opacity-80 transition-opacity">
                <partner.Logo className={`${partner.width} h-auto`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
    <style>{`
      @keyframes roadmap-marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-roadmap-marquee { animation: roadmap-marquee 14s linear infinite; will-change: transform; }
      @media (min-width: 640px) { .animate-roadmap-marquee { animation: roadmap-marquee 18s linear infinite; } }
      .animate-roadmap-marquee:hover { animation-play-state: paused; }
    `}</style>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: WHAT'S INSIDE — rainmaker Timeline
// ─────────────────────────────────────────────────────────────────────────────
const ModuleCard: React.FC<{
  Icon: React.ElementType;
  title: string;
  desc: string;
  bullets: string[];
  duration: string;
}> = ({ Icon, title, desc, bullets, duration }) => (
  <div className="rounded-[1.25rem] md:rounded-[2rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-5 sm:p-7 md:p-9">
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
        <Icon size={22} className="text-blue-400" />
      </div>
      <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[var(--text-muted)]">
        <Clock size={12} /> {duration}
      </span>
    </div>
    <h4 className="text-lg sm:text-xl md:text-2xl font-black text-[var(--text-main)] mb-2 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
      {title}
    </h4>
    <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-5">{desc}</p>
    <ul className="space-y-2.5">
      {bullets.map((b) => (
        <li key={b} className="flex items-start gap-2.5 text-sm sm:text-base text-[var(--text-main)]">
          <Check size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  </div>
);

const modules = [
  {
    title: 'Module 1',
    Icon: AlertCircle,
    heading: 'The $800 Client Trap',
    duration: '12 min',
    desc: 'Why most established firms plateau: the pricing, positioning, and intake habits that keep you competing on price with every bookkeeper in town.',
    bullets: [
      'The three signals that tell a prospect you are a commodity',
      'How to audit your current client base by real margin, not revenue',
      'The capacity math behind "we are busy but not growing"',
    ],
  },
  {
    title: 'Module 2',
    Icon: Target,
    heading: 'Positioning for the $8,000 Client',
    duration: '15 min',
    desc: 'How to reframe the same expertise you already have into an offer that high-value clients seek out and pay for without negotiating.',
    bullets: [
      'Choosing the niche and the outcome you become known for',
      'Packaging advisory and tax planning so the value is obvious',
      'The authority assets that pre-sell you before the first call',
    ],
  },
  {
    title: 'Module 3',
    Icon: Layers,
    heading: 'The Infrastructure That Makes Growth Work',
    duration: '18 min',
    desc: 'The website, intake, client portal, review engine, and automations that let a firm take on better clients without adding headcount.',
    bullets: [
      'The exact client journey from ad click to signed engagement',
      'What to automate first (and what to keep human)',
      'How to turn every finished engagement into a 5-star review',
    ],
  },
  {
    title: 'Module 4',
    Icon: CalendarCheck,
    heading: 'The 90-Day Scaling Plan',
    duration: '15 min',
    desc: 'Week-by-week execution. What to do, in what order, with the worksheets to track it, so this becomes a plan and not a video you watched once.',
    bullets: [
      'Weeks 1-4: positioning, pricing, and offer rebuild',
      'Weeks 5-8: infrastructure and automation rollout',
      'Weeks 9-12: demand, reviews, and the first premium clients',
    ],
  },
];

const WhatsInsideSection: React.FC = () => {
  const { theme } = useTheme();
  const timelineData = modules.map((m) => ({
    title: m.title,
    content: <ModuleCard Icon={m.Icon} title={m.heading} desc={m.desc} bullets={m.bullets} duration={m.duration} />,
  }));

  return (
    <section className={theme === 'dark' ? 'bg-black' : 'bg-white'}>
      <div className="pt-14 sm:pt-20 md:pt-28 px-4">
        <SectionHeading className="mb-4">
          <span className="text-[var(--text-main)]">What&apos;s Inside the</span>{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Roadmap</span>
        </SectionHeading>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[var(--text-muted)]"
        >
          Four modules, about an hour of video, and a workbook you will actually use. Every step is
          something we have implemented inside real CPA firms.
        </motion.p>
      </div>
      <Timeline data={timelineData} />
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: WHO IT'S FOR / NOT FOR
// ─────────────────────────────────────────────────────────────────────────────
const forYou = [
  'You own or lead an established CPA or accounting firm doing $250K+ per year',
  'You are busy, but growth has flattened and margins are not improving',
  'You want higher-value clients without hiring a sales team',
  'You are willing to change how you package and deliver what you already do well',
];
const notForYou = [
  'You are just starting out and need your first ten clients',
  'You want a get-rich-quick tactic instead of a system',
  'You are not the decision maker for pricing and positioning',
  'You are looking for a bookkeeping or software tutorial',
];

const WhoItsForSection: React.FC = () => (
  <section className="relative py-14 sm:py-20 md:py-28 px-4" style={{ backgroundColor: '#0a0f1c' }}>
    <div className="relative z-10 max-w-5xl mx-auto">
      <SectionHeading className="mb-10 sm:mb-14">
        Is This{' '}
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">For You?</span>
      </SectionHeading>
      <div className="grid md:grid-cols-2 gap-5 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl md:rounded-[2rem] border p-6 sm:p-8"
          style={{ backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.25)' }}
        >
          <h3 className="text-lg sm:text-xl font-black text-white mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
            This is for you if…
          </h3>
          <ul className="space-y-3.5">
            {forYou.map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                  <Check size={14} className="text-green-400" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl md:rounded-[2rem] border p-6 sm:p-8"
          style={{ backgroundColor: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <h3 className="text-lg sm:text-xl font-black text-white mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
            This is not for you if…
          </h3>
          <ul className="space-y-3.5">
            {notForYou.map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                  <X size={14} className="text-red-400" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: FOUNDER
// ─────────────────────────────────────────────────────────────────────────────
const FounderSection: React.FC = () => (
  <section className="relative py-14 sm:py-20 md:py-28 px-4 bg-[#1a2332]">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full blur-[100px] bg-blue-500/6 pointer-events-none" />
    <div className="relative z-10 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-10"
      >
        <div className="mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3px] border-blue-500/30">
          <img src="/Founder Photos/marcel-headshot-2.png" alt="Marcel Allen, CEO & Founder of Nexli" className="w-full h-full object-cover object-top" />
        </div>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-3"
          style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
        >
          Why I Put This in a{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{ROADMAP_PRICE_DISPLAY} Roadmap</span>
        </h2>
        <p className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase" style={{ color: '#60a5fa' }}>
          Marcel Allen — CEO &amp; Founder, Nexli
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="space-y-5 text-sm sm:text-base md:text-lg leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.75)' }}
      >
        <p>
          I&apos;m Marcel. My wife has spent four years inside CPA firms and is now the COO of one.
          I have watched her live through the 70-hour tax seasons, the clients who send documents at
          the last minute, and the talented partners losing deals to firms with better systems.
        </p>
        <p>
          We build the Digital Rainmaker System for established firms: the website, the client
          portal, the automations, and the review engine that let a firm take on better clients
          without burning out the team.
        </p>
        <p>
          But the system only works when the thinking behind it is right. This roadmap is that
          thinking. It is the same framework we walk through with every firm we work with, priced so
          any serious owner can pick it up, run it, and decide for themselves what to do next.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.9)' }} className="font-medium">
          If you implement it yourself, great. If you want help, you will know exactly what to ask for.
        </p>
      </motion.div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: OFFER + CHECKOUT FORM
// ─────────────────────────────────────────────────────────────────────────────
const inputCls =
  'w-full rounded-xl border px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-white/30 outline-none transition-colors focus:border-blue-500';
const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.1)',
};

const CheckoutForm: React.FC<{ cancelled?: boolean }> = ({ cancelled }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setPending(true);

    const eventId = generateEventId();
    trackMetaEvent(
      'InitiateCheckout',
      {
        content_name: ROADMAP_PRODUCT_NAME,
        content_type: 'product',
        content_ids: [ROADMAP_PRODUCT_ID],
        value: ROADMAP_PRICE_VALUE,
        currency: ROADMAP_CURRENCY,
        num_items: 1,
      },
      eventId
    );

    try {
      const res = await fetch('/api/roadmap/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          event_id: eventId,
          attribution: getAttribution(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || 'Could not start checkout. Please try again.');
        setPending(false);
        return;
      }
      window.location.assign(data.checkoutUrl);
    } catch {
      setError('Something went wrong. Please try again.');
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
      {cancelled && (
        <div
          className="rounded-xl border px-4 py-3 text-xs sm:text-sm flex items-start gap-2.5"
          style={{ backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.3)', color: 'rgba(255,255,255,0.8)' }}
        >
          <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
          Your card was not charged. Pick up right where you left off below.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          autoComplete="given-name"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputCls}
          style={inputStyle}
          required
        />
        <input
          type="text"
          autoComplete="family-name"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={inputCls}
          style={inputStyle}
          required
        />
      </div>
      <input
        type="email"
        autoComplete="email"
        placeholder="Work email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputCls}
        style={inputStyle}
        required
      />
      <input
        type="tel"
        autoComplete="tel"
        placeholder="Phone (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputCls}
        style={inputStyle}
      />

      {error && (
        <p className="text-xs sm:text-sm text-red-400 font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${PRIMARY_BTN} w-full !px-6 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        {pending ? 'Opening secure checkout…' : `Get Instant Access — ${ROADMAP_PRICE_DISPLAY}`}
        {!pending && <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
        <Lock size={12} /> Secure checkout powered by Stripe. You will be redirected to complete payment.
      </p>
    </form>
  );
};

const includes = [
  { Icon: Video, text: 'Four-module video walkthrough (about 60 minutes)' },
  { Icon: FileText, text: 'The PDF workbook with 90-day planning worksheets' },
  { Icon: CalendarCheck, text: 'A free 30-minute strategy call to map it onto your firm' },
  { Icon: Sparkles, text: 'Lifetime access, including future updates' },
];

const OfferSection: React.FC<{ cancelled?: boolean }> = ({ cancelled }) => (
  <section id="checkout" className="relative py-14 sm:py-20 md:py-28 px-4 scroll-mt-6" style={{ backgroundColor: '#0a0f1c' }}>
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px] bg-blue-500/8" />
    </div>
    <div className="relative z-10 max-w-5xl mx-auto">
      <SectionHeading className="mb-10 sm:mb-14">
        Get the Roadmap{' '}
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Today</span>
      </SectionHeading>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-2xl md:rounded-[2.5rem] border overflow-hidden grid md:grid-cols-2"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(59,130,246,0.3)' }}
      >
        {/* Left: what you get */}
        <div className="p-6 sm:p-8 md:p-10 border-b md:border-b-0 md:border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#60a5fa' }}>
            {ROADMAP_PRODUCT_NAME}
          </p>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-5xl sm:text-6xl font-black text-white leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
              {ROADMAP_PRICE_DISPLAY}
            </span>
            <span className="text-lg line-through mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {ROADMAP_ANCHOR_PRICE_DISPLAY}
            </span>
          </div>
          <ul className="space-y-3.5 mb-8">
            {includes.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
                  <Icon size={16} className="text-blue-400" />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl border p-4 flex items-start gap-3" style={{ backgroundColor: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.25)' }}>
            <ShieldCheck size={22} className="text-green-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white mb-0.5">30-day money-back guarantee</p>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Watch it, work through it, and if it is not worth ten times the price, email us for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="p-6 sm:p-8 md:p-10">
          <h3 className="text-lg sm:text-xl font-black text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
            Where should we send your access?
          </h3>
          <p className="text-xs sm:text-sm mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
            You will get instant access after payment, plus the link by email.
          </p>
          <CheckoutForm cancelled={cancelled} />
        </div>
      </motion.div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: FAQ
// ─────────────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'What exactly do I get?',
    a: 'A four-module video walkthrough (about 60 minutes), the PDF workbook with the 90-day planning worksheets, and a free 30-minute strategy call. Access is instant after checkout and the link is emailed to you as well.',
  },
  {
    q: 'Is this just a sales pitch for your services?',
    a: 'No. The roadmap stands on its own and you can implement every step yourself. On the strategy call we map it onto your firm. If you ask what it would look like for us to build it for you, we will tell you. If you do not ask, we will not pitch.',
  },
  {
    q: 'My firm is small. Will this still apply?',
    a: 'It is built for established firms, roughly $250K per year and up, with real clients and a real capacity problem. If you are pre-revenue or looking for your first clients, this is not the right fit yet.',
  },
  {
    q: 'How is the content delivered?',
    a: 'Right after payment you land on your access page with the video and the PDF download. The same link is emailed to you so you can come back any time.',
  },
  {
    q: 'What if it is not for me?',
    a: 'Email us within 30 days and we refund the full amount. No forms, no questions.',
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="relative py-14 sm:py-20 md:py-28 px-4 bg-[#1a2332]">
      <div className="relative z-10 max-w-3xl mx-auto">
        <SectionHeading className="mb-8 sm:mb-12">
          Frequently Asked{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Questions</span>
        </SectionHeading>
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left rounded-xl sm:rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                style={{
                  backgroundColor: openIndex === i ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  borderColor: openIndex === i ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-sm sm:text-base font-semibold text-white">{faq.q}</span>
                <ChevronDown
                  size={20}
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                  }}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 sm:px-6 pt-3 pb-1 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-10 sm:mt-14"
        >
          <button onClick={scrollToCheckout} className={PRIMARY_BTN}>
            Get Instant Access — {ROADMAP_PRICE_DISPLAY}
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            30-day money-back guarantee. Instant access.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STICKY CTA — hidden while the checkout block is on screen
// ─────────────────────────────────────────────────────────────────────────────
const StickyCTA: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });

    const target = document.getElementById('checkout');
    let observer: IntersectionObserver | null = null;
    if (target && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => setCheckoutVisible(entry.isIntersecting),
        { threshold: 0.15 }
      );
      observer.observe(target);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, []);

  const visible = scrolled && !checkoutVisible;

  return (
    <AnimatePresence>
      {visible && (
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
            <p className="hidden sm:flex items-center gap-2 text-sm md:text-base font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <BadgeDollarSign size={18} className="text-blue-400" />
              {ROADMAP_PRODUCT_NAME} — <span className="line-through opacity-60">{ROADMAP_ANCHOR_PRICE_DISPLAY}</span> {ROADMAP_PRICE_DISPLAY}
            </p>
            <button
              onClick={scrollToCheckout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 sm:px-7 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 group cursor-pointer"
            >
              Get the Roadmap — {ROADMAP_PRICE_DISPLAY}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL PROOF STRIP — quick outcome stats between hero and modules
// ─────────────────────────────────────────────────────────────────────────────
const proofStats = [
  { Icon: TrendingUp, value: '10x', label: 'Average fee difference between an $800 and an $8,000 engagement' },
  { Icon: Users, value: '0', label: 'New hires required to run the roadmap' },
  { Icon: Clock, value: '90 days', label: 'From first module to first premium client, if you follow the plan' },
];

const ProofStrip: React.FC = () => (
  <section className="relative px-4 pb-14 sm:pb-20" style={{ backgroundColor: '#0a0f1c' }}>
    <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4 md:gap-6">
      {proofStats.map(({ Icon, value, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="rounded-2xl border p-5 sm:p-6 text-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Icon size={22} className="text-blue-400 mx-auto mb-3" />
          <p className="text-3xl sm:text-4xl font-black text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
interface RoadmapOfferProps {
  cancelled?: boolean;
}

const RoadmapOffer: React.FC<RoadmapOfferProps> = ({ cancelled = false }) => {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackMetaEvent('ViewContent', {
      content_name: ROADMAP_PRODUCT_NAME,
      content_type: 'product',
      content_ids: [ROADMAP_PRODUCT_ID],
      content_category: 'Sales Page',
      value: ROADMAP_PRICE_VALUE,
      currency: ROADMAP_CURRENCY,
    });
  }, []);

  useEffect(() => {
    if (cancelled) {
      // Land on the form after Stripe cancel (hash may be dropped by the redirect).
      const t = setTimeout(scrollToCheckout, 300);
      return () => clearTimeout(t);
    }
  }, [cancelled]);

  return (
    <div className="min-h-screen pb-14 sm:pb-16" style={{ backgroundColor: '#0a0f1c' }}>
      <RoadmapLogo />
      <HeroSection />
      <TrustBar />
      <ProofStrip />
      <WhatsInsideSection />
      <WhoItsForSection />
      <FounderSection />
      <OfferSection cancelled={cancelled} />
      <FAQSection />
      <StickyCTA />
    </div>
  );
};

export default RoadmapOffer;
