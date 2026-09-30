'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck, FileSearch, Lock, Map } from 'lucide-react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { linkProps } from '../../lib/firm-sites/links';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'Book a 20-minute call',
    text: 'Tell us what you are deciding this year and what it is worth.',
  },
  {
    icon: FileSearch,
    title: 'We review two years of returns and the books',
    text: 'Upload securely through the portal. We look for what was left on the table.',
  },
  {
    icon: Map,
    title: 'You get a written plan and a fixed fee',
    text: 'Scope, price and calendar agreed before anything starts.',
  },
];

export default function Hero({ cfg }: { cfg: FirmSiteConfig }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32"
      style={{
        background:
          'var(--fs-hero-bg, linear-gradient(140deg, var(--fs-primary-deep) 0%, var(--fs-primary) 55%, var(--fs-primary-dark) 100%))',
        color: 'var(--fs-hero-text, var(--fs-on-primary))',
      }}
    >
      {/* Ambient accent glow + fine grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 50% at 80% 20%, rgba(var(--fs-accent-rgb), 0.13) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(var(--fs-hero-grid, rgba(255,255,255,0.6)) 1px, transparent 1px), linear-gradient(90deg, var(--fs-hero-grid, rgba(255,255,255,0.6)) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      <div className="fs-container relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
        {/* Copy */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fs-eyebrow"
          >
            {cfg.tagline}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="mt-5 text-[2.5rem] sm:text-5xl md:text-[3.5rem] xl:text-[4rem] font-medium tracking-[-0.015em] max-w-3xl"
          >
            {cfg.heroHeadline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
            className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl"
            style={{ color: 'var(--fs-hero-muted, rgba(255,255,255,0.78))' }}
          >
            {cfg.heroSub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
            className="mt-9 flex flex-col sm:flex-row flex-wrap gap-3"
          >
            <a href={cfg.bookingUrl} {...linkProps(cfg.bookingUrl)} className="fs-btn fs-btn-accent">
              Book a consultation
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href={cfg.portalUrl} {...linkProps(cfg.portalUrl)} className="fs-btn fs-btn-outline-light">
              <Lock size={15} aria-hidden="true" />
              Client portal login
            </a>
          </motion.div>

          {cfg.contact.phone && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-6 text-sm"
              style={{ color: 'var(--fs-hero-faint, rgba(255,255,255,0.6))' }}
            >
              Prefer to talk?{' '}
              <a
                href={`tel:${cfg.contact.phone.replace(/[^\d+]/g, '')}`}
                className="underline underline-offset-4 decoration-[rgba(255,255,255,0.35)] hover:decoration-current"
                style={{ color: 'var(--fs-hero-text, var(--fs-on-primary))' }}
              >
                {cfg.contact.phone}
              </a>
            </motion.p>
          )}
        </div>

        {/* How it works card */}
        <motion.aside
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          aria-label="How working with us starts"
          className="relative rounded-xl p-6 sm:p-8"
          style={{
            background: 'var(--fs-hero-card-bg, rgba(255,255,255,0.07))',
            border: '1px solid var(--fs-hero-card-border, rgba(255,255,255,0.16))',
            boxShadow: '0 24px 60px -40px rgba(0,0,0,0.5)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--fs-accent)' }}>
            How an engagement begins
          </p>
          <ol className="mt-5 space-y-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
                    style={{
                      background: 'rgba(var(--fs-accent-rgb), 0.10)',
                      color: 'var(--fs-accent)',
                      border: '1px solid rgba(var(--fs-accent-rgb), 0.22)',
                    }}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--fs-hero-muted, rgba(255,255,255,0.68))' }}>
                      {step.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div
            className="mt-6 pt-5 flex items-center justify-between gap-3 text-sm"
            style={{ borderTop: '1px solid var(--fs-hero-rule, rgba(255,255,255,0.12))', color: 'var(--fs-hero-muted, rgba(255,255,255,0.7))' }}
          >
            <span>No cost for the first call.</span>
            <a
              href={cfg.bookingUrl}
              {...linkProps(cfg.bookingUrl)}
              className="inline-flex items-center gap-1 font-semibold"
              style={{ color: 'var(--fs-accent)' }}
            >
              Pick a time
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
