'use client';

// ---------------------------------------------------------------------------
// The fine print, written as a trust signal rather than a liability shield:
// what a good firm won't sell you, what the estimate assumes, what it leaves
// out, and the year the figures come from. Then "Powered by Nexli": the
// tool is the firm's, the credit is small.
// ---------------------------------------------------------------------------
import React from 'react';
import { Check, Minus, Settings2, X } from 'lucide-react';
import { ASSUMPTIONS, NOT_CONSIDERED, WONT_SELL } from '@/lib/tax-planning/engine';
import { CHECKED_ON } from '@/lib/tax-planning/rates';

export const NEXLI_CREDIT_URL = 'https://www.nexli.net/?utm_source=tax-planning-tool&utm_medium=referral';

function List({ title, items, icon }: { title: string; items: readonly string[]; icon: 'x' | 'check' | 'minus' }) {
  const Icon = icon === 'x' ? X : icon === 'check' ? Check : Minus;
  const tone = icon === 'x' ? 'text-rose-300' : icon === 'check' ? 'text-cyan-300' : 'text-white/40';
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((t) => (
          <li key={t} className="flex gap-2.5 text-[13px] leading-snug text-white/60">
            <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tone}`} aria-hidden="true" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ToolFooter({
  firm,
  year,
  onSettings,
}: {
  firm: string;
  year: number;
  /** Prospect view: reopen the firm's settings. */
  onSettings?: () => void;
}) {
  return (
    <footer className="mt-16 border-t border-white/10 pt-10">
      <div className="grid gap-3 md:grid-cols-3">
        <List title={`What ${firm} won’t sell you`} items={WONT_SELL} icon="x" />
        <List title="What this assumes" items={ASSUMPTIONS} icon="check" />
        <List title="What it leaves out" items={NOT_CONSIDERED} icon="minus" />
      </div>

      <div className="mt-6 max-w-4xl text-xs leading-relaxed text-white/45">
        An estimate for illustration. It is not tax advice, not a tax return and not a promise of any result. It uses
        {` ${year}`} federal tax figures (checked {CHECKED_ON}) and approximate state rates, and it can be wrong for your
        situation. Nothing you enter leaves this browser. {firm} confirms every number before anything is filed.
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-4">
        <a
          href={NEXLI_CREDIT_URL}
          target="_blank"
          rel="noopener"
          className="text-xs font-semibold text-white/40 transition-colors hover:text-white/70"
        >
          Powered by <span className="font-black tracking-tight text-white/60">Nexli</span>
        </a>
        {onSettings && (
          <button
            type="button"
            onClick={onSettings}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/35 transition-colors hover:text-white/70"
          >
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
            Firm settings
          </button>
        )}
      </div>
    </footer>
  );
}
