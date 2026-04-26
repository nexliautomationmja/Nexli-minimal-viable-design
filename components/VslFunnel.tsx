'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Shield, Clock, TrendingUp, Droplets,
  VolumeX, X, ChevronDown,
  Monitor, Users, Bot, BarChart3,
  Zap, CalendarCheck, Star, DollarSign, ContactRound, Save, TimerReset, LayoutDashboard,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useBooking } from './QualificationProvider';
import MuxPlayer from '@mux/mux-player-react';

// Google "G" icon matching lucide-react component interface
const GoogleG: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 24, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

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
  const videoRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Video tracking state
  const [sessionId, setSessionId] = useState<string>('');
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const milestonesTracked = useRef<Set<number>>(new Set());

  // Generate or retrieve session ID
  useEffect(() => {
    let id = localStorage.getItem('vsl_session_id');
    if (!id) {
      id = `vsl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('vsl_session_id', id);
    }
    setSessionId(id);

    // Check if there's a saved position and restore it
    const savedPosition = localStorage.getItem(`vsl_position_${id}`);
    if (savedPosition && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedPosition);
    }
  }, []);

  // Track video event
  const trackEvent = useCallback(async (eventType: string, data: any = {}) => {
    if (!sessionId) return;

    try {
      await fetch('/api/vsl/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: eventType,
          video_position: videoRef.current?.currentTime || 0,
          video_duration: videoRef.current?.duration || 0,
          ...data,
        }),
      });
    } catch (error) {
      console.error('Failed to track video event:', error);
    }
  }, [sessionId]);

  // Video event handlers
  const handlePlay = () => {
    trackEvent('play');
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (!video) return;

    trackEvent('pause', {
      completion_percentage: (video.currentTime / video.duration) * 100,
    });

    // Save position
    localStorage.setItem(`vsl_position_${sessionId}`, video.currentTime.toString());
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !sessionId) return;

    const currentTime = video.currentTime;
    const duration = video.duration;
    const completionPercentage = (currentTime / duration) * 100;

    // Track progress every 10 seconds
    if (currentTime - lastTrackedTime >= 10) {
      trackEvent('progress', { completion_percentage: completionPercentage });
      setLastTrackedTime(currentTime);
    }

    // Track milestones (25%, 50%, 75%, 100%)
    const milestones = [25, 50, 75, 100];
    milestones.forEach(milestone => {
      if (completionPercentage >= milestone && !milestonesTracked.current.has(milestone)) {
        milestonesTracked.current.add(milestone);
        trackEvent('milestone', {
          milestone,
          completion_percentage: completionPercentage,
        });
      }
    });

    // Save position every few seconds
    if (Math.floor(currentTime) % 5 === 0) {
      localStorage.setItem(`vsl_position_${sessionId}`, currentTime.toString());
    }
  };

  const handleEnded = () => {
    trackEvent('complete', { completion_percentage: 100 });
    localStorage.removeItem(`vsl_position_${sessionId}`);
  };

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
          className="relative inline-flex items-center mb-6 md:mb-8 rounded-full overflow-hidden p-[1px]"
        >
          <span
            className="absolute inset-[-100%] animate-[shimmer_4s_linear_infinite] opacity-70"
            style={{ background: 'conic-gradient(from 0deg at 50% 50%, #60a5fa, #3b82f6, #60a5fa)' }}
          />
          <span className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-main)]">
            <Shield size={14} className="text-blue-400" />
            <span className="text-xs sm:text-sm font-black tracking-wide uppercase text-blue-300">
              Built Exclusively for Established CPA Firms
            </span>
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
                <MuxPlayer
                  ref={videoRef}
                  playbackId="dKbnk7fWMY3Y4JHbfFjnvVwZnX0192ee1zCH3Wy6pEhA"
                  metadata={{
                    video_title: "Nexli Digital Rainmaker System",
                  }}
                  streamType="on-demand"
                  accentColor="#3b82f6"
                  className="w-full rounded-xl md:rounded-2xl"
                  style={{ aspectRatio: '16/9' }}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                />
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

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-4"
        >
          {/* The Hidden Drain Button */}
          <a
            href="/revenuecalc"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-red-600/25 group cursor-pointer"
          >
            Find My Hidden Drain
            <Droplets size={22} className="group-hover:translate-y-[-2px] transition-transform" />
          </a>

          {/* Booking Button */}
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
// TRUST BAR — Enterprise-grade authority signals (infinite marquee)
// ─────────────────────────────────────────────────────────────────────────────

const AWSLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 120.4 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFFFFF" d="M33.9,26.1c0,1.5,0.2,2.7,0.4,3.6c0.3,0.9,0.7,1.8,1.3,2.9c0.2,0.3,0.3,0.6,0.3,0.9c0,0.4-0.2,0.8-0.8,1.2l-2.5,1.7c-0.4,0.2-0.7,0.4-1,0.4c-0.4,0-0.8-0.2-1.2-0.6c-0.6-0.6-1-1.2-1.4-1.9c-0.4-0.7-0.8-1.4-1.2-2.4c-3.1,3.7-7,5.5-11.8,5.5c-3.4,0-6-1-8-2.9s-3-4.5-3-7.7c0-3.4,1.2-6.2,3.6-8.2s5.7-3.1,9.8-3.1c1.4,0,2.8,0.1,4.2,0.3c1.5,0.2,3,0.5,4.6,0.9v-2.9c0-3-0.6-5.2-1.9-6.4c-1.3-1.2-3.4-1.8-6.5-1.8c-1.4,0-2.8,0.2-4.3,0.5c-1.5,0.4-2.9,0.8-4.3,1.4C9.6,7.7,9.1,7.9,8.8,8C8.5,8,8.3,8.1,8.2,8.1c-0.6,0-0.8-0.4-0.8-1.2v-2c0-0.6,0.1-1.1,0.3-1.4s0.6-0.6,1.1-0.8c1.4-0.7,3.1-1.3,5-1.8c2-0.5,4-0.8,6.2-0.8c4.8,0,8.2,1.1,10.5,3.2c2.2,2.2,3.3,5.4,3.3,9.9L33.9,26.1z M17.7,32.2c1.3,0,2.7-0.2,4.1-0.7c1.4-0.5,2.7-1.4,3.8-2.6c0.6-0.8,1.1-1.6,1.4-2.6c0.2-1,0.4-2.1,0.4-3.5v-1.7c-1.2-0.3-2.4-0.5-3.7-0.7c-1.3-0.2-2.5-0.2-3.8-0.2c-2.7,0-4.6,0.5-6,1.6c-1.3,1.1-2,2.6-2,4.6c0,1.9,0.5,3.3,1.5,4.2C14.4,31.8,15.8,32.2,17.7,32.2z M49.8,36.6c-0.7,0-1.2-0.1-1.5-0.4c-0.3-0.2-0.6-0.8-0.8-1.6l-9.4-31c-0.2-0.8-0.4-1.3-0.4-1.6c0-0.6,0.3-1,1-1h3.9c0.8,0,1.3,0.1,1.6,0.4c0.3,0.2,0.6,0.8,0.8,1.6l6.7,26.5L57.9,3c0.2-0.8,0.4-1.3,0.8-1.6C59,1.2,59.6,1,60.3,1h3.2c0.8,0,1.3,0.1,1.6,0.4c0.3,0.2,0.6,0.8,0.8,1.6l6.3,26.8L79.1,3c0.2-0.8,0.5-1.3,0.8-1.6C80.2,1.2,80.7,1,81.5,1h3.7c0.6,0,1,0.3,1,1c0,0.2,0,0.4-0.1,0.6c0,0.2-0.1,0.6-0.3,1l-9.7,31c-0.2,0.8-0.5,1.3-0.8,1.6c-0.3,0.2-0.8,0.4-1.5,0.4h-3.4c-0.8,0-1.3-0.1-1.6-0.4c-0.3-0.3-0.6-0.8-0.8-1.6L61.8,8.8l-6.2,25.8c-0.2,0.8-0.4,1.3-0.8,1.6c-0.3,0.3-0.9,0.4-1.6,0.4H49.8z M101.3,37.6c-2.1,0-4.2-0.2-6.2-0.7c-2-0.5-3.6-1-4.6-1.6c-0.6-0.4-1.1-0.8-1.2-1.1S89,33.4,89,33.1v-2c0-0.8,0.3-1.2,0.9-1.2c0.2,0,0.5,0,0.7,0.1c0.2,0.1,0.6,0.2,1,0.4c1.4,0.6,2.8,1.1,4.4,1.4c1.6,0.3,3.2,0.5,4.8,0.5c2.5,0,4.5-0.4,5.8-1.3c1.4-0.9,2.1-2.2,2.1-3.8c0-1.1-0.4-2-1.1-2.8s-2.1-1.4-4-2.1l-5.8-1.8c-2.9-0.9-5.1-2.3-6.4-4.1c-1.3-1.8-2-3.7-2-5.8c0-1.7,0.4-3.2,1.1-4.4s1.7-2.4,2.9-3.3c1.2-0.9,2.6-1.6,4.2-2.1c1.6-0.5,3.3-0.7,5-0.7c0.9,0,1.8,0,2.7,0.2c0.9,0.1,1.8,0.3,2.6,0.4c0.8,0.2,1.6,0.4,2.3,0.6c0.7,0.2,1.3,0.5,1.7,0.7c0.6,0.3,1,0.6,1.2,1c0.2,0.3,0.4,0.8,0.4,1.3v1.9c0,0.8-0.3,1.3-0.9,1.3c-0.3,0-0.8-0.2-1.5-0.5c-2.3-1-4.8-1.6-7.7-1.6c-2.3,0-4.1,0.4-5.3,1.1s-1.9,1.9-1.9,3.6c0,1.1,0.4,2.1,1.2,2.8c0.8,0.8,2.3,1.5,4.4,2.2l5.7,1.8c2.9,0.9,5,2.2,6.2,3.8c1.2,1.6,1.8,3.5,1.8,5.6c0,1.7-0.4,3.3-1,4.6c-0.7,1.4-1.7,2.6-2.9,3.5c-1.2,1-2.7,1.7-4.4,2.2C105.2,37.4,103.3,37.6,101.3,37.6z"/>
    <path fill="#FF9900" d="M108.9,57.1C95.7,66.8,76.5,72,60.1,72C37,72,16.2,63.5,0.5,49.3c-1.2-1.1-0.1-2.6,1.4-1.8c17,9.9,37.9,15.8,59.6,15.8c14.6,0,30.7-3,45.5-9.3C109.1,53.1,111,55.5,108.9,57.1z"/>
    <path fill="#FF9900" d="M114.3,50.9c-1.7-2.2-11.1-1-15.4-0.5c-1.3,0.2-1.5-1-0.3-1.8c7.5-5.3,19.9-3.8,21.3-2c1.4,1.8-0.4,14.2-7.4,20.1c-1.1,0.9-2.1,0.4-1.6-0.8C112.5,61.9,116,53,114.3,50.9z"/>
  </svg>
);

const ClaudeLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 184 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#D97757" d="m7.75 26.27 7.77-4.36.13-.38-.13-.21h-.38l-1.3-.08-4.44-.12-3.85-.16-3.73-.2-.94-.2L0 19.4l.09-.58.79-.53 1.13.1 2.5.17 3.75.26 2.72.16 4.03.42h.64l.09-.26-.22-.16-.17-.16-3.88-2.63-4.2-2.78-2.2-1.6L3.88 11l-.6-.76-.26-1.66L4.1 7.39l1.45.1.37.1 1.47 1.13 3.14 2.43 4.1 3.02.6.5.24-.17.03-.12-.27-.45L13 9.9l-2.38-4.1-1.06-1.7-.28-1.02c-.1-.42-.17-.77-.17-1.2L10.34.21l.68-.22 1.64.22.69.6 1.02 2.33 1.65 3.67 2.56 4.99.75 1.48.4 1.37.15.42h.26v-.24l.21-2.81.39-3.45.38-4.44.13-1.25.62-1.5L23.1.57l.96.46.79 1.13-.11.73-.47 3.05-.92 4.78-.6 3.2h.35l.4-.4 1.62-2.15 2.72-3.4 1.2-1.35 1.4-1.49.9-.71h1.7l1.25 1.86-.56 1.92-1.75 2.22-1.45 1.88-2.08 2.8-1.3 2.24.12.18.31-.03 4.7-1 2.54-.46 3.03-.52 1.37.64.15.65-.54 1.33-3.24.8-3.8.76-5.66 1.34-.07.05.08.1 2.55.24 1.09.06h2.67l4.97.37 1.3.86.78 1.05-.13.8-2 1.02-2.7-.64-6.3-1.5-2.16-.54h-.3v.18l1.8 1.76 3.3 2.98 4.13 3.84.21.95-.53.75-.56-.08-3.63-2.73-1.4-1.23-3.17-2.67h-.21v.28l.73 1.07 3.86 5.8.2 1.78-.28.58-1 .35-1.1-.2L26 33.14l-2.33-3.57-1.88-3.2-.23.13-1.11 11.95-.52.61-1.2.46-1-.76-.53-1.23.53-2.43.64-3.17.52-2.52.47-3.13.28-1.04-.02-.07-.23.03-2.36 3.24-3.59 4.85-2.84 3.04-.68.27-1.18-.61.11-1.09.66-.97 3.93-5 2.37-3.1 1.53-1.79-.01-.26h-.09L6.8 30.56l-1.86.24-.8-.75.1-1.23.38-.4 3.14-2.16Z"/>
    <path fill="#FFFFFF" d="M64.48 33.54c-5.02 0-8.45-2.8-10.07-7.11a19.19 19.19 0 0 1-1.23-7.03c0-7.23 3.24-12.25 10.4-12.25 4.81 0 7.78 2.1 9.47 7.11h2.06l-.28-6.91c-2.88-1.86-6.48-2.8-10.86-2.8-6.17 0-11.42 2.76-14.34 7.74a16.77 16.77 0 0 0-2.22 8.65c0 5.53 2.61 10.43 7.51 13.15a17.51 17.51 0 0 0 8.73 2.06c4.78 0 8.57-.91 11.93-2.5l.87-7.62h-2.1c-1.26 3.48-2.76 5.57-5.25 6.68-1.22.55-2.76.83-4.62.83ZM86.13 7.15l.2-3.4h-1.42l-6.32 1.9v1.03l2.8 1.3v23.78c0 1.62-.83 1.98-3 2.25v1.74h10.75v-1.74c-2.18-.27-3-.63-3-2.25V7.16Zm42.75 29h.83l7.27-1.38v-1.78l-1.02-.08c-1.7-.16-2.14-.51-2.14-1.9V18.33l.2-4.07h-1.15l-6.87.99v1.74l.67.12c1.86.27 2.41.79 2.41 2.09v11.3c-1.78 1.38-3.48 2.25-5.5 2.25-2.24 0-3.63-1.14-3.63-3.8V18.34l.2-4.07h-1.18l-6.88.99v1.74l.71.12c1.86.27 2.41.79 2.41 2.09v10.43c0 4.42 2.5 6.52 6.48 6.52 3.04 0 5.53-1.62 7.4-3.87l-.2 3.87ZM108.9 22.08c0-5.65-3-7.82-8.42-7.82-4.78 0-8.25 1.98-8.25 5.26 0 .98.35 1.73 1.06 2.25l3.64-.48c-.16-1.1-.24-1.77-.24-2.05 0-1.86.99-2.8 3-2.8 2.97 0 4.47 2.09 4.47 5.45v1.1l-7.5 2.25c-2.5.68-3.92 1.27-4.87 2.65a5 5 0 0 0-.7 2.8c0 3.2 2.2 5.46 5.96 5.46 2.72 0 5.13-1.23 7.23-3.56.75 2.33 1.9 3.56 3.95 3.56 1.66 0 3.16-.67 4.5-1.98l-.4-1.38c-.58.16-1.14.24-1.73.24-1.15 0-1.7-.91-1.7-2.69v-8.26Zm-9.6 10.87c-2.05 0-3.32-1.19-3.32-3.28 0-1.42.67-2.25 2.1-2.73l6.08-1.93v5.84c-1.94 1.47-3.08 2.1-4.86 2.1Zm63.3 1.82v-1.78l-1.03-.08c-1.7-.16-2.13-.51-2.13-1.9V7.15l.2-3.4h-1.43l-6.32 1.9v1.03l2.8 1.3v7.82a8.83 8.83 0 0 0-5.37-1.54c-6.28 0-11.18 4.78-11.18 11.93 0 5.89 3.52 9.96 9.32 9.96 3 0 5.61-1.46 7.23-3.72l-.2 3.72h.84l7.27-1.38Zm-13.16-18.14c3 0 5.25 1.74 5.25 4.94v9a7.2 7.2 0 0 1-5.21 2.1c-4.3 0-6.48-3.4-6.48-7.94 0-5.1 2.49-8.1 6.44-8.1Zm28.53 4.5c-.56-2.64-2.18-4.14-4.43-4.14-3.36 0-5.69 2.53-5.69 6.16 0 5.37 2.84 8.85 7.43 8.85a8.6 8.6 0 0 0 7.39-4.35l1.34.36c-.6 4.66-4.82 8.14-10 8.14-6.08 0-10.27-4.5-10.27-10.9 0-6.45 4.55-10.99 10.63-10.99 4.54 0 7.74 2.73 8.77 7.47l-15.84 4.86v-2.14l10.67-3.31Z"/>
  </svg>
);

const GoHighLevelLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Arrow icon */}
    <polygon points="6,44 10,44 10,20 14,20 8,8 2,20 6,20" fill="#E37400"/>
    <polygon points="18,44 22,44 22,16 26,16 20,4 14,16 18,16" fill="#4285F4"/>
    <polygon points="30,44 34,44 34,24 38,24 32,12 26,24 30,24" fill="#34A853"/>
    <polygon points="42,44 46,44 46,28 50,28 44,16 38,28 42,28" fill="#FBBC04"/>
    {/* Wordmark */}
    <text x="56" y="33" fill="#FFFFFF" fontFamily="'Syne', Arial, sans-serif" fontWeight="700" fontSize="18">HighLevel</text>
  </svg>
);

const StripeLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 468 222.5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFFFFF" d="M414,113.4c0-25.6-12.4-45.8-36.1-45.8c-23.8,0-38.2,20.2-38.2,45.6c0,30.1,17,45.3,41.4,45.3c11.9,0,20.9-2.7,27.7-6.5v-20c-6.8,3.4-14.6,5.5-24.5,5.5c-9.7,0-18.3-3.4-19.4-15.2h48.9C413.8,121,414,115.8,414,113.4z M364.6,103.9c0-11.3,6.9-16,13.2-16c6.1,0,12.6,4.7,12.6,16H364.6z"/>
    <path fill="#FFFFFF" d="M301.1,67.6c-9.8,0-16.1,4.6-19.6,7.8l-1.3-6.2h-22v116.6l25-5.3l0.1-28.3c3.6,2.6,8.9,6.3,17.7,6.3c17.9,0,34.2-14.4,34.2-46.1C335.1,83.4,318.6,67.6,301.1,67.6z M295.1,136.5c-5.9,0-9.4-2.1-11.8-4.7l-0.1-37.1c2.6-2.9,6.2-4.9,11.9-4.9c9.1,0,15.4,10.2,15.4,23.3C310.5,126.5,304.3,136.5,295.1,136.5z"/>
    <polygon fill="#FFFFFF" points="223.8,61.7 248.9,56.3 248.9,36 223.8,41.3"/>
    <rect x="223.8" y="69.3" fill="#FFFFFF" width="25.1" height="87.5"/>
    <path fill="#FFFFFF" d="M196.9,76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7,15.9-6.3,19-5.2v-23C214.5,68.1,202.8,65.9,196.9,76.7z"/>
    <path fill="#FFFFFF" d="M146.9,47.6l-24.4,5.2l-0.1,80.1c0,14.8,11.1,25.7,25.9,25.7c8.2,0,14.2-1.5,17.5-3.3V135c-3.2,1.3-19,5.9-19-8.9V90.6h19V69.3h-19L146.9,47.6z"/>
    <path fill="#FFFFFF" d="M79.3,94.7c0-3.9,3.2-5.4,8.5-5.4c7.6,0,17.2,2.3,24.8,6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5,67.6,54,78.2,54,95.9c0,27.6,38,23.2,38,35.1c0,4.6-4,6.1-9.6,6.1c-8.3,0-18.9-3.4-27.3-8v23.8c9.3,4,18.7,5.7,27.3,5.7c20.8,0,35.1-10.3,35.1-28.2C117.4,100.6,79.3,105.9,79.3,94.7z"/>
  </svg>
);

const GoogleLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 272 92" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* G icon — scaled 2.5x, centered vertically */}
    <g transform="translate(4,16) scale(2.5)">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </g>
    {/* Wordmark */}
    <text x="72" y="62" fill="#FFFFFF" fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif" fontWeight="500" fontSize="42" letterSpacing="-1">Google</text>
  </svg>
);

const SupabaseLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 581 113" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627H99.1935C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear_sb)"/>
    <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627H99.1935C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear_sb)" fillOpacity="0.2"/>
    <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
    <path d="M151.397 66.7608C151.996 72.3621 157.091 81.9642 171.877 81.9642C184.764 81.9642 190.959 73.7624 190.959 65.7607C190.959 58.559 186.063 52.6577 176.373 50.6571L169.379 49.1569C166.682 48.6568 164.884 47.1565 164.884 44.7559C164.884 41.9552 167.681 39.8549 171.178 39.8549C176.772 39.8549 178.87 43.5556 179.27 46.4564L190.359 43.9558C189.76 38.6546 185.064 29.7527 171.078 29.7527C160.488 29.7527 152.696 37.0543 152.696 45.8561C152.696 52.7576 156.991 58.4591 166.482 60.5594L172.976 62.0598C176.772 62.8599 178.271 64.6605 178.271 66.8609C178.271 69.4615 176.173 71.762 171.777 71.762C165.983 71.762 163.085 68.1611 162.786 64.2602L151.397 66.7608Z" fill="white"/>
    <path d="M233.421 80.4639H246.109C245.909 78.7635 245.609 75.3628 245.609 71.5618V31.2529H232.321V59.8592C232.321 65.5606 228.925 69.5614 223.031 69.5614C216.837 69.5614 214.039 65.1604 214.039 59.6592V31.2529H200.752V62.3599C200.752 73.0622 207.545 81.7642 219.434 81.7642C224.628 81.7642 230.325 79.7638 233.022 75.1627C233.022 77.1631 233.221 79.4636 233.421 80.4639Z" fill="white"/>
    <path d="M273.076 99.4682V75.663C275.473 78.9636 280.469 81.6644 287.263 81.6644C301.149 81.6644 310.439 70.6617 310.439 55.7584C310.439 41.1553 302.148 30.1528 287.762 30.1528C280.37 30.1528 274.875 33.4534 272.677 37.2544V31.253H259.79V99.4682H273.076ZM297.352 55.8585C297.352 64.6606 291.958 69.7616 285.164 69.7616C278.372 69.7616 272.877 64.5605 272.877 55.8585C272.877 47.1566 278.372 42.0554 285.164 42.0554C291.958 42.0554 297.352 47.1566 297.352 55.8585Z" fill="white"/>
    <path d="M317.964 67.0609C317.964 74.7627 324.357 81.8643 334.848 81.8643C342.139 81.8643 346.835 78.4634 349.332 74.5625C349.332 76.463 349.532 79.1635 349.832 80.4639H362.02C361.72 78.7635 361.422 75.2627 361.422 72.6622V48.4567C361.422 38.5545 355.627 29.7527 340.043 29.7527C326.855 29.7527 319.761 38.2544 318.963 45.9562L330.751 48.4567C331.151 44.1558 334.348 40.455 340.141 40.455C345.737 40.455 348.434 43.3556 348.434 46.8564C348.434 48.5568 347.536 49.9572 344.738 50.3572L332.65 52.1576C324.458 53.3579 317.964 58.2589 317.964 67.0609ZM337.644 71.962C333.349 71.962 331.25 69.1614 331.25 66.2608C331.25 62.4599 333.947 60.5594 337.345 60.0594L348.434 58.359V60.5594C348.434 69.2615 343.239 71.962 337.644 71.962Z" fill="white"/>
    <path d="M387.703 80.4641V74.4627C390.299 78.6637 395.494 81.6644 402.288 81.6644C416.276 81.6644 425.467 70.5618 425.467 55.6585C425.467 41.0552 417.174 29.9528 402.788 29.9528C395.494 29.9528 390.1 33.1535 387.902 36.6541V8.04785H374.815V80.4641H387.703ZM412.178 55.7584C412.178 64.7605 406.784 69.7616 399.99 69.7616C393.297 69.7616 387.703 64.6606 387.703 55.7584C387.703 46.7564 393.297 41.8554 399.99 41.8554C406.784 41.8554 412.178 46.7564 412.178 55.7584Z" fill="white"/>
    <path d="M432.99 67.0609C432.99 74.7627 439.383 81.8643 449.873 81.8643C457.165 81.8643 461.862 78.4634 464.358 74.5625C464.358 76.463 464.559 79.1635 464.858 80.4639H477.046C476.748 78.7635 476.448 75.2627 476.448 72.6622V48.4567C476.448 38.5545 470.653 29.7527 455.068 29.7527C441.881 29.7527 434.788 38.2544 433.989 45.9562L445.776 48.4567C446.177 44.1558 449.374 40.455 455.167 40.455C460.763 40.455 463.46 43.3556 463.46 46.8564C463.46 48.5568 462.561 49.9572 459.763 50.3572L447.676 52.1576C439.484 53.3579 432.99 58.2589 432.99 67.0609ZM452.671 71.962C448.375 71.962 446.276 69.1614 446.276 66.2608C446.276 62.4599 448.973 60.5594 452.371 60.0594L463.46 58.359V60.5594C463.46 69.2615 458.265 71.962 452.671 71.962Z" fill="white"/>
    <path d="M485.645 66.7608C486.243 72.3621 491.339 81.9642 506.124 81.9642C519.012 81.9642 525.205 73.7624 525.205 65.7607C525.205 58.559 520.311 52.6577 510.62 50.6571L503.626 49.1569C500.929 48.6568 499.132 47.1565 499.132 44.7559C499.132 41.9552 501.928 39.8549 505.425 39.8549C511.021 39.8549 513.118 43.5556 513.519 46.4564L524.607 43.9558C524.007 38.6546 519.312 29.7527 505.326 29.7527C494.735 29.7527 486.944 37.0543 486.944 45.8561C486.944 52.7576 491.238 58.4591 500.73 60.5594L507.224 62.0598C511.021 62.8599 512.519 64.6605 512.519 66.8609C512.519 69.4615 510.421 71.762 506.025 71.762C500.23 71.762 497.334 68.1611 497.034 64.2602L485.645 66.7608Z" fill="white"/>
    <path d="M545.385 50.2571C545.685 45.7562 549.482 40.5549 556.375 40.5549C563.967 40.5549 567.165 45.3561 567.365 50.2571H545.385ZM568.664 63.0601C567.065 67.4609 563.668 70.5617 557.474 70.5617C550.88 70.5617 545.385 65.8606 545.087 59.3593H580.252C580.252 59.159 580.451 57.1587 580.451 55.2582C580.451 39.4547 571.361 29.7527 556.175 29.7527C543.588 29.7527 531.998 39.9548 531.998 55.6584C531.998 72.262 543.886 81.9642 557.374 81.9642C569.462 81.9642 577.255 74.8626 579.753 66.3607L568.664 63.0601Z" fill="white"/>
    <defs>
      <linearGradient id="paint0_linear_sb" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
        <stop stopColor="#249361"/>
        <stop offset="1" stopColor="#3ECF8E"/>
      </linearGradient>
      <linearGradient id="paint1_linear_sb" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
        <stop/>
        <stop offset="1" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const VercelLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 2048 407" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M467.444 406.809L233.722 0.335938L0 406.809H467.444ZM703.186 388.306L898.51 18.813H814.024L679.286 287.152L544.547 18.813H460.061L655.385 388.306H703.186ZM2034.31 18.813V388.307H1964.37V18.813H2034.31ZM1644.98 250.395C1644.98 221.599 1650.99 196.272 1663.01 174.415C1675.03 152.557 1691.79 135.731 1713.28 123.935C1734.77 112.139 1759.91 106.241 1788.69 106.241C1814.19 106.241 1837.14 111.792 1857.54 122.894C1877.94 133.996 1894.15 150.476 1906.17 172.333C1918.19 194.191 1924.39 220.905 1924.75 252.477V268.61H1718.75C1720.2 291.508 1726.94 309.549 1738.96 322.733C1751.35 335.57 1767.93 341.988 1788.69 341.988C1801.8 341.988 1813.83 338.519 1824.75 331.58C1835.68 324.641 1843.88 315.274 1849.34 303.478L1920.93 308.682C1912.18 334.702 1895.79 355.519 1871.75 371.131C1847.7 386.744 1820.02 394.55 1788.69 394.55C1759.91 394.55 1734.77 388.652 1713.28 376.856C1691.79 365.06 1675.03 348.233 1663.01 326.376C1650.99 304.518 1644.98 279.192 1644.98 250.395ZM1852.62 224.375C1850.07 201.823 1842.97 185.344 1831.31 174.935C1819.65 164.18 1805.45 158.802 1788.69 158.802C1769.38 158.802 1753.72 164.527 1741.7 175.976C1729.67 187.425 1722.21 203.558 1719.29 224.375H1852.62ZM1526.96 174.935C1538.62 184.303 1545.9 197.313 1548.82 213.966L1620.94 210.323C1618.39 189.16 1610.93 170.772 1598.54 155.159C1586.15 139.547 1570.13 127.578 1550.45 119.251C1531.15 110.577 1509.84 106.241 1486.52 106.241C1457.74 106.241 1432.61 112.139 1411.11 123.935C1389.62 135.731 1372.86 152.557 1360.84 174.415C1348.82 196.272 1342.81 221.599 1342.81 250.395C1342.81 279.192 1348.82 304.518 1360.84 326.376C1372.86 348.233 1389.62 365.06 1411.11 376.856C1432.61 388.652 1457.74 394.55 1486.52 394.55C1510.56 394.55 1532.42 390.213 1552.09 381.54C1571.77 372.519 1587.79 359.856 1600.18 343.549C1612.57 327.243 1620.03 308.161 1622.58 286.304L1549.91 283.181C1547.36 301.569 1540.25 315.794 1528.6 325.855C1516.94 335.57 1502.91 340.427 1486.52 340.427C1463.94 340.427 1446.45 332.621 1434.06 317.008C1421.68 301.396 1415.49 279.192 1415.49 250.395C1415.49 221.599 1421.68 199.395 1434.06 183.782C1446.45 168.17 1463.94 160.364 1486.52 160.364C1502.19 160.364 1515.66 165.221 1526.96 174.935ZM1172.15 112.473H1237.24L1239.12 165.559C1243.74 150.533 1250.16 138.864 1258.39 130.552C1270.32 118.5 1286.96 112.473 1308.29 112.473H1334.87V169.293H1307.75C1292.56 169.293 1280.09 171.359 1270.32 175.491C1260.92 179.624 1253.69 186.166 1248.63 195.12C1243.93 204.073 1241.58 215.437 1241.58 229.211V388.306H1172.15V112.473ZM871.925 174.415C859.904 196.272 853.893 221.599 853.893 250.395C853.893 279.192 859.904 304.518 871.925 326.376C883.947 348.233 900.704 365.06 922.198 376.856C943.691 388.652 968.827 394.55 997.606 394.55C1028.93 394.55 1056.62 386.744 1080.66 371.131C1104.71 355.519 1121.1 334.702 1129.84 308.682L1058.26 303.478C1052.8 315.274 1044.6 324.641 1033.67 331.58C1022.74 338.519 1010.72 341.988 997.606 341.988C976.841 341.988 960.266 335.57 947.88 322.733C935.858 309.549 929.119 291.508 927.662 268.61H1133.67V252.477C1133.3 220.905 1127.11 194.191 1115.09 172.333C1103.07 150.476 1086.86 133.996 1066.46 122.894C1046.06 111.792 1023.11 106.241 997.606 106.241C968.827 106.241 943.691 112.139 922.198 123.935C900.704 135.731 883.947 152.557 871.925 174.415ZM1040.23 174.935C1051.88 185.344 1058.99 201.823 1061.54 224.375H928.208C931.123 203.558 938.591 187.425 950.612 175.976C962.634 164.527 978.298 158.802 997.606 158.802C1014.36 158.802 1028.57 164.18 1040.23 174.935Z" fill="white"/>
  </svg>
);

const trustLogos = [
  { name: 'Google', Logo: GoogleLogo, width: 'w-[70px] sm:w-[90px]' },
  { name: 'AWS', Logo: AWSLogo, width: 'w-[50px] sm:w-[65px]' },
  { name: 'Claude', Logo: ClaudeLogo, width: 'w-[70px] sm:w-[90px]' },
  { name: 'GoHighLevel', Logo: GoHighLevelLogo, width: 'w-[70px] sm:w-[90px]' },
  { name: 'Stripe', Logo: StripeLogo, width: 'w-[70px] sm:w-[90px]' },
  { name: 'Supabase', Logo: SupabaseLogo, width: 'w-[70px] sm:w-[90px]' },
  { name: 'Vercel', Logo: VercelLogo, width: 'w-[70px] sm:w-[90px]' },
];

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
      Built on enterprise-grade infrastructure trusted by:
    </motion.p>

    {/* Marquee container */}
    <div className="relative">
      {/* Fade edges - narrower on mobile for better logo visibility */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 z-10" style={{ background: 'linear-gradient(to right, var(--bg-main), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 z-10" style={{ background: 'linear-gradient(to left, var(--bg-main), transparent)' }} />

      {/* Scrolling track */}
      <div className="flex animate-marquee">
        {/* Duplicate 2x for seamless infinite loop */}
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="flex shrink-0 items-center gap-14 sm:gap-20 md:gap-24 px-7 sm:px-10">
            {trustLogos.map((partner, i) => (
              <div
                key={`${setIndex}-${i}`}
                className="shrink-0 opacity-50 hover:opacity-80 transition-opacity"
              >
                <partner.Logo className={`${partner.width} h-auto`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>

    {/* Marquee keyframe injected via style tag */}
    <style>{`
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      /* -50% moves the first set completely offscreen, revealing identical second set = seamless loop */
      /* Slower on mobile (14s) for better logo visibility, desktop speed (18s) */
      .animate-marquee {
        animation: marquee 14s linear infinite;
        will-change: transform;
      }
      @media (min-width: 640px) {
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      }
      .animate-marquee:hover {
        animation-play-state: paused;
      }
    `}</style>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: THE TRANSFORMATION — 4 Business Outcomes
// ─────────────────────────────────────────────────────────────────────────────

// Google Review Animation Component
const GoogleReviewAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 md:gap-4 py-4 md:py-8">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        <svg className="w-10 h-10 md:w-16 md:h-16" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      </motion.div>
      <div className="flex gap-1 md:gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            initial={{ scale: 0, rotate: -30 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + s * 0.1, type: "spring", stiffness: 200 }}
          >
            <Star
              className="w-5 h-5 md:w-7 md:h-7 text-yellow-400 fill-yellow-400"
              style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' }}
            />
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9 }}
        className="text-xs md:text-sm font-semibold text-white/70"
      >
        5-Star Reviews on Autopilot
      </motion.p>
    </div>
  );
};

// Advisory Clients Animation Component
const AdvisoryClientsAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 md:gap-5 py-4 md:py-8">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center bg-[#001a0d] border-2 border-[#00D632]/30"
          style={{ filter: 'drop-shadow(0 0 24px rgba(0, 214, 50, 0.5))' }}
        >
          <ContactRound className="w-9 h-9 md:w-14 md:h-14 text-[#00D632]" strokeWidth={2} />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-3xl md:text-5xl font-black mb-2"
          style={{
            color: '#00D632',
            fontFamily: "'Syne', sans-serif",
            filter: 'drop-shadow(0 0 20px rgba(0, 214, 50, 0.4))'
          }}
        >
          4-5
        </p>
        <p className="text-xs md:text-sm font-semibold text-white/70">
          New Advisory Clients
        </p>
      </motion.div>
    </div>
  );
};

// Hours Saved Animation Component
const HoursSavedAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 md:gap-5 py-4 md:py-8">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center bg-[#0a1628] border-2 border-[#3b82f6]/30"
          style={{ filter: 'drop-shadow(0 0 24px rgba(59, 130, 246, 0.5))' }}
        >
          <Save className="w-9 h-9 md:w-14 md:h-14 text-[#3b82f6]" strokeWidth={2} />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-3xl md:text-5xl font-black mb-2"
          style={{
            color: '#3b82f6',
            fontFamily: "'Syne', sans-serif",
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))'
          }}
        >
          10+
        </p>
        <p className="text-xs md:text-sm font-semibold text-white/70">
          Hours Saved Per Week
        </p>
      </motion.div>
    </div>
  );
};

// Google Reviews Simplified Animation Component
const GoogleReviewsSimpleAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 md:gap-5 py-4 md:py-8">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center bg-[#1a1400] border-2 border-[#fbbf24]/30"
          style={{ filter: 'drop-shadow(0 0 24px rgba(251, 191, 36, 0.5))' }}
        >
          <svg className="w-9 h-9 md:w-14 md:h-14" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-3xl md:text-5xl font-black mb-2"
          style={{
            color: '#fbbf24',
            fontFamily: "'Syne', sans-serif",
            filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))'
          }}
        >
          3x
        </p>
        <p className="text-xs md:text-sm font-semibold text-white/70">
          Google Review Growth
        </p>
      </motion.div>
    </div>
  );
};

const TransformationSection: React.FC = () => {
  return (
    <section className="relative py-14 sm:py-20 px-4" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="relative z-10 max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card 1: Custom Website */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'circOut' }}
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-[#60a5fa]/20 p-6 md:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mb-4 md:mb-5"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center bg-[#0a1628] border-2 border-[#60a5fa]/30"
                  style={{ filter: 'drop-shadow(0 0 24px rgba(96, 165, 250, 0.5))' }}
                >
                  <Monitor className="w-9 h-9 md:w-11 md:h-11 text-[#60a5fa]" strokeWidth={2} />
                </div>
              </motion.div>

              <div className="relative inline-flex items-center mb-3 md:mb-4 rounded-full overflow-hidden p-[1px]">
                <span
                  className="absolute inset-[-100%] animate-[shimmer_4s_linear_infinite] opacity-70"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #60a5fa, #3b82f6, #60a5fa)' }}
                />
                <span className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--bg-main)]">
                  <Star size={12} className="text-blue-400 fill-blue-400" />
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-blue-300">Premium Trust Asset</span>
                </span>
              </div>

              <h3 className="text-lg md:text-2xl font-black tracking-tight mb-2 text-white">
                Custom Website
              </h3>
              <p className="text-xs md:text-sm max-w-md leading-relaxed text-neutral-300">
                A premium, mobile-optimized website that positions you as a modern, sophisticated firm — not a template, but a trust-building asset.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Client Dashboard & Portal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'circOut', delay: 0.1 }}
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-[#06B6D4]/20 p-6 md:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mb-4 md:mb-5"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center bg-[#0a2832] border-2 border-[#06B6D4]/30"
                  style={{ filter: 'drop-shadow(0 0 24px rgba(6, 182, 212, 0.5))' }}
                >
                  <LayoutDashboard className="w-9 h-9 md:w-11 md:h-11 text-[#06B6D4]" strokeWidth={2} />
                </div>
              </motion.div>

              <div className="relative inline-flex items-center mb-3 md:mb-4 rounded-full overflow-hidden p-[1px]">
                <span
                  className="absolute inset-[-100%] animate-[shimmer_4s_linear_infinite] opacity-70"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #06B6D4, #3B82F6, #8B5CF6, #06B6D4)' }}
                />
                <span className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--bg-main)]">
                  <Star size={12} className="text-cyan-400 fill-cyan-400" />
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-cyan-300">The Centerpiece</span>
                </span>
              </div>

              <h3 className="text-lg md:text-2xl font-black tracking-tight mb-2 text-white">
                Client Dashboard & Portal
              </h3>
              <p className="text-xs md:text-sm max-w-md leading-relaxed text-neutral-300">
                The command center your firm deserves. Invoicing, engagement letters, document collection, and secure messaging — all in one branded portal.
              </p>
            </div>
          </motion.div>

          {/* Card 3: AI Automations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'circOut', delay: 0.2 }}
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-[#a78bfa]/20 p-6 md:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mb-4 md:mb-5"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center bg-[#1a0a28] border-2 border-[#a78bfa]/30"
                  style={{ filter: 'drop-shadow(0 0 24px rgba(167, 139, 250, 0.5))' }}
                >
                  <Bot className="w-9 h-9 md:w-11 md:h-11 text-[#a78bfa]" strokeWidth={2} />
                </div>
              </motion.div>

              <div className="relative inline-flex items-center mb-3 md:mb-4 rounded-full overflow-hidden p-[1px]">
                <span
                  className="absolute inset-[-100%] animate-[shimmer_4s_linear_infinite] opacity-70"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #a78bfa, #8b5cf6, #a78bfa)' }}
                />
                <span className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--bg-main)]">
                  <Star size={12} className="text-purple-400 fill-purple-400" />
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-purple-300">24/7 Intake Engine</span>
                </span>
              </div>

              <h3 className="text-lg md:text-2xl font-black tracking-tight mb-2 text-white">
                AI Automations
              </h3>
              <p className="text-xs md:text-sm max-w-md leading-relaxed text-neutral-300">
                Intelligent workflows that capture leads, qualify prospects, and nurture relationships while you sleep — no manual follow-up required.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Google Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'circOut', delay: 0.3 }}
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-[#fbbf24]/20 p-6 md:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mb-4 md:mb-5"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center bg-[#1a1400] border-2 border-[#fbbf24]/30"
                  style={{ filter: 'drop-shadow(0 0 24px rgba(251, 191, 36, 0.5))' }}
                >
                  <svg className="w-9 h-9 md:w-14 md:h-14" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
              </motion.div>

              <div className="relative inline-flex items-center mb-3 md:mb-4 rounded-full overflow-hidden p-[1px]">
                <span
                  className="absolute inset-[-100%] animate-[shimmer_4s_linear_infinite] opacity-70"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)' }}
                />
                <span className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--bg-main)]">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-yellow-300">Reputation Multiplier</span>
                </span>
              </div>

              <h3 className="text-lg md:text-2xl font-black tracking-tight mb-2 text-white">
                Google Review Engine
              </h3>
              <p className="text-xs md:text-sm max-w-md leading-relaxed text-neutral-300">
                Our automated review engine routes your happiest clients to Google — building the social proof that makes high-net-worth prospects choose you over competitors.
              </p>
            </div>
          </motion.div>
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
  return (
    <section className="relative py-14 sm:py-20 md:py-28 px-4" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[120px] bg-emerald-500/8 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px] bg-blue-500/6 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
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
            <span style={{ color: '#00D632' }}>
              Speaks for Itself
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            If the Rainmaker System helps you close just 4-5 new high-value advisory clients
            this year, it pays for itself. The time you save on admin is pure profit.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-10 sm:mb-14">
          {/* Advisory Clients Card - Special Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'circOut' }}
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-[#00D632]/20"
          >
            <AdvisoryClientsAnimation />
            <div className="px-4 pb-4 md:px-6 md:pb-6 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="relative inline-flex items-center rounded-full overflow-hidden p-[1px] md:p-[1.5px]"
              >
                <span
                  className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] opacity-80"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #00D632, #00ff3c, #00D632, #00ff3c, #00D632)' }}
                />
                <span
                  className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #00D632, #00ff3c, #00D632, #00ff3c, #00D632)' }}
                />
                <span className="relative z-10 inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-[var(--bg-main)]">
                  <ContactRound className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] flex-shrink-0 text-[#00D632]" strokeWidth={2.5} />
                  <span className="text-[var(--text-main)] text-[10px] md:text-sm font-black tracking-[0.1em] md:tracking-[0.15em] uppercase">New Clients</span>
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Hours Saved Card - Special Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'circOut', delay: 0.15 }}
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-[#3b82f6]/20"
          >
            <HoursSavedAnimation />
            <div className="px-4 pb-4 md:px-6 md:pb-6 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="relative inline-flex items-center rounded-full overflow-hidden p-[1px] md:p-[1.5px]"
              >
                <span
                  className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] opacity-80"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #3b82f6, #60a5fa, #3b82f6, #60a5fa, #3b82f6)' }}
                />
                <span
                  className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #3b82f6, #60a5fa, #3b82f6, #60a5fa, #3b82f6)' }}
                />
                <span className="relative z-10 inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-[var(--bg-main)]">
                  <Save className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] flex-shrink-0 text-[#3b82f6]" strokeWidth={2.5} />
                  <span className="text-[var(--text-main)] text-[10px] md:text-sm font-black tracking-[0.1em] md:tracking-[0.15em] uppercase">Time Saved</span>
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Google Reviews Card - Special Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'circOut', delay: 0.3 }}
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-[#fbbf24]/20"
          >
            <GoogleReviewsSimpleAnimation />
            <div className="px-4 pb-4 md:px-6 md:pb-6 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="relative inline-flex items-center rounded-full overflow-hidden p-[1px] md:p-[1.5px]"
              >
                <span
                  className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] opacity-80"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)' }}
                />
                <span
                  className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40"
                  style={{ background: 'conic-gradient(from 0deg at 50% 50%, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)' }}
                />
                <span className="relative z-10 inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-[var(--bg-main)]">
                  <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.10z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-[var(--text-main)] text-[10px] md:text-sm font-black tracking-[0.1em] md:tracking-[0.15em] uppercase">Reviews</span>
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced ROI Callout with shimmer border */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'circOut' }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden p-[1.5px]"
        >
          {/* Cash App Green shimmer border */}
          <span
            className="absolute inset-[-200%] animate-[shimmer_8s_linear_infinite] opacity-70"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, #00D632, #00ff3c, #00D632, #00ff3c, #00D632)'
            }}
          />
          <span
            className="absolute inset-[-200%] animate-[shimmer_8s_linear_infinite] blur-2xl opacity-20"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, #00D632, #00ff3c, #00D632, #00ff3c, #00D632)'
            }}
          />

          <div className="relative z-10 rounded-[14px] md:rounded-[22px] p-6 md:p-10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950">
            {/* Ambient glows */}
            <div className="absolute top-0 left-0 w-48 h-48 blur-[80px] rounded-full pointer-events-none"
              style={{ backgroundColor: 'rgba(0, 214, 50, 0.1)' }}
            />
            <div className="absolute bottom-0 right-0 w-48 h-48 blur-[80px] rounded-full pointer-events-none"
              style={{ backgroundColor: 'rgba(0, 214, 50, 0.08)' }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              {/* Icon badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center bg-[#001a0d] border-2 border-[#00D632]/30"
                  style={{ filter: 'drop-shadow(0 0 24px rgba(0, 214, 50, 0.4))' }}
                >
                  <DollarSign className="w-9 h-9 md:w-11 md:h-11 text-[#00D632]" strokeWidth={2.5} />
                </div>
              </motion.div>

              {/* Text content */}
              <div className="flex-1">
                <p className="text-xs md:text-sm font-black tracking-[0.1em] uppercase mb-2"
                  style={{ color: '#00D632' }}
                >
                  ROI Reality Check
                </p>
                <p className="text-sm md:text-base lg:text-lg leading-relaxed text-neutral-200">
                  The average high-value advisory client brings{' '}
                  <span className="font-bold text-white">
                    $5,000-$15,000+
                  </span>{' '}
                  in annual revenue. If your new digital presence, automated intake, and review engine help you land
                  even a handful of these clients, the system doesn&apos;t just pay for itself — it
                  becomes your{' '}
                  <span className="font-bold" style={{ color: '#00D632' }}>highest-ROI investment</span>.
                </p>
              </div>
            </div>
          </div>
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
      icon: GoogleG,
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
// STORY VIDEO MODAL — Instagram/Facebook style story viewer
// ─────────────────────────────────────────────────────────────────────────────
const StoryVideoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
    }
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
        onClick={onClose}
      >
        {/* Progress bar */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Video container */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative w-full max-w-md mx-4 aspect-[9/16] rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            onEnded={onClose}
          >
            <source src="https://pub-30ba0dacbf5d436998d690d6fc971433.r2.dev/videos/justine-welcome.mp4" type="video/mp4" />
          </video>

          {/* Tap zones for navigation */}
          <div className="absolute inset-0 flex">
            <div className="flex-1" onClick={onClose} />
            <div className="flex-1" onClick={onClose} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: FOUNDER STORY — Origin + Trust
// ─────────────────────────────────────────────────────────────────────────────
const FounderStorySection: React.FC = () => {
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  return (
    <>
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
            {/* Headshot with story ring */}
            <div
              className="mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
              onClick={() => setIsStoryOpen(true)}
            >
              <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#1a2332]">
                <img
                  src="/Founder Photos/marcel-headshot-2.png"
                  alt="Marcel Allen, CEO & Founder of Nexli"
                  className="w-full h-full object-cover object-top"
                />
              </div>
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

      <StoryVideoModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
    </>
  );
};

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

      // Associate email with VSL tracking session
      const sessionId = localStorage.getItem('vsl_session_id');
      if (sessionId) {
        await fetch('/api/vsl/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            event_type: 'email_captured',
            email,
            video_position: 0,
            video_duration: 0,
          }),
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
