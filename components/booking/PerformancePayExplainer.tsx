'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import {
  AGENCY_PERFORMANCE_PERCENT,
  AGENCY_RETAINER_MONTHLY,
  PERFORMANCE_EXAMPLE_EXTRA,
  PERFORMANCE_EXAMPLE_REVENUE,
  PERFORMANCE_EXAMPLE_TOTAL,
  PERFORMANCE_NET_PLAIN,
  PERFORMANCE_QUIET_EXTRA,
  PERFORMANCE_QUIET_REVENUE,
  PERFORMANCE_QUIET_SHARE,
  PERFORMANCE_THRESHOLD,
  PERFORMANCE_YOURS,
  usd,
} from '@/lib/agency-offer';

/**
 * How the 10% performance pay works, "as if a baby was looking at it"
 * (Marcel, 2026-11-19). On the VSLs and /booking-confirmed-b (inside
 * PricingBlock) and on /pitch's money slide (compact), so the three show
 * the same thing.
 *
 * THE ONE IDEA IT EXISTS TO GET ACROSS: the 10% is not taken from every
 * sale. It is one number, once a month (Marcel's definition,
 * PERFORMANCE_NET_PLAIN), and the $10,000 already paid counts toward it. Two
 * months side by side make that obvious without a sentence of rules: a
 * quiet one where nothing more is owed, and Marcel's $150,000 one where
 * $5,000 is. Every figure comes from lib/agency-offer.
 *
 * Opaque navy, like PricingBlock, so it reads the same on the dark decks and
 * on /booking-confirmed-b's light theme. Colours are set inline because the
 * globals.css `p` rule would otherwise win.
 */

const SURFACE = 'linear-gradient(160deg, #101c33 0%, #0a1020 100%)';
const MUTED = 'rgba(255,255,255,0.66)';
const FAINT = 'rgba(255,255,255,0.5)';

type Month = {
  label: string;
  revenue: number;
  share: number;
  /** The third line: what happens to the $10,000 already paid. */
  paidLine: string;
  paidValue: string;
  result: number;
  resultLabel: string;
  note: string;
  tone: 'emerald' | 'amber';
};

const MONTHS: Month[] = [
  {
    label: 'A quiet month',
    revenue: PERFORMANCE_QUIET_REVENUE,
    share: PERFORMANCE_QUIET_SHARE,
    paidLine: 'You already paid',
    paidValue: usd(AGENCY_RETAINER_MONTHLY),
    result: PERFORMANCE_QUIET_EXTRA,
    resultLabel: 'You pay more',
    note: `${usd(PERFORMANCE_QUIET_SHARE)} is less than the ${usd(AGENCY_RETAINER_MONTHLY)} you already paid. Nothing more to pay.`,
    tone: 'emerald',
  },
  {
    label: 'A big month',
    revenue: PERFORMANCE_EXAMPLE_REVENUE,
    share: PERFORMANCE_EXAMPLE_TOTAL,
    paidLine: 'Minus what you already paid',
    paidValue: `−${usd(AGENCY_RETAINER_MONTHLY)}`,
    result: PERFORMANCE_EXAMPLE_EXTRA,
    resultLabel: 'Invoiced at the end of the month',
    note: `Only the difference is invoiced. Never ${AGENCY_PERFORMANCE_PERCENT} of each sale.`,
    tone: 'amber',
  },
];

const TONE = {
  emerald: { border: 'rgba(52,211,153,0.45)', bg: 'rgba(16,185,129,0.12)', text: '#6ee7b7', chip: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' },
  amber: { border: 'rgba(251,191,36,0.45)', bg: 'rgba(245,158,11,0.12)', text: '#fcd34d', chip: 'border-amber-400/40 bg-amber-400/10 text-amber-200' },
};

function Row({ label, value, compact, strong }: { label: string; value: string; compact: boolean; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={compact ? 'text-[12.5px] leading-snug' : 'text-[13px] leading-snug sm:text-sm'} style={{ color: MUTED }}>
        {label}
      </span>
      <span
        className={`shrink-0 font-black tracking-tight text-white ${
          compact ? (strong ? 'text-[20px]' : 'text-[17px]') : strong ? 'text-[1.6rem] sm:text-[1.85rem]' : 'text-xl sm:text-2xl'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function MonthCard({ m, compact }: { m: Month; compact: boolean }) {
  const t = TONE[m.tone];
  return (
    <div className={`flex flex-col rounded-2xl border border-white/10 ${compact ? 'p-3' : 'p-4 sm:p-5'}`} style={{ background: 'rgba(0,0,0,0.22)' }}>
      <span className={`self-start rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${t.chip}`}>
        {m.label}
      </span>
      <div className={compact ? 'mt-2.5 space-y-1.5' : 'mt-4 space-y-2.5'}>
        <div>
          <Row label="The clients our ads brought you made" value={usd(m.revenue)} compact={compact} strong />
          <span className="block text-[11.5px] leading-snug" style={{ color: FAINT }}>
            after your ad spend and commissions
          </span>
        </div>
        <Row label={`${AGENCY_PERFORMANCE_PERCENT} of that`} value={usd(m.share)} compact={compact} />
        <Row label={m.paidLine} value={m.paidValue} compact={compact} />
      </div>
      {/* Pushed to the bottom so the two results line up. */}
      <div className={`mt-auto ${compact ? 'pt-2.5' : 'pt-4'}`}>
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
          style={{ borderColor: t.border, background: t.bg }}
        >
          <span className={`font-bold leading-tight ${compact ? 'text-[12px]' : 'text-[13px] sm:text-sm'}`} style={{ color: t.text }}>
            {m.resultLabel}
          </span>
          <span className={`shrink-0 font-black tracking-tight text-white ${compact ? 'text-[22px]' : 'text-[2rem] sm:text-[2.3rem]'}`}>
            {usd(m.result)}
          </span>
        </div>
      </div>
      {!compact && (
        <span className="mt-2.5 block text-[12.5px] leading-snug" style={{ color: FAINT }}>
          {m.note}
        </span>
      )}
    </div>
  );
}

export default function PerformancePayExplainer({
  compact = false,
  sideBySide = false,
  className = '',
}: {
  compact?: boolean;
  /** Compact, but the two months side by side from sm up (a wide deck column); stacked on a phone. */
  sideBySide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6 lg:p-7'} ${className}`}
      style={{ background: SURFACE, borderColor: 'rgba(251,191,36,0.3)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300 sm:text-[11px]">
          How the {AGENCY_PERFORMANCE_PERCENT} works
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-200 sm:text-xs">
          <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          Not {AGENCY_PERFORMANCE_PERCENT} of every sale
        </span>
      </div>

      <div
        className={`font-extrabold leading-tight tracking-tight text-white ${compact ? 'mt-2 text-[15px]' : 'mt-3 text-xl sm:text-2xl lg:text-[1.7rem]'}`}
      >
        One number, once a month.
      </div>
      <span className={`mt-1.5 block leading-snug ${compact ? 'text-[12px]' : 'text-sm sm:text-[15px]'}`} style={{ color: MUTED }}>
        <strong className="text-white">{AGENCY_PERFORMANCE_PERCENT}</strong> of {PERFORMANCE_NET_PLAIN}. The{' '}
        {usd(AGENCY_RETAINER_MONTHLY)} you paid at the start of the month counts toward it.
      </span>

      <div className={`grid ${compact ? `mt-3 gap-2.5 ${sideBySide ? 'sm:grid-cols-2' : ''}` : 'mt-5 gap-3 sm:grid-cols-2 sm:gap-4'}`}>
        {MONTHS.map((m) => (
          <MonthCard key={m.label} m={m} compact={compact} />
        ))}
      </div>

      <ul className={`list-none space-y-1.5 p-0 ${compact ? 'mt-3' : 'mt-5'}`}>
        {[
          `Only revenue from the clients our ads bring you. ${PERFORMANCE_YOURS}`,
          `Under ${usd(PERFORMANCE_THRESHOLD)} in a month? The ${usd(AGENCY_RETAINER_MONTHLY)} is all you pay us.`,
        ].map((line) => (
          <li
            key={line}
            className={`flex items-start gap-2 font-semibold leading-snug text-white ${compact ? 'text-[12px]' : 'text-sm sm:text-[15px]'}`}
          >
            <Check className={`shrink-0 text-emerald-400 ${compact ? 'mt-px h-3.5 w-3.5' : 'mt-0.5 h-4 w-4'}`} strokeWidth={3} aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
