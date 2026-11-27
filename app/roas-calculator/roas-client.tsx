'use client';

// ---------------------------------------------------------------------------
// The ROAS Calculator: budget and offer, then a best / average / worst grid
// that edits like a spreadsheet, and every result moving as you type.
//
// WHERE THINGS LIVE
//   The arithmetic and the benchmark numbers: lib/roas-calc.ts. It is a copy
//     of the spreadsheet and follows it, not Nexli's own benchmarks.
//   The visitor's numbers: this browser (localStorage), one set per model,
//     so flipping B2C ↔ B2B never loses what they typed.
//   The opt-in: /api/forms/roas-calc, with the numbers they were looking at.
//
// The calculator is open to everyone. The opt-in emails the breakdown; it
// does not gate the numbers. A tool that hides its answer behind a form is a
// form, and nobody shares a form.
// ---------------------------------------------------------------------------
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  RotateCcw,
  User,
} from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import { OUTFIT, RimCard } from '@/components/funnel/primitives';
import { GRADIENT_TEXT, HEADING, Kicker, MUTED } from '@/components/math/ui';
import { Field, INPUT, QuestionPanel } from '@/components/tax-planning/fields';
import { trackLeadEvent } from '@/lib/meta-events';
import {
  BENCHMARKS,
  DEFAULTS,
  MODEL_LABEL,
  SCENARIOS,
  breakEvenSales,
  run,
  sanitize,
  type CalcInputs,
  type Grid,
  type Model,
  type ScenarioInputs,
  type ScenarioKey,
  type ScenarioResult,
} from '@/lib/roas-calc';

const STORAGE_KEY = 'nexli-roas-calc:v1';
const CTA_HREF = '/agency';

// ── Formatting ──────────────────────────────────────────────────────────────

const usd0 = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const usd2 = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
/** Whole numbers the way the sheet's #,##0 shows them. */
const count = (n: number) => Math.round(n).toLocaleString('en-US');
const roasText = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Money that may carry cents (a $1.50 CPL), shown without ".00" noise. */
const moneyCell = (n: number) =>
  Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const sameGrid = (a: Grid, b: Grid) =>
  SCENARIOS.every(({ key }) =>
    (['cpl', 'cpbc', 'show', 'close'] as const).every((f) => a[key][f] === b[key][f]),
  );

// ── Inputs ──────────────────────────────────────────────────────────────────

/**
 * A number typed as text, so "1." on the way to "1.5" survives, and
 * reformatted with commas when the field loses focus. `kind` sets the
 * adornment: $ before, % after.
 */
function NumberInput({
  value,
  onChange,
  kind,
  max,
  id,
  ariaLabel,
  compact = false,
}: {
  value: number;
  onChange: (n: number) => void;
  kind: 'money' | 'percent';
  max: number;
  id?: string;
  ariaLabel?: string;
  compact?: boolean;
}) {
  const show = useCallback((n: number) => (kind === 'money' ? moneyCell(n) : String(n)), [kind]);
  const [text, setText] = useState(show(value));
  const focused = useRef(false);

  // Follow changes made elsewhere (a benchmark loaded, Start over), never
  // while the visitor is mid-keystroke in this field.
  useEffect(() => {
    if (!focused.current) setText(show(value));
  }, [value, show]);

  return (
    <div className="relative">
      {kind === 'money' && (
        <span
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 font-bold text-white/40 ${
            compact ? 'left-2.5 text-xs' : 'left-3.5 text-sm'
          }`}
        >
          $
        </span>
      )}
      <input
        id={id}
        aria-label={ariaLabel}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        onFocus={(e) => {
          focused.current = true;
          e.target.select();
        }}
        onBlur={() => {
          focused.current = false;
          setText(show(value));
        }}
        onChange={(e) => {
          const t = e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 12);
          setText(t);
          const n = parseFloat(t);
          onChange(t === '' || !Number.isFinite(n) ? 0 : Math.min(max, n));
        }}
        className={`${INPUT} ${
          compact
            ? `rounded-lg py-2 text-[15px] sm:text-base ${kind === 'money' ? 'pl-6 pr-2' : 'pl-2.5 pr-6'}`
            : kind === 'money'
              ? 'pl-7 pr-3'
              : 'pl-3.5 pr-8'
        }`}
      />
      {kind === 'percent' && (
        <span
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 font-bold text-white/40 ${
            compact ? 'right-2.5 text-xs' : 'right-3.5 text-sm'
          }`}
        >
          %
        </span>
      )}
    </div>
  );
}

const GRID_ROWS: readonly {
  field: keyof ScenarioInputs;
  label: string;
  short: string;
  /** The row label on a phone, where the grid has no room for the full one. */
  mobile: string;
  kind: 'money' | 'percent';
  max: number;
  hint: string;
}[] = [
  { field: 'cpl', label: 'Cost per lead', short: 'CPL', mobile: 'CPL', kind: 'money', max: 1_000_000, hint: 'Ad spend ÷ leads' },
  { field: 'cpbc', label: 'Cost per booked call', short: 'CPBC', mobile: 'CPBC', kind: 'money', max: 1_000_000, hint: 'Ad spend ÷ calls booked' },
  { field: 'show', label: 'Show-up rate', short: 'Show', mobile: 'Show-up', kind: 'percent', max: 100, hint: 'Booked calls that happen' },
  { field: 'close', label: 'Close rate', short: 'Close', mobile: 'Close rate', kind: 'percent', max: 100, hint: 'Showed calls that buy' },
];

const SCENARIO_TONE: Record<ScenarioKey, { dot: string; text: string; ring: string; bar: string }> = {
  best: { dot: 'bg-emerald-400', text: 'text-emerald-300', ring: 'border-emerald-400/25', bar: 'from-emerald-400 to-cyan-400' },
  average: { dot: 'bg-cyan-400', text: 'text-cyan-300', ring: 'border-cyan-400/30', bar: 'from-blue-500 to-cyan-400' },
  worst: { dot: 'bg-amber-400', text: 'text-amber-200', ring: 'border-amber-300/25', bar: 'from-amber-400 to-rose-400' },
};

/** The sheet's rows 6–10, as an editable grid. */
function ScenarioGrid({ grid, onChange }: { grid: Grid; onChange: (k: ScenarioKey, f: keyof ScenarioInputs, v: number) => void }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[340px] border-separate border-spacing-x-1.5 border-spacing-y-2 sm:border-spacing-x-2">
        <thead>
          <tr>
            <th className="w-[34%] text-left text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 sm:text-[11px]">
              <span className="sr-only">Metric</span>
            </th>
            {SCENARIOS.map(({ key }) => (
              <th key={key} scope="col" className="pb-0.5 text-left">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 sm:text-[11px]">
                  <span className={`h-1.5 w-1.5 rounded-full ${SCENARIO_TONE[key].dot}`} aria-hidden="true" />
                  {key === 'average' ? (
                    <>
                      <span className="sm:hidden">Avg</span>
                      <span className="hidden sm:inline">Average</span>
                    </>
                  ) : key === 'best' ? (
                    'Best'
                  ) : (
                    'Worst'
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GRID_ROWS.map((row) => (
            <tr key={row.field}>
              <th scope="row" className="pr-1 text-left align-middle">
                <div className="text-[13px] font-bold leading-tight text-white sm:text-sm">
                  <span className="sm:hidden">{row.mobile}</span>
                  <span className="hidden sm:inline">{row.label}</span>
                </div>
                <div className="mt-0.5 hidden text-[11px] font-medium leading-tight text-white/40 sm:block">{row.hint}</div>
              </th>
              {SCENARIOS.map(({ key, label }) => (
                <td key={key}>
                  <NumberInput
                    compact
                    kind={row.kind}
                    max={row.max}
                    value={grid[key][row.field]}
                    onChange={(v) => onChange(key, row.field, v)}
                    ariaLabel={`${row.label}, ${label.toLowerCase()}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Results ─────────────────────────────────────────────────────────────────

function FunnelStep({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <>
      <div className="min-w-0 text-center">
        <div className="text-[15px] font-extrabold tabular-nums leading-none text-white sm:text-lg">{value}</div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</div>
      </div>
      {!last && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" aria-hidden="true" />}
    </>
  );
}

function ScenarioCard({
  scenario,
  label,
  r,
  maxRoas,
  featured,
}: {
  scenario: ScenarioKey;
  label: string;
  r: ScenarioResult;
  maxRoas: number;
  featured: boolean;
}) {
  const tone = SCENARIO_TONE[scenario];
  const losing = r.roas < 1;
  const width = maxRoas > 0 ? Math.max(2, (r.roas / maxRoas) * 100) : 2;
  return (
    <div
      className={`rounded-2xl border bg-white/[0.03] p-4 sm:p-5 ${featured ? `${tone.ring} bg-white/[0.05]` : 'border-white/10'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
            {label}
          </div>
          <div className="mt-1 text-[13px] font-semibold text-white/55">
            <span className="tabular-nums text-white/85">{usd0(r.revenue)}</span> revenue
          </div>
        </div>
        <div className="text-right">
          <div className={`text-[2rem] font-black tabular-nums leading-none tracking-tight sm:text-[2.4rem] ${losing ? 'text-rose-300' : tone.text}`}>
            {roasText(r.roas)}
            <span className="ml-0.5 text-lg font-extrabold sm:text-xl">x</span>
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">ROAS</div>
        </div>
      </div>

      {/* ROAS against the best of the three, so the spread reads at a glance. */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${losing ? 'from-rose-500 to-rose-400' : tone.bar}`}
          initial={false}
          animate={{ width: `${width}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 26 }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-1">
        <FunnelStep label="Leads" value={count(r.leads)} />
        <FunnelStep label="Calls" value={count(r.calls)} />
        <FunnelStep label="Showed" value={count(r.showed)} />
        <FunnelStep label="Sales" value={count(r.sales)} last />
      </div>
    </div>
  );
}

/** The sheet's Performance Metrics block (rows 15–18), as it lays it out. */
function MetricsTable({ results }: { results: Record<ScenarioKey, ScenarioResult> }) {
  const head = ['Scenario', 'Leads', 'Calls', 'Showed calls', 'Sales', 'Revenue', 'ROAS'];
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-white/10">
            {head.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 sm:text-[11px] ${i > 0 ? 'text-right' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SCENARIOS.map(({ key, label }) => {
            const r = results[key];
            return (
              <tr key={key} className="border-b border-white/[0.06] last:border-0">
                <th scope="row" className="px-4 py-3 text-sm font-bold text-white">
                  <span className="inline-flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${SCENARIO_TONE[key].dot}`} aria-hidden="true" />
                    {label}
                  </span>
                </th>
                <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-white/75">{count(r.leads)}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-white/75">{count(r.calls)}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-white/75">{count(r.showed)}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-white/75">{count(r.sales)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-white">{usd2(r.revenue)}</td>
                <td className={`px-4 py-3 text-right text-sm font-black tabular-nums ${r.roas < 1 ? 'text-rose-300' : SCENARIO_TONE[key].text}`}>
                  {roasText(r.roas)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Benchmarks ──────────────────────────────────────────────────────────────

function BenchmarkCard({
  name,
  blurb,
  grid,
  active,
  onUse,
}: {
  name: string;
  blurb: string;
  grid: Grid;
  active: boolean;
  onUse: () => void;
}) {
  return (
    <div className={`flex flex-col rounded-2xl border p-4 sm:p-5 ${active ? 'border-cyan-400/40 bg-cyan-400/[0.05]' : 'border-white/10 bg-white/[0.025]'}`}>
      <div className="text-base font-extrabold leading-tight tracking-tight text-white">{name}</div>
      <div className="mt-1 text-[13px] leading-snug text-white/50">{blurb}</div>
      <table className="mt-4 w-full text-[13px]">
        <thead>
          <tr>
            <th className="pb-1.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
              <span className="sr-only">Metric</span>
            </th>
            {SCENARIOS.map(({ key }) => (
              <th key={key} scope="col" className="pb-1.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                {key === 'average' ? 'Avg' : key === 'best' ? 'Best' : 'Worst'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GRID_ROWS.map((row) => (
            <tr key={row.field} className="border-t border-white/[0.06]">
              <th scope="row" className="py-1.5 text-left font-semibold text-white/60">
                {row.short}
              </th>
              {SCENARIOS.map(({ key }) => (
                <td key={key} className="py-1.5 text-right font-bold tabular-nums text-white/85">
                  {row.kind === 'money' ? `$${moneyCell(grid[key][row.field])}` : `${grid[key][row.field]}%`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={onUse}
        className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
          active
            ? 'bg-cyan-400/15 text-cyan-200'
            : 'border border-white/10 bg-white/[0.04] text-white/80 hover:border-cyan-400/40 hover:text-white'
        }`}
      >
        {active ? (
          <>
            <Check className="h-4 w-4" aria-hidden="true" /> In the calculator
          </>
        ) : (
          <>
            Use these numbers <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}

// ── Opt-in ──────────────────────────────────────────────────────────────────

type OptInState = 'idle' | 'sending' | 'done';

function OptIn({ model, inputs, spend, results }: { model: Model; inputs: CalcInputs; spend: number; results: Record<ScenarioKey, ScenarioResult> }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [firm, setFirm] = useState('');
  const [state, setState] = useState<OptInState>('idle');
  const [error, setError] = useState<string | null>(null);
  const ids = { name: useId(), email: useId(), firm: useId() };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'sending') return;
    if (!firstName.trim()) return setError('Add your first name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email.');
    setError(null);
    setState('sending');
    try {
      const { eventId, attribution } = trackLeadEvent('ROAS Calculator');
      const res = await fetch('/api/forms/roas-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          firmName: firm.trim(),
          event_id: eventId,
          attribution,
          model,
          inputs,
          spend,
          results,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Something went wrong. Try again.');
      }
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setState('idle');
    }
  };

  return (
    <RimCard className="mt-14 sm:mt-20" innerClassName="px-5 py-7 sm:px-10 sm:py-10">
      <AnimatePresence mode="wait" initial={false}>
        {state === 'done' ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative mx-auto max-w-2xl text-center"
          >
            <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-400" aria-hidden="true" />
            <h2 className="mt-4 text-2xl sm:text-3xl" style={HEADING}>
              Your numbers are on the way.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: MUTED }}>
              Check your inbox for the {MODEL_LABEL[model]} breakdown. If you want those numbers in your own
              ad account, see how the Digital Rainmaker System builds and runs the whole path, from the ad to the
              booked consultation.
            </p>
            <a
              href={CTA_HREF}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02]"
            >
              See the Digital Rainmaker System <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={false}
            exit={{ opacity: 0, y: -8 }}
            className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12"
          >
            <div>
              <Kicker>Keep your numbers</Kicker>
              <h2 className="mt-3 text-pretty text-[1.75rem] sm:text-4xl" style={HEADING}>
                Get this breakdown <span className={GRADIENT_TEXT}>in your inbox.</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed sm:text-base" style={{ color: MUTED }}>
                We will email the three scenarios you just built, with the {MODEL_LABEL[model]} benchmarks
                beside them, so you can check your campaigns against them each month.
              </p>
              <ul className="mt-5 space-y-2">
                {['Best, average and worst case side by side', 'The benchmark for every funnel type', 'No spam. Unsubscribe in one click.'].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm font-medium text-white/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={submit} noValidate className="space-y-4">
              <Field label="First name" htmlFor={ids.name}>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
                  <input
                    id={ids.name}
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`${INPUT} pl-10 pr-3`}
                    placeholder="Jordan"
                  />
                </div>
              </Field>
              <Field label="Email" htmlFor={ids.email}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
                  <input
                    id={ids.email}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${INPUT} pl-10 pr-3`}
                    placeholder="you@yourfirm.com"
                  />
                </div>
              </Field>
              <Field label={<>Firm name <span className="normal-case tracking-normal text-white/35">(optional)</span></>} htmlFor={ids.firm}>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
                  <input
                    id={ids.firm}
                    autoComplete="organization"
                    value={firm}
                    onChange={(e) => setFirm(e.target.value)}
                    className={`${INPUT} pl-10 pr-3`}
                    placeholder="Your firm"
                  />
                </div>
              </Field>
              {error && (
                <div role="alert" className="text-sm font-semibold text-rose-300">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={state === 'sending'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-blue-500/25 transition-opacity disabled:opacity-60"
              >
                {state === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending
                  </>
                ) : (
                  <>
                    Email me my numbers <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </RimCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

const MODEL_OPTIONS: readonly { value: Model; label: string; sub: string }[] = [
  { value: 'b2c', label: 'B2C', sub: 'You sell to individuals' },
  { value: 'b2b', label: 'B2B', sub: 'You sell to businesses' },
];

export default function RoasCalculator() {
  const [model, setModel] = useState<Model>('b2b');
  const [all, setAll] = useState<Record<Model, CalcInputs>>(DEFAULTS);
  const loaded = useRef(false);
  const modelPill = useId();
  const budgetIds = { daily: useId(), price: useId() };

  // Restore after mount, so the server's HTML (the sheet's defaults) and the
  // first client render agree.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { model?: unknown; all?: Record<string, unknown> };
        if (saved.model === 'b2c' || saved.model === 'b2b') setModel(saved.model);
        setAll({
          b2c: sanitize(saved.all?.b2c, DEFAULTS.b2c),
          b2b: sanitize(saved.all?.b2b, DEFAULTS.b2b),
        });
      }
    } catch {
      // Private mode or a corrupt save: start from the sheet's defaults.
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ model, all }));
    } catch {
      // Not saved; the page still works.
    }
  }, [model, all]);

  const inputs = all[model];
  const update = (patch: Partial<CalcInputs>) => setAll((a) => ({ ...a, [model]: { ...a[model], ...patch } }));
  const setCell = (k: ScenarioKey, f: keyof ScenarioInputs, v: number) =>
    setAll((a) => ({
      ...a,
      [model]: { ...a[model], grid: { ...a[model].grid, [k]: { ...a[model].grid[k], [f]: v } } },
    }));
  const loadGrid = (grid: Grid) => update({ grid });
  const reset = () => setAll((a) => ({ ...a, [model]: DEFAULTS[model] }));

  const { spend, results } = useMemo(() => run(inputs), [inputs]);
  const maxRoas = Math.max(results.best.roas, results.average.roas, results.worst.roas);
  const breakEven = breakEvenSales(spend, inputs.price);
  const isDefault =
    inputs.daily === DEFAULTS[model].daily && inputs.price === DEFAULTS[model].price && sameGrid(inputs.grid, DEFAULTS[model].grid);

  const presets = [
    { id: 'default', name: 'Calculator default', grid: DEFAULTS[model].grid },
    ...BENCHMARKS[model].map((b) => ({ id: b.id, name: b.name, grid: b.grid })),
  ];

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen overflow-x-clip text-white" style={{ backgroundColor: '#020617', ...OUTFIT }}>
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)' }} />
          <div className="absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 right-1/4 h-[480px] w-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)' }} />
        </div>

        <FunnelLogo />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 md:pt-28 lg:px-8">
          {/* ── Hero ── */}
          <div className="max-w-4xl">
            <Kicker>Free tool · ROAS calculator</Kicker>
            <h1 className="mt-3 text-pretty text-[2.1rem] sm:text-5xl lg:text-[3.4rem]" style={HEADING}>
              Where your ad numbers <span className={GRADIENT_TEXT}>need to be.</span>
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed sm:text-lg" style={{ color: MUTED }}>
              Put in your daily budget and what one client is worth. Change any cost or rate and watch the best,
              average and worst case move, like a spreadsheet that does the math for you.
            </p>
          </div>

          {/* ── B2C / B2B ── */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div role="group" aria-label="Business model" className="grid w-full max-w-md grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
              {MODEL_OPTIONS.map((o) => {
                const on = o.value === model;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setModel(o.value)}
                    className={`relative rounded-xl px-3 py-2.5 text-left transition-colors ${on ? 'text-white' : 'text-white/55 hover:text-white/90'}`}
                  >
                    {on && (
                      <motion.span
                        layoutId={modelPill}
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative block text-base font-black tracking-tight">{o.label}</span>
                    <span className={`relative block text-[12px] font-semibold ${on ? 'text-white/85' : 'text-white/45'}`}>{o.sub}</span>
                  </button>
                );
              })}
            </div>
            {!isDefault && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/60 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset {MODEL_LABEL[model]}
              </button>
            )}
          </div>

          {/* ── Calculator ── */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-start lg:gap-8">
            <div className="space-y-4">
              <QuestionPanel step={1} title="Your budget and offer" sub="What you spend a day, and what one sale is worth.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Ad spend per day"
                    htmlFor={budgetIds.daily}
                    aside={
                      <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-cyan-300">
                        {usd0(spend)}/mo
                      </span>
                    }
                    hint="Monthly spend is daily × 30."
                  >
                    <NumberInput id={budgetIds.daily} kind="money" max={1_000_000} value={inputs.daily} onChange={(v) => update({ daily: v })} />
                  </Field>
                  <Field label="Offer contract price" htmlFor={budgetIds.price} hint="What a client pays for one sale.">
                    <NumberInput id={budgetIds.price} kind="money" max={100_000_000} value={inputs.price} onChange={(v) => update({ price: v })} />
                  </Field>
                </div>
              </QuestionPanel>

              <QuestionPanel step={2} title="Your funnel numbers" sub="Best, average and worst case. Click any cell to change it.">
                <ScenarioGrid grid={inputs.grid} onChange={setCell} />
                <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 sm:text-[11px]">
                    Or start from a benchmark
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((p) => {
                      const on = sameGrid(inputs.grid, p.grid);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => loadGrid(p.grid)}
                          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                            on
                              ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200'
                              : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </QuestionPanel>
            </div>

            {/* Results stay in view on a desktop while the grid is edited. */}
            <div className="lg:sticky lg:top-6">
              <RimCard innerClassName="p-4 sm:p-6">
                <div className="relative">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <Kicker>{MODEL_LABEL[model]} · this month</Kicker>
                      <div className="mt-1.5 text-[13px] font-semibold text-white/55">
                        <span className="text-2xl font-black tabular-nums tracking-tight text-white sm:text-[1.75rem]">{usd0(spend)}</span>{' '}
                        in ad spend
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Break even</div>
                      <div className="text-[13px] font-semibold text-white/70">
                        <span className="font-black tabular-nums text-white">{count(breakEven)}</span>{' '}
                        {breakEven === 1 ? 'sale' : 'sales'} a month
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {SCENARIOS.map(({ key, label }) => (
                      <ScenarioCard key={key} scenario={key} label={label} r={results[key]} maxRoas={maxRoas} featured={key === 'average'} />
                    ))}
                  </div>

                  <div className="mt-4 text-xs leading-relaxed text-white/45">
                    ROAS is revenue ÷ ad spend: 1.00x gets your ad spend back, before any other costs. Sales are
                    rounded to whole clients before revenue is counted.
                  </div>
                </div>
              </RimCard>
            </div>
          </div>

          {/* ── The sheet's table ── */}
          <section className="mt-14 sm:mt-20">
            <Kicker>Performance metrics</Kicker>
            <h2 className="mt-3 text-2xl sm:text-3xl" style={HEADING}>
              The whole funnel, <span className={GRADIENT_TEXT}>line by line.</span>
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed" style={{ color: MUTED }}>
              Leads and calls each come straight from your spend (spend ÷ CPL, spend ÷ CPBC). Showed calls and
              sales follow from your rates.
            </p>
            <div className="mt-6">
              <MetricsTable results={results} />
            </div>
          </section>

          {/* ── Benchmarks ── */}
          <section className="mt-14 sm:mt-20">
            <Kicker>{MODEL_LABEL[model]} benchmarks</Kicker>
            <h2 className="mt-3 text-2xl sm:text-3xl" style={HEADING}>
              Where the numbers sit <span className={GRADIENT_TEXT}>by funnel type.</span>
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed" style={{ color: MUTED }}>
              Cost per lead depends on how the ad asks for the lead, so compare yourself with the funnel you
              actually run. Load any of them into the calculator, then put your own budget and price on top.
            </p>
            <div className={`mt-6 grid gap-4 sm:grid-cols-2 ${BENCHMARKS[model].length > 3 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'}`}>
              {BENCHMARKS[model].map((b) => (
                <BenchmarkCard
                  key={b.id}
                  name={b.name}
                  blurb={b.blurb}
                  grid={b.grid}
                  active={sameGrid(inputs.grid, b.grid)}
                  onUse={() => {
                    loadGrid(b.grid);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </section>

          <OptIn model={model} inputs={inputs} spend={spend} results={results} />

          <footer className="mt-14 border-t border-white/10 pt-8">
            <div className="max-w-4xl text-xs leading-relaxed text-white/45">
              For illustration only. The results are arithmetic on the numbers you enter, not a forecast or a
              promise of any result. Benchmarks are typical ranges, not guarantees; your costs depend on your
              market, your offer, your creative and the ad platform. Your numbers stay in this browser unless you
              ask us to email them.
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pb-4">
              <span className="text-xs font-semibold text-white/40">
                Built by <span className="font-black tracking-tight text-white/60">Nexli</span>
              </span>
              <a href={CTA_HREF} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-white">
                See the Digital Rainmaker System <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </footer>
        </div>
      </main>
    </MotionConfig>
  );
}
