'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { FIRM_SITE_SECTIONS } from '../../lib/firm-sites/types';
import { fadeUp, stagger, viewportOnce } from './motion';

function initials(name: string): string {
  return name
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function About({ cfg }: { cfg: FirmSiteConfig }) {
  const { about, team } = cfg;
  const paragraphs = about.body.split(/\n{2,}/).filter(Boolean);

  return (
    <section id={FIRM_SITE_SECTIONS.about} className="py-20 md:py-28 scroll-mt-20">
      <div className="fs-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={fadeUp} custom={0}>
            <span className="fs-eyebrow">About {cfg.firmName}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight">
              {about.heading}
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--fs-text-muted)' }}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>

          {about.highlights && about.highlights.length > 0 && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              custom={1}
              className="fs-card p-8 md:p-10 lg:mt-14"
              style={{ boxShadow: 'none' }}
            >
              <p className="text-sm font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--fs-accent)' }}>
                What every engagement includes
              </p>
              <ul className="mt-5 space-y-4 list-none p-0 m-0">
                {about.highlights.map((h) => (
                  <li key={h} className="flex gap-3 items-start">
                    <span
                      className="mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(var(--fs-accent-rgb), 0.12)', color: 'var(--fs-primary)' }}
                    >
                      <Check size={14} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="text-[0.9375rem] md:text-base leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {team && team.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="mt-16 md:mt-20"
          >
            <motion.h3 variants={fadeUp} custom={0} className="text-2xl font-semibold tracking-tight">
              The team
            </motion.h3>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 list-none p-0 m-0">
              {team.map((member, i) => (
                <motion.li key={member.name} variants={fadeUp} custom={i} className="fs-card p-6 flex gap-4">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo}
                      alt={member.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="w-16 h-16 rounded-md shrink-0 flex items-center justify-center text-lg font-semibold"
                      style={{
                        background: 'var(--fs-primary)',
                        color: 'var(--fs-on-primary)',
                        fontFamily: 'var(--fs-font-heading)',
                      }}
                    >
                      {initials(member.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{member.name}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--fs-accent)' }}>
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fs-text-muted)' }}>
                        {member.bio}
                      </p>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  );
}
