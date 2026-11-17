'use client';

// ---------------------------------------------------------------------------
// The one-page leave-behind "Save as PDF" prints.
//
// It replaces the screen entirely under print (the interactive page is
// print:hidden), on white, so it reads on paper and costs no toner. Built
// from the same result object as the screen, so the two can't disagree.
//
// This is how a firm sends results after a call. The numbers never go into
// a link: Nexli's analytics record every page address (lib/tax-planning/
// firm.ts), and a PDF made in the browser goes nowhere but where the firm
// sends it.
//
// No <p> or <h*>: globals.css colours those for the dark theme, which would
// print white on white.
// ---------------------------------------------------------------------------
import React from 'react';
import { ASSUMPTIONS, quarterlyEstimate, type Answers, type FullResult } from '@/lib/tax-planning/engine';
import { CHECKED_ON } from '@/lib/tax-planning/rates';
import { stateInfo } from '@/lib/tax-planning/states';
import { money, round100 } from './format';

const ENTITY: Record<Answers['entity'], string> = {
  sole: 'Sole proprietor / single-member LLC',
  partnership: 'Partnership / multi-member LLC',
  scorp: 'S corporation',
  ccorp: 'C corporation',
};
const FILING: Record<Answers['filing'], string> = {
  single: 'Single',
  mfj: 'Married, filing jointly',
  hoh: 'Head of household',
};

export default function PrintSummary({
  firm,
  answers: a,
  full,
  year,
  fee,
  feeIncludesReturn,
}: {
  firm: string;
  answers: Answers;
  full: FullResult;
  year: number;
  fee: number;
  feeIncludesReturn: boolean;
}) {
  const r = full.thisYear;
  const b = r.baseline;
  const liability = round100(b.total);
  const saved = round100(r.savings);
  const share = liability > 0 ? fee / liability : 0;
  const shareText = share > 0 && share < 0.01 ? 'under 1%' : `${Math.round(share * 100)}%`;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const bill: [string, number][] = (
    [
      ['Federal income tax', b.federal],
      [b.viaPayroll > 0 ? 'Payroll tax on your salary' : 'Self-employment tax', b.employment + b.addlMedicare],
      ['State income tax', b.state],
      ['State entity tax', b.entity],
    ] as [string, number][]
  ).filter(([, v]) => round100(v) > 0);
  const growth = a.revenueLastYear > 0 ? a.revenueThisYear / a.revenueLastYear - 1 : null;

  const facts: [string, string][] = [
    ['Revenue last year', money(a.revenueLastYear)],
    ['Revenue this year', `${money(a.revenueThisYear)}${growth != null ? ` (${growth >= 0 ? '+' : '−'}${Math.round(Math.abs(growth) * 100)}%)` : ''}`],
    ['Your profit, before paying yourself', money(a.profit)],
    ['Business', `${ENTITY[a.entity]}${a.sstb ? ', professional services' : ''}`],
    ...(a.entity === 'scorp' ? ([['Your salary', money(a.salary)]] as [string, string][]) : []),
    ['Filing status', FILING[a.filing]],
    ['State', a.stateRate != null ? `${stateInfo(a.state).name} (${a.stateRate}%)` : stateInfo(a.state).name],
    ['Kids under 17', String(a.kids)],
  ];

  return (
    <div className="hidden bg-white text-[11px] leading-snug text-slate-800 print:block" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div className="flex items-end justify-between border-b-2 border-slate-900 pb-2">
        <div>
          <div className="text-[22px] font-extrabold leading-none tracking-tight text-slate-900">{firm}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
            Tax planning estimate · {year}
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          {a.preparedFor.trim() && (
            <div>
              Prepared for <span className="font-bold text-slate-900">{a.preparedFor.trim()}</span>
            </div>
          )}
          <div>{today}</div>
        </div>
      </div>

      {!r.supported ? (
        <div className="mt-6 text-[14px] text-slate-800">
          A C corporation needs {firm} to look at it directly. This estimate covers sole proprietors, LLCs, partnerships
          and S corps.
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Big label="Your tax liability" value={money(liability)} tone="text-rose-700" />
            <Big label={`Planning with ${firm}`} value={money(fee)} tone="text-amber-700" />
            <Big label="The fee, as a share of the bill" value={shareText} tone="text-slate-900" />
          </div>

          <div className="mt-3 rounded-md border border-amber-400 bg-amber-50 px-3 py-2 text-[12px] text-slate-900">
            Pay the IRS <b>{money(liability)}</b>, or pay {firm} <b>{money(fee)}</b>
            {feeIncludesReturn ? ', return included,' : ''} to plan it. {firm} works the bill down before it’s filed and
            keeps your books clean all year.
          </div>

          <div className="mt-4 grid grid-cols-[1fr_1.55fr] gap-5">
            <div>
              <Title>Your numbers</Title>
              <table className="w-full">
                <tbody>
                  {facts.map(([k, v]) => (
                    <tr key={k} className="border-b border-slate-200">
                      <td className="py-1 pr-2 text-slate-600">{k}</td>
                      <td className="py-1 text-right font-semibold text-slate-900">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Title className="mt-4">What makes up the bill</Title>
              <table className="w-full">
                <tbody>
                  {bill.map(([k, v]) => (
                    <tr key={k} className="border-b border-slate-200">
                      <td className="py-1 text-slate-600">{k}</td>
                      <td className="py-1 text-right font-semibold">{money(v)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-1 font-bold text-slate-900">Your tax liability</td>
                    <td className="py-1 text-right font-bold text-rose-700">{money(liability)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <Title>Where planning goes to work</Title>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-300 text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-1 font-semibold">Strategy</th>
                    <th className="py-1 font-semibold">Note</th>
                    <th className="py-1 text-right font-semibold">Effect</th>
                  </tr>
                </thead>
                <tbody>
                  {r.steps.map((s) => (
                    <tr key={s.id} className="border-b border-slate-200 align-top">
                      <td className="py-1 pr-2 font-semibold text-slate-900">
                        {s.title}
                        {s.kind === 'defers' && <span className="ml-1 text-[9px] font-bold uppercase text-violet-700">Defers</span>}
                      </td>
                      <td className="py-1 pr-2 text-[10px] text-slate-600">
                        {s.status === 'off'
                          ? 'Not included'
                          : s.status === 'skipped'
                            ? s.reason
                            : (s.detail ?? (s.kind === 'defers' ? 'Deferred: taxed when the money comes out.' : ''))}
                      </td>
                      <td className="py-1 text-right font-semibold text-slate-900">
                        {s.status === 'applied' ? money(s.savings) : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-1 font-bold text-slate-900" colSpan={2}>
                      Together
                    </td>
                    <td className="py-1 text-right font-bold text-emerald-700">{money(saved)}</td>
                  </tr>
                </tbody>
              </table>

              <Title className="mt-4">Quarterly estimated payments</Title>
              <div className="grid grid-cols-4 gap-2">
                {[`Apr 15, ${year}`, `Jun 15, ${year}`, `Sep 15, ${year}`, `Jan 15, ${year + 1}`].map((d) => (
                  <div key={d} className="rounded border border-slate-200 px-2 py-1">
                    <div className="text-[9px] text-slate-500">{d}</div>
                    <div className="font-bold text-slate-900">{money(quarterlyEstimate(b))}</div>
                  </div>
                ))}
              </div>
              <div className="mt-1 text-[9.5px] text-slate-500">Before anything withheld from paychecks.</div>

              {full.nextYear.supported && (
                <div className="mt-3 text-[11px] text-slate-700">
                  <b>{year + 1}</b>, growing at the same pace: a tax liability of about{' '}
                  {money(full.nextYear.baseline.total)}.
                </div>
              )}
              {r.flags.map((f) => (
                <div key={f.id} className="mt-2 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[10px] text-rose-900">
                  <b>A risk worth fixing.</b> {f.text}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-4 border-t border-slate-300 pt-2 text-[9px] leading-relaxed text-slate-500">
        <b className="text-slate-700">Assumes:</b> {ASSUMPTIONS.join(' ')} An estimate for illustration, not tax advice
        and not a promise of any result. {year} federal figures, checked {CHECKED_ON}. {firm} confirms every number before
        anything is filed.
        <span className="float-right font-semibold text-slate-400">Powered by Nexli</span>
      </div>
    </div>
  );
}

function Big({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-md border border-slate-200 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-[24px] font-black leading-tight tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}

function Title({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-700 ${className}`}>{children}</div>
  );
}
