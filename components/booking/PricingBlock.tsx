'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Megaphone,
  MessagesSquare,
  Percent,
  Plus,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import MetaLogo from '@/components/icons/MetaLogo';
import { OUTFIT } from '@/components/funnel/primitives';
import {
  AGENCY_MAX_AD_BUDGET,
  AGENCY_MIN_AD_BUDGET,
  AGENCY_PERFORMANCE_PERCENT,
  AGENCY_RETAINER_MONTHLY,
  AGENCY_RETAINER_TERM_MONTHS,
  usd,
  usdK,
} from '@/lib/agency-offer';

/**
 * What the engagement costs: THE RETAINER in lib/agency-offer.ts (Marcel,
 * 2026-11-19). On the VSLs, right above the calendar, and on
 * /booking-confirmed-b.
 *
 * Shared rather than copied because a price laid out differently on two
 * pages reads as two different prices, and these two pages are read minutes
 * apart: the VSL, then the confirmation after booking.
 *
 * DRAWN IN /math's LANGUAGE (Marcel, 2026-11-19): not one box with the
 * price in it, but the "How the math works" chain. Three numbered cards
 * with their icon tiles, joined by plus signs, are what the firm pays:
 * the agency fee, the performance pay, its own ad budget. Under them, a
 * small diagram of where that money goes (Nexli, and Meta directly, never
 * through us) and the terms.
 *
 * PERFORMANCE PAY IS NAMED, NOT EXPLAINED (Marcel, 2026-11-19): "plus 10%
 * performance pay", and how it works is walked through on the call. He
 * would rather a firm get on the call and see it than read the mechanics
 * on a landing page. Do not add the worked example, the "greater of"
 * rule or the definition of attributable net revenue back here.
 *
 * NO PREPAY ON THE PAGE (same day). The $60,000 six-month prepay exists
 * (AGENCY_RETAINER_PREPAY) but is not shown or offered here.
 *
 * DARK WHATEVER THE THEME. /booking-confirmed-b follows the site theme, so
 * every surface here is opaque navy rather than /math's translucent glass,
 * which would vanish on a white page. Only the kicker and the line under
 * the heading follow the theme.
 */

const SURFACE = 'linear-gradient(160deg, #101c33 0%, #0a1020 100%)';
const MUTED = 'rgba(255,255,255,0.62)';

type Tone = 'emerald' | 'amber' | 'blue' | 'cyan';

/** /math's tile colours (components/math/ChainIcons). */
const TONES: Record<Tone, { tile: string; text: string; shadow: string; line: string }> = {
  emerald: { tile: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-400', shadow: 'rgba(16,185,129,0.35)', line: '#10B981' },
  amber: { tile: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-400', shadow: 'rgba(245,158,11,0.35)', line: '#F59E0B' },
  blue: { tile: 'bg-blue-500/20 border-blue-500/30', text: 'text-blue-400', shadow: 'rgba(37,99,235,0.35)', line: '#0081FB' },
  cyan: { tile: 'bg-cyan-500/20 border-cyan-500/30', text: 'text-cyan-400', shadow: 'rgba(6,182,212,0.35)', line: '#06B6D4' },
};

function Tile({ Icon, tone, n }: { Icon: LucideIcon; tone: Tone; n?: number }) {
  const t = TONES[tone];
  return (
    <span className="relative inline-flex">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${t.tile}`}
        style={{ filter: `drop-shadow(0 4px 8px ${t.shadow})` }}
      >
        <Icon className={`h-5 w-5 ${t.text}`} aria-hidden="true" />
      </span>
      {n !== undefined && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-[#020617] ring-2 ring-[#0b1220]"
        >
          {n}
        </span>
      )}
    </span>
  );
}

/** Nexli's three chevrons, as in the page logo. */
function NexliMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-label="Nexli" role="img">
      <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
      <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="#3B82F6" />
      <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4" />
    </svg>
  );
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' as const, delay },
});

/** The plus between two cards: beside them on desktop, between them on a phone. */
function Join() {
  return (
    <div className="flex items-center justify-center py-1 lg:px-2 lg:py-0" aria-hidden="true">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#0d1526] text-white/60">
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </div>
  );
}

/** One lane of "where your money goes": a line with a packet on it, then who gets it. */
function Lane({
  tone,
  logo,
  name,
  amount,
  detail,
  delay,
}: {
  tone: Tone;
  logo: React.ReactNode;
  name: string;
  amount: string;
  detail: string;
  delay: number;
}) {
  const still = useReducedMotion();
  const color = TONES[tone].line;
  return (
    <div className="flex items-center">
      <div className="relative h-[2px] min-w-[1.75rem] flex-1 rounded-full" style={{ background: `linear-gradient(90deg, rgba(255,255,255,0.12), ${color})` }}>
        {!still && (
          <motion.span
            aria-hidden="true"
            className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            initial={{ left: '0%', opacity: 0 }}
            animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay }}
          />
        )}
      </div>
      <ChevronRight className="-ml-1.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden="true" />
      {/* One width for both, so the two arrows end at the same point. */}
      <div className="ml-1 flex w-[12.25rem] shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-[#0d1526] px-3 py-2.5 sm:w-56 sm:px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
          {logo}
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">{name}</span>
          <span className="block text-sm font-bold text-white sm:text-[15px]">{amount}</span>
          <span className="block text-[11px] leading-snug sm:text-xs" style={{ color: MUTED }}>
            {detail}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function PricingBlock({ headline }: { headline?: React.ReactNode }) {
  const parts = [
    {
      n: 1,
      tone: 'emerald' as Tone,
      Icon: CircleDollarSign,
      label: 'Agency fee',
      value: (
        <AnimatedNumber
          value={AGENCY_RETAINER_MONTHLY}
          animateOnView
          format={(n) => usd(Math.round(n))}
        />
      ),
      unit: 'a month',
      note: 'The website, portal, funnel, automations and campaigns, built and run for you.',
      highlight: true,
    },
    {
      n: 2,
      tone: 'amber' as Tone,
      Icon: Percent,
      label: 'Performance pay',
      value: AGENCY_PERFORMANCE_PERCENT,
      // No gloss on the 10%: what it is a percentage of is for the call.
      unit: '',
      note: 'We’ll walk you through how it works on the call.',
      highlight: false,
    },
    {
      n: 3,
      tone: 'blue' as Tone,
      Icon: Megaphone,
      label: 'Your ad budget',
      // The range (Marcel, 2026-11-19). The top end counts up from the
      // bottom as it scrolls in, so the range opens out to $5K–$30K.
      value: (
        <span className="whitespace-nowrap">
          {usdK(AGENCY_MIN_AD_BUDGET)}–
          <AnimatedNumber
            value={AGENCY_MAX_AD_BUDGET}
            animateOnView
            duration={1100}
            format={(n) => usdK(Math.max(AGENCY_MIN_AD_BUDGET, n))}
          />
        </span>
      ),
      unit: 'a month',
      note: `Anywhere from ${usd(AGENCY_MIN_AD_BUDGET)} to ${usd(AGENCY_MAX_AD_BUDGET)} a month, paid straight to Meta on your own card. It never passes through us.`,
      highlight: false,
    },
  ];

  const terms: { Icon: LucideIcon; title: string; body: string }[] = [
    { Icon: Wrench, title: 'No setup fee', body: 'Nothing separate to pay for the build.' },
    {
      Icon: CalendarClock,
      title: `${AGENCY_RETAINER_TERM_MONTHS}-month initial term`,
      body: 'Long enough for the campaigns to have actually run.',
    },
    {
      Icon: MessagesSquare,
      title: 'Walked through on the call',
      body: 'The agreement and the performance pay, before anything is signed. Nothing here changes.',
    },
  ];

  return (
    <div className="mx-auto mt-10 max-w-6xl md:mt-14" style={OUTFIT}>
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400 sm:text-xs">
        What it costs
      </p>
      {headline}

      {/* What you pay: three numbered cards and the plus signs between them,
          the "How the math works" chain on /math. */}
      <div className="mt-8 grid grid-cols-1 lg:mt-10 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {parts.map((p, i) => (
          <React.Fragment key={p.label}>
            {i > 0 && <Join />}
            <motion.div {...rise(0.08 * i)} className="flex">
              <div
                className={`flex w-full flex-col rounded-2xl border p-5 lg:p-6 ${
                  p.highlight
                    ? 'border-emerald-400/55 shadow-[0_0_50px_-16px_rgba(52,211,153,0.6)]'
                    : 'border-white/10'
                }`}
                style={{ background: SURFACE }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="pr-1.5 pt-1.5">
                    <Tile Icon={p.Icon} tone={p.tone} n={p.n} />
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px] ${TONES[p.tone].text}`}>
                    {p.label}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[2.6rem] font-black leading-none tracking-tight text-white lg:text-5xl">
                    {p.value}
                  </span>
                  {p.unit && <span className="text-sm font-bold text-white/70 sm:text-base">{p.unit}</span>}
                </div>
                <span className="mt-3 block text-[13px] leading-snug sm:text-sm" style={{ color: MUTED }}>
                  {p.note}
                </span>
              </div>
            </motion.div>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Where the money goes: one source, two lanes. The second lane is
            the point: the ad budget goes from the firm to Meta, not to us. */}
        <motion.div {...rise(0.2)} className="rounded-2xl border border-white/10 p-4 sm:p-6" style={{ background: SURFACE }}>
          <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400/90 sm:text-[11px]">
            Where your money goes
          </div>
          <div className="flex items-stretch gap-2 sm:gap-3">
            <div className="flex shrink-0 flex-col items-center justify-center gap-2">
              <Tile Icon={Building2} tone="cyan" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">Your firm</span>
            </div>
            <div className="relative flex flex-1 flex-col justify-center gap-4">
              {/* The fork: one line down from the firm, a lane off each end. */}
              <span aria-hidden="true" className="absolute bottom-[22%] left-0 top-[22%] w-[2px] rounded-full bg-white/15" />
              <Lane
                tone="emerald"
                logo={<NexliMark className="h-5 w-5" />}
                name="Nexli"
                amount={`${usd(AGENCY_RETAINER_MONTHLY)} a month`}
                detail={`+ ${AGENCY_PERFORMANCE_PERCENT} performance pay`}
                delay={0}
              />
              <Lane
                tone="blue"
                logo={<MetaLogo className="h-5 w-5" />}
                name="Meta"
                amount={`${usdK(AGENCY_MIN_AD_BUDGET)}–${usdK(AGENCY_MAX_AD_BUDGET)} a month`}
                detail="Your ad budget, your card"
                delay={1.1}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          {...rise(0.28)}
          className="relative overflow-hidden rounded-2xl border py-5 pl-6 pr-5 sm:pl-7"
          style={{ borderColor: 'rgba(20,168,119,0.4)', background: 'linear-gradient(160deg, #0c2620 0%, #0a1020 100%)' }}
        >
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1" style={{ background: '#14A877' }} />
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:text-[11px]">The terms</div>
          <ul className="mt-3 list-none space-y-3.5 p-0">
            {terms.map(({ Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15">
                  <Icon className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-white sm:text-[15px]">
                    {title}
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: MUTED }}>
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
