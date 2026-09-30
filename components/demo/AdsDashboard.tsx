'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CircleDollarSign, MousePointerClick, Target, Users } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';

// ---------------------------------------------------------------------------
// The ads half of the system, shown rather than described.
//
// A deliberately fake but honest dashboard. The vocabulary is the product's
// own — Qualified / Booked Calls / Campaign / Creative and the
// Qualified-Raw-Disqualified badge trio all come from
// dashboard/src/app/api/dashboard/ad-analytics/route.ts, so this reads as the
// real reporting surface rather than a marketing invention.
//
// Two honesty constraints baked in:
//
//  1. The 90-day column shows exactly 50 qualified leads, because that is the
//     number the guarantee on this same page promises. If these two ever
//     disagree the page argues with itself.
//  2. The product does not track ad spend or ROAS yet — there is no Meta
//     Insights integration. So the return figure is not asserted: it is
//     computed live from a close rate the visitor sets themselves, and the
//     assumption is printed next to the number.
// ---------------------------------------------------------------------------

type RangeKey = '7d' | '30d' | '90d';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
];

interface RangeData {
  qualified: number;
  booked: number;
  spend: number;
  weeks: { label: string; leads: number }[];
}

// 90d is the anchor: 50 qualified, matching the guarantee. 7d and 30d are that
// pace scaled back, with the ramp you would actually see while creative is
// still being tested.
const DATA: Record<RangeKey, RangeData> = {
  '7d': {
    qualified: 4,
    booked: 3,
    spend: 1_400,
    weeks: [{ label: 'Mon', leads: 1 }, { label: 'Tue', leads: 0 }, { label: 'Wed', leads: 1 }, { label: 'Thu', leads: 0 }, { label: 'Fri', leads: 2 }],
  },
  '30d': {
    qualified: 16,
    booked: 11,
    spend: 6_000,
    weeks: [{ label: 'Wk 1', leads: 2 }, { label: 'Wk 2', leads: 3 }, { label: 'Wk 3', leads: 5 }, { label: 'Wk 4', leads: 6 }],
  },
  '90d': {
    qualified: 50,
    booked: 34,
    spend: 18_000,
    weeks: [{ label: 'Mo 1', leads: 9 }, { label: 'Mo 2', leads: 17 }, { label: 'Mo 3', leads: 24 }],
  },
};

const CAMPAIGNS: { name: string; creative: string; leads: number; qualified: number; booked: number }[] = [
  { name: 'Advisory — Business Owners', creative: 'owner-story-v3', leads: 41, qualified: 22, booked: 15 },
  { name: 'Advisory — High Earners', creative: 'tax-bill-hook', leads: 33, qualified: 17, booked: 12 },
  { name: 'Retargeting — Site Visitors', creative: 'portal-walkthrough', leads: 19, qualified: 11, booked: 7 },
];

const FEED: { name: string; firm: string; city: string; score: 'Qualified' | 'Raw' }[] = [
  { name: 'Dana W.', firm: 'Whitfield CPA Group', city: 'Denver, CO', score: 'Qualified' },
  { name: 'Marcus T.', firm: 'Trent & Associates', city: 'Austin, TX', score: 'Qualified' },
  { name: 'Priya R.', firm: 'Raman Tax Partners', city: 'Chicago, IL', score: 'Raw' },
  { name: 'Ellis B.', firm: 'Brandt Advisory', city: 'Phoenix, AZ', score: 'Qualified' },
  { name: 'Joanne K.', firm: 'Kessler & Kim', city: 'Seattle, WA', score: 'Qualified' },
];

const ENGAGEMENT_AVG = 15_000;

const usd0 = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const int = (n: number) => Math.round(n).toLocaleString('en-US');
const mult = (n: number) => `${n.toFixed(1)}x`;

const SCORE_STYLE: Record<string, { bg: string; fg: string }> = {
  // The product's own colours: emerald / grey / red.
  Qualified: { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  Raw: { bg: 'rgba(148,163,184,0.15)', fg: '#cbd5e1' },
};

const AdsDashboard: React.FC = () => {
  const [range, setRange] = useState<RangeKey>('90d');
  const [closeRate, setCloseRate] = useState(20);

  const d = DATA[range];
  const { cpl, closed, revenue, roas } = useMemo(() => {
    const c = (d.qualified * closeRate) / 100;
    const rev = c * ENGAGEMENT_AVG;
    return {
      cpl: d.qualified ? d.spend / d.qualified : 0,
      closed: c,
      revenue: rev,
      roas: d.spend ? rev / d.spend : 0,
    };
  }, [d, closeRate]);

  const maxWeek = Math.max(...d.weeks.map((w) => w.leads), 1);
  // Qualified is a subset — roughly half of everything the ads bring in clears
  // the criteria, which is what the campaign table below also shows.
  const totalLeads = Math.round(d.qualified * 1.86);

  const tiles = [
    { label: 'Qualified leads', value: d.qualified, format: int, Icon: Users, accent: '#60a5fa' },
    { label: 'Booked calls', value: d.booked, format: int, Icon: MousePointerClick, accent: '#06B6D4' },
    { label: 'Ad spend', value: d.spend, format: usd0, Icon: CircleDollarSign, accent: '#a78bfa' },
    { label: 'Cost per qualified lead', value: cpl, format: usd0, Icon: Target, accent: '#fbbf24' },
  ];

  return (
    <div
      className="rounded-2xl md:rounded-3xl border overflow-hidden"
      style={{ backgroundColor: '#0b1220', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      {/* Window chrome, so it reads as a product and not a marketing panel */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        </span>
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Campaign performance — Meta Ads
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Range toggle */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-bold text-white">Your firm, last {RANGES.find((r) => r.key === range)!.label}</p>
          <div className="inline-flex p-0.5 rounded-full bg-white/5 border border-white/10">
            {RANGES.map((r) => {
              const active = range === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRange(r.key)}
                  className={`relative px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                    active ? 'text-blue-300' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="ads-range"
                      className="absolute inset-0 rounded-full bg-blue-500/20 border border-blue-500/30"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{r.key}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tiles.map((t) => (
            <div
              key={t.label}
              className="rounded-xl border p-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {t.label}
                </span>
                <span
                  className="inline-flex w-7 h-7 shrink-0 rounded-lg items-center justify-center"
                  style={{ backgroundColor: `${t.accent}1f`, color: t.accent }}
                >
                  <t.Icon size={14} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-black text-white">
                <AnimatedNumber value={t.value} format={t.format} animateOnView />
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4">
          {/* Leads over time */}
          <div
            className="rounded-xl border p-4 flex flex-col"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Qualified leads over time
            </p>
            <div className="mt-4 space-y-2.5">
              {d.weeks.map((w) => (
                <div key={w.label} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {w.label}
                  </span>
                  <span className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(96,165,250,0.12)' }}>
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
                      initial={false}
                      animate={{ width: `${(w.leads / maxWeek) * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right text-[11px] font-bold text-white tabular-nums">{w.leads}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px]" style={{ color: '#34d399' }}>
              <ArrowUpRight size={13} aria-hidden="true" />
              Volume climbs as creative and audiences get tested
            </p>

            {/* Keeps this panel level with the taller one beside it, and the
                two rates are worth stating anyway. */}
            <dl
              className="mt-auto pt-4 grid grid-cols-2 gap-3 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div>
                <dt className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Total leads</dt>
                <dd className="mt-0.5 text-lg font-black text-white tabular-nums">{int(totalLeads)}</dd>
              </div>
              <div>
                <dt className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Qualified rate</dt>
                <dd className="mt-0.5 text-lg font-black text-white tabular-nums">
                  {Math.round((d.qualified / totalLeads) * 100)}%
                </dd>
              </div>
            </dl>
          </div>

          {/* What it is worth — driven by the visitor's own close rate */}
          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.25)' }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: '#34d399' }}>
              What that is worth to you
            </p>

            <label htmlFor="ads-close-rate" className="mt-4 flex items-center justify-between text-xs">
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Your close rate</span>
              <span className="font-black text-white tabular-nums">{closeRate}%</span>
            </label>
            <input
              id="ads-close-rate"
              type="range"
              min={5}
              max={60}
              step={1}
              value={closeRate}
              onChange={(e) => setCloseRate(Number(e.target.value))}
              className="ads-range mt-2 w-full"
              style={{
                background: `linear-gradient(to right, #34d399 0%, #34d399 ${((closeRate - 5) / 55) * 100}%, rgba(255,255,255,0.08) ${((closeRate - 5) / 55) * 100}%)`,
              }}
            />

            <dl className="mt-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Engagements closed</dt>
                <dd className="text-base font-black text-white">
                  <AnimatedNumber value={closed} format={(n) => n.toFixed(1)} />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Revenue at {usd0(ENGAGEMENT_AVG)} average</dt>
                <dd className="text-base font-black text-white">
                  <AnimatedNumber value={revenue} format={usd0} />
                </dd>
              </div>
              <div
                className="flex items-baseline justify-between gap-3 pt-2.5 border-t"
                style={{ borderColor: 'rgba(52,211,153,0.2)' }}
              >
                <dt className="text-xs font-bold" style={{ color: '#34d399' }}>Return on ad spend</dt>
                <dd className="text-2xl font-black" style={{ color: '#34d399' }}>
                  <AnimatedNumber value={roas} format={mult} />
                </dd>
              </div>
            </dl>

            <p className="mt-3 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Your number, not ours — move the slider. Revenue assumes a {usd0(ENGAGEMENT_AVG)} average
              engagement; the leads are what we guarantee, the close rate is yours.
            </p>
          </div>
        </div>

        {/* Campaign table */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Campaign', 'Creative', 'Leads', 'Qualified', 'Booked'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em]"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAMPAIGNS.map((c) => (
                  <tr key={c.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-3 text-xs font-semibold text-white whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {c.creative}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.leads}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums"
                        style={{ background: SCORE_STYLE.Qualified.bg, color: SCORE_STYLE.Qualified.fg }}
                      >
                        {c.qualified}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.booked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead feed */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Leads arriving
          </p>
          <ul className="mt-3 space-y-2 list-none p-0 m-0">
            {FEED.map((f, i) => (
              <motion.li
                key={f.name}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span
                  className="inline-flex w-7 h-7 shrink-0 rounded-full items-center justify-center text-[10px] font-black"
                  style={{ background: 'rgba(96,165,250,0.15)', color: '#93c5fd' }}
                >
                  {f.name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-white truncate">
                    {f.name} — {f.firm}
                  </span>
                  <span className="block text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {f.city}
                  </span>
                </span>
                <span
                  className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: SCORE_STYLE[f.score].bg, color: SCORE_STYLE[f.score].fg }}
                >
                  {f.score}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ads-range { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; outline: none; cursor: pointer; }
        .ads-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 3px solid #34d399; cursor: pointer; }
        .ads-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 3px solid #34d399; cursor: pointer; }
        .ads-range:focus-visible { outline: 2px solid #34d399; outline-offset: 3px; }
      `,
        }}
      />
    </div>
  );
};

export default AdsDashboard;
