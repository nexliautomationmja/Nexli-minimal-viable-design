'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, FileSignature, KeyRound, Mail, Rocket, Wrench } from 'lucide-react';
import { trackMetaEvent } from '@/lib/meta-events';
import {
  FOUNDATION_LIVE_IN_DAYS,
  FOUNDATION_PRICE_DISPLAY,
  FOUNDATION_PRODUCT_ID,
  FOUNDATION_PRODUCT_NAME,
  FOUNDATION_SETUP_FEE_DISPLAY,
  SUPPORT_EMAIL,
} from '@/lib/foundation-config';
import FunnelLogo from '@/components/FunnelLogo';

interface DemoThankYouProps {
  sessionId: string;
  firstName: string;
  email: string;
  firmName: string;
  purchaseEventId: string;
  /** Dollars actually charged today (setup fee + first month). */
  amount: number;
  currency: string;
  /** The buyer's Launch Pad on the portal, once provisioning has minted it. */
  onboardingUrl?: string;
}

const SYNE: React.CSSProperties = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" };
const INNER_CARD: React.CSSProperties = { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' };

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

const Card: React.FC<{ children: React.ReactNode; id?: string; accent?: boolean }> = ({ children, id, accent }) => (
  <section id={id} className="relative px-4 pb-10 md:pb-14 scroll-mt-24">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl md:rounded-[2rem] border p-5 sm:p-8 md:p-10"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: accent ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)' }}
      >
        {children}
      </motion.div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function DemoThankYou({
  sessionId,
  firstName,
  email,
  firmName,
  purchaseEventId,
  amount,
  currency,
  onboardingUrl,
}: DemoThankYouProps) {
  const fired = useRef(false);

  // Browser-side Purchase with the same event_id as the server webhook → dedup.
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const guardKey = `foundation_purchase_fired:${sessionId}`;
    try {
      if (sessionStorage.getItem(guardKey)) return;
      sessionStorage.setItem(guardKey, '1');
    } catch {
      // storage unavailable — fire anyway; server-side dedup still applies
    }

    trackMetaEvent(
      'Purchase',
      {
        content_name: FOUNDATION_PRODUCT_NAME,
        content_type: 'product',
        content_ids: [FOUNDATION_PRODUCT_ID],
        value: amount,
        currency,
        num_items: 1,
      },
      purchaseEventId
    );
  }, [sessionId, purchaseEventId, amount, currency]);


  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-20">
      <FunnelLogo />

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
            style={SYNE}
          >
            Welcome aboard{firstName ? `, ${firstName}` : ''}.{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Let&apos;s build {firmName ? `${firmName}'s` : 'your'} foundation.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Your {FOUNDATION_PRODUCT_NAME} subscription is active. Two quick steps and the
            {' '}{FOUNDATION_LIVE_IN_DAYS}-day clock starts.
          </motion.p>
        </div>
      </section>

      {/* Step 1 — Check email */}
      <Card accent>
        <StepBadge n={1} label="Check your email" Icon={Mail} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight mb-3" style={SYNE}>
          Two emails are on their way to <span className="text-blue-400 break-all">{email || 'your inbox'}</span>.
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border p-5 flex gap-4" style={INNER_CARD}>
            <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
              <FileSignature size={22} className="text-blue-400" />
            </span>
            <div>
              <p className="font-bold text-white mb-1">Your {FOUNDATION_PRODUCT_NAME} Service Agreement</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Open it and e-sign. It covers the {FOUNDATION_SETUP_FEE_DISPLAY} setup fee, your{' '}
                {FOUNDATION_PRICE_DISPLAY}/month month-to-month subscription, and what we deliver.
              </p>
            </div>
          </div>
          <div className="rounded-xl border p-5 flex gap-4" style={INNER_CARD}>
            <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(6,182,212,0.12)' }}>
              <KeyRound size={22} className="text-cyan-400" />
            </span>
            <div>
              <p className="font-bold text-white mb-1">Your welcome email with a set-password link</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Set your password to log in to your firm dashboard, where you manage clients, invoices, and documents.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Didn&apos;t get them within a few minutes? Check spam, then email{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-400 underline underline-offset-2">{SUPPORT_EMAIL}</a>.
        </p>
      </Card>

      {/* Step 2 — hand off to the Launch Pad. The portal owns onboarding;
          duplicating those forms here would mean two surfaces collecting the
          same things into the same database. */}
      <Card id="setup">
        <StepBadge n={2} label="Set up your payments and domain" Icon={Wrench} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight mb-3" style={SYNE}>
          Two things and we can start building.
        </h2>
        <p className="text-sm sm:text-base mb-6 max-w-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Your Stripe account so the portal can take payments, and access to your domain so we can
          point it at the new site. Nothing moves and nothing migrates. Fill those in and{' '}
          {firmName ? `${firmName}'s` : 'your'} website and client portal go live within{' '}
          {FOUNDATION_LIVE_IN_DAYS} days.
        </p>

        {onboardingUrl ? (
          <a
            href={onboardingUrl}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-bold text-white transition-transform hover:scale-[1.02] hover:bg-blue-500 active:scale-[0.98]"
            style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
          >
            <Rocket size={19} aria-hidden="true" />
            Open your Launch Pad
            <ArrowRight size={19} aria-hidden="true" />
          </a>
        ) : (
          /* No link yet: provisioning is still running, or this buyer predates
             the handoff. Say so plainly rather than rendering a dead button. */
          <div
            className="rounded-xl border p-5 text-sm leading-relaxed"
            style={{ ...INNER_CARD, color: 'rgba(255,255,255,0.7)' }}
          >
            <p className="font-bold text-white mb-1">Your Launch Pad is being set up.</p>
            <p>
              Refresh this page in a minute, or use the link in your service agreement email — it
              opens the same place. Still stuck? Email{' '}
              <a href="mailto:support@nexli.net" className="font-semibold" style={{ color: '#60a5fa' }}>
                support@nexli.net
              </a>
              .
            </p>
          </div>
        )}
      </Card>

      <section className="relative px-4 pt-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <Mail size={14} />
            Your receipt was sent to {email || 'your email'}. Bookmark this page to come back to it.
          </p>
        </div>
      </section>
    </div>
  );
}
