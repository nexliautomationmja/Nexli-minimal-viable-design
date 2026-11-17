'use client';

// ---------------------------------------------------------------------------
// "Make it yours": what a firm sets once to get its own link.
//
// Everything here ends up in the URL (lib/tax-planning/firm.ts), so it is
// limited to the firm's own settings: never a prospect's numbers.
// ---------------------------------------------------------------------------
import React, { useEffect, useId, useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';
import { RimCard } from '@/components/funnel/primitives';
import { STRATEGY_IDS, type StrategyId } from '@/lib/tax-planning/engine';
import {
  FIRM_NAME_MAX,
  SALARY_PCT_MAX,
  SALARY_PCT_MIN,
  TOOL_PATH,
  cleanUrl,
  firmQuery,
  type FirmConfig,
} from '@/lib/tax-planning/firm';
import { Field, INPUT, MoneyField, Stepper, Switch } from './fields';
import { STRATEGY_SHORT } from './format';

export default function FirmSetup({
  firm,
  onChange,
  onClose,
}: {
  firm: FirmConfig;
  onChange: (f: FirmConfig) => void;
  /** Prospect view only: the firm opened settings from the footer. */
  onClose?: () => void;
}) {
  const nameId = useId();
  const bookId = useId();
  // The booking link as typed; the config only ever holds a cleaned URL.
  const [bookRaw, setBookRaw] = useState(firm.bookUrl ?? '');
  const bookBad = bookRaw.trim() !== '' && cleanUrl(bookRaw) === null;
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (patch: Partial<FirmConfig>) => onChange({ ...firm, ...patch });
  const hasName = firm.name.trim() !== '';

  useEffect(() => {
    setLink(`${window.location.origin}${TOOL_PATH}?${firmQuery(firm)}`);
  }, [firm]);

  const toggle = (id: StrategyId) =>
    set({ off: firm.off.includes(id) ? firm.off.filter((x) => x !== id) : [...firm.off, id] });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // No clipboard (an old browser, an iframe): the link is selectable below.
      (document.getElementById(`${nameId}-link`) as HTMLInputElement | null)?.select();
    }
  };

  return (
    <RimCard className="mb-10" innerClassName="px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400 sm:text-xs">
            For firms · Make it yours
          </div>
          <div className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
            Put your name and your fee on it.
          </div>
          <div className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-[15px]">
            Fill this in once and copy your link. Share your screen with it on a sales call, or send it to a
            prospect to fill in. Their numbers stay in their browser; the link only carries what you set here.
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 hover:border-white/30 hover:text-white"
          >
            Done
          </button>
        )}
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Your firm's name" htmlFor={nameId} className="sm:col-span-2">
          <input
            id={nameId}
            type="text"
            value={firm.name}
            maxLength={FIRM_NAME_MAX}
            placeholder="e.g. Smith & Co. CPAs"
            onChange={(e) => set({ name: e.target.value })}
            className={`${INPUT} px-3.5`}
          />
        </Field>
        <MoneyField
          label="Planning fee, a year"
          value={firm.fee}
          onChange={(fee) => set({ fee })}
          max={1_000_000}
        />
        <Field label="Fee includes the return">
          <div className="flex h-[46px] items-center gap-3">
            <Switch
              checked={firm.feeIncludesReturn}
              onChange={(feeIncludesReturn) => set({ feeIncludesReturn })}
              label="Fee includes the tax return"
            />
            <span className="text-sm text-white/65">{firm.feeIncludesReturn ? 'Yes, all in' : 'No, billed on top'}</span>
          </div>
        </Field>
        <Field
          label="Booking link (optional)"
          htmlFor={bookId}
          className="sm:col-span-2"
          hint={
            bookBad ? (
              <span className="text-rose-300">That doesn’t look like a web address.</span>
            ) : (
              'Adds a “Book your planning call” button for prospects.'
            )
          }
        >
          <input
            id={bookId}
            type="url"
            inputMode="url"
            value={bookRaw}
            placeholder="calendly.com/your-firm"
            onChange={(e) => {
              setBookRaw(e.target.value);
              set({ bookUrl: cleanUrl(e.target.value) });
            }}
            className={`${INPUT} px-3.5 text-[15px] font-semibold`}
          />
        </Field>
        <Stepper
          label="S corp salary, % of profit"
          value={firm.salaryPct}
          min={SALARY_PCT_MIN}
          max={SALARY_PCT_MAX}
          onChange={(salaryPct) => set({ salaryPct })}
          hint="Your reasonable-compensation assumption."
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="mt-6">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 sm:text-[11px]">
          Strategies you offer
        </div>
        <div className="flex flex-wrap gap-2">
          {STRATEGY_IDS.map((id) => {
            const on = !firm.off.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  on
                    ? 'border-cyan-400/50 bg-cyan-400/[0.1] text-cyan-100'
                    : 'border-white/10 bg-white/[0.03] text-white/40 line-through decoration-white/30'
                }`}
              >
                {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {STRATEGY_SHORT[id]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
          <input
            id={`${nameId}-link`}
            readOnly
            value={link}
            aria-label="Your link"
            onFocus={(e) => e.target.select()}
            className={`${INPUT} truncate pl-10 pr-3 text-[13px] font-medium text-white/70 sm:text-sm`}
          />
        </div>
        <button
          type="button"
          onClick={copy}
          disabled={!hasName}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? 'Copied' : hasName ? 'Copy your link' : 'Add your name first'}
        </button>
      </div>
    </RimCard>
  );
}
