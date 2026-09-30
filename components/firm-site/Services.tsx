'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { linkProps } from '../../lib/firm-sites/links';
import { FIRM_SITE_SECTIONS } from '../../lib/firm-sites/types';
import { getServiceIcon } from './icons';
import { fadeUp, stagger, viewportOnce } from './motion';

export default function Services({ cfg }: { cfg: FirmSiteConfig }) {
  return (
    <section id={FIRM_SITE_SECTIONS.services} className="py-20 md:py-28 scroll-mt-20">
      <div className="fs-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          custom={0}
          className="max-w-2xl"
        >
          <span className="fs-eyebrow">Practice areas</span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight">
            Six decisions we get paid to be right about.
          </h2>
          <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--fs-text-muted)' }}>
            One partner-led team across the company, the owner and the structure that connects them &mdash; so
            nothing is optimised in isolation.
          </p>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 list-none p-0 m-0"
        >
          {cfg.services.map((svc, i) => {
            const Icon = getServiceIcon(svc.icon);
            return (
              <motion.li
                key={svc.title}
                variants={fadeUp}
                custom={i}
                className="fs-card group relative p-8 transition-colors duration-300"
                style={{ boxShadow: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--fs-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--fs-border)';
                }}
              >
                <div
                  className="pb-5 mb-5"
                  style={{ borderBottom: '1px solid var(--fs-border)', color: 'var(--fs-accent)' }}
                >
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className="text-lg md:text-xl font-medium">{svc.title}</h3>
                <p className="mt-3 text-sm md:text-[0.9375rem] leading-relaxed" style={{ color: 'var(--fs-text-muted)' }}>
                  {svc.description}
                </p>
              </motion.li>
            );
          })}
        </motion.ul>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          custom={1}
          className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <a href={cfg.bookingUrl} {...linkProps(cfg.bookingUrl)} className="fs-btn fs-btn-primary">
            Talk to a partner
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <p className="text-sm" style={{ color: 'var(--fs-text-muted)' }}>
            Every engagement is fixed-fee and scoped in writing. No hourly meter.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
