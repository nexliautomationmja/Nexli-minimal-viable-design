'use client';

// ---------------------------------------------------------------------------
// The Tax Planning Tool: questions on the left, the tax liability against
// the planning fee on the right, every strategy worked out below.
//
// Built to be screen-shared on a sales call (desktop: the numbers stay in
// view and move as the answers change) and to be filled in alone on a phone
// (a bar at the bottom carries the bill and the fee until the results scroll
// in).
//
// WHERE THINGS LIVE
//   The firm's settings: the URL (lib/tax-planning/firm.ts), written with
//     history.replaceState as the firm edits them.
//   The prospect's answers: this browser only (localStorage), never the
//     URL, never a server. They leave as the PDF the firm sends.
//   The arithmetic: lib/tax-planning/engine.ts.
// ---------------------------------------------------------------------------
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ArrowDown, CalendarCheck, ChevronDown, Printer, RotateCcw } from 'lucide-react';
import { OUTFIT, RimCard } from '@/components/funnel/primitives';
import { GRADIENT_TEXT, HEADING, Kicker, MUTED } from '@/components/math/ui';
import { MoneyField, QuestionPanel, Segmented, Select, Stepper, Field, INPUT } from '@/components/tax-planning/fields';
import FirmSetup from '@/components/tax-planning/FirmSetup';
import Summary from '@/components/tax-planning/Summary';
import StrategyList from '@/components/tax-planning/StrategyList';
import { CheapRoute, Growth, Quarterly } from '@/components/tax-planning/MoreResults';
import ToolFooter from '@/components/tax-planning/ToolFooter';
import PrintSummary from '@/components/tax-planning/PrintSummary';
import { firmName, money, round100 } from '@/components/tax-planning/format';
import { SAMPLE, run, sanitizeAnswers, type Answers, type Entity } from '@/lib/tax-planning/engine';
import { ratesFor } from '@/lib/tax-planning/rates';
import { STATES, isStateCode, stateInfo } from '@/lib/tax-planning/states';
import { TOOL_PATH, firmQuery, type FirmConfig } from '@/lib/tax-planning/firm';

const STORAGE_KEY = 'nexli-tax-tool:v1';

const PRINT_CSS = `
@media print {
  @page { size: letter; margin: 0.45in; }
  html, body, body > div { background: #fff !important; }
}`;

const ENTITY_OPTIONS: { value: Entity; label: string }[] = [
  { value: 'sole', label: 'Sole prop / LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'scorp', label: 'S corp' },
  { value: 'ccorp', label: 'C corp' },
];

const STATE_OPTIONS = STATES.map((s) => ({ value: s.code, label: s.name }));

export default function TaxTool({
  initialFirm,
  setup,
  year,
}: {
  initialFirm: FirmConfig;
  /** No firm in the link: show "Make it yours" at the top. */
  setup: boolean;
  /** The tax year "this year" means, fixed on the server. */
  year: number;
}) {
  const [firm, setFirm] = useState(initialFirm);
  const [showSetup, setShowSetup] = useState(setup);
  const [answers, setAnswers] = useState<Answers>(SAMPLE);
  const [touched, setTouched] = useState(false);
  const loaded = useRef(false);
  const firmEdited = useRef(false);

  // Restore a returning visitor's answers. After mount, so the server's HTML
  // (the sample) and the first client render agree.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { answers?: unknown; touched?: unknown };
        setAnswers(sanitizeAnswers(saved.answers, isStateCode));
        setTouched(saved.touched === true);
      }
    } catch {
      // Private mode, blocked storage, a corrupt save: start from the sample.
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, touched }));
    } catch {
      // Not saved; the page still works.
    }
  }, [answers, touched]);

  const set = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setTouched(true);
  }, []);

  const startOver = () => {
    setAnswers(SAMPLE);
    setTouched(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing saved */
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFirm = (f: FirmConfig) => {
    firmEdited.current = true;
    setFirm(f);
  };

  // The firm's settings ride in the URL, so "Copy your link" and a reload
  // both carry them. replaceState: no history entry per keystroke.
  useEffect(() => {
    if (!firmEdited.current) return;
    window.history.replaceState(window.history.state, '', `${TOOL_PATH}?${firmQuery(firm)}`);
  }, [firm]);

  const name = firmName(firm.name);
  useEffect(() => {
    document.title = firm.name.trim() ? `${firm.name.trim()} · Tax Planning Estimate` : 'Tax Planning Tool';
  }, [firm.name]);

  const full = useMemo(
    () => run(answers, year, { salaryPct: firm.salaryPct, firmOff: firm.off }),
    [answers, year, firm.salaryPct, firm.off],
  );
  const r = full.thisYear;
  const rates = ratesFor(year);
  const growth = answers.revenueLastYear > 0 ? answers.revenueThisYear / answers.revenueLastYear - 1 : null;
  const margin = answers.revenueThisYear > 0 ? answers.profit / answers.revenueThisYear : null;
  const liability = round100(r.baseline.total);

  return (
    <MotionConfig reducedMotion="user">
      <style>{PRINT_CSS}</style>
      <main
        className="relative min-h-screen overflow-x-clip text-white print:hidden"
        style={{ backgroundColor: '#020617', ...OUTFIT }}
      >
        {/* /math's three glows. */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)' }} />
          <div className="absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 right-1/4 h-[480px] w-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-16">
          {/* The firm's name is the brand here; Nexli is a footnote. */}
          <header className="mb-8 flex items-center justify-between gap-3 sm:mb-10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-blue-500/25">
                {initials(name)}
              </span>
              <span className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">{name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-[13px] font-semibold text-white/80 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white sm:px-4 sm:text-sm"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Save as PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button
                type="button"
                onClick={startOver}
                aria-label="Start over"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white/60 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white sm:px-4"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Start over</span>
              </button>
            </div>
          </header>

          {showSetup && (
            <FirmSetup firm={firm} onChange={updateFirm} onClose={setup ? undefined : () => setShowSetup(false)} />
          )}

          <div className="max-w-4xl">
            <Kicker>Tax planning estimate · {year}</Kicker>
            <h1 className="mt-3 text-pretty text-[2.1rem] sm:text-5xl lg:text-[3.4rem]" style={HEADING}>
              What you’ll pay the IRS, <span className={GRADIENT_TEXT}>and what planning costs.</span>
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed sm:text-lg" style={{ color: MUTED }}>
              Answer a few questions about your business. You’ll see your estimated tax bill next to what planning
              with {name} costs, and where planning goes to work.
            </p>
            {!touched && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/[0.08] px-3.5 py-1.5 text-[13px] font-semibold text-amber-100">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden="true" />
                Sample numbers. Replace them with yours.
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-start lg:gap-8">
            <div className="space-y-4">
              {/* Just what moves the bill most. Everything else waits in
                  "More detail" with a neutral default, and the line under
                  that heading says what's being assumed. */}
              <QuestionPanel title="Just the basics" sub="Rough numbers are fine. The estimate updates as you type.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <MoneyField label="Revenue last year" value={answers.revenueLastYear} onChange={(v) => set('revenueLastYear', v)} />
                  <MoneyField
                    label="Revenue this year"
                    value={answers.revenueThisYear}
                    onChange={(v) => set('revenueThisYear', v)}
                    aside={growth != null && Number.isFinite(growth) ? <GrowthChip g={growth} /> : undefined}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <MoneyField
                    label="Your profit this year"
                    value={answers.profit}
                    onChange={(v) => set('profit', v)}
                    hint={`Your share, before paying yourself.${margin != null && margin > 0 && margin <= 1 ? ` A ${Math.round(margin * 100)}% margin.` : ''}`}
                  />
                  <Select
                    label="State"
                    value={answers.state}
                    onChange={(v) => set('state', v)}
                    options={STATE_OPTIONS}
                    hint={stateInfo(answers.state).brackets.length === 0 ? 'No state tax on wages or business income.' : undefined}
                  />
                </div>
                <Segmented
                  label="How the business is set up"
                  value={answers.entity}
                  options={ENTITY_OPTIONS}
                  onChange={(v) => set('entity', v)}
                  cols="grid-cols-2 sm:grid-cols-4"
                />
                {answers.entity === 'scorp' && (
                  <MoneyField
                    label="Your salary from the S corp"
                    value={answers.salary}
                    onChange={(v) => set('salary', Math.min(v, answers.profit))}
                    hint="What runs through payroll to you each year."
                  />
                )}
                <Segmented
                  label="Filing status"
                  value={answers.filing}
                  options={[
                    { value: 'single', label: 'Single' },
                    { value: 'mfj', label: 'Married' },
                    { value: 'hoh', label: 'Head of household' },
                  ]}
                  onChange={(v) => set('filing', v)}
                  cols="grid-cols-3"
                />
              </QuestionPanel>

              <MoreDetail summary={assumptionLine(answers)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Segmented
                    label="Professional services?"
                    value={answers.sstb ? 'yes' : 'no'}
                    options={[
                      { value: 'no', label: 'No' },
                      { value: 'yes', label: 'Yes' },
                    ]}
                    onChange={(v) => set('sstb', v === 'yes')}
                    hint="Medicine, law, accounting, consulting, financial services, performing arts or sports."
                  />
                  <MoneyField
                    label="Payroll to employees"
                    value={answers.payroll}
                    onChange={(v) => set('payroll', v)}
                    hint="A year, not counting you."
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <MoneyField
                    label="Your wages from a job"
                    value={answers.otherWages}
                    onChange={(v) => set('otherWages', v)}
                    hint="W-2 pay from an employer you don’t own."
                  />
                  {answers.filing === 'mfj' ? (
                    <MoneyField label="Spouse’s income" value={answers.spouseIncome} onChange={(v) => set('spouseIncome', v)} />
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Stepper label="Kids under 17" value={answers.kids} max={10} onChange={(v) => set('kids', v)} />
                  <MoneyField
                    label="Already into retirement"
                    value={answers.retirementNow}
                    onChange={(v) => set('retirementNow', v)}
                    hint="A year, all accounts."
                  />
                </div>
                <Segmented
                  label="Your age"
                  value={answers.age}
                  options={[
                    { value: 'under50', label: 'Under 50' },
                    { value: '50to59', label: '50–59' },
                    { value: '60to63', label: '60–63' },
                    { value: '64plus', label: '64+' },
                  ]}
                  onChange={(v) => set('age', v)}
                  cols="grid-cols-4"
                  hint="Over 50, you can put more into retirement."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <MoneyField
                    label="Tax prep fee today"
                    value={answers.prepFee}
                    onChange={(v) => set('prepFee', v)}
                    hint="What you pay to have the return done."
                  />
                  <MoneyField
                    label="Total tax you paid last year"
                    value={answers.taxLastYear}
                    onChange={(v) => set('taxLastYear', v)}
                    hint="Shows how fast the bill is growing."
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <RateField value={answers.stateRate} onChange={(v) => set('stateRate', v)} />
                  <PreparedFor value={answers.preparedFor} onChange={(v) => set('preparedFor', v)} />
                </div>
              </MoreDetail>
            </div>

            <div id="results" className="scroll-mt-6 lg:sticky lg:top-6">
              <Summary result={r} firm={name} fee={firm.fee} feeIncludesReturn={firm.feeIncludesReturn} />
            </div>
          </div>

          {r.supported && (
            <>
              <section className="mt-14 sm:mt-20">
                <Kicker>Where planning goes to work</Kicker>
                <h2 className="mt-3 max-w-4xl text-pretty text-[1.85rem] sm:text-4xl lg:text-[2.6rem]" style={HEADING}>
                  {r.steps.length} {r.steps.length === 1 ? 'strategy' : 'strategies'},{' '}
                  <span className={GRADIENT_TEXT}>worked out on your numbers.</span>
                </h2>
                <p className="mb-7 mt-3 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: MUTED }}>
                  What {name} looks at first, and what each could take off your {money(r.baseline.total)} bill. Each is
                  worked out on top of the last, so the amounts add up. Switch any off to see what it’s worth.
                </p>
                <StrategyList
                  result={r}
                  answers={answers}
                  set={set}
                  rates={rates}
                  salaryPct={firm.salaryPct}
                  firm={name}
                />
              </section>

              <div className="mt-6 grid gap-4 sm:gap-5 lg:grid-cols-2">
                <CheapRoute
                  result={r}
                  prepFee={answers.prepFee}
                  fee={firm.fee}
                  feeIncludesReturn={firm.feeIncludesReturn}
                  firm={name}
                />
                <Quarterly result={r} year={year} firm={name} />
              </div>

              <div className="mt-4 sm:mt-5">
                <Growth full={full} answers={answers} year={year} />
              </div>
            </>
          )}

          <RimCard className="mt-14" innerClassName="px-5 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[1.6rem] font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                  {r.supported && liability > 0 ? (
                    <>
                      Before you pay the IRS <span className="text-rose-300">{money(liability)}</span>, plan it.
                    </>
                  ) : (
                    'Get the real numbers.'
                  )}
                </div>
                <div className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/65">
                  This is an estimate. A planning call with {name} turns it into a plan, with your actual return in
                  hand and the books kept clean all year.
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                {firm.bookUrl ? (
                  <a
                    href={firm.bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-7 py-3.5 text-[15px] font-bold text-white no-underline shadow-xl shadow-blue-500/25 transition-[filter] hover:brightness-110"
                  >
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                    Book your planning call
                  </a>
                ) : (
                  showSetup && (
                    <div className="max-w-xs text-sm text-white/45">
                      Add your booking link above and a “Book your planning call” button appears here.
                    </div>
                  )
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-[15px] font-semibold text-white/85 transition-colors hover:border-white/30 hover:text-white"
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  Save as PDF
                </button>
              </div>
            </div>
          </RimCard>

          <ToolFooter
            firm={name}
            year={r.year}
            onSettings={
              showSetup
                ? undefined
                : () => {
                    setShowSetup(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
            }
          />
        </div>

        {r.supported && liability > 0 && <PhoneBar liability={liability} fee={firm.fee} />}
      </main>

      <PrintSummary
        firm={name}
        answers={answers}
        full={full}
        year={year}
        fee={firm.fee}
        feeIncludesReturn={firm.feeIncludesReturn}
      />
    </MotionConfig>
  );
}

function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  return (words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? 'Y').slice(0, 2)).toUpperCase();
}

function GrowthChip({ g }: { g: number }) {
  const up = g >= 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
        up ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'
      }`}
    >
      {up ? '+' : '−'}
      {Math.round(Math.abs(g) * 100)}%
    </span>
  );
}

/** An optional flat state rate, for anyone folding in city or county tax. */
function RateField({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const [text, setText] = useState(value == null ? '' : String(value));
  // Follow outside changes (Start over), but never fight the typing: "5."
  // and "." are mid-entry, not something to overwrite.
  useEffect(() => {
    setText((t) => {
      const n = parseFloat(t);
      if (value == null) return Number.isFinite(n) ? '' : t;
      return n === value ? t : String(value);
    });
  }, [value]);
  return (
    <Field label="Your own rate" hint="Optional. Overrides the state’s brackets.">
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          placeholder="Auto"
          aria-label="Your own state tax rate, percent"
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d.]/g, '').slice(0, 5);
            setText(t);
            const n = parseFloat(t);
            onChange(t === '' || !Number.isFinite(n) ? null : Math.min(20, n));
          }}
          className={`${INPUT} pl-3.5 pr-8`}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40">%</span>
      </div>
    </Field>
  );
}

const AGE_TEXT: Record<Answers['age'], string> = {
  under50: 'under 50',
  '50to59': 'aged 50–59',
  '60to63': 'aged 60–63',
  '64plus': '64 or older',
};

/** What "More detail" is assuming while it's closed, in one line. */
function assumptionLine(a: Answers): string {
  const other = a.otherWages + (a.filing === 'mfj' ? a.spouseIncome : 0);
  return [
    a.sstb ? 'a professional service business' : 'not a professional service business',
    a.payroll > 0 ? `${money(a.payroll)} of payroll` : 'no employees',
    other > 0 ? `${money(other)} of other income` : 'no other income',
    a.kids > 0 ? `${a.kids} ${a.kids === 1 ? 'kid' : 'kids'} under 17` : 'no kids under 17',
    AGE_TEXT[a.age],
    a.retirementNow > 0 ? `${money(a.retirementNow)} a year into retirement` : 'nothing into retirement yet',
    `a ${money(a.prepFee)} prep fee today`,
  ].join(', ');
}

/**
 * The optional questions, closed by default. Closed, it still says what it
 * is assuming, so a default nobody saw can't quietly skew the number.
 */
function MoreDetail({ summary, children }: { summary: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section
      className="rounded-2xl border border-white/10"
      style={{ background: 'linear-gradient(160deg, rgba(16,28,51,0.6) 0%, rgba(10,16,32,0.6) 100%)' }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">More detail</span>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
              Optional
            </span>
          </span>
          {!open && (
            <span className="mt-1 block text-[13px] leading-snug text-white/50 sm:text-sm">
              Assuming {summary}.
            </span>
          )}
        </span>
        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={id} className="space-y-5 border-t border-white/10 px-4 pb-6 pt-5 sm:px-6">
          {children}
        </div>
      )}
    </section>
  );
}

function PreparedFor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Prepared for" hint="A name for the PDF. It isn’t sent anywhere.">
      <input
        type="text"
        value={value}
        maxLength={80}
        placeholder="Business or client name"
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT} px-3.5 text-[15px] font-semibold`}
      />
    </Field>
  );
}

/**
 * Phones: the headline rides along at the bottom while the questions fill
 * the screen, and steps aside once the results themselves are in view.
 */
function PhoneBar({ liability, fee }: { liability: number; fee: number }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const el = document.getElementById('results');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting || e.boundingClientRect.top < 0), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-[#020617]/90 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 lg:hidden ${
        hidden ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Your tax bill</div>
          <div className="text-xl font-black tabular-nums leading-tight text-rose-300">
            ≈ {money(liability)}{' '}
            <span className="text-sm font-semibold text-white/50">
              vs <span className="text-amber-300">{money(fee)}</span> to plan it
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25"
        >
          See results
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
