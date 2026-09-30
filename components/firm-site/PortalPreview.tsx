'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, CreditCard, Lock, MessageSquare, PenLine, ShieldCheck, Upload } from 'lucide-react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { linkProps } from '../../lib/firm-sites/links';
import { FIRM_SITE_SECTIONS } from '../../lib/firm-sites/types';
import { fadeUp, viewportOnce } from './motion';

const FEATURES = [
  {
    icon: CreditCard,
    title: 'Pay invoices',
    text: 'Card or bank transfer, with receipts saved to your account automatically.',
  },
  {
    icon: PenLine,
    title: 'Sign engagement letters',
    text: 'Review and e-sign in minutes. No printing, scanning or mailing.',
  },
  {
    icon: Upload,
    title: 'Upload documents',
    text: 'Drag in W-2s, 1099s and statements from any device. We see them instantly.',
  },
  {
    icon: MessageSquare,
    title: 'Message securely',
    text: 'Ask questions and get answers in one encrypted thread, not a scattered inbox.',
  },
];

const MOCK_ITEMS = [
  { icon: PenLine, label: 'Engagement letter', meta: 'Fractional CFO \u00b7 FY2026', status: 'Awaiting signature', tone: 'accent' },
  { icon: Upload, label: 'Tax organizer', meta: 'S-Corp \u00b7 7 of 10 documents', status: 'In progress', tone: 'muted' },
  { icon: CreditCard, label: 'Invoice INV-2043', meta: 'Q4 advisory retainer', status: '$19,500', tone: 'ok' },
  { icon: MessageSquare, label: 'Message from your CPA', meta: 'About the Q4 estimate', status: 'New', tone: 'accent' },
];

export default function PortalPreview({ cfg }: { cfg: FirmSiteConfig }) {
  return (
    <section
      id={FIRM_SITE_SECTIONS.portal}
      className="relative py-20 md:py-28 overflow-hidden scroll-mt-20"
      style={{ background: 'var(--fs-primary-deep)', color: 'var(--fs-on-primary)' }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(50% 60% at 15% 30%, rgba(var(--fs-accent-rgb), 0.10) 0%, transparent 70%)',
        }}
      />

      <div className="fs-container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Copy */}
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={fadeUp} custom={0}>
          <span className="fs-eyebrow">Client portal</span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight">
            Your whole relationship with us, in one secure place.
          </h2>
          <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Every {cfg.firmName} client gets a private, branded portal. Everything that used to happen over
            email, paper and phone tag now happens here, from any device.
          </p>

          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 list-none p-0 m-0">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="flex gap-3">
                  <div
                    className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(var(--fs-accent-rgb), 0.18)', color: 'var(--fs-accent)' }}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.66)' }}>
                      {f.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4">
            <a href={cfg.portalUrl} {...linkProps(cfg.portalUrl)} className="fs-btn fs-btn-accent">
              <Lock size={15} aria-hidden="true" />
              Client portal login
            </a>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Not a client yet?{' '}
              <a
                href={cfg.bookingUrl}
                {...linkProps(cfg.bookingUrl)}
                className="underline underline-offset-4 font-medium"
                style={{ color: 'var(--fs-on-primary)' }}
              >
                Book a consultation
              </a>
            </p>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <ShieldCheck size={14} aria-hidden="true" />
            Bank-level encryption. Two-factor sign-in. Your data is never sold.
          </p>
        </motion.div>

        {/* Portal mock */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -0.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
          className="relative"
        >
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'var(--fs-surface)',
              color: 'var(--fs-text)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 28px 60px -38px rgba(0,0,0,0.55)',
            }}
          >
            {/* Portal header */}
            <div
              className="flex items-center justify-between gap-4 px-5 py-4"
              style={{ background: 'var(--fs-primary)', color: 'var(--fs-on-primary)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--fs-accent)', color: 'var(--fs-on-accent)' }}
                >
                  {cfg.firmName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ fontFamily: 'var(--fs-font-heading)' }}>
                    {cfg.firmName}
                  </p>
                  <p className="text-[11px]" style={{ opacity: 0.7 }}>
                    Client portal
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Bell size={16} style={{ opacity: 0.8 }} />
                <div className="w-7 h-7 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />
              </div>
            </div>

            {/* Greeting + progress */}
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--fs-border)' }}>
              <p className="text-xs" style={{ color: 'var(--fs-text-muted)' }}>
                Good morning, Jordan
              </p>
              <p className="mt-1 text-lg font-semibold" style={{ fontFamily: 'var(--fs-font-heading)' }}>
                Your 2026 plan is 75% built
              </p>
              <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(var(--fs-text-rgb), 0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '75%', background: 'var(--fs-accent)' }} />
              </div>
            </div>

            {/* Items */}
            <ul className="divide-y list-none p-0 m-0" style={{ borderColor: 'var(--fs-border)' }}>
              {MOCK_ITEMS.map((item) => {
                const Icon = item.icon;
                const pill =
                  item.tone === 'accent'
                    ? { background: 'rgba(var(--fs-accent-rgb), 0.18)', color: 'var(--fs-text)' }
                    : item.tone === 'ok'
                      ? { background: 'rgba(22, 163, 74, 0.14)', color: 'var(--fs-text)' }
                      : { background: 'rgba(var(--fs-text-rgb), 0.07)', color: 'var(--fs-text-muted)' };
                return (
                  <li key={item.label} className="flex items-center gap-3 px-5 py-3.5" style={{ borderColor: 'var(--fs-border)' }}>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(var(--fs-accent-rgb), 0.12)', color: 'var(--fs-accent)' }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{item.label}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--fs-text-muted)' }}>
                        {item.meta}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={pill}>
                      {item.status}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'rgba(var(--fs-text-rgb), 0.03)' }}>
              <span className="text-xs" style={{ color: 'var(--fs-text-muted)' }}>
                Secure connection
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--fs-text)' }}>
                Open portal <ArrowRight size={12} />
              </span>
            </div>
          </div>

          {/* Floating badge */}
          <div
            className="absolute -bottom-4 -left-2 sm:-left-6 rounded-md px-4 py-3 flex items-center gap-3"
            style={{
              background: 'var(--fs-accent)',
              color: 'var(--fs-on-accent)',
              boxShadow: '0 14px 30px -22px rgba(0,0,0,0.5)',
            }}
          >
            <Lock size={16} />
            <div className="leading-tight">
              <p className="text-xs font-bold">Encrypted end to end</p>
              <p className="text-[11px]" style={{ opacity: 0.8 }}>
                Documents, messages and payments
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
