'use client';

// ---------------------------------------------------------------------------
// The ROAS Calculator page: the workbook, the three scenarios as cards
// under it, and the opt-in.
//
// WHERE THINGS LIVE
//   The spreadsheet UI (grid, formula bar, keyboard, clipboard, tabs):
//     components/roas/Workbook.tsx.
//   Where each cell sits and what its formula reads: lib/roas-sheet.ts.
//   The arithmetic and the benchmark numbers: lib/roas-calc.ts, a copy of
//     the spreadsheet that follows it, not Nexli's own benchmarks.
//   The visitor's numbers: this browser (localStorage), one set per model,
//     with undo history in memory.
//   The opt-in: /api/forms/roas-calc, with the numbers they were looking at.
//
// The calculator is open to everyone. The opt-in emails the breakdown; it
// does not gate the numbers.
// ---------------------------------------------------------------------------
import React, { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowRight, Building2, Check, CheckCircle2, ChevronRight, Keyboard, Loader2, Mail, User } from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import { OUTFIT, RimCard } from '@/components/funnel/primitives';
import { GRADIENT_TEXT, HEADING, Kicker, MUTED } from '@/components/math/ui';
import { Field, INPUT } from '@/components/tax-planning/fields';
import Workbook, { type Tab } from '@/components/roas/Workbook';
import { trackLeadEvent } from '@/lib/meta-events';
import {
  DEFAULTS,
  MODEL_LABEL,
  SCENARIOS,
  breakEvenSales,
  run,
  sanitize,
  type CalcInputs,
  type Grid,
  type Model,
  type ScenarioKey,
  type ScenarioResult,
} from '@/lib/roas-calc';

const STORAGE_KEY = 'nexli-roas-calc:v2';
const CTA_HREF = '/agency';
const HISTORY_MAX = 100;

const usd0 = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
/** Whole numbers the way the sheet's #,##0 shows them. */
const count = (n: number) => Math.round(n).toLocaleString('en-US');
const roasText = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SCENARIO_TONE: Record<ScenarioKey, { dot: string; text: string; ring: string; bar: string }> = {
  best: { dot: 'bg-emerald-400', text: 'text-emerald-300', ring: 'border-emerald-400/25', bar: 'from-emerald-400 to-cyan-400' },
  average: { dot: 'bg-cyan-400', text: 'text-cyan-300', ring: 'border-cyan-400/30', bar: 'from-blue-500 to-cyan-400' },
  worst: { dot: 'bg-amber-400', text: 'text-amber-200', ring: 'border-amber-300/25', bar: 'from-amber-400 to-rose-400' },
};

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

type Book = Record<Model, CalcInputs>;

/**
 * The numbers and their undo history in one reducer, so two Ctrl+Z presses
 * in the same tick undo two steps instead of reading the same stale stack.
 */
interface History {
  book: Book;
  past: Book[];
  future: Book[];
}
type HistoryAction =
  | { type: 'commit'; model: Model; next: CalcInputs }
  | { type: 'load'; model: Model; grid: Grid }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'restore'; book: Book };

function historyReducer(h: History, a: HistoryAction): History {
  const push = (book: Book): History => ({ book, past: [...h.past.slice(-(HISTORY_MAX - 1)), h.book], future: [] });
  switch (a.type) {
    case 'commit':
      return push({ ...h.book, [a.model]: a.next });
    case 'load':
      return push({ ...h.book, [a.model]: { ...h.book[a.model], grid: a.grid } });
    case 'undo':
      return h.past.length ? { book: h.past[h.past.length - 1], past: h.past.slice(0, -1), future: [h.book, ...h.future] } : h;
    case 'redo':
      return h.future.length ? { book: h.future[0], past: [...h.past, h.book], future: h.future.slice(1) } : h;
    case 'restore':
      return { book: a.book, past: [], future: [] };
  }
}

const SHORTCUTS: readonly [string, string][] = [
  ['Type', 'replace a cell'],
  ['Enter / F2', 'edit'],
  ['Tab / arrows', 'move'],
  ['Shift + arrows', 'select'],
  ['Ctrl + C / V', 'copy, paste'],
  ['Ctrl + Z / Y', 'undo, redo'],
  ['=200*1.1', 'math in a cell'],
];

export default function RoasCalculator() {
  const [tab, setTab] = useState<Tab>('b2b');
  /** The last calculator tab, so the cards and opt-in have a model even on Benchmarks. */
  const [model, setModel] = useState<Model>('b2b');
  const [hist, dispatch] = useReducer(historyReducer, { book: DEFAULTS, past: [], future: [] });
  const { book } = hist;
  const loaded = useRef(false);

  // Restore after mount, so the server's HTML (the sheet's defaults) and the
  // first client render agree.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { tab?: unknown; book?: Record<string, unknown> };
        if (saved.tab === 'b2c' || saved.tab === 'b2b') {
          setTab(saved.tab);
          setModel(saved.tab);
        }
        dispatch({ type: 'restore', book: { b2c: sanitize(saved.book?.b2c, DEFAULTS.b2c), b2b: sanitize(saved.book?.b2b, DEFAULTS.b2b) } });
      }
    } catch {
      // Private mode or a corrupt save: start from the sheet's defaults.
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tab: model, book }));
    } catch {
      // Not saved; the page still works.
    }
  }, [model, book]);

  const switchTab = (t: Tab) => {
    setTab(t);
    if (t !== 'benchmarks') setModel(t);
  };

  const commit = useCallback((m: Model, next: CalcInputs) => dispatch({ type: 'commit', model: m, next }), []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const load = (m: Model, grid: Grid) => {
    dispatch({ type: 'load', model: m, grid });
    switchTab(m);
  };

  const inputs = book[model];
  const { spend, results } = useMemo(() => run(inputs), [inputs]);
  const maxRoas = Math.max(results.best.roas, results.average.roas, results.worst.roas);
  const breakEven = breakEvenSales(spend, inputs.price);

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
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl">
            <Kicker>Free tool · ROAS calculator</Kicker>
            <h1 className="mt-3 text-pretty text-[2.1rem] sm:text-5xl lg:text-[3.4rem]" style={HEADING}>
              Where your ad numbers <span className={GRADIENT_TEXT}>need to be.</span>
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed sm:text-lg" style={{ color: MUTED }}>
              A real spreadsheet, B2C and B2B. Change any blue cell and every formula recalculates: leads, calls,
              sales, revenue and ROAS for your best, average and worst case. Copy it out or download it with the
              formulas intact.
            </p>
          </motion.div>

          {/* ── Workbook ── */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <RimCard className="mt-8 sm:mt-10" innerClassName="p-0" orbs={false}>
              <Workbook
                tab={tab}
                onTab={switchTab}
                all={book}
                onCommit={commit}
                onUndo={undo}
                onRedo={redo}
                canUndo={hist.past.length > 0}
                canRedo={hist.future.length > 0}
                onLoad={load}
              />
            </RimCard>
          </motion.div>

          <div className="mt-4 hidden flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-white/45 md:flex">
            <Keyboard className="h-4 w-4 text-white/35" aria-hidden="true" />
            {SHORTCUTS.map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white/70">{k}</kbd>
                {v}
              </span>
            ))}
          </div>

          {/* ── The results, at a glance ── */}
          <section className="mt-14 sm:mt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Kicker>{MODEL_LABEL[model]} · at a glance</Kicker>
                <h2 className="mt-3 text-2xl sm:text-3xl" style={HEADING}>
                  {usd0(spend)} a month in ads <span className={GRADIENT_TEXT}>returns this.</span>
                </h2>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Break even</div>
                <div className="text-sm font-semibold text-white/70">
                  <span className="font-black tabular-nums text-white">{count(breakEven)}</span> {breakEven === 1 ? 'sale' : 'sales'} a month at{' '}
                  {usd0(inputs.price)}
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {SCENARIOS.map(({ key, label }) => (
                <ScenarioCard key={key} scenario={key} label={label} r={results[key]} maxRoas={maxRoas} featured={key === 'average'} />
              ))}
            </div>
            <div className="mt-4 text-xs leading-relaxed text-white/45">
              ROAS is revenue ÷ ad spend: 1.00x gets your ad spend back, before any other costs. Sales are rounded to
              whole clients before revenue is counted, as in the sheet.
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
