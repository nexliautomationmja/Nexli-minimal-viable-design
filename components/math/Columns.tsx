'use client';

// ---------------------------------------------------------------------------
// Vertical columns, drawn at true pixel size (measured, not a scaled
// viewBox) so the labels are the same size on a phone as on a Zoom share.
//
// The dataviz rules it follows: columns capped in width and never filling
// their slot, a 4px rounded data end with a square baseline, solid hairline
// gridlines, labels in text colours (never the series colour), values on
// only the columns the story is about, and a tooltip on every column for
// the rest. Each chart also renders a visually hidden table, so no value is
// only reachable by hovering.
// ---------------------------------------------------------------------------
import React, { useState } from 'react';
import { C, FAINT, MUTED, useSeen, useWidth } from './ui';

export interface Column {
  key: string;
  /** Under the axis. */
  label: string;
  sublabel?: string;
  value: number;
  color: string;
  /** Drawn at reduced opacity, e.g. the months before the bundle pays. */
  dim?: boolean;
  /** Printed on the cap. Leave undefined to leave this column unlabelled. */
  capLabel?: string;
  capSub?: string;
  /** Tooltip lines. */
  tip: { value: string; label: string };
}

export interface RefLine {
  value: number;
  color: string;
  dash?: string;
}

const M = { top: 48, right: 12, bottom: 46, left: 52 };

function columnPath(x: number, y: number, w: number, base: number) {
  const r = Math.min(4, w / 2, Math.max(0, base - y));
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${base} Z`;
}

export default function Columns({
  data,
  yMax,
  ticks,
  tickFormat,
  refLines = [],
  height = 300,
  maxBar = 56,
  caption,
  xTitle,
}: {
  data: Column[];
  yMax: number;
  ticks: number[];
  tickFormat: (n: number) => string;
  refLines?: RefLine[];
  height?: number;
  maxBar?: number;
  /** Describes the chart for the hidden table. */
  caption: string;
  /** Names the x axis, set under the y labels, left of the first column. */
  xTitle?: string;
}) {
  const [box, width] = useWidth<HTMLDivElement>();
  const [seenRef, seen] = useSeen<HTMLDivElement>(0.4);
  const [hover, setHover] = useState<number | null>(null);

  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const base = M.top + plotH;
  const y = (v: number) => base - (v / yMax) * plotH;
  const slot = data.length ? plotW / data.length : 0;
  const barW = Math.max(6, Math.min(maxBar, slot * 0.56));
  const cx = (i: number) => M.left + slot * i + slot / 2;
  const showSub = slot > 72;

  return (
    <div ref={seenRef} className="relative">
      <div ref={box} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} className="block overflow-visible" aria-hidden="true">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={C.grid} strokeWidth={1} />
                <text
                  x={M.left - 10}
                  y={y(t) + 4}
                  textAnchor="end"
                  fontSize={12}
                  fill={C.axis}
                  className="tabular-nums"
                >
                  {tickFormat(t)}
                </text>
              </g>
            ))}

            {data.map((d, i) => {
              const top = y(d.value);
              const x = cx(i) - barW / 2;
              const lifted = hover === i;
              return (
                <g key={d.key}>
                  {d.value > 0 && (
                    <path
                      d={columnPath(x, top, barW, base)}
                      fill={d.color}
                      opacity={d.dim ? 0.38 : lifted ? 1 : 0.92}
                      style={{
                        transformBox: 'fill-box',
                        transformOrigin: 'bottom',
                        transform: seen ? 'scaleY(1)' : 'scaleY(0)',
                        transition: `transform 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s, opacity 0.2s`,
                      }}
                    />
                  )}
                  {d.capLabel && (
                    <g style={{ opacity: seen ? 1 : 0, transition: `opacity 0.4s ease ${0.5 + i * 0.06}s` }}>
                      <text
                        x={cx(i)}
                        y={top - (d.capSub ? 24 : 10)}
                        textAnchor="middle"
                        fontSize={slot > 90 ? 17 : 14}
                        fontWeight={800}
                        fill="#fff"
                      >
                        {d.capLabel}
                      </text>
                      {d.capSub && (
                        <text x={cx(i)} y={top - 8} textAnchor="middle" fontSize={12} fill={MUTED}>
                          {d.capSub}
                        </text>
                      )}
                    </g>
                  )}
                  <text x={cx(i)} y={base + 20} textAnchor="middle" fontSize={slot > 90 ? 14 : 12} fontWeight={slot > 90 ? 700 : 500} fill={slot > 90 ? '#fff' : C.axis}>
                    {d.label}
                  </text>
                  {d.sublabel && showSub && (
                    <text x={cx(i)} y={base + 38} textAnchor="middle" fontSize={12} fill={FAINT}>
                      {d.sublabel}
                    </text>
                  )}
                </g>
              );
            })}

            {xTitle && (
              <text x={M.left - 10} y={base + 20} textAnchor="end" fontSize={11} fill={FAINT}>
                {xTitle}
              </text>
            )}

            {refLines.map((r) => (
              <line
                key={r.value}
                x1={M.left}
                x2={width - M.right}
                y1={y(r.value)}
                y2={y(r.value)}
                stroke={r.color}
                strokeWidth={2}
                strokeDasharray={r.dash ?? '7 6'}
                style={{ opacity: seen ? 1 : 0, transition: 'opacity 0.5s ease 0.9s' }}
              />
            ))}

            {/* Hit targets: the whole column slot, not just the painted bar. */}
            {data.map((d, i) => (
              <rect
                key={`hit-${d.key}`}
                x={M.left + slot * i}
                y={M.top - 30}
                width={slot}
                height={plotH + 30}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              />
            ))}
          </svg>
        )}

        {hover !== null && width > 0 && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border border-white/10 px-3 py-2 shadow-xl"
            style={{
              left: Math.min(Math.max(cx(hover), 70), width - 70),
              top: Math.max(y(data[hover].value) - 8, 40),
              background: 'rgba(8,13,26,0.96)',
            }}
          >
            <div className="text-[15px] font-bold tabular-nums text-white">{data[hover].tip.value}</div>
            <div className="text-xs" style={{ color: MUTED }}>
              {data[hover].tip.label}
            </div>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th scope="row">
                {d.label}
                {d.sublabel ? `, ${d.sublabel}` : ''}
              </th>
              <td>{d.tip.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A legend entry for a reference line: a short stroke, then the words. */
export function LineKey({
  color,
  dash,
  label,
  sub,
}: {
  color: string;
  dash?: string;
  label: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="6" aria-hidden="true" className="shrink-0">
        <line x1="1" x2="25" y1="3" y2="3" stroke={color} strokeWidth="2.5" strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <span className="text-[13px] font-semibold text-white/90 sm:text-sm">
        {label}
        {sub && (
          <span className="ml-1.5 font-normal" style={{ color: MUTED }}>
            {sub}
          </span>
        )}
      </span>
    </div>
  );
}

export function SwatchKey({ color, label }: { color: string; label: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: color }} />
      <span className="text-[13px] text-white/85 sm:text-sm">{label}</span>
    </div>
  );
}
