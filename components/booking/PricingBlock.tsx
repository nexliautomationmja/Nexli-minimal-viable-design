'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import {
  AGENCY_AD_SPEND,
  AGENCY_TOTAL_MONTHLY,
  usd,
} from '@/lib/agency-offer';

/**
 * What the engagement costs, on both confirmation pages.
 *
 * ONE sticker price. It used to show the fee and the ad spend as two cards
 * side by side, which read as two bills and invited the question of whether
 * you could take just one. There is one number: AGENCY_TOTAL_MONTHLY.
 *
 * The ad-spend split sits underneath as a disclosure, not a line item —
 * it answers "where does the money go", not "what am I buying". Ad spend
 * is collected by Nexli as part of the monthly and placed into the
 * campaigns; it is not billed separately and the firm does not pay the
 * platforms itself.
 *
 * Shared rather than copied because this is the one block that has to look
 * identical on A and B. A price laid out differently on two pages reads as
 * two different prices.
 *
 * The counter holds at zero until scrolled into view and renders instantly
 * under prefers-reduced-motion; both are handled inside AnimatedNumber.
 */
export default function PricingBlock() {
  return (
    <div className="max-w-3xl mx-auto mt-10 md:mt-14">
      <p className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-green-500">
        What it costs
      </p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'circOut' }}
        className="mt-6 rounded-2xl md:rounded-3xl border border-green-500/25 bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-10 md:px-10 md:py-14 text-center"
      >
        <AnimatedNumber
          value={AGENCY_TOTAL_MONTHLY}
          animateOnView
          format={(n) => usd(Math.round(n))}
          className="block text-6xl md:text-8xl font-black leading-none text-white"
          style={{
            fontFamily: "'Syne', sans-serif",
            filter: 'drop-shadow(0 0 28px rgba(34,197,94,0.35))',
          }}
        />
        <p className="mt-3 text-base md:text-lg font-bold text-white">a month</p>
        <p className="mt-2 text-sm md:text-base leading-relaxed text-white/60">
          Everything above, built and run for you.
        </p>

        {/* Where the money goes — a disclosure, not a second price. */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-8 flex max-w-lg items-start gap-3.5 rounded-2xl border border-green-500/20 bg-green-500/[0.06] px-4 py-4 text-left md:px-5"
        >
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-green-500/30 bg-[#001a0d]"
            aria-hidden="true"
          >
            <Megaphone className="h-4 w-4 text-green-400" strokeWidth={2} />
          </span>
          <span>
            <span className="block text-sm font-bold text-white">
              {usd(AGENCY_AD_SPEND)} of that is your ad spend
            </span>
            <span className="mt-1 block text-xs md:text-sm leading-relaxed text-white/60">
              It runs through us so the budget actually reaches the campaigns on
              schedule, instead of sitting in an account waiting on a card that
              declined. You see where every dollar of it went in the weekly update.
            </span>
          </span>
        </motion.div>

        <p className="mt-6 text-sm text-white/55">
          No setup fee, no deposit. Six-month initial term, then month to month.
        </p>
      </motion.div>

      <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
        We will walk through the numbers on the call. Nothing here changes.
      </p>
    </div>
  );
}
