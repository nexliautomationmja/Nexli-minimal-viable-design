'use client';

// ---------------------------------------------------------------------------
// Year-one value of one month's new clients: planning fees plus the
// bookkeeping-and-payroll bundle, one row per scenario.
//
// HTML rather than SVG so it reflows on a phone. A 2px surface gap between
// the two segments, a square baseline and a 4px rounded end. A segment's
// figure prints inside it only when there is room; otherwise the row's
// breakdown line says it, so nothing is clipped and nothing is hover-only.
// ---------------------------------------------------------------------------
import React from 'react';
import { C, MUTED, useSeen, useWidth } from './ui';

export interface StackRow {
  key: string;
  label: string;
  sublabel: string;
  a: number;
  b: number;
}

export default function StackedBars({
  rows,
  format,
  aLabel,
  bLabel,
}: {
  rows: StackRow[];
  format: (n: number) => string;
  aLabel: string;
  bLabel: string;
}) {
  const [seenRef, seen] = useSeen<HTMLDivElement>(0.4);
  const [trackRef, trackW] = useWidth<HTMLDivElement>();
  const max = Math.max(...rows.map((r) => r.a + r.b));
  // Leave room after the longest bar for its total.
  const scale = (n: number) => (n / max) * 0.8;
  const fits = (n: number) => trackW * scale(n) > format(n).length * 9 + 22;

  return (
    <div ref={seenRef} className="space-y-4 sm:space-y-5">
      {rows.map((r, i) => (
        <div key={r.key} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[150px_1fr] sm:gap-5">
          <div>
            <div className="text-[15px] font-bold text-white sm:text-base">{r.label}</div>
            <div className="text-xs" style={{ color: MUTED }}>
              {r.sublabel}
            </div>
          </div>
          <div ref={i === 0 ? trackRef : undefined} className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 items-stretch gap-[2px] sm:h-11"
              style={{
                width: seen ? `${scale(r.a + r.b) * 100}%` : '0%',
                transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
              }}
            >
              <div
                className="flex items-center justify-center overflow-visible text-sm font-bold text-white"
                style={{ flexGrow: r.a, flexBasis: 0, background: C.planning }}
              >
                {seen && fits(r.a) ? <span className="whitespace-nowrap">{format(r.a)}</span> : null}
              </div>
              <div
                className="flex items-center justify-center rounded-r-[4px] text-sm font-bold text-white"
                style={{ flexGrow: r.b, flexBasis: 0, background: C.backEnd }}
              >
                {seen && fits(r.b) ? <span className="whitespace-nowrap">{format(r.b)}</span> : null}
              </div>
            </div>
            <div
              className="shrink-0 whitespace-nowrap"
              style={{ opacity: seen ? 1 : 0, transition: `opacity 0.4s ease ${0.6 + i * 0.1}s` }}
            >
              <span className="text-lg font-black text-white sm:text-xl">{format(r.a + r.b)}</span>
            </div>
          </div>
          {!(fits(r.a) && fits(r.b)) && trackW > 0 && (
            <div className="text-xs sm:col-start-2" style={{ color: MUTED }}>
              {format(r.a)} {aLabel.toLowerCase()} + {format(r.b)} {bLabel.toLowerCase()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
