'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Shield, Clock, TrendingUp, Star,
  VolumeX, X, ChevronDown,
  Monitor, Users, Bot, BarChart3,
  Zap, CalendarCheck,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useBooking } from './QualificationProvider';

// ─────────────────────────────────────────────────────────────────────────────
// STATIC LOGO — Non-linking brand anchor (replaces Navbar on funnel pages)
// ─────────────────────────────────────────────────────────────────────────────
const StaticLogo: React.FC = () => (
  <div className="fixed top-6 left-6 md:top-8 md:left-8 z-[110]">
    <div
      className="flex items-center gap-2 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="logo-grad-vsl" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
        <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-vsl)" />
        <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4" />
      </svg>
      <span
        className="text-sm md:text-xl font-black tracking-tighter text-white"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        NEXLI
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: HERO — ROI Headline + Video + Qualification CTA
// ─────────────────────────────────────────────────────────────────────────────
const HeroSection: React.FC = () => {
  const { openBooking } = useBooking();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsMuted(false))
        .catch(() => {
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] bg-blue-500/8" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 md:mb-8"
          style={{
            backgroundColor: 'rgba(59,130,246,0.1)',
            borderColor: 'rgba(59,130,246,0.25)',
          }}
        >
          <Shield size={14} style={{ color: '#60a5fa' }} />
          <span className="text-xs sm:text-sm font-semibold tracking-wide" style={{ color: '#60a5fa' }}>
            Built Exclusively for Established CPA Firms
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6 md:mb-8"
          style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
        >
          Stop Losing High-Value Clients to Firms With{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Better Systems
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          The Digital Rainmaker System is a complete, done-for-you infrastructure that
          automates your intake, secures your documents, and engineers 5-star Google reviews
          on autopilot. Built exclusively for established CPA firms.
        </motion.p>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl mx-auto mb-10 md:mb-14"
        >
          <div className="relative rounded-2xl md:rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden bg-[#050505]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none bg-blue-500/5" />
            <div className="relative z-10 p-2.5 sm:p-4 md:p-8">
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
                <AnimatePresence>
                  {isMuted && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={handleUnmute}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 cursor-pointer transition-colors"
                    >
                      <VolumeX size={16} className="sm:hidden" />
                      <VolumeX size={18} className="hidden sm:block" />
                      Unmute
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <button
            onClick={() => openBooking()}
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group cursor-pointer"
          >
            See If Your Firm Qualifies
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            We only partner with established CPA firms. No startups. No high-pressure pitch.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BAR — Enterprise-grade authority signals
// ─────────────────────────────────────────────────────────────────────────────
const TrustBar: React.FC = () => (
  <section className="relative py-10 sm:py-14 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-6 sm:mb-8"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Built on enterprise-grade infrastructure trusted by:
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16 flex-wrap"
        style={{ opacity: 0.35 }}
      >
        {/* Google */}
        <svg className="h-6 sm:h-7" viewBox="0 0 272 92" fill="currentColor" style={{ color: 'rgba(255,255,255,0.9)' }}>
          <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
          <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
          <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" />
          <path d="M225 3v65h-9.5V3h9.5z" />
          <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" />
          <path d="M35.29 41.19V32H67.4c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.7.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.09-.01z" />
        </svg>
        {/* Stripe */}
        <svg className="h-6 sm:h-7" viewBox="0 0 60 25" fill="currentColor" style={{ color: 'rgba(255,255,255,0.9)' }}>
          <path d="M5 10.2c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V6.7c-1.5-.6-2.9-.8-4.3-.8C3.2 5.9.8 7.8.8 10.4c0 4.1 5.6 3.4 5.6 5.2 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.4v3.6c1.7.7 3.3 1 4.9 1 3.4 0 5.7-1.7 5.7-4.4 0-4.4-5.7-3.6-5.4-5.3zM14.4 2.7l-4 .9v3.8h-1.7v3.3h1.7v5c0 3.5 1.7 4.2 4 4.2 1.2 0 2.1-.3 2.1-.3v-3.2s-.5.1-1 .1c-1.1 0-1.5-.5-1.5-1.5v-4.4h2.5V7.4h-2.5l.4-4.7zM23.2 5.6l-.3 1.7h-2v3.3h4.3v9.3h4.1V10.6h2.6V7.3h-2.6V6.2c0-1 .4-1.5 1.4-1.5.5 0 1 .1 1 .1V1.5s-.7-.2-1.7-.2c-3 0-4.8 1.4-4.8 4.3zM33 7.3h4.1v12.6H33V7.3zM33 2.5h4.1v3.3H33V2.5zM39.2 13.7c0-3.9 2.8-6.5 5.8-6.5 1.8 0 3 .8 3.7 1.6l-.2-1.4h3.9v12.4h-3.9l.2-1.4c-.8.9-2.1 1.7-3.8 1.7-3 0-5.7-2.7-5.7-6.4zm9.7 0c0-2.1-1.3-3.5-3-3.5s-3 1.4-3 3.5 1.3 3.5 3 3.5 3-1.4 3-3.5zM60 19.9h-4.1V14c0-2.2-.8-3-2.1-3-1.4 0-2.4 1-2.4 2.9v6h-4.1V7.3h3.9l-.2 1.5c.9-1 2.2-1.7 3.8-1.7 2.9 0 5.2 1.8 5.2 5.7v7.1z" />
        </svg>
        {/* GoHighLevel (text mark) */}
        <span
          className="text-sm sm:text-base font-black tracking-tight"
          style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Syne', sans-serif" }}
        >
          GoHighLevel
        </span>
        {/* AWS */}
        <svg className="h-6 sm:h-7" viewBox="0 0 80 48" fill="currentColor" style={{ color: 'rgba(255,255,255,0.9)' }}>
          <path d="M22.7 20.3c0 .7.1 1.3.2 1.8.2.5.4 1 .7 1.6.1.2.1.4.1.5 0 .2-.1.4-.4.6l-1.3.9c-.2.1-.3.2-.5.2-.2 0-.4-.1-.6-.3-.3-.3-.5-.6-.7-1-.2-.4-.4-.8-.6-1.3-1.5 1.7-3.3 2.6-5.5 2.6-1.6 0-2.8-.5-3.8-1.4-1-.9-1.5-2.2-1.5-3.7 0-1.6.6-3 1.7-3.9 1.2-1 2.7-1.5 4.7-1.5.7 0 1.3.1 2 .1.7.1 1.4.2 2.2.4v-1.4c0-1.5-.3-2.5-1-3.2-.6-.7-1.8-1-3.3-1-.7 0-1.5.1-2.2.3-.8.2-1.5.4-2.2.8-.3.2-.6.3-.7.3-.2.1-.3.1-.4.1-.3 0-.5-.2-.5-.7v-1c0-.4.1-.6.2-.8.1-.1.4-.3.8-.5 1-.5 2.2-.9 3.4-1.2 1.2-.3 2.5-.5 3.9-.5 3 0 5.2.7 6.5 2 1.3 1.4 2 3.4 2 6.1v8h.1zm-7.6 2.8c.6 0 1.3-.1 2-.3.7-.2 1.3-.7 1.9-1.3.3-.4.6-.9.7-1.4.1-.6.2-1.2.2-2v-1c-.6-.1-1.2-.2-1.8-.3-.6-.1-1.2-.1-1.8-.1-1.3 0-2.2.2-2.8.7-.6.5-1 1.2-1 2.2 0 .9.2 1.6.7 2.1.5.4 1.2.4 1.9.4zm15.1 2c-.4 0-.7-.1-.8-.2-.2-.2-.3-.5-.5-1l-5.2-17.1c-.2-.5-.2-.9-.2-1 0-.4.2-.6.6-.6h2c.4 0 .7.1.9.2.2.2.3.5.4 1l3.7 14.6 3.5-14.6c.1-.5.3-.8.4-1 .2-.2.5-.2.9-.2h1.7c.4 0 .7.1.9.2.2.2.3.5.4 1l3.5 14.8L45 6.7c.1-.5.3-.8.5-1 .2-.2.5-.2.8-.2h1.9c.4 0 .6.2.6.6 0 .1 0 .3-.1.4 0 .2-.1.4-.2.6l-5.4 17.1c-.1.5-.3.8-.5 1-.2.2-.5.2-.8.2h-1.8c-.4 0-.7-.1-.9-.2-.2-.2-.3-.5-.4-1l-3.4-14.2-3.4 14.2c-.1.5-.3.8-.4 1-.2.2-.5.2-.9.2h-1.8v.1zM58.8 25.5c-1 0-2-.1-2.9-.4-.9-.3-1.7-.6-2.2-1-.3-.2-.5-.4-.6-.6-.1-.2-.1-.4-.1-.5V22c0-.5.2-.7.5-.7.1 0 .3 0 .4.1.1.1.3.2.5.3.7.3 1.5.6 2.3.8.8.2 1.6.3 2.4.3 1.3 0 2.3-.2 3-.7.7-.5 1.1-1.1 1.1-2 0-.6-.2-1.1-.6-1.5-.4-.4-1.2-.8-2.3-1.1l-3.3-1c-1.7-.5-2.9-1.3-3.7-2.3-.8-1-1.2-2.1-1.2-3.3 0-1 .2-1.8.6-2.6.4-.7 1-1.4 1.7-1.9.7-.5 1.5-.9 2.4-1.2.9-.3 1.9-.4 2.9-.4.5 0 1 0 1.6.1.5.1 1 .2 1.5.3.5.1.9.3 1.3.4.4.2.7.3 1 .5.3.2.5.4.6.6.1.2.2.4.2.7v1c0 .5-.2.7-.5.7-.2 0-.5-.1-.9-.3-1.5-.7-3.1-1-4.8-1-1.1 0-2 .2-2.7.6-.7.4-1 1-1 1.8 0 .6.2 1.1.7 1.5.5.4 1.3.8 2.5 1.2l3.2 1c1.6.5 2.8 1.2 3.6 2.2.7.9 1.1 2 1.1 3.3 0 1-.2 1.9-.6 2.7-.4.8-1 1.5-1.8 2-.8.6-1.6 1-2.6 1.3-1.1.2-2.1.4-3.3.4z" />
        </svg>
      </motion.div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: THE TRANSFORMATION — 4 Business Outcomes
// ─────────────────────────────────────────────────────────────────────────────
const TransformationSection: React.FC = () => {
  const outcomes = [
    {
      icon: Monitor,
      label: 'The Premium Trust Asset',
      sublabel: 'Custom Website',
      color: '#60a5fa',
      description:
        'A digital presence engineered to convert high-net-worth clients before you even speak to them.',
    },
    {
      icon: Shield,
      label: 'The Command Center',
      sublabel: 'Client Portal',
      color: '#22d3ee',
      description:
        'Bank-level secure document collection, instant e-signatures for engagement letters, and automated invoicing in one branded portal.',
    },
    {
      icon: Bot,
      label: 'The 24/7 Intake Engine',
      sublabel: 'AI Automations',
      color: '#a78bfa',
      description:
        'Intelligent sequences that vet, nurture, and book qualified prospects while you sleep.',
    },
    {
      icon: Star,
      label: 'The Reputation Multiplier',
      sublabel: 'Google Review Engine',
      color: '#fbbf24',
      description:
        'Systematically route your happiest tax-season clients to Google, turning your reputation into a compounding asset.',
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 px-4" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
          >
            What You{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Actually Get
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Four integrated systems, built and installed for you — not software features, but business outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {outcomes.map((o, i) => {
            const Icon = o.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl sm:rounded-3xl border p-6 sm:p-8"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${o.color}18` }}
                  >
                    <Icon size={22} style={{ color: o.color }} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-0.5" style={{ color: '#ffffff' }}>
                      {o.label}
                    </h3>
                    <span
                      className="text-xs font-semibold tracking-wide uppercase block mb-3"
                      style={{ color: o.color }}
                    >
                      {o.sublabel}
                    </span>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {o.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: COST OF INACTION — Agitate the Pain
// ─────────────────────────────────────────────────────────────────────────────
const CostOfInactionSection: React.FC = () => {
  const painPoints = [
    {
      icon: Clock,
      text: 'Every hour spent chasing documents, sending reminders, and manually onboarding clients is a billable hour you never get back.',
    },
    {
      icon: TrendingUp,
      text: 'Premium prospects are Googling you right now. If they see 8 reviews while your competitor has 60+, they\'re already gone.',
    },
    {
      icon: Users,
      text: 'High-net-worth clients expect a modern experience — secure portals, instant signatures, professional communication. Email attachments signal "small-time."',
    },
    {
      icon: BarChart3,
      text: 'Your competitors are automating their intake, reviews, and follow-ups. While you administrate, they scale.',
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 md:py-28 px-4 bg-[#1a2332]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[100px] bg-red-500/6 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4 sm:mb-6"
            style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
          >
            The{' '}
            <span style={{ color: '#ef4444', filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.5))' }}>
              Cost of Doing Nothing
            </span>{' '}
            Is Higher Than You Think
          </h2>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Every month you rely on email attachments and manual follow-ups, you are bleeding
            billable hours and losing premium clients who expect a modern experience.
          </p>
        </motion.div>

        <div className="space-y-5 md:space-y-6">
          {painPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 rounded-xl sm:rounded-2xl border p-5 sm:p-6"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.05)',
                  borderColor: 'rgba(239,68,68,0.15)',
                }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                >
                  <Icon size={20} style={{ color: '#f87171' }} />
                </div>
                <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {point.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: ROI JUSTIFICATION — The Math
// ─────────────────────────────────────────────────────────────────────────────
const ROISection: React.FC = () => {
  const stats = [
    { value: '4-5', label: 'New Advisory Clients', sublabel: 'to pay for the entire system' },
    { value: '10+', label: 'Hours Saved Per Week', sublabel: 'on admin and document chasing' },
    { value: '3x', label: 'Google Review Growth', sublabel: 'within the first 90 days' },
  ];

  return (
    <section className="relative py-14 sm:py-20 md:py-28 px-4 bg-[#1a2332]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[100px] bg-blue-500/8 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4 sm:mb-6"
            style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
          >
            The Math{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Speaks for Itself
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            If the Rainmaker System helps you close just 4-5 new high-value advisory clients
            this year, it pays for itself. The time you save on admin is pure profit.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-14">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="text-center rounded-2xl sm:rounded-3xl border p-6 sm:p-8"
              style={{
                backgroundColor: 'rgba(16,185,129,0.08)',
                borderColor: 'rgba(16,185,129,0.2)',
              }}
            >
              <span
                className="text-3xl sm:text-4xl md:text-5xl font-black block mb-2"
                style={{ color: '#34d399', fontFamily: "'Syne', sans-serif" }}
              >
                {s.value}
              </span>
              <span className="text-sm sm:text-base font-semibold block mb-1" style={{ color: '#ffffff' }}>
                {s.label}
              </span>
              <span className="text-xs block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {s.sublabel}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ROI Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl sm:rounded-3xl border p-6 sm:p-8 text-center"
          style={{
            backgroundColor: 'rgba(59,130,246,0.08)',
            borderColor: 'rgba(59,130,246,0.2)',
          }}
        >
          <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            <span className="font-bold" style={{ color: '#60a5fa' }}>Consider this:</span>{' '}
            The average high-value advisory client brings $5,000-$15,000+ in annual revenue.
            If your new digital presence, automated intake, and review engine help you land
            even a handful of these clients, the system doesn&apos;t just pay for itself — it
            becomes your highest-ROI investment.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: PROJECTION FRAMEWORK — "What to Expect in Your First 90 Days"
// ─────────────────────────────────────────────────────────────────────────────
const ProjectionSection: React.FC = () => {
  const { openBooking } = useBooking();

  const projections = [
    {
      icon: Star,
      label: 'Reputation Multiplier',
      metric: '40+',
      unit: 'Google Reviews',
      description:
        'Our automated review engine routes your happiest clients to Google — building the social proof that makes high-net-worth prospects choose you over competitors.',
      color: '#fbbf24',
    },
    {
      icon: Shield,
      label: 'Command Center',
      metric: '75',
      unit: 'Hours Saved',
      description:
        'Secure document collection, instant e-signatures, and automated invoicing eliminate the admin that keeps your team from billable work.',
      color: '#22d3ee',
    },
    {
      icon: Bot,
      label: '24/7 Intake Engine',
      metric: '100%',
      unit: 'Unqualified Filtered',
      description:
        'Intelligent sequences vet every inbound lead — only qualified, high-value prospects make it to your calendar.',
      color: '#a78bfa',
    },
    {
      icon: Monitor,
      label: 'Premium Trust Asset',
      metric: '2-3x',
      unit: 'Booking Likelihood',
      description:
        'A conversion-optimized digital presence that turns cold traffic into booked consultations before you pick up the phone.',
      color: '#60a5fa',
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 px-4" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[120px] bg-blue-500/6 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{
              backgroundColor: 'rgba(16,185,129,0.1)',
              borderColor: 'rgba(16,185,129,0.25)',
            }}
          >
            <CalendarCheck size={14} style={{ color: '#34d399' }} />
            <span className="text-xs sm:text-sm font-semibold tracking-wide" style={{ color: '#34d399' }}>
              90-Day Projection
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
          >
            What to Expect in Your{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              First 90 Days
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Based on how the system is engineered to work, here is the measurable impact a typical established CPA firm can expect within their first quarter.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-10 sm:mb-14">
          {projections.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl sm:rounded-3xl border p-6 sm:p-8"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${p.color}18` }}
                  >
                    <Icon size={20} style={{ color: p.color }} />
                  </div>
                  <span
                    className="text-xs font-semibold tracking-wide uppercase"
                    style={{ color: p.color }}
                  >
                    {p.label}
                  </span>
                </div>
                <div className="mb-3">
                  <span
                    className="text-3xl sm:text-4xl font-black"
                    style={{ color: p.color, fontFamily: "'Syne', sans-serif" }}
                  >
                    {p.metric}
                  </span>
                  <span className="text-sm font-semibold ml-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {p.unit}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {p.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => openBooking()}
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group cursor-pointer"
          >
            See If Your Firm Qualifies
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            We only partner with established CPA firms. No startups. No high-pressure pitch.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: FOUNDER STORY — Origin + Trust
// ─────────────────────────────────────────────────────────────────────────────
const FounderStorySection: React.FC = () => (
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
        {/* Headshot */}
        <div className="mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
          <img
            src="/Founder Photos/marcel-headshot.png"
            alt="Marcel Allen, CEO & Founder of Nexli"
            className="w-full h-full object-cover"
          />
        </div>
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-3"
          style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
        >
          Built by Someone Who&apos;s Seen CPA Firm Chaos{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            from the Inside
          </span>
        </h2>
        <p className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase" style={{ color: '#60a5fa' }}>
          Marcel Allen — CEO &amp; Founder
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
          I&apos;m Marcel. My wife has been in CPA firms for four years — she&apos;s now the COO of
          one — and I&apos;ve watched her live through every problem this system solves.
        </p>
        <p>
          The 70-hour weeks during tax season. Clients who wait until the last minute to send
          documents. Email inboxes that turn into black holes. Talented CPAs losing deals to
          competitors with better websites and more Google reviews.
        </p>
        <p>
          The expertise is there. The client work is world-class. But the systems? Broken or
          nonexistent.
        </p>
        <p>
          So I built the <span className="font-semibold" style={{ color: '#ffffff' }}>Digital Rainmaker System</span> —
          the infrastructure a modern CPA firm should have. A professional website. A client portal
          that eliminates email chaos. Automations that handle follow-ups. A review engine that
          builds your reputation while you focus on client work.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.9)' }} className="font-medium">
          No fluff. No complexity. Just the system that lets talented CPAs compete at the highest
          level — without burning out their team.
        </p>
      </motion.div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: FAQ — Adapted for Premium Positioning
// ─────────────────────────────────────────────────────────────────────────────
const FAQSection: React.FC = () => {
  const { openBooking } = useBooking();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What kind of CPA firms do you work with?',
      a: 'We exclusively partner with established CPA and accounting firms doing $250K+ in annual revenue. If you\'re a solo practitioner just starting out, this isn\'t the right fit yet.',
    },
    {
      q: 'How is this different from hiring a web designer or buying software?',
      a: 'This is a done-for-you business infrastructure build — not a website project or a software subscription. We design, build, and integrate your entire client-facing system: website, portal, automations, and review engine. You get a custom-built system, not a template.',
    },
    {
      q: 'What does the investment look like?',
      a: 'The Digital Rainmaker System is a premium, done-for-you engagement. Setup begins at $15,000 with an ongoing partnership retainer. We\'ll discuss the exact scope and pricing on your strategy call based on your firm\'s specific needs.',
    },
    {
      q: 'How long does the implementation take?',
      a: 'Most firms go live within 2-4 weeks. We handle everything — design, development, integrations, automations — so there\'s minimal disruption to your practice.',
    },
    {
      q: 'What if I already have a website?',
      a: 'No problem. We can rebuild from scratch or strategically integrate the portal, automations, and review engine into your existing presence — whatever makes sense for your firm.',
    },
    {
      q: 'Is there a high-pressure sales pitch on the call?',
      a: 'Absolutely not. The strategy call is a genuine audit of your current systems. We\'ll identify gaps, show you what\'s possible, and give you a custom roadmap. If it\'s a fit, great. If not, you still walk away with actionable insights.',
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 md:py-28 px-4 bg-[#1a2332]">
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-center mb-8 sm:mb-12"
          style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
        >
          Frequently Asked{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Questions
          </span>
        </motion.h2>

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
                <span className="text-sm sm:text-base font-semibold" style={{ color: '#ffffff' }}>
                  {faq.q}
                </span>
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

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-10 sm:mt-14"
        >
          <button
            onClick={() => openBooking()}
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group cursor-pointer"
          >
            See If Your Firm Qualifies
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            We only partner with established CPA firms. No startups. No high-pressure pitch.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXIT-INTENT POPUP — Lead Capture
// ─────────────────────────────────────────────────────────────────────────────
const ExitIntentPopup: React.FC = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('nexli-exit-dismissed')) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered.current) {
        hasTriggered.current = true;
        setShow(true);
      }
    };

    // Also trigger on mobile via back button / scroll-up pattern
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Rapid scroll up near top of page
      if (
        currentScrollY < 100 &&
        lastScrollY - currentScrollY > 50 &&
        !hasTriggered.current
      ) {
        hasTriggered.current = true;
        setShow(true);
      }
      lastScrollY = currentScrollY;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    sessionStorage.setItem('nexli-exit-dismissed', '1');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    try {
      // Fire Meta Pixel lead event
      if (typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'Lead', {
          content_name: 'CPA Automation Blueprint',
          content_category: 'Exit Intent',
        });
      }

      // Send to GHL webhook
      await fetch('https://services.leadconnectorhq.com/hooks/aFlQmmyaRZncBaqSQz2L/webhook-trigger/d22e5d91-61de-46ac-ad9a-8e7a6e7a0fa1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'vslfunnel-exit-intent',
          lead_magnet: 'CPA Firm Automation Blueprint',
        }),
      });

      setSubmitted(true);
    } catch {
      // Still mark as submitted so user gets confirmation
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border p-6 sm:p-8 md:p-10"
            style={{
              backgroundColor: '#0c1425',
              borderColor: 'rgba(59,130,246,0.25)',
              boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 25px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>

            {!submitted ? (
              <>
                {/* Headline */}
                <h3
                  className="text-xl sm:text-2xl font-black mb-2"
                  style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
                >
                  Wait — Before You Go.
                </h3>
                <p className="text-sm sm:text-base font-semibold mb-4" style={{ color: '#60a5fa' }}>
                  Download the <em>CPA Firm Automation Blueprint</em>.
                </p>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  See the exact 4-step system we use to help established firms save 10+ hours
                  a week and generate 5-star Google reviews on autopilot.
                </p>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    required
                    className="flex-1 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {submitting ? 'Sending...' : 'Get the Free Blueprint'}
                  </button>
                </form>

                <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  No spam. Unsubscribe anytime.
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
                >
                  <Zap size={24} style={{ color: '#34d399' }} />
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
                >
                  Check Your Inbox
                </h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  The CPA Firm Automation Blueprint is on its way.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STICKY CTA BAR — Appears after scrolling past hero
// ────────────��────────────────────────────────────────────────────────────────
const StickyCTA: React.FC = () => {
  const { openBooking } = useBooking();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show once user scrolls past ~600px (roughly past the hero)
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <p
              className="hidden sm:block text-sm md:text-base font-semibold"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Ready to modernize your firm?
            </p>
            <button
              onClick={() => openBooking()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 sm:px-7 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 group cursor-pointer"
            >
              See If Your Firm Qualifies
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VSL FUNNEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const VslFunnel: React.FC = () => {
  useEffect(() => {
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'ViewContent', {
        content_name: 'VSL Funnel Landing Page (Variant B)',
        content_category: 'Landing Page',
      });
    }
  }, []);

  return (
    <div className="min-h-screen pb-14 sm:pb-16">
      <StaticLogo />
      <HeroSection />
      <TrustBar />
      <TransformationSection />
      <CostOfInactionSection />
      <ROISection />
      <ProjectionSection />
      <FounderStorySection />
      <FAQSection />
      <StickyCTA />
      <ExitIntentPopup />
    </div>
  );
};

export default VslFunnel;
