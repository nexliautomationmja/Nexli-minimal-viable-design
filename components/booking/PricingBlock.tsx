'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Wallet } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import {
  AGENCY_AD_SPEND,
  AGENCY_MONTHLY_FEE,
  AGENCY_TOTAL_MONTHLY,
  usd,
} from '@/lib/agency-offer';

/**
 * What the engagement costs, on both confirmation pages.
 *
 * Shared rather than copied because this is the one block that has to look
 * identical on A and B. The figures already come from lib/agency-offer.ts so
 * they could not drift, but the markup around them could, and a price laid
 * out differently on two pages reads as two different prices.
 *
 * Deliberately right under "Everything Included": the price only makes sense
 * immediately after the list it buys.
 *
 * Two numbers and a total — never itemised. One fee for one system, because
 * a price with parts invites an argument about the parts before the call
 * even happens. See the note in lib/agency-offer.ts.
 *
 * The counters hold at zero until scrolled into view (`animateOnView`) and
 * render instantly under prefers-reduced-motion; both are handled inside
 * AnimatedNumber.
 */

const CARDS = [
  {
    Icon: Wallet,
    value: AGENCY_MONTHLY_FEE,
    label: 'per month',
    note: 'Everything above, built and run for you.',
  },
  {
    Icon: Megaphone,
    value: AGENCY_AD_SPEND,
    label: 'per month in ad spend',
    note: 'Paid to the platforms through your own ad account, not to us.',
  },
];

export default function PricingBlock() {
  return (
    <div className="max-w-5xl mx-auto mt-10 md:mt-14">
      <p className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-green-500">
        What it costs
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {CARDS.map(({ Icon, value, label, note }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: 'circOut' }}
            className="relative flex flex-col items-center rounded-2xl md:rounded-3xl border border-green-500/20 bg-gradient-to-br from-slate-900 to-slate-950 px-5 py-8 md:px-6 md:py-10 text-center"
          >
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-green-500/30 bg-[#001a0d] md:h-16 md:w-16"
              style={{ filter: 'drop-shadow(0 0 24px rgba(34,197,94,0.35))' }}
            >
              <Icon className="h-7 w-7 text-green-400 md:h-8 md:w-8" strokeWidth={2} />
            </div>

            <AnimatedNumber
              value={value}
              animateOnView
              format={(n) => usd(Math.round(n))}
              className="text-4xl md:text-5xl font-black leading-none text-white"
              style={{
                fontFamily: "'Syne', sans-serif",
                filter: 'drop-shadow(0 0 20px rgba(34,197,94,0.3))',
              }}
            />

            <p className="mt-3 text-sm md:text-base font-bold text-white">{label}</p>
            <p className="mt-1.5 text-xs md:text-sm leading-relaxed text-white/55">{note}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/[0.06] px-5 py-5 text-center md:px-8"
      >
        <p className="text-sm md:text-base text-[var(--text-muted)]">
          <span className="font-bold text-[var(--text-main)]">
            About {usd(AGENCY_TOTAL_MONTHLY)} a month all in.
          </span>{' '}
          Month to month. No setup fee, no contract.
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          We will walk through the numbers on the call. Nothing here changes.
        </p>
      </motion.div>
    </div>
  );
}
