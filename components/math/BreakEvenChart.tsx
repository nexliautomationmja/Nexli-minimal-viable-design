'use client';

// ---------------------------------------------------------------------------
// Where the firm stands, month 0 to 12, after everything paid to Nexli.
//
// Two lines on ONE axis — month to month (solid) and paid annually
// (dashed, the second channel besides colour). Below zero is shaded as
// "earning back the investment", above as "in the green". A crosshair snaps
// to the nearest month and reads out both plans; the scenario table beside
// it carries the same figures without hovering.
//
// Switching scenario rescales the axis and the lines morph to the new
// shape (framer-motion interpolates `d`, both paths have the same commands).
// ---------------------------------------------------------------------------
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MONTHS, PLANS, breakEvenMonth, netSeries, usd, usdCompact, type Scenario } from '@/lib/see-the-math';
import { C, MUTED, useSeen, useWidth } from './ui';

const M = { top: 24, right: 16, bottom: 34, left: 60 };
const Y_MIN = -80_000;

function niceStep(range: number) {
  const steps = [50_000, 100_000, 200_000, 250_000, 500_000];
  return steps.find((s) => range / s <= 5) ?? 500_000;
}

export default function BreakEvenChart({ scenario, height = 300 }: { scenario: Scenario; height?: number }) {
  const [box, width] = useWidth<HTMLDivElement>();
  const [seenRef, seen] = useSeen<HTMLDivElement>(0.4);
  const [hover, setHover] = useState<number | null>(null);

  const monthly = useMemo(() => netSeries(scenario, PLANS.monthly), [scenario]);
  const annual = useMemo(() => netSeries(scenario, PLANS.annual), [scenario]);
  const beM = breakEvenMonth(scenario, PLANS.monthly);
  const beA = breakEvenMonth(scenario, PLANS.annual);

  const top = Math.max(...monthly, ...annual);
  const step = niceStep(top);
  const yMax = Math.ceil((top * 1.08) / step) * step;
  const ticks = [Y_MIN, 0];
  for (let t = step; t <= yMax; t += step) ticks.push(t);

  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const x = (m: number) => M.left + (m / MONTHS) * plotW;
  const y = (v: number) => M.top + ((yMax - v) / (yMax - Y_MIN)) * plotH;
  const path = (s: number[]) => s.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const zero = y(0);

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const m = Math.round(((e.clientX - rect.left) / rect.width) * MONTHS);
    setHover(Math.max(0, Math.min(MONTHS, m)));
  };

  const sameMonth = beM !== null && beM === beA;

  return (
    <div ref={seenRef} className="relative">
      <div ref={box} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} className="block" aria-hidden="true">
            <defs>
              <clipPath id="be-reveal">
                <motion.rect
                  x={0}
                  y={0}
                  height={height}
                  initial={{ width: 0 }}
                  animate={{ width: seen ? width : 0 }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </clipPath>
            </defs>

            {/* The two regions. */}
            <rect x={M.left} y={M.top} width={plotW} height={Math.max(0, zero - M.top)} fill="rgba(20,168,119,0.06)" />
            <rect x={M.left} y={zero} width={plotW} height={Math.max(0, M.top + plotH - zero)} fill="rgba(244,63,94,0.07)" />
            {/* Region names sit in the two corners the lines never reach —
                top-left and bottom-right — so they cannot collide with the
                break-even labels, which live around the zero crossing. */}
            <text x={M.left + 12} y={M.top + 20} fontSize={12} fontWeight={700} fill="#6ee7b7">
              In the green
            </text>
            {/* Only when the band is tall enough to hold it: on the best case
                the axis runs past $1M and the loss band is a sliver. */}
            {M.top + plotH - zero >= 30 && (
              <text x={width - M.right - 10} y={M.top + plotH - 9} textAnchor="end" fontSize={12} fontWeight={700} fill="#fda4af">
                Earning back the investment
              </text>
            )}

            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={M.left}
                  x2={width - M.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={t === 0 ? 'rgba(255,255,255,0.45)' : C.grid}
                  strokeWidth={t === 0 ? 1.5 : 1}
                />
                <text x={M.left - 10} y={y(t) + 4} textAnchor="end" fontSize={12} fill={C.axis} className="tabular-nums">
                  {usdCompact(t)}
                </text>
              </g>
            ))}
            {Array.from({ length: MONTHS / 2 + 1 }, (_, i) => i * 2).map((m) => (
              <text key={m} x={x(m)} y={height - 10} textAnchor="middle" fontSize={12} fill={C.axis}>
                {m}
              </text>
            ))}

            <g clipPath="url(#be-reveal)">
              <motion.path
                initial={false}
                animate={{ d: path(annual) }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                fill="none"
                stroke={C.annual}
                strokeWidth={2.5}
                strokeDasharray="7 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <motion.path
                initial={false}
                animate={{ d: path(monthly) }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                fill="none"
                stroke={C.monthly}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Break-even markers, after the lines have drawn. */}
            <g style={{ opacity: seen ? 1 : 0, transition: 'opacity 0.4s ease 1.2s' }}>
              {beA !== null && !sameMonth && (
                <g>
                  <circle cx={x(beA)} cy={y(annual[beA])} r={6} fill={C.annual} stroke={C.surface} strokeWidth={2.5} />
                  <text x={x(beA) + 10} y={y(annual[beA]) + 22} fontSize={13} fontWeight={700} fill="#fff">
                    Month {beA}
                  </text>
                </g>
              )}
              {beM !== null &&
                (() => {
                  // Up and to the left of the marker, where the lines are
                  // still low. On a narrow chart an early month leaves no
                  // room there, so the label pins to the plot's left edge
                  // and lifts clear of the line instead of running off it.
                  const lines = sameMonth ? [`Month ${beM}`, 'both plans'] : [`Month ${beM}`];
                  const w = Math.max(...lines.map((l) => l.length)) * 7.4;
                  const mx = x(beM);
                  const my = y(monthly[beM]);
                  const fits = mx - 10 - w >= M.left + 4;
                  const tx = fits ? mx - 10 : M.left + 4;
                  const ty = my - 12 - (lines.length - 1) * 15 - (fits ? 0 : 10);
                  return (
                    <g>
                      <circle cx={mx} cy={my} r={6} fill={C.monthly} stroke={C.surface} strokeWidth={2.5} />
                      <text x={tx} y={ty} textAnchor={fits ? 'end' : 'start'} fontSize={13} fontWeight={700} fill="#fff">
                        {lines.map((l, i) => (
                          <tspan key={l} x={tx} dy={i ? 15 : 0} fontWeight={i ? 500 : 700} fill={i ? MUTED : '#fff'}>
                            {l}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                })()}
            </g>

            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + plotH} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                <circle cx={x(hover)} cy={y(annual[hover])} r={5} fill={C.annual} stroke={C.surface} strokeWidth={2} />
                <circle cx={x(hover)} cy={y(monthly[hover])} r={5} fill={C.monthly} stroke={C.surface} strokeWidth={2} />
              </g>
            )}

            <rect
              x={M.left}
              y={M.top}
              width={plotW}
              height={plotH}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}

        {hover !== null && width > 0 && (
          <div
            className="pointer-events-none absolute z-10 min-w-[190px] rounded-xl border border-white/10 px-3.5 py-2.5 shadow-xl"
            style={{
              left: x(hover) > width / 2 ? x(hover) - 206 : x(hover) + 14,
              top: M.top + 6,
              background: 'rgba(8,13,26,0.96)',
            }}
          >
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
              {hover === 0 ? 'At signing' : `Month ${hover}`}
            </div>
            {[
              { label: 'Month to month', v: monthly[hover], color: C.monthly, dash: undefined },
              { label: 'Paid annually', v: annual[hover], color: C.annual, dash: '4 3' },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2.5 py-0.5">
                <svg width="16" height="4" aria-hidden="true">
                  <line x1="1" x2="15" y1="2" y2="2" stroke={r.color} strokeWidth="2.5" strokeDasharray={r.dash} />
                </svg>
                <span className="text-[15px] font-bold tabular-nums text-white">{usd(r.v)}</span>
                <span className="text-xs" style={{ color: MUTED }}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-1 text-center text-xs" style={{ color: MUTED }}>
        Months after signing
      </div>

      <table className="sr-only">
        <caption>
          Where the firm stands after everything paid to Nexli, {scenario.label.toLowerCase()} pace, by month
        </caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Month to month</th>
            <th scope="col">Paid annually</th>
          </tr>
        </thead>
        <tbody>
          {monthly.map((v, m) => (
            <tr key={m}>
              <th scope="row">{m}</th>
              <td>{usd(v)}</td>
              <td>{usd(annual[m])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
