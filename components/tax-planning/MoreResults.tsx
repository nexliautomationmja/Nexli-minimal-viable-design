'use client';

// ---------------------------------------------------------------------------
// Below the strategies: three more arguments, all in the page's one frame —
// the tax liability against the planning fee. No "with a plan" bill anywhere
// (Marcel, 2026-11-17); the strategy cards carry the savings.
//
//   CheapRoute  "the cheapest preparer is the most expensive mistake": what
//               each one charges, against the bill both of them are
//               looking at.
//   Quarterly   "we keep the IRS off your back": the four estimates the
//               liability implies, and a reasonable-compensation warning
//               when an S corp salary looks low.
//   Growth      revenue and the tax bill, last year → this year → next year
//               at the same pace.
// ---------------------------------------------------------------------------
import React from 'react';
import { AlertTriangle, ArrowRight, Check, X } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import { quarterlyEstimate, type Answers, type FullResult, type PlanResult } from '@/lib/tax-planning/engine';
import { money, round100 } from './format';

const CARD = 'rounded-2xl border border-white/10 p-5 sm:p-7';
const CARD_BG = { background: 'linear-gradient(160deg, rgba(16,28,51,0.85) 0%, rgba(10,16,32,0.85) 100%)' };

function CardHead({ kicker, title }: { kicker: string; title: React.ReactNode }) {
  return (
    <>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400 sm:text-xs">{kicker}</div>
      <div className="mt-2 text-[1.45rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[1.75rem]">{title}</div>
    </>
  );
}

function Point({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  const Icon = ok ? Check : X;
  return (
    <li className="flex gap-2 text-[13px] leading-snug text-white/70 sm:text-sm">
      <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${ok ? 'text-emerald-300' : 'text-rose-300'}`} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export function CheapRoute({
  result,
  prepFee,
  fee,
  feeIncludesReturn,
  firm,
}: {
  result: PlanResult;
  prepFee: number;
  fee: number;
  feeIncludesReturn: boolean;
  firm: string;
}) {
  const liability = round100(result.baseline.total);
  const firmCost = fee + (feeIncludesReturn ? 0 : prepFee);
  const extra = firmCost - prepFee;
  return (
    <div className={CARD} style={CARD_BG}>
      <CardHead kicker="The most expensive mistake" title="The cheapest preparer costs the most." />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.05] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-300">A cheap preparer</div>
          <div className="mt-1.5 text-2xl font-black tabular-nums text-white">{money(prepFee)}</div>
          <ul className="mt-3 space-y-1.5">
            <Point ok={false}>Files what you owe, after the year is over</Point>
            <Point ok={false}>Nobody looks for savings before December 31</Point>
            <Point ok={false}>Estimates are a guess, or skipped</Point>
          </ul>
        </div>
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">{firm}</div>
          <div className="mt-1.5 text-2xl font-black tabular-nums text-white">{money(firmCost)}</div>
          <ul className="mt-3 space-y-1.5">
            <Point ok>Plans the year while there’s still time to act</Point>
            <Point ok>Books kept clean every month</Point>
            <Point ok>Estimates paid on time, no penalties</Point>
          </ul>
        </div>
      </div>
      <div className="mt-4 text-[15px] leading-relaxed text-white/80 sm:text-base">
        {extra > 0 ? (
          <>
            Doing it right costs <span className="font-black text-amber-300">{money(extra)}</span> more than the cheap
            route. The bill it’s working on is <span className="font-black text-rose-300">{money(liability)}</span>.
          </>
        ) : (
          <>
            Both cost about the same. Only one of them is working on your{' '}
            <span className="font-black text-rose-300">{money(liability)}</span> bill.
          </>
        )}
      </div>
    </div>
  );
}

export function Quarterly({ result, year, firm }: { result: PlanResult; year: number; firm: string }) {
  const dates = [`Apr 15, ${year}`, `Jun 15, ${year}`, `Sep 15, ${year}`, `Jan 15, ${year + 1}`];
  const q = round100(quarterlyEstimate(result.baseline));
  return (
    <div className={CARD} style={CARD_BG}>
      <CardHead kicker="Keep the IRS off your back" title="Four payments. No surprises in April." />
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        {dates.map((d) => (
          <div key={d} className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-3.5 py-3">
            <div className="text-[11px] font-semibold text-cyan-200/80 sm:text-xs">{d}</div>
            <AnimatedNumber value={q} format={money} className="mt-0.5 block text-lg font-black text-white sm:text-xl" />
          </div>
        ))}
      </div>
      <div className="mt-4 text-[13px] leading-relaxed text-white/60 sm:text-sm">
        Estimated payments on this bill, before anything withheld from paychecks. Paying at least 90% of this year’s tax
        on time is one of the IRS’s safe harbors from underpayment penalties, and {firm} keeps your books current so
        these numbers are real, not guesses.
      </div>
      {result.flags.map((f) => (
        <div key={f.id} className="mt-4 flex gap-3 rounded-xl border border-rose-400/35 bg-rose-500/[0.08] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
          <div className="text-[13px] leading-relaxed text-rose-50/90 sm:text-sm">
            <span className="font-bold text-rose-200">A risk worth fixing. </span>
            {f.text}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Growth({ full, answers, year }: { full: FullResult; answers: Answers; year: number }) {
  const g = full.growth;
  const gPct = Math.round(Math.abs(g) * 100);
  const nextRevenue = answers.revenueThisYear * (1 + g);
  const thisBill = round100(full.thisYear.baseline.total);
  const nextBill = round100(full.nextYear.baseline.total);
  const bars = [
    ...(answers.taxLastYear > 0 ? [{ key: 'last', label: String(year - 1), sub: 'What you paid', value: round100(answers.taxLastYear), dashed: false }] : []),
    { key: 'this', label: String(year), sub: 'This year', value: thisBill, dashed: false },
    {
      key: 'next',
      label: String(year + 1),
      sub: g === 0 ? 'Same again' : `At ${g > 0 ? '+' : '−'}${gPct}% again`,
      value: nextBill,
      dashed: true,
    },
  ];
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className={CARD} style={CARD_BG}>
      <CardHead
        kicker="Your growth"
        title={
          answers.revenueLastYear <= 0
            ? 'As the business grows, so does the bill.'
            : g >= 0
              ? `Up ${gPct}% this year. The bill grows with you.`
              : `Down ${gPct}% this year. The bill is still there.`
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
        {[
          { label: `${year - 1} revenue`, value: answers.revenueLastYear },
          { label: `${year} revenue`, value: answers.revenueThisYear },
          { label: `${year + 1} at this pace`, value: nextRevenue },
        ].map((r, i) => (
          <React.Fragment key={r.label}>
            {i > 0 && <ArrowRight className="h-4 w-4 shrink-0 text-white/30" aria-hidden="true" />}
            <div className={`rounded-xl border px-3.5 py-2.5 ${i === 2 ? 'border-dashed border-white/20' : 'border-white/10 bg-white/[0.03]'}`}>
              <div className="text-[11px] text-white/50">{r.label}</div>
              <div className="text-base font-black tabular-nums text-white sm:text-lg">{money(r.value)}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-7 space-y-4">
        {bars.map((b) => (
          <div key={b.key} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[150px_1fr] sm:gap-5">
            <div>
              <div className="text-[15px] font-bold text-white sm:text-base">{b.label}</div>
              <div className="text-xs text-white/50">{b.sub}</div>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`h-10 rounded-r-[4px] transition-[width] duration-700 ease-out sm:h-11 ${b.dashed ? 'border border-dashed border-rose-300/60' : ''}`}
                style={{
                  width: `${(b.value / max) * 78}%`,
                  background: b.dashed ? 'rgba(244,63,94,0.14)' : b.key === 'last' ? 'rgba(251,113,133,0.45)' : 'linear-gradient(90deg, #e11d48, #fb7185)',
                }}
              />
              <span className="shrink-0 text-lg font-black tabular-nums text-white sm:text-xl">{money(b.value)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-[15px] leading-relaxed text-white/80 sm:text-base">
        Over these two years, about <span className="font-black text-rose-300">{money(thisBill + nextBill)}</span> goes to
        the IRS and your state{g > 0 ? ', and it rises with every year the business grows' : ''}.
      </div>
    </div>
  );
}
