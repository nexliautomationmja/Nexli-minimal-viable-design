'use client';

// ---------------------------------------------------------------------------
// The full picture, on the "your clients cover our monthly fee" slide.
//
// Marcel's framing (2026-11-09): tax planning pays for the system first.
// Bookkeeping and payroll, built up month by month, then cover it on their
// own. From there every tax plan, paid up front, is the bonus on top. So
// the chart shows both, stacked against the monthly bill:
//
//   bookkeeping and payroll at the BASE (the foundation that covers the bill)
//   tax planning ON TOP (the cherry)
//   the bill as a dashed line across
//
// It tells that in order. When the slide arrives only tax planning shows,
// clearing the bill on its own; a beat later bookkeeping and payroll grow in
// underneath and lift it. A two-step toggle replays it on a call. Under the
// months, two brackets say who is covering the bill when.
//
// Drawn at true pixel size like Columns (measured width, no viewBox), with
// the same rules: capped bar width, rounded data end, square baseline, a 2px
// gap between stacked segments, text in text colours, a tooltip on every
// month and a hidden table so nothing is hover-only.
// ---------------------------------------------------------------------------
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usd, usdCompact } from '@/lib/see-the-math';
import { LineKey, SwatchKey } from './Columns';
import { usePrint } from './print';
import { C, FAINT, MUTED, useSeen, useWidth } from './ui';

export interface CoverMonth {
  month: number;
  /** Bookkeeping and payroll billed that month. */
  backEnd: number;
  /** Tax planning fees signed that month, paid up front. */
  planning: number;
}

type View = 'planning' | 'both';

const M = { top: 20, right: 12, bottom: 84, left: 52 };
const HEIGHT = 306;
const Y_MAX = 60_000;
const TICKS = [0, 20_000, 40_000, 60_000];
const GAP = 2;

/** Estimated text width: Outfit runs about 0.56em a character. */
const textW = (s: string, size: number) => s.length * size * 0.56;

/** One label on one line if it fits the span, else split near the middle. */
function lines(label: string, span: number, size: number): string[] {
  if (textW(label, size) <= span) return [label];
  const words = label.split(' ');
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

export default function CoverChart({ data, bill }: { data: CoverMonth[]; bill: number }) {
  const [box, width] = useWidth<HTMLDivElement>();
  const [seenRef, seen] = useSeen<HTMLDivElement>(0.4);
  // On paper: the full picture at once, no toggle, no motion.
  const print = usePrint();
  const [view, setView] = useState<View>(print ? 'both' : 'planning');
  const [hover, setHover] = useState<number | null>(null);
  const touched = useRef(false);
  const [reduce, setReduce] = useState(print);

  // The story, once, the first time the chart is on screen: tax planning
  // alone, then bookkeeping and payroll grow in under it. Reduced motion, or
  // a tap on the toggle first, goes straight to the answer.
  useEffect(() => {
    const r = print || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduce(r);
    if (r) setView('both');
  }, [print]);
  useEffect(() => {
    if (!seen || reduce) return;
    const t = window.setTimeout(() => {
      if (!touched.current) setView('both');
    }, 1900);
    return () => window.clearTimeout(t);
  }, [seen, reduce]);
  const pick = (v: View) => {
    touched.current = true;
    setView(v);
  };

  const both = view === 'both';
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = HEIGHT - M.top - M.bottom;
  const base = M.top + plotH;
  const y = (v: number) => base - (v / Y_MAX) * plotH;
  const h = (v: number) => (v / Y_MAX) * plotH;
  const slot = data.length ? plotW / data.length : 0;
  const barW = Math.max(6, Math.min(30, slot * 0.56));
  const cx = (i: number) => M.left + slot * i + slot / 2;

  // Who covers the bill when. The first month with any income, then the
  // first month bookkeeping and payroll clear the bill alone.
  const firstIncome = data.findIndex((d) => d.planning + d.backEnd > 0);
  const covers = data.findIndex((d) => d.backEnd >= bill);
  const brackets: { from: number; to: number; label: string; color: string }[] =
    firstIncome === -1
      ? []
      : both && covers !== -1
        ? [
            { from: firstIncome, to: covers - 1, label: 'Tax planning covers it', color: C.planning },
            { from: covers, to: data.length - 1, label: 'Bookkeeping covers it', color: C.backEnd },
          ]
        : [{ from: firstIncome, to: data.length - 1, label: 'Tax planning covers it', color: C.planning }];

  const ease = reduce ? { duration: 0 } : { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div ref={seenRef}>
      {/* The toggle, then the legend on one line: three rows of legend beside
          the toggle made this the tallest slide in the deck, and it shrank to
          fit a 1280×720 share. */}
      <div className="mb-3 flex flex-col gap-3">
        {!print && (
        <div
          role="group"
          aria-label="What the chart shows"
          className="inline-flex shrink-0 self-start rounded-full border border-white/10 bg-white/[0.04] p-1"
        >
          {(
            [
              ['planning', 'Tax planning'],
              ['both', '+ Bookkeeping & payroll'],
            ] as const
          ).map(([v, label]) => {
            const on = view === v;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={on}
                onClick={() => pick(v)}
                className={`relative rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors sm:px-4 sm:text-[13px] ${
                  on ? 'text-white' : 'text-white/60 hover:text-white/90'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="cover-toggle"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
        )}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <SwatchKey color={C.planning} label="Tax planning" />
          <span className={`transition-opacity duration-500 ${both ? 'opacity-100' : 'opacity-35'}`}>
            <SwatchKey color={C.backEnd} label="Bookkeeping & payroll" />
          </span>
          <LineKey color={C.invest} dash="7 6" label="Your monthly bill" sub={`${usd(bill)} a month`} />
        </div>
      </div>

      <div ref={box} className="relative w-full" style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} className="block overflow-visible" aria-hidden="true">
            {TICKS.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={C.grid} strokeWidth={1} />
                <text x={M.left - 10} y={y(t) + 4} textAnchor="end" fontSize={12} fill={C.axis} className="tabular-nums">
                  {usdCompact(t)}
                </text>
              </g>
            ))}

            {data.map((d, i) => {
              const x = cx(i) - barW / 2;
              const gh = seen && both ? h(d.backEnd) : 0;
              const gap = gh > 0 && d.planning > 0 ? GAP : 0;
              const bh = seen ? h(d.planning) : 0;
              const by = base - gh - gap - bh;
              const r = Math.min(4, barW / 2);
              const delay = reduce ? 0 : seen && !both ? i * 0.05 : i * 0.03;
              const t = { ...ease, delay };
              const lifted = hover === i;
              return (
                <g key={d.month} opacity={hover === null || lifted ? 1 : 0.55} style={{ transition: 'opacity 0.2s' }}>
                  {/* Bookkeeping and payroll: the base. Square unless nothing sits on it. */}
                  <motion.rect
                    x={x}
                    width={barW}
                    initial={false}
                    animate={{ y: base - gh, height: gh }}
                    transition={t}
                    rx={d.planning > 0 ? 0 : r}
                    fill={C.backEnd}
                  />
                  {/* Tax planning: on top, with the rounded data end, and a
                      square foot so only its top corners round. */}
                  <motion.rect
                    x={x}
                    width={barW}
                    initial={false}
                    animate={{ y: by, height: bh }}
                    transition={t}
                    rx={r}
                    fill={C.planning}
                  />
                  <motion.rect
                    x={x}
                    width={barW}
                    initial={false}
                    animate={{ y: by + Math.max(0, bh - r), height: Math.min(r, bh) }}
                    transition={t}
                    fill={C.planning}
                  />
                  <text
                    x={cx(i)}
                    y={base + 18}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={lifted ? 700 : 500}
                    fill={lifted ? '#fff' : C.axis}
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}

            <text x={M.left - 10} y={base + 18} textAnchor="end" fontSize={11} fill={FAINT}>
              Month
            </text>

            <line
              x1={M.left}
              x2={width - M.right}
              y1={y(bill)}
              y2={y(bill)}
              stroke={C.invest}
              strokeWidth={2}
              strokeDasharray="7 6"
              style={{ opacity: seen ? 1 : 0, transition: 'opacity 0.5s ease 0.6s' }}
            />

            {brackets.map((b) => {
              const x1 = M.left + slot * b.from + 3;
              const x2 = M.left + slot * (b.to + 1) - 3;
              const yb = base + 32;
              const ls = lines(b.label, x2 - x1 + 8, 11);
              return (
                <motion.g
                  key={`${b.label}-${b.from}-${b.to}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: seen ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.35 }}
                >
                  <path
                    d={`M${x1},${yb - 6} V${yb} H${x2} V${yb - 6}`}
                    fill="none"
                    stroke={b.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {ls.map((l, k) => (
                    <text
                      key={l}
                      x={(x1 + x2) / 2}
                      y={yb + 16 + k * 14}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={700}
                      fill="rgba(255,255,255,0.82)"
                    >
                      {l}
                    </text>
                  ))}
                </motion.g>
              );
            })}

            {/* Hit targets: the whole month, not just the painted bar. */}
            {data.map((d, i) => (
              <rect
                key={`hit-${d.month}`}
                x={M.left + slot * i}
                y={M.top}
                width={slot}
                height={plotH}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover((v) => (v === i ? null : v))}
              />
            ))}
          </svg>
        )}

        {hover !== null && width > 0 && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border border-white/10 px-3 py-2 shadow-xl"
            style={{
              left: Math.min(Math.max(cx(hover), 100), width - 100),
              top: Math.max(y(data[hover].planning + (both ? data[hover].backEnd : 0)) - 10, 70),
              background: 'rgba(8,13,26,0.96)',
            }}
          >
            <div className="mb-1 text-xs font-bold text-white">Month {data[hover].month}</div>
            <TipRow color={C.planning} label="Tax planning" value={data[hover].planning} />
            {both && <TipRow color={C.backEnd} label="Bookkeeping and payroll" value={data[hover].backEnd} />}
            <div className="mt-1 border-t border-white/10 pt-1 text-xs" style={{ color: MUTED }}>
              Your bill {usd(bill)}
            </div>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>
          What comes in each month at the conservative pace, against a {usd(bill)} monthly bill
        </caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Tax planning</th>
            <th scope="col">Bookkeeping and payroll</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <th scope="row">{d.month}</th>
              <td>{usd(d.planning)}</td>
              <td>{usd(d.backEnd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TipRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="flex items-center gap-1.5" style={{ color: MUTED }}>
        <span className="h-2 w-2 rounded-[2px]" style={{ background: color }} />
        {label}
      </span>
      <span className="font-bold tabular-nums text-white">{usd(value)}</span>
    </div>
  );
}
