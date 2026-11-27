'use client';

// ---------------------------------------------------------------------------
// The ROAS workbook on a phone.
//
// The desktop grid is the sheet at its real width (about 1,100px), so on a
// 390px screen it showed columns A and B and hid the rest behind a sideways
// scroll. This is the same sheet re-laid for a phone: every cell is still the
// sheet's cell (same address, same value, same formula, same flash and
// selection), but the scenarios run across in three columns and the results
// are transposed (metrics down, scenarios across), so nothing needs a
// sideways scroll. The full grid stays one tap away ("Grid").
//
// Editing happens in a bottom sheet, not in the cell. A phone's decimal
// keypad has no Enter or Next key, so the sheet carries them: − / + steps,
// Prev / Next through every input, and Done.
// ---------------------------------------------------------------------------
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Minus, Plus, Upload, X } from 'lucide-react';
import { addr, formatValue, parseEntry, type Cell, type InputRef, type Sheet } from '@/lib/roas-sheet';
import { BENCHMARKS, MODEL_LABEL, type Grid, type Model, type ScenarioKey } from '@/lib/roas-calc';

const TONE_TEXT: Record<ScenarioKey, string> = {
  best: 'text-emerald-300',
  average: 'text-cyan-300',
  worst: 'text-amber-200',
};
const TONE_DOT: Record<ScenarioKey, string> = {
  best: 'bg-emerald-400',
  average: 'bg-cyan-400',
  worst: 'bg-amber-400',
};
const REF_COLORS = ['#60a5fa', '#f472b6', '#a78bfa', '#34d399', '#fbbf24'];
const SCENARIO_COLS: readonly { c: number; key: ScenarioKey; label: string }[] = [
  { c: 1, key: 'best', label: 'Best' },
  { c: 2, key: 'average', label: 'Avg' },
  { c: 3, key: 'worst', label: 'Worst' },
];

/** Money without ".00" when there are no cents: "$150,000", "$12.50". The
 *  desktop grid keeps the sheet's $#,##0.00; a phone column has no room. */
function compact(cell: Cell | undefined): string {
  if (!cell || cell.value === undefined) return cell?.text ?? '';
  if (cell.format === 'money') {
    const cents = Math.round(cell.value * 100);
    return cents % 100 === 0
      ? `$${(cents / 100).toLocaleString('en-US')}`
      : `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return formatValue(cell.value, cell.format);
}

export interface MobileCellProps {
  sheet: Sheet;
  focusAddr: string;
  refs: string[];
  flash: boolean;
  selId: string;
  onTap: (r: number, c: number) => void;
}

/** One tappable cell, carrying its address the way a sheet does. */
function MCell({ r, c, sheet, focusAddr, refs, flash, selId, onTap, big = false }: MobileCellProps & { r: number; c: number; big?: boolean }) {
  const a = addr(r, c);
  const cell = sheet.cells[a];
  const text = compact(cell);
  const isInput = cell?.kind === 'input';
  const isRoas = cell?.format === 'roas';
  const losing = isRoas && (cell?.value ?? 0) < 1;
  const refIndex = refs.indexOf(a);
  const color = isInput
    ? 'text-sky-200'
    : losing
      ? 'text-rose-300'
      : cell?.kind === 'value'
        ? 'text-white/85'
        : cell?.tone
          ? TONE_TEXT[cell.tone]
          : 'text-cyan-200';
  return (
    <button
      type="button"
      onClick={() => onTap(r, c)}
      aria-label={`${a}: ${text}${isInput ? ', tap to edit' : ''}`}
      className={`relative flex min-h-[46px] w-full min-w-0 items-center justify-end rounded-lg border px-2 text-right transition-colors active:scale-[0.98] ${
        isInput ? 'border-sky-400/20 bg-blue-500/[0.08]' : 'border-white/[0.06] bg-white/[0.02]'
      }`}
      style={refIndex >= 0 ? { borderColor: REF_COLORS[refIndex % REF_COLORS.length], borderStyle: 'dashed', borderWidth: 2 } : undefined}
    >
      <span className="pointer-events-none absolute left-1.5 top-1 font-mono text-[9px] font-semibold text-white/25">{a}</span>
      {isInput && (
        <span aria-hidden="true" className="absolute left-0 top-0 h-0 w-0 rounded-tl-lg border-r-[7px] border-t-[7px] border-r-transparent border-t-sky-400/60" />
      )}
      <motion.span
        key={text}
        initial={flash ? { backgroundColor: 'rgba(34,211,238,0.32)', scale: 1.08 } : false}
        animate={{ backgroundColor: 'rgba(34,211,238,0)', scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={`-mx-1 mt-2 truncate rounded px-1 tabular-nums ${big ? 'text-[17px] font-black' : 'text-[14px]'} ${
          isRoas ? 'font-black' : isInput ? 'font-bold' : 'font-semibold'
        } ${color}`}
      >
        {text}
      </motion.span>
      {focusAddr === a && (
        <motion.span
          layoutId={selId}
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[2px] rounded-[10px] p-[2px]"
          transition={{ type: 'spring', stiffness: 600, damping: 42 }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #22d3ee)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            boxShadow: '0 0 16px rgba(34,211,238,0.35)',
          }}
        />
      )}
    </button>
  );
}

function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-2 mt-5 flex items-end justify-between gap-2 first:mt-0">
      <span className="bg-gradient-to-r from-blue-300 via-violet-300 to-cyan-200 bg-clip-text text-[15px] font-black tracking-tight text-transparent">
        {children}
      </span>
      {aside}
    </div>
  );
}

function ScenarioHead() {
  return (
    <div className="grid grid-cols-[76px_repeat(3,minmax(0,1fr))] gap-1.5 pb-1">
      <span />
      {SCENARIO_COLS.map((s) => (
        <span key={s.key} className="inline-flex items-center justify-end gap-1.5 pr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
          <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[s.key]}`} aria-hidden="true" />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function RowLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col justify-center">
      <span className="text-[13px] font-bold leading-tight text-white">{children}</span>
      {sub && <span className="text-[10px] font-medium leading-tight text-white/40">{sub}</span>}
    </div>
  );
}

// ── Calculator tab ──────────────────────────────────────────────────────────

const INPUT_ROWS: readonly { r: number; label: string; sub: string }[] = [
  { r: 6, label: 'CPL', sub: 'Cost per lead' },
  { r: 7, label: 'CPBC', sub: 'Cost per call' },
  { r: 8, label: 'Show-up', sub: '% that show' },
  { r: 9, label: 'Close', sub: '% that buy' },
];
/** The results block transposed: one row per metric (sheet column), one
 *  column per scenario (sheet rows 16–18). */
const RESULT_ROWS: readonly { c: number; label: string }[] = [
  { c: 1, label: 'Leads' },
  { c: 2, label: 'Calls' },
  { c: 3, label: 'Showed' },
  { c: 4, label: 'Sales' },
  { c: 5, label: 'Revenue' },
  { c: 6, label: 'ROAS' },
];

export function MobileCalc(props: MobileCellProps) {
  const cell = (r: number, c: number, big = false) => <MCell key={`${r}-${c}`} r={r} c={c} big={big} {...props} />;
  return (
    <div className="px-3 pb-4 pt-3">
      <SectionTitle>Budget & offer</SectionTitle>
      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <div className="mb-1 pl-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Ad spend / day</div>
          {cell(1, 1)}
        </div>
        <div>
          <div className="mb-1 pl-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Monthly (×30)</div>
          {cell(1, 2)}
        </div>
        <div className="col-span-2">
          <div className="mb-1 mt-1 pl-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Offer contract price</div>
          {cell(2, 1)}
        </div>
      </div>

      <SectionTitle>Funnel numbers</SectionTitle>
      <ScenarioHead />
      <div className="space-y-1.5">
        {INPUT_ROWS.map((row) => (
          <div key={row.r} className="grid grid-cols-[76px_repeat(3,minmax(0,1fr))] gap-1.5">
            <RowLabel sub={row.sub}>{row.label}</RowLabel>
            {SCENARIO_COLS.map((s) => cell(row.r, s.c))}
          </div>
        ))}
      </div>

      <SectionTitle>Performance metrics</SectionTitle>
      <ScenarioHead />
      <div className="space-y-1.5">
        {RESULT_ROWS.map((row) => (
          <div key={row.c} className="grid grid-cols-[76px_repeat(3,minmax(0,1fr))] gap-1.5">
            <RowLabel>{row.label}</RowLabel>
            {SCENARIO_COLS.map((s, i) => cell(15 + i, row.c, row.c === 6))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Benchmarks tab ──────────────────────────────────────────────────────────

export function MobileBenchmarks({ onLoad, initialSide, ...props }: MobileCellProps & { onLoad: (m: Model, g: Grid) => void; initialSide: Model }) {
  const [side, setSide] = useState<Model>(initialSide);
  const blocks = (props.sheet.blocks ?? []).filter((b) => b.model === side);
  return (
    <div className="px-3 pb-4 pt-3">
      <div role="group" aria-label="Benchmark side" className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
        {(['b2c', 'b2b'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={side === m}
            onClick={() => setSide(m)}
            className={`rounded-lg py-2 text-[13px] font-bold transition-colors ${side === m ? 'bg-white/10 text-white' : 'text-white/50'}`}
          >
            {MODEL_LABEL[m]} benchmarks
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {blocks.map((b) => {
          const grid = BENCHMARKS[b.model].find((x) => x.id === b.id)?.grid;
          return (
            <div key={`${b.model}-${b.id}`} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <SectionTitle>{b.name}</SectionTitle>
              <ScenarioHead />
              <div className="space-y-1.5">
                {INPUT_ROWS.map((row, j) => (
                  <div key={row.r} className="grid grid-cols-[76px_repeat(3,minmax(0,1fr))] gap-1.5">
                    <RowLabel sub={row.sub}>{row.label}</RowLabel>
                    {SCENARIO_COLS.map((s) => (
                      <MCell key={s.c} r={b.r0 + 1 + j} c={b.c0 + s.c} {...props} />
                    ))}
                  </div>
                ))}
              </div>
              {grid && (
                <button
                  type="button"
                  onClick={() => onLoad(b.model, grid)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-2.5 text-[14px] font-bold text-cyan-100 active:scale-[0.99]"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Load into {MODEL_LABEL[b.model]} calculator
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── The editor ──────────────────────────────────────────────────────────────

/** How far − / + move a value. */
function stepFor(ref: InputRef | undefined): number {
  if (!ref) return 1;
  if (ref.field === 'daily') return 10;
  if (ref.field === 'price') return 500;
  return ref.metric === 'cpl' ? 1 : ref.metric === 'cpbc' ? 10 : 5;
}

/** Height of the on-screen keyboard, so the sheet sits on top of it (iOS
 *  lays position: fixed out against the layout viewport, under the keys). */
function useKeyboardInset(active: boolean) {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!active || !vv) return setInset(0);
    const update = () => setInset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [active]);
  return inset;
}

export function EditorSheet({
  open,
  address,
  title,
  explain,
  cell,
  text,
  onText,
  onDone,
  onCancel,
  onStep,
  position,
}: {
  open: boolean;
  address: string;
  title: string;
  explain?: string;
  cell: Cell | undefined;
  text: string;
  onText: (t: string) => void;
  onDone: () => void;
  onCancel: () => void;
  /** -1 previous input, +1 next input. */
  onStep: (dir: -1 | 1) => void;
  /** "3 of 15". */
  position: string;
}) {
  const inset = useKeyboardInset(open);
  const isMoney = cell?.format === 'money';
  const step = stepFor(cell?.input);
  const nudge = (dir: -1 | 1) => {
    const n = parseEntry(text) ?? cell?.value ?? 0;
    const next = Math.max(0, Math.round((n + dir * step) * 100) / 100);
    onText(String(next));
  };
  // Keep focus in the field when a button is pressed, so the keyboard stays up.
  const keep = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDone}
            className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px] sm:hidden"
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-label={`Edit ${address}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 z-[121] rounded-t-3xl border-t border-white/15 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] sm:hidden"
            style={{ bottom: inset, background: 'linear-gradient(160deg, #13223d 0%, #0b1324 100%)' }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-cyan-400/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-cyan-200">{address}</span>
                  <span className="text-[11px] font-semibold text-white/40">{position}</span>
                </div>
                <div className="mt-1 truncate text-[16px] font-extrabold text-white">{title}</div>
                {explain && <div className="text-[12px] leading-snug text-white/50">{explain}</div>}
              </div>
              <button
                type="button"
                onMouseDown={keep}
                onClick={onCancel}
                aria-label="Cancel"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/60"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onMouseDown={keep}
                onClick={() => nudge(-1)}
                aria-label={`Minus ${step}`}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80 active:bg-white/10"
              >
                <Minus className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="relative min-w-0 flex-1">
                {isMoney && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-white/40">$</span>}
                <input
                  autoFocus
                  aria-label={`Value for ${address}`}
                  inputMode="decimal"
                  enterKeyHint="next"
                  value={text}
                  onFocus={(e) => {
                    const n = e.target.value.length;
                    e.target.setSelectionRange(0, n);
                  }}
                  onChange={(e) => onText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onStep(1);
                    }
                  }}
                  className={`h-14 w-full rounded-2xl border-2 border-cyan-300/70 bg-[#0d1a2e] text-center font-mono text-[22px] font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.25)] outline-none ${
                    isMoney ? 'pl-8 pr-4' : 'pl-4 pr-9'
                  }`}
                />
                {!isMoney && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-white/40">%</span>}
              </div>
              <button
                type="button"
                onMouseDown={keep}
                onClick={() => nudge(1)}
                aria-label={`Plus ${step}`}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80 active:bg-white/10"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-1.5 text-center text-[11px] text-white/35">Arithmetic works too: =200*1.1</div>

            <div className="mt-3 grid grid-cols-[1fr_1fr_1.3fr] gap-2">
              <button
                type="button"
                onMouseDown={keep}
                onClick={() => onStep(-1)}
                className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] text-[14px] font-bold text-white/80"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
              </button>
              <button
                type="button"
                onMouseDown={keep}
                onClick={() => onStep(1)}
                className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] text-[14px] font-bold text-white/80"
              >
                Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onMouseDown={keep}
                onClick={onDone}
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-[15px] font-bold text-white shadow-lg shadow-blue-500/25"
              >
                <Check className="h-4 w-4" aria-hidden="true" /> Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
