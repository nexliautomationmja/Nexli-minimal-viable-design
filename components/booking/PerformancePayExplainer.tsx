'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import {
  AGENCY_PERFORMANCE_PERCENT,
  AGENCY_RETAINER_MONTHLY,
  BIG_MONTH,
  PERFORMANCE_DEFINITION,
  PERFORMANCE_SIMPLE_RULE,
  PERFORMANCE_THRESHOLD,
  PERFORMANCE_THRESHOLD_LINE,
  QUIET_MONTH,
  usd,
  type PerformanceMonth,
} from '@/lib/agency-offer';

/**
 * How the monthly calculation works, "as if a baby was looking at it"
 * (Marcel, 2026-11-19). Under the price cards on /booking-confirmed-b and on
 * /pitch's pricing slide (compact), so the two show the same thing. Not on
 * the VSLs, whose cards say it in words.
 *
 * THE IDEAS IT EXISTS TO GET ACROSS (the pitch-deck brief, 2026-11-20):
 *   - the fee base is NET: what was collected from the clients the system
 *     brought in, minus the agreed ad spend and commissions;
 *   - the $10,000 is a CREDIT against the 10%, never added on top of it;
 *   - at or below $100,000 net in a month there is no additional invoice;
 *   - it is not 10% of every sale, and not the firm's net profit.
 * Two months side by side make it obvious: a quiet one where nothing more is
 * owed, and a growth one where $5,000 is. Every figure comes from
 * performanceMonth in lib/agency-offer, the same calculation the tests run.
 *
 * SAID THE SIMPLE WAY (Marcel, 2026-11-20): the $10,000 covers the first
 * $100,000 of net attributed revenue; above that we bill 10% of the
 * difference. Each month walks it in that order: collected, minus ads and
 * commissions, the first $100,000 covered, the amount above, 10% of it.
 *
 * Opaque navy, like PricingBlock, so it reads the same on the dark decks and
 * on /booking-confirmed-b's light theme. Colours are set inline because the
 * globals.css `p` rule would otherwise win.
 */

const SURFACE = 'linear-gradient(160deg, #101c33 0%, #0a1020 100%)';
const MUTED = 'rgba(255,255,255,0.66)';
const FAINT = 'rgba(255,255,255,0.5)';

/** A deduction, with a real minus sign. */
const minus = (n: number) => `−${usd(n)}`;

type Month = {
  label: string;
  m: PerformanceMonth;
  resultLabel: string;
  note: string;
  tone: 'emerald' | 'amber';
};

const MONTHS: Month[] = [
  {
    label: 'A quiet month',
    m: QUIET_MONTH,
    resultLabel: 'Billed at the end of the month',
    note: `Under ${usd(PERFORMANCE_THRESHOLD)}, so your ${usd(AGENCY_RETAINER_MONTHLY)} covers it. Nothing more to pay.`,
    tone: 'emerald',
  },
  {
    label: 'A growth month',
    m: BIG_MONTH,
    resultLabel: `${AGENCY_PERFORMANCE_PERCENT} of the difference, billed at month end`,
    note: `${usd(BIG_MONTH.above)} above ${usd(PERFORMANCE_THRESHOLD)}, so we bill ${AGENCY_PERFORMANCE_PERCENT} of it. Never ${AGENCY_PERFORMANCE_PERCENT} of each sale.`,
    tone: 'amber',
  },
];

const TONE = {
  emerald: { border: 'rgba(52,211,153,0.45)', bg: 'rgba(16,185,129,0.12)', text: '#6ee7b7', chip: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' },
  amber: { border: 'rgba(251,191,36,0.45)', bg: 'rgba(245,158,11,0.12)', text: '#fcd34d', chip: 'border-amber-400/40 bg-amber-400/10 text-amber-200' },
};

function Row({
  label,
  value,
  compact,
  strong = false,
  dim = false,
}: {
  label: string;
  value: string;
  compact: boolean;
  strong?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className={`${compact ? 'text-[12px]' : 'text-[13px] sm:text-sm'} leading-snug ${strong ? 'font-bold' : ''}`}
        style={{ color: strong ? '#ffffff' : MUTED }}
      >
        {label}
      </span>
      <span
        className={`shrink-0 font-black tracking-tight ${dim ? 'text-white/70' : 'text-white'} ${
          compact ? (strong ? 'text-[18px]' : 'text-[15px]') : strong ? 'text-[1.45rem] sm:text-[1.65rem]' : 'text-lg sm:text-xl'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function MonthCard({ month, compact }: { month: Month; compact: boolean }) {
  const t = TONE[month.tone];
  const { m } = month;
  return (
    <div className={`flex flex-col rounded-2xl border border-white/10 ${compact ? 'p-3' : 'p-4 sm:p-5'}`} style={{ background: 'rgba(0,0,0,0.22)' }}>
      <span className={`self-start rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${t.chip}`}>
        {month.label}
      </span>
      <div className={compact ? 'mt-2 space-y-0.5' : 'mt-4 space-y-2'}>
        {/* Compact (the deck) keeps every row to one line; the definition
            above spells each term out. */}
        <Row label={compact ? 'Collected from system clients' : 'Collected from clients the system brought in'} value={usd(m.collected)} compact={compact} />
        <Row label="Agreed ad spend" value={minus(m.adSpend)} compact={compact} dim />
        <Row label="Agreed commissions" value={minus(m.commissions)} compact={compact} dim />
        <div className={`border-t border-white/15 ${compact ? 'pt-1' : 'pt-2'}`}>
          <Row label="Net attributed revenue" value={usd(m.net)} compact={compact} strong />
        </div>
        <Row
          label={compact ? `Covered by your ${usd(AGENCY_RETAINER_MONTHLY)}` : `Covered by your ${usd(AGENCY_RETAINER_MONTHLY)} (up to ${usd(PERFORMANCE_THRESHOLD)})`}
          value={minus(m.covered)}
          compact={compact}
          dim
        />
        <Row label={`Above ${usd(PERFORMANCE_THRESHOLD)}`} value={usd(m.above)} compact={compact} />
      </div>
      {/* Pushed to the bottom so the two results line up. */}
      <div className={`mt-auto ${compact ? 'pt-2' : 'pt-4'}`}>
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border ${compact ? 'px-3 py-1.5' : 'px-4 py-3'}`}
          style={{ borderColor: t.border, background: t.bg }}
        >
          <span className={`font-bold leading-tight ${compact ? 'text-[12px]' : 'text-[13px] sm:text-sm'}`} style={{ color: t.text }}>
            {month.resultLabel}
          </span>
          <span className={`shrink-0 font-black tracking-tight text-white ${compact ? 'text-[20px]' : 'text-[2rem] sm:text-[2.3rem]'}`}>
            {usd(m.additional)}
          </span>
        </div>
      </div>
      {!compact && (
        <span className="mt-2.5 block text-[12.5px] leading-snug" style={{ color: FAINT }}>
          {month.note}
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
      className={`rounded-2xl border ${compact ? 'p-4' : 'p-5 sm:p-6 lg:p-7'} ${className}`}
      style={{ background: SURFACE, borderColor: 'rgba(251,191,36,0.3)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300 sm:text-[11px]">
          How the monthly calculation works
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-200 sm:text-xs">
          <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          Not {AGENCY_PERFORMANCE_PERCENT} of every sale
        </span>
      </div>

      {/* The rule first, in one sentence; what "net attributed revenue" is under it. */}
      <div
        className={`font-extrabold leading-tight tracking-tight text-white ${compact ? 'mt-1.5 text-[15px]' : 'mt-3 text-xl sm:text-2xl lg:text-[1.6rem]'}`}
      >
        {PERFORMANCE_SIMPLE_RULE}
      </div>
      <span className={`block leading-snug ${compact ? 'mt-1.5 text-[12px]' : 'mt-2.5 text-sm sm:text-[15px]'}`} style={{ color: MUTED }}>
        {PERFORMANCE_DEFINITION}
      </span>

      <div className={`grid ${compact ? `mt-3 gap-2.5 ${sideBySide ? 'sm:grid-cols-2' : ''}` : 'mt-5 gap-3 sm:grid-cols-2 sm:gap-4'}`}>
        {MONTHS.map((m) => (
          <MonthCard key={m.label} month={m} compact={compact} />
        ))}
      </div>

      <p
        className={`flex items-start gap-2 font-semibold leading-snug ${compact ? 'mt-2.5 text-[12px]' : 'mt-5 text-sm sm:text-[15px]'}`}
        style={{ color: '#ffffff' }}
      >
        <Check className={`shrink-0 text-emerald-400 ${compact ? 'mt-px h-3.5 w-3.5' : 'mt-0.5 h-4 w-4'}`} strokeWidth={3} aria-hidden="true" />
        <span>{PERFORMANCE_THRESHOLD_LINE}</span>
      </p>
    </div>
  );
}
