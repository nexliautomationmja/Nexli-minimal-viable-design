'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { fadeUp, stagger, viewportOnce } from './motion';

export default function Testimonials({ cfg }: { cfg: FirmSiteConfig }) {
  const items = cfg.testimonials ?? [];
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="firm-testimonials-heading"
      className="py-20 md:py-28"
      style={{ background: 'var(--fs-surface)', borderTop: '1px solid var(--fs-border)', borderBottom: '1px solid var(--fs-border)' }}
    >
      <div className="fs-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          custom={0}
          className="max-w-2xl"
        >
          <span className="fs-eyebrow">Clients</span>
          <h2 id="firm-testimonials-heading" className="mt-3 text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight">
            What the relationship actually looks like.
          </h2>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className={`mt-12 grid grid-cols-1 ${items.length > 1 ? 'md:grid-cols-2' : ''} gap-6 list-none p-0 m-0`}
        >
          {items.map((t, i) => (
            <motion.li
              key={t.name}
              variants={fadeUp}
              custom={i}
              className="fs-card relative p-8 md:p-10 flex flex-col"
              // The section itself is --fs-surface, so the card takes the canvas colour.
              style={{ background: 'var(--fs-bg)' }}
            >
              <div className="flex gap-1 opacity-80" aria-label="Five star rating">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={13} fill="var(--fs-accent)" stroke="var(--fs-accent)" aria-hidden="true" />
                ))}
              </div>
              <figure className="m-0 flex-1 flex flex-col">
              <blockquote className="mt-5 flex-1 m-0">
                <p
                  className="text-[1.0625rem] md:text-xl font-normal leading-[1.6]"
                  style={{ fontFamily: 'var(--fs-font-heading)', color: 'var(--fs-text)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-6 pt-5 flex items-center gap-3" style={{ borderTop: '1px solid var(--fs-border)' }}>
                <div
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: 'rgba(var(--fs-accent-rgb), 0.12)', color: 'var(--fs-accent)' }}
                >
                  {t.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{t.name}</p>
                  {t.detail && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--fs-text-muted)' }}>
                      {t.detail}
                    </p>
                  )}
                </div>
              </figcaption>
              </figure>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
