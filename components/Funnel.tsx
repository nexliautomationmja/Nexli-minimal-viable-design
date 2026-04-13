'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Globe, Zap, VolumeX,
  Monitor, Layout, Code, Palette,
  Users, FileText, PenLine, MessageSquare, Upload,
  PhoneOff, CalendarCheck, CheckCircle,
  Droplets, Bot, LayoutDashboard,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useBooking } from './QualificationProvider';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: HERO — Headline + Autoplay Video + Book Call CTA
// ─────────────────────────────────────────────────────────────────────────────
const HeroSection: React.FC = () => {
  const { theme } = useTheme();
  const { openBooking } = useBooking();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try autoplay with sound first
    video.muted = false;
    video.volume = 1;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay with sound succeeded
          setIsMuted(false);
        })
        .catch(() => {
          // Browser blocked sound — fall back to muted autoplay with unmute overlay
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
    }
  }, []);

  const handleUnmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    setIsMuted(false);
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-blue-500/8' : 'bg-blue-500/5'}`} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6 md:mb-8"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Your CPA Firm Deserves a{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            System That Works
          </span>{' '}
          While You Sleep
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10 md:mb-14"
        >
          See how the Digital Rainmaker System automates client intake, eliminates
          email chains, and builds your 5-star reputation — all on autopilot.
        </motion.p>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl mx-auto mb-10 md:mb-14"
        >
          <div className={`relative rounded-[1.5rem] md:rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'}`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-blue-500/5 opacity-100' : 'bg-blue-500/10 opacity-50'}`} />
            <div className="relative z-10 p-4 md:p-8">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-xl md:rounded-2xl"
                  controls
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                >
                  <source
                    src="https://pub-30ba0dacbf5d436998d690d6fc971433.r2.dev/videos/olivia-landing-page.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>

                {/* Unmute overlay — shown when browser blocks autoplay with sound */}
                <AnimatePresence>
                  {isMuted && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={handleUnmute}
                      className="absolute top-4 right-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-blue-600/30 cursor-pointer transition-colors"
                    >
                      <VolumeX size={18} />
                      Tap to Unmute
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Book Call CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <button
            onClick={() => openBooking()}
            className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group cursor-pointer"
          >
            Book Your Free Strategy Call
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: THE PROBLEM — Pain Agitation
// ─────────────────────────────────────────────────────────────────────────────
const ProblemSection: React.FC = () => {
  // This section always has a dark bg (#1a2332), so text must always be white.
  // We use inline styles to override globals.css h2/p color rules that win over
  // Tailwind utilities due to CSS cascade-layer specificity in Tailwind v4.
  const painPoints = [
    'High-value prospects googling you and seeing 8 reviews while your competitor has 60+',
    'Clients treating you like a commodity and shopping based on price instead of value',
    'Spending hours on admin work that could be automated — client follow-ups, document requests, onboarding',
    'Your website looks like it was built in 2015 while competitors have modern portals and streamlined processes',
  ];

  return (
    <section className="relative py-20 md:py-28 px-4 bg-[#1a2332]">
      {/* Subtle top-edge glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[100px] bg-blue-500/8 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-12 md:mb-16"
          style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
        >
          You&apos;re Leaving Money on the Table —{' '}
          <span style={{ color: '#ef4444', filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.5))' }}>Premium Clients Are Choosing Firms That Look More Professional</span>
        </motion.h2>

        <div className="space-y-5 md:space-y-6 text-left max-w-2xl mx-auto">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <span className="flex-shrink-0 mt-0.5 text-red-400 text-xl md:text-2xl font-bold">✕</span>
              <p className="text-base md:text-lg font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {point}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Google G SVG (matches Services.tsx)
// ─────────────────────────────────────────────────────────────────────────────
const GoogleGIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Shared 3D floating icon row
// ─────────────────────────────────────────────────────────────────────────────
const FloatingIconRow: React.FC<{
  icons: { Icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; isGoogle?: boolean; isStar?: boolean }[];
  bg: string;
  border: string;
  textColor: string;
  shadow: string;
}> = ({ icons, bg, border, textColor, shadow }) => (
  <div className="flex gap-3" style={{ perspective: '600px' }}>
    {icons.map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{
          opacity: 1,
          y: [0, -6, 0],
          rotateX: [0, 4, 0],
          rotateY: [0, i % 2 === 0 ? 6 : -6, 0],
          rotateZ: [0, i % 2 === 0 ? 2 : -2, 0],
        }}
        viewport={{ once: true }}
        transition={{
          opacity: { delay: 0.3 + i * 0.15, duration: 0.6 },
          y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
          rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
          rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
          rotateZ: { delay: 0.8 + i * 0.15, duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="w-14 h-14 rounded-2xl border flex items-center justify-center"
          style={{ backgroundColor: bg, borderColor: border, filter: `drop-shadow(0 4px 8px ${shadow})` }}
        >
          {item.isGoogle ? (
            <GoogleGIcon size={28} />
          ) : item.isStar ? (
            <svg width="28" height="28" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="#fbbf24" />
            </svg>
          ) : item.Icon ? (
            <item.Icon size={28} style={{ color: textColor }} />
          ) : null}
        </div>
      </motion.div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: THE SOLUTION — What You Get (Floating Icons)
// ─────────────────────────────────────────────────────────────────────────────
const SolutionSection: React.FC = () => {
  const { theme } = useTheme();
  const { openBooking } = useBooking();
  const isDark = theme === 'dark';

  const systemParts = [
    {
      heroIcon: Monitor,
      heroColor: isDark ? '#60a5fa' : '#3b82f6',
      heroGlow: 'rgba(59, 130, 246, 0.4)',
      label: 'Premium Websites',
      icons: [{ Icon: Monitor }, { Icon: Layout }, { Icon: Code }, { Icon: Palette }, { Icon: Globe }],
      iconBg: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.3)',
      iconBorder: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.4)',
      iconText: isDark ? '#60a5fa' : '#3b82f6',
      iconShadow: 'rgba(37, 99, 235, 0.3)',
      description: 'Professional design that positions you as a premium firm — not just another CPA competing on price.',
    },
    {
      heroIcon: LayoutDashboard,
      heroColor: isDark ? '#22d3ee' : '#06b6d4',
      heroGlow: 'rgba(6, 182, 212, 0.4)',
      label: 'Client Dashboard',
      icons: [{ Icon: Users }, { Icon: FileText }, { Icon: PenLine }, { Icon: MessageSquare }, { Icon: Upload }],
      iconBg: isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.3)',
      iconBorder: isDark ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.4)',
      iconText: isDark ? '#22d3ee' : '#06b6d4',
      iconShadow: 'rgba(6, 182, 212, 0.3)',
      description: 'Embedded in your site — clients upload documents, you track everything in real-time. No more email attachments. Ever.',
    },
    {
      heroIcon: Bot,
      heroColor: isDark ? '#a78bfa' : '#8b5cf6',
      heroGlow: 'rgba(139, 92, 246, 0.4)',
      label: 'AI Automations',
      icons: [{ Icon: PhoneOff }, { Icon: Zap }, { Icon: MessageSquare }, { Icon: CalendarCheck }, { Icon: CheckCircle }],
      iconBg: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.3)',
      iconBorder: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.4)',
      iconText: isDark ? '#a78bfa' : '#8b5cf6',
      iconShadow: 'rgba(139, 92, 246, 0.3)',
      description: 'Auto-reminders, follow-ups, onboarding sequences. You focus on the work, not the admin.',
    },
    {
      heroIcon: null,
      heroColor: '',
      heroGlow: '',
      label: 'Google Reviews',
      isGoogleHero: true,
      icons: [{ isStar: true }, { isStar: true }, { isStar: true }, { isStar: true }, { isStar: true }],
      iconBg: isDark ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.3)',
      iconBorder: isDark ? 'rgba(251,191,36,0.3)' : 'rgba(251,191,36,0.4)',
      iconText: isDark ? '#fbbf24' : '#f59e0b',
      iconShadow: 'rgba(251, 191, 36, 0.3)',
      description: 'Automatically asks happy clients for reviews at the right time. Routes unhappy feedback privately so you can fix it.',
    },
  ];

  return (
    <section className="relative py-20 md:py-28 px-4" style={{ backgroundColor: isDark ? 'var(--bg-main)' : '#f8f9fa' }}>
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Rainmaker System hero icon (Photo 5) — above heading */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-4 mb-8 md:mb-10"
        >
          <div className="flex items-center gap-3">
            <Droplets size={48} style={{ color: isDark ? '#60a5fa' : '#3b82f6', filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))' }} />
            <span className="text-2xl md:text-3xl font-bold" style={{ color: isDark ? '#ffffff' : '#1a2332' }}>Rainmaker System</span>
          </div>
          <div className="flex gap-3" style={{ perspective: '600px' }}>
            {[
              { Icon: Monitor, color: isDark ? '#60a5fa' : '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.3)', border: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.4)', shadow: 'rgba(37, 99, 235, 0.3)' },
              { Icon: Bot, color: isDark ? '#a78bfa' : '#8b5cf6', bg: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.3)', border: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.4)', shadow: 'rgba(139, 92, 246, 0.3)' },
              { Icon: LayoutDashboard, color: isDark ? '#22d3ee' : '#06b6d4', bg: isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.3)', border: isDark ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.4)', shadow: 'rgba(6, 182, 212, 0.3)' },
              { Icon: null, color: '', bg: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.3)', border: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.4)', shadow: 'rgba(245, 158, 11, 0.3)', isGoogle: true },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{
                  opacity: 1,
                  y: [0, -6, 0],
                  rotateX: [0, 4, 0],
                  rotateY: [0, i % 2 === 0 ? 6 : -6, 0],
                  rotateZ: [0, i % 2 === 0 ? 2 : -2, 0],
                }}
                viewport={{ once: true }}
                transition={{
                  opacity: { delay: 0.3 + i * 0.15, duration: 0.6 },
                  y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                  rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                  rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                  rotateZ: { delay: 0.8 + i * 0.15, duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl border flex items-center justify-center"
                  style={{ backgroundColor: item.bg, borderColor: item.border, filter: `drop-shadow(0 4px 8px ${item.shadow})` }}
                >
                  {item.isGoogle ? (
                    <GoogleGIcon size={28} />
                  ) : item.Icon ? (
                    <item.Icon size={28} style={{ color: item.color }} />
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-center mb-14 md:mb-20"
          style={{ fontFamily: "'Syne', sans-serif", color: isDark ? '#ffffff' : '#1a2332' }}
        >
          The Digital Rainmaker System:{' '}
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Everything You Need
          </span>{' '}
          to Modernize Your Firm
        </motion.h2>

        {/* 4 system parts — each with its own floating icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-16 mb-14 md:mb-20">
          {systemParts.map((part, i) => {
            const HeroIcon = part.heroIcon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                {/* Hero icon + label */}
                <div className="flex items-center gap-3 mb-4">
                  {part.isGoogleHero ? (
                    <svg width="48" height="48" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  ) : HeroIcon ? (
                    <HeroIcon size={48} style={{ color: part.heroColor, filter: `drop-shadow(0 0 20px ${part.heroGlow})` }} />
                  ) : null}
                  <span className="text-xl md:text-2xl font-bold" style={{ color: isDark ? '#ffffff' : '#1a2332' }}>{part.label}</span>
                </div>

                {/* Floating sub-icons */}
                <div className="mb-5">
                  <FloatingIconRow icons={part.icons} bg={part.iconBg} border={part.iconBorder} textColor={part.iconText} shadow={part.iconShadow} />
                </div>

                {/* Description */}
                <p className="text-sm md:text-base leading-relaxed max-w-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#4b5563' }}>
                  {part.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => openBooking()}
            className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group cursor-pointer"
          >
            Book Your Free Strategy Call
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNNEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Funnel: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
    </div>
  );
};

export default Funnel;
