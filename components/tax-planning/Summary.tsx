'use client';

// ---------------------------------------------------------------------------
// The numbers beside the questions: the tax liability, and the planning fee
// next to it. "Pay the IRS this fat chunk, or pay us a fraction of it."
//
// Liability against fee, NOT "without vs with a plan" (Marcel, 2026-11-17).
// A second, smaller bill is one more number for a prospect to process on a
// call; the bill they already dread and the fee beside it is the one they
// take in at a glance. The strategies further down say where planning goes
// to work, each with its own amount.
//
// The two bars share one scale, so the fee's bar is the fee's real size
// against the bill: a sliver, which is the point.
// ---------------------------------------------------------------------------
import React from 'react';
import AnimatedNumber from '@/components/AnimatedNumber';
import BonusStar, { BONUS_SHEEN_CSS } from '@/components/math/BonusStar';
import type { PlanResult } from '@/lib/tax-planning/engine';
import { money, round100 } from './format';

export default function Summary({
  result,
  firm,
  fee,
  feeIncludesReturn,
}: {
  result: PlanResult;
  firm: string;
  fee: number;
  feeIncludesReturn: boolean;
}) {
  if (!result.supported) {
    return (
      <div
        className="rounded-2xl border border-white/10 p-6 sm:p-8"
        style={{ background: 'linear-gradient(160deg, rgba(16,28,51,0.85) 0%, rgba(10,16,32,0.85) 100%)' }}
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-400">C corporation</div>
        <div className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-white">
          A C corp needs {firm} to look at it directly.
        </div>
        <div className="mt-3 text-[15px] leading-relaxed text-white/65">
          This estimate covers sole proprietors, LLCs, partnerships and S corps. A C corp pays its own tax, then you
          pay again on what it pays you, and the planning works differently. Book a call and {firm} will run your
          real numbers.
        </div>
      </div>
    );
  }

  const b = result.baseline;
  const liability = round100(b.total);
  const parts = [
    { label: 'Federal income tax', value: b.federal },
    { label: b.viaPayroll > 0 ? 'Payroll tax on your salary' : 'Self-employment tax', value: b.employment + b.addlMedicare },
    { label: 'State income tax', value: b.state },
    ...(b.entity > 0 ? [{ label: 'State entity tax', value: b.entity }] : []),
  ].filter((p) => round100(p.value) > 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-8">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-300 sm:text-[11px]">
              Your tax liability
            </div>
            <AnimatedNumber
              value={liability}
              format={money}
              className="mt-2 block text-[2.3rem] font-black leading-none tracking-tight text-white sm:text-5xl"
            />
            <div className="mt-2 text-xs leading-snug text-white/50 sm:text-[13px]">Estimated for {result.year}</div>
          </div>
          <dl className="space-y-1.5 border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            {parts.map((p) => (
              <div key={p.label} className="flex items-baseline justify-between gap-3">
                <dt className="text-[13px] text-white/55 sm:text-sm">{p.label}</dt>
                <dd className="text-[15px] font-bold tabular-nums text-white/90">{money(p.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Choice firm={firm} fee={fee} liability={liability} feeIncludesReturn={feeIncludesReturn} />
    </div>
  );
}

function Choice({
  firm,
  fee,
  liability,
  feeIncludesReturn,
}: {
  firm: string;
  fee: number;
  liability: number;
  feeIncludesReturn: boolean;
}) {
  const scale = Math.max(liability, fee, 1);
  const share = liability > 0 ? fee / liability : 0;
  const shareText = share > 0 && share < 0.01 ? 'under 1%' : `${Math.round(share * 100)}%`;
  const bars = [
    { label: 'To the IRS and your state', value: liability, color: 'linear-gradient(90deg, #e11d48, #fb7185)', text: 'text-rose-300' },
    {
      label: `To ${firm}${feeIncludesReturn ? ', return included' : ''}`,
      value: fee,
      color: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
      text: 'text-amber-300',
    },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-amber-300/50 p-5 sm:p-6"
      style={{
        background:
          'linear-gradient(140deg, rgba(251,191,36,0.13) 0%, rgba(245,158,11,0.05) 45%, rgba(10,16,32,0.9) 100%)',
        boxShadow: '0 0 44px -18px rgba(251,191,36,0.55), inset 0 1px 0 rgba(255,247,214,0.12)',
      }}
    >
      <style>{BONUS_SHEEN_CSS}</style>
      <span aria-hidden="true" className="bonus-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" />
      <div className="relative">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200 sm:text-[11px]">The choice</div>
        <div className="mt-2 text-[1.35rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[1.65rem]">
          Pay the IRS <span className="text-rose-300">{money(liability)}</span>, or pay {firm}{' '}
          <span className="text-amber-300">{money(fee)}</span> to plan it.
        </div>

        <div className="mt-5 space-y-3.5">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-white/60 sm:text-sm">{bar.label}</span>
                <AnimatedNumber value={bar.value} format={money} className={`text-lg font-black sm:text-xl ${bar.text}`} />
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${Math.max(1.5, (bar.value / scale) * 100)}%`, background: bar.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {fee > 0 && liability > 0 && (
          <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-amber-300/30 bg-black/25 px-4 py-3.5">
            <BonusStar size={34} />
            <div className="min-w-0">
              <div className="text-[15px] font-bold leading-snug text-white sm:text-base">
                The fee is <span className="font-black text-amber-300">{shareText}</span> of your tax bill.
              </div>
              <div className="mt-0.5 text-[13px] leading-snug text-white/65 sm:text-sm">
                {firm} works the bill down before it’s filed, and keeps your books clean all year.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
