'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { linkProps } from '../../lib/firm-sites/links';
import { fadeUp, viewportOnce } from './motion';

export default function CTA({ cfg }: { cfg: FirmSiteConfig }) {
  const phoneHref = cfg.contact.phone ? `tel:${cfg.contact.phone.replace(/[^\d+]/g, '')}` : undefined;

  return (
    <section className="py-16 md:py-24">
      <div className="fs-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          custom={0}
          className="relative overflow-hidden rounded-lg px-6 py-14 sm:px-12 md:px-16 md:py-20 text-center"
          style={{
            background: 'linear-gradient(135deg, var(--fs-primary) 0%, var(--fs-primary-dark) 100%)',
            color: 'var(--fs-on-primary)',
            boxShadow: 'none',
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(50% 80% at 85% 10%, rgba(var(--fs-accent-rgb), 0.14) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="fs-eyebrow">Get started</span>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              Ready to decide the number instead of receiving it?
            </h2>
            <p className="mt-5 text-base md:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Book a complimentary consultation with {cfg.firmName}. We will tell you honestly whether the work
              pays for itself &mdash; and if it does not, we will say so.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
              <a href={cfg.bookingUrl} {...linkProps(cfg.bookingUrl)} className="fs-btn fs-btn-accent">
                Book a consultation
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              {phoneHref && (
                <a href={phoneHref} className="fs-btn fs-btn-outline-light">
                  <Phone size={15} aria-hidden="true" />
                  {cfg.contact.phone}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
