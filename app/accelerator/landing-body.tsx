'use client';

// ---------------------------------------------------------------------------
// The Accelerator landing page's markup and motion.
//
// Split out of page.tsx only because `export const metadata` requires a
// server component and framer-motion requires a client one. page.tsx keeps
// the metadata; everything visible lives here.
//
// THE MOTION VOCABULARY IS THE CALCULATOR'S, not a new one:
//
//   AnimatedNumber            ProfitCalculator uses it fourteen times; it is
//                             the house's signature effect and the reason
//                             those pages feel alive rather than printed.
//   whileHover scale 1.02     RevenueCalculator's buttons, and already baked
//   whileTap   scale 0.98     into FunnelCta, so the CTAs needed nothing.
//   duration 0.4-0.6          the house timing. Faster reads as twitchy on a
//                             page this sparse.
//
// RESTRAINT IS THE POINT. Everything moving at once is noise, and on a page
// whose whole job is one click it actively competes with the button. Four
// things move: the number counts, the badge rim turns, sections rise as you
// reach them, and the three icon chips bob while their rows lift under the
// cursor. Nothing else — and if a fifth is ever proposed, something here
// should come out to make room for it.
//
// The hero figure counts WITHOUT animateOnView because it is above the fold
// and should be mid-count as the page settles. The one inside the card uses
// animateOnView, or it finishes before anyone scrolls to it and reads as
// static text - which is the exact trap AnimatedNumber's own comment warns
// about.
// ---------------------------------------------------------------------------

import { motion } from 'framer-motion';
import { DollarSign, MessageSquare, Search, type LucideIcon } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import FunnelLogo from '@/components/FunnelLogo';
import FunnelCta from '@/components/funnel/FunnelCta';
import { AmbientGlow, CANVAS, OUTFIT, RimCard } from '@/components/funnel/primitives';
import {
  ACCELERATOR_CLOSE_RATE,
  ACCELERATOR_HIGH_FEE,
  ACCELERATOR_LOW_FEE,
  ACCELERATOR_TARGET,
  ACCELERATOR_TOP_N,
} from '@/lib/advisory-config';
import { ACCELERATOR_QUALIFY_PATH } from '@/lib/accelerator-config';

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** The guide's conservative band, not its headline one. */
const CONSERVATIVE_COUNT = Math.round(ACCELERATOR_TOP_N * ACCELERATOR_CLOSE_RATE);
const CONSERVATIVE_LOW = CONSERVATIVE_COUNT * ACCELERATOR_LOW_FEE;
const CONSERVATIVE_HIGH = CONSERVATIVE_COUNT * ACCELERATOR_HIGH_FEE;

/**
 * Three questions it ANSWERS, not three steps it tells you to take.
 *
 * This used to be the method — pull the twenty, price the work, have the
 * conversation — which is the guide's content laid out on a page you can
 * read without downloading anything. Naming what a reader will know
 * afterwards sells it; naming what to do removes the reason to open it.
 */
/**
 * Accents are emerald -> cyan -> blue, not the Rainmaker sweep.
 *
 * That row runs blue/violet/cyan/AMBER, which works on a page with no
 * single accent. This one is green throughout, and amber beside #4ade80
 * reads as a mistake rather than a palette. Narrowing to the cool end
 * keeps three distinct chips without fighting the page.
 *
 * Token shape is the house one, shared by ProfitCalculator's ACCENT map
 * and Services' getIconColors: -500/20 fill, -500/30 border, -400 glyph,
 * plus a drop-shadow in the same hue.
 */
const ANSWERS: { text: string; Icon: LucideIcon; chip: string; glyph: string; glow: string }[] = [
  {
    text: 'Which of the clients already on your books are quietly overpaying',
    Icon: Search,
    chip: 'bg-emerald-500/20 border-emerald-500/30',
    glyph: 'text-emerald-400',
    glow: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))',
  },
  {
    text: 'What that planning work is genuinely worth, and what to charge for it',
    Icon: DollarSign,
    chip: 'bg-cyan-500/20 border-cyan-500/30',
    glyph: 'text-cyan-400',
    glow: 'drop-shadow(0 4px 8px rgba(6, 182, 212, 0.3))',
  },
  {
    text: 'How to raise it with a compliance client without it feeling like a sale',
    Icon: MessageSquare,
    chip: 'bg-blue-500/20 border-blue-500/30',
    glyph: 'text-blue-400',
    glow: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))',
  },
];

/** The house entrance: up and in, once, when you reach it. */
const rise = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

export default function AcceleratorLandingBody() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: CANVAS }}>
      <FunnelLogo />
      <AmbientGlow />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-6 pt-24 md:pt-28 pb-12 md:pb-16">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* The rim pill, not either ShimmerButton component.
              Both of those are dead code with zero call sites; "shimmer"
              on this site means the rotating conic rim, and this is the
              same pill Marcel approved on /booking-confirmed-b, minus its
              theme branch because this page is always dark.
              6s per the house convention for a standalone top-of-page
              badge. The .rim-spin class rather than an arbitrary-value
              Tailwind animation, so the reduced-motion rule in globals
              can stop it. */}
          <span className="relative inline-flex rounded-full p-[1px]">
            <span
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <span
                className="absolute inset-[-100%] rim-spin"
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 50%, #4ade80, #166534, #4ade80, #166534, #4ade80)',
                }}
              />
            </span>

            {/* OPAQUE interior. A flat tint over a solid base, never an
                alpha fill - at any alpha the rim bleeds through and washes
                the pill out. Same trick as PricingBlock's setup-fee card. */}
            <span
              className="relative z-10 inline-flex items-center rounded-full px-3.5 py-1.5 text-emerald-400 uppercase tracking-[0.2em] text-[10px] font-black"
              style={{
                background: 'linear-gradient(rgba(74,222,128,0.10), rgba(74,222,128,0.10)), #0a0f1c',
              }}
            >
              Completely free
            </span>
          </span>

          <h1
            className="mt-6 text-3xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[1.04] text-white"
            style={OUTFIT}
          >
            Get an extra{' '}
            <AnimatedNumber
              value={ACCELERATOR_TARGET}
              format={(n) => usd(Math.round(n))}
              // MILLISECONDS, not seconds — useAnimatedValue divides by this
              // directly. 1.4 here meant 1.4ms and the figure snapped.
              duration={1400}
              className="tabular-nums"
              style={{ color: '#4ade80' }}
            />{' '}
            out of the book of business you already have.
          </h1>

          <p
            className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Not new clients. The ones whose returns you are already filing &mdash;
            who are overpaying tax right now and have never been offered a plan.
          </p>

          <motion.div
            className="mt-9 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
          >
            <FunnelCta href={ACCELERATOR_QUALIFY_PATH} size="lg">
              Download it for free
            </FunnelCta>
          </motion.div>

          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Five questions, about a minute. It arrives by email.
          </p>
        </motion.div>
      </section>

      {/* ── What it shows you ────────────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-6 pb-14 md:pb-20">
        <motion.div {...rise}>
          <RimCard className="mx-auto max-w-2xl" innerClassName="p-6 sm:p-9">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
              What it shows you
            </p>

            {/* The promise, not the derivation. This block used to print
                the guide's own arithmetic down the page — memorable in one
                glance, and enough to skip the download. */}
            <p
              className="mt-4 text-xl sm:text-2xl md:text-3xl font-black leading-[1.15] text-white"
              style={OUTFIT}
            >
              How to pull up to{' '}
              <AnimatedNumber
                value={ACCELERATOR_TARGET}
                animateOnView
                format={(n) => usd(Math.round(n))}
                duration={1200}
                className="tabular-nums"
                style={{ color: '#4ade80' }}
              />{' '}
              that is already hiding in your existing book of business.
            </p>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
              No ads, no funnel, no system to buy. The clients are people whose
              returns you are already filing.
            </p>

            {/* Both hedges. advisory-config is explicit that the close rate
                is an ASSUMPTION and the copy must say so. Do not remove
                either the first sentence or the conservative band. */}
            <p className="mt-6 pt-5 border-t border-white/10 text-sm leading-relaxed text-white/60">
              <strong className="text-white">
                {usd(ACCELERATOR_TARGET)} is a worked example, not a promise.
              </strong>{' '}
              It assumes a close rate the guide states plainly, and your number
              will be your own. On its more conservative band it is{' '}
              {usd(CONSERVATIVE_LOW)} to {usd(CONSERVATIVE_HIGH)} &mdash; still
              from clients you already have.
            </p>
          </RimCard>
        </motion.div>
      </section>

      {/* ── What you will know ───────────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-6 pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <motion.div {...rise}>
            <h2
              className="text-2xl sm:text-3xl md:text-[2.5rem] font-black tracking-[-0.03em] leading-[1.08] text-white text-center"
              style={OUTFIT}
            >
              A method, not a motivational PDF.
            </h2>
            <p className="mt-5 text-center text-base sm:text-lg leading-relaxed text-white/70">
              By the end of it you will know:
            </p>
          </motion.div>

          <div className="mt-7 grid gap-3 sm:gap-4">
            {ANSWERS.map((a, i) => (
              <motion.div
                key={a.text}
                className="flex gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                // Staggered by index rather than a parent variant: three
                // rows do not justify a variants tree, and the delay is
                // short enough that the last one lands before a reader
                // has finished the first.
                transition={{ duration: 0.45, delay: i * 0.09, ease: 'easeOut' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* The chip bobs on a CSS keyframe, not framer-motion.
                    Services.tsx builds the same effect from eight
                    transition objects per icon; ProfitCalculator does it
                    with one keyframe and a delay, and it is identical on
                    screen. Staggered by index so the three drift rather
                    than bobbing in lockstep, which is the tell that it
                    was automated. */}
                <span
                  aria-hidden="true"
                  className={`icon-float mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${a.chip}`}
                  style={{ filter: a.glow, animationDelay: `${i * 0.35}s` }}
                >
                  <a.Icon size={20} className={a.glyph} strokeWidth={2} />
                </span>
                <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-white/75">
                  {a.text}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div {...rise} className="mt-9 flex justify-center">
            <FunnelCta href={ACCELERATOR_QUALIFY_PATH} size="lg">
              Download it for free
            </FunnelCta>
          </motion.div>

          <p className="mt-4 text-center text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Free. We do not ask for a card, because there is nothing to pay for.
          </p>
        </div>
      </section>
    </main>
  );
}
