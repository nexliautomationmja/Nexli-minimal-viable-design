'use client';
import React from 'react';
import { motion } from 'framer-motion';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { fadeUp, stagger, viewportOnce } from './motion';

/** Trust bar directly under the hero. Renders nothing when the config has no stats. */
export default function Stats({ cfg }: { cfg: FirmSiteConfig }) {
  const stats = cfg.stats ?? [];
  if (stats.length === 0) return null;

  return (
    <section
      aria-label="Firm at a glance"
      className="relative"
      style={{ background: 'var(--fs-surface)', borderBottom: '1px solid var(--fs-border)' }}
    >
      <div className="fs-container">
        <motion.dl
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 py-10 md:py-12"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i}
              className="relative pl-4"
              style={{ borderLeft: '3px solid var(--fs-accent)' }}
            >
              <dt className="order-2 text-sm leading-snug" style={{ color: 'var(--fs-text-muted)' }}>
                {s.label}
              </dt>
              <dd
                className="text-3xl md:text-4xl font-semibold tracking-tight mb-1"
                style={{ fontFamily: 'var(--fs-font-heading)', color: 'var(--fs-stat-ink, var(--fs-primary))' }}
              >
                {s.value}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
