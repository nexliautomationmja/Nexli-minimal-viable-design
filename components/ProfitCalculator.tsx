'use client';

// Internal sales-call profit calculator.
// UI styled to match the Nexli portal "Launch Pad" onboarding page:
// Syne display headlines, white/5 cards, accent icon chips, shimmer pills,
// gradient progress ring, step timeline, and the shimmer-bordered centerpiece.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  DollarSign,
  Landmark,
  Repeat,
  RotateCcw,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import AnimatedNumber from './AnimatedNumber';
import {
  computeProfit,
  DEFAULT_INPUTS,
  formatClients,
  formatCurrency,
  formatMultiple,
  formatPercent,
  type Period,
  type ProfitInputs,
} from '../lib/profit-calc';

// ---------------------------------------------------------------------------
// Design tokens (mirrors nexli-portal onboarding-client.tsx)
// ---------------------------------------------------------------------------

const SYNE: React.CSSProperties = { fontFamily: 'var(--font-syne), sans-serif' };

const SHIMMER_CONIC =
  'conic-gradient(from 0deg at 50% 50%, #06B6D4, #3B82F6, #8B5CF6, #06B6D4, #3B82F6, #06B6D4)';
const SHIMMER_CONIC_WARM =
  'conic-gradient(from 0deg at 50% 50%, #3B82F6, #8B5CF6, #06B6D4, #F59E0B, #3B82F6)';

type Accent = 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber';

const ACCENT: Record<
  Accent,
  { chip: string; chipGlow: string; icon: string; check: string; badge: string; hover: string; dot: string }
> = {
  blue: {
    chip: 'bg-blue-500/20 border border-blue-500/30',
    chipGlow: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))',
    icon: 'text-blue-400',
    check: 'text-blue-500',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    hover: 'hover:bg-blue-500/10 hover:border-blue-500/30',
    dot: '#3B82F6',
  },
  violet: {
    chip: 'bg-violet-500/20 border border-violet-500/30',
    chipGlow: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3))',
    icon: 'text-violet-400',
    check: 'text-violet-500',
    badge: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    hover: 'hover:bg-violet-500/10 hover:border-violet-500/30',
    dot: '#8B5CF6',
  },
  cyan: {
    chip: 'bg-cyan-500/20 border border-cyan-500/30',
    chipGlow: 'drop-shadow(0 4px 8px rgba(6, 182, 212, 0.3))',
    icon: 'text-cyan-400',
    check: 'text-cyan-500',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    hover: 'hover:bg-cyan-500/10 hover:border-cyan-500/30',
    dot: '#06B6D4',
  },
  emerald: {
    chip: 'bg-emerald-500/20 border border-emerald-500/30',
    chipGlow: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))',
    icon: 'text-emerald-400',
    check: 'text-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    hover: 'hover:bg-emerald-500/10 hover:border-emerald-500/30',
    dot: '#10B981',
  },
  amber: {
    chip: 'bg-amber-500/20 border border-amber-500/30',
    chipGlow: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))',
    icon: 'text-amber-400',
    check: 'text-yellow-500',
    badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    hover: 'hover:bg-amber-500/10 hover:border-amber-500/30',
    dot: '#F59E0B',
  },
};

const GRADIENT_TEXT = 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500';
const MONEY_TEXT = 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500';
const LOSS_TEXT = 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-orange-400';

// ---------------------------------------------------------------------------
// Logo (inline SVG chevron + wordmark, matches marketing site)
// ---------------------------------------------------------------------------

const NexliLogo: React.FC = () => (
  <span className="inline-flex items-center gap-2">
    <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad-profit" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
      <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-profit)" />
      <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4" />
    </svg>
    <span className="text-lg font-black tracking-tighter text-white" style={SYNE}>
      NEXLI
    </span>
  </span>
);

// ---------------------------------------------------------------------------
// Shimmer-border pill (Launch Pad badge)
// ---------------------------------------------------------------------------

const ShimmerPill: React.FC<{ children: React.ReactNode; conic?: string }> = ({ children, conic = SHIMMER_CONIC_WARM }) => (
  <div className="relative inline-flex items-center rounded-full overflow-hidden p-[1.5px]">
    <span className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] opacity-80" style={{ background: conic }} />
    <span className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40" style={{ background: conic }} />
    <span className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#020617]">{children}</span>
  </div>
);

// ---------------------------------------------------------------------------
// Progress ring (gradient stroke) — shows share of profit the firm keeps
// ---------------------------------------------------------------------------

const ProgressRing: React.FC<{ percent: number; label: string; display: string }> = ({ percent, label, display }) => {
  const R = 52;
  const C = 2 * Math.PI * R;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = C - (clamped / 100) * C;
  return (
    <div className="relative w-[108px] h-[108px] sm:w-[120px] sm:h-[120px] shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="pc-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="url(#pc-ring)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white tabular-nums" style={{ letterSpacing: '-0.03em' }}>
          {display}
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Badge pill (Launch Pad "0 of 3 done" style) and period toggle
// ---------------------------------------------------------------------------

const Badge: React.FC<{ children: React.ReactNode; accent?: Accent | 'neutral' }> = ({ children, accent = 'neutral' }) => (
  <span
    className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
      accent === 'neutral' ? 'bg-white/5 text-neutral-400 border border-white/10' : ACCENT[accent].badge
    )}
  >
    {children}
  </span>
);

interface PeriodToggleProps {
  value: Period;
  onChange: (p: Period) => void;
  labels?: [string, string];
  layoutId: string;
}

const PeriodToggle: React.FC<PeriodToggleProps> = ({ value, onChange, labels = ['Monthly', 'Annual'], layoutId }) => {
  const options: Period[] = ['monthly', 'annual'];
  return (
    <div className="inline-flex p-0.5 rounded-full bg-white/5 border border-white/10">
      {options.map((opt, idx) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'relative px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer',
              active ? 'text-blue-300' : 'text-neutral-400 hover:text-white'
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-blue-500/20 border border-blue-500/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{labels[idx]}</span>
          </button>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Slider field: Launch Pad input + gradient range slider
// ---------------------------------------------------------------------------

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  adornment?: '$' | '%';
  hint?: React.ReactNode;
  accent?: Accent;
  children?: React.ReactNode;
}

const SliderField: React.FC<SliderFieldProps> = ({ label, value, onChange, min, max, step, adornment, hint, accent = 'blue', children }) => {
  const a = ACCENT[accent];
  const clamped = Math.min(Math.max(value, min), max);
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const n = Number(raw);
    onChange(Number.isFinite(n) ? Math.max(0, n) : 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</span>
        {children}
      </div>

      <div className="relative">
        {adornment === '$' && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500 pointer-events-none">$</span>
        )}
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={value}
          onChange={handleNumber}
          onFocus={(e) => e.target.select()}
          className={cn(
            'pc-input font-bold text-base sm:text-lg tabular-nums',
            adornment === '$' ? 'pl-7 pr-4' : adornment === '%' ? 'pl-4 pr-9' : 'px-4'
          )}
        />
        {adornment === '%' && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500 pointer-events-none">%</span>
        )}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="pc-range mt-2"
        style={{
          background: `linear-gradient(to right, #3B82F6 0%, ${a.dot} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
        }}
      />

      <div className="flex justify-between mt-0.5 text-[10px] text-neutral-500 tabular-nums">
        <span>{adornment === '$' ? formatCurrency(min) : `${min}${adornment ?? ''}`}</span>
        {hint ? <span className="text-neutral-400">{hint}</span> : null}
        <span>{adornment === '$' ? formatCurrency(max) : `${max}${adornment ?? ''}`}+</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Stat tile (Centerpiece feature-tile style)
// ---------------------------------------------------------------------------

interface StatTileProps {
  icon: React.ElementType;
  label: string;
  value: number | null;
  format: (n: number) => string;
  sub?: React.ReactNode;
  accent?: Accent;
}

const StatTile: React.FC<StatTileProps> = ({ icon: Icon, label, value, format, sub, accent = 'cyan' }) => {
  const a = ACCENT[accent];
  return (
    <div className={cn('rounded-xl px-3 py-2.5 border bg-white/5 border-white/10 transition-all duration-300', a.hover)}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={14} className={a.check} />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60 leading-tight">{label}</span>
      </div>
      <div className="text-lg sm:text-xl font-black tracking-tight text-white leading-none">
        {value === null ? <span className="text-neutral-500">—</span> : <AnimatedNumber value={value} format={format} />}
      </div>
      {sub ? <p className="mt-1 text-[11px] text-white/60 leading-snug">{sub}</p> : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step heading with timeline dot
// ---------------------------------------------------------------------------

const StepHeading: React.FC<{ step: number; title: string; right?: React.ReactNode; pulse?: boolean }> = ({ step, title, right, pulse }) => (
  <div className="flex items-center gap-3 mb-3">
    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-black border border-white/10 shrink-0">
      <div className={cn('h-3.5 w-3.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border border-blue-600', pulse ? 'animate-pulse' : 'opacity-80')} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Step {step}</div>
      <h2 className="text-base sm:text-lg font-bold text-white leading-tight" style={SYNE}>
        {title}
      </h2>
    </div>
    {right}
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ProfitCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<ProfitInputs>(DEFAULT_INPUTS);
  const [view, setView] = useState<Period>('monthly');

  const results = useMemo(() => computeProfit(inputs, view), [inputs, view]);

  const set =
    <K extends keyof ProfitInputs>(key: K) =>
    (value: ProfitInputs[K]) =>
      setInputs((prev) => ({ ...prev, [key]: value }));

  const feeIsAnnual = inputs.nexliFeePeriod === 'annual';
  const periodShort = view === 'annual' ? '/yr' : '/mo';
  const periodWord = view === 'annual' ? 'a year' : 'a month';
  const periodLabel = view === 'annual' ? 'this year' : 'this month';
  const negative = results.netProfit < 0;

  // Share of gross profit the firm keeps after paying Nexli
  const keepPct = results.grossProfit > 0 ? (results.netProfit / results.grossProfit) * 100 : 0;

  const flow: { label: string; value: number; format: (n: number) => string; money?: boolean }[] = [
    { label: `Consults ${periodShort}`, value: results.consults, format: formatClients },
    { label: 'Closed', value: results.closedClients, format: formatClients },
    { label: 'Revenue', value: results.grossRevenue, format: formatCurrency },
    { label: 'Profit', value: results.grossProfit, format: formatCurrency },
    { label: 'Net', value: results.netProfit, format: formatCurrency, money: true },
  ];

  const chips: [Accent, React.ElementType][] = [
    ['blue', Users],
    ['violet', Calculator],
    ['cyan', BarChart3],
    ['amber', Landmark],
    ['emerald', TrendingUp],
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#020617] text-white">
      <style>{`
        @keyframes pc-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pc-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .pc-card { animation: pc-fade-up 0.5s ease-out both; }
        .pc-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding-top: 0.45rem;
          padding-bottom: 0.45rem;
          color: #fff;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .pc-input:focus { border-color: #3B82F6; }
        .pc-input::-webkit-outer-spin-button, .pc-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .pc-input[type=number] { -moz-appearance: textfield; appearance: textfield; }
        .pc-range {
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
        }
        .pc-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px; height: 18px;
          border-radius: 9999px;
          background: #020617;
          border: 2px solid #06B6D4;
          box-shadow: 0 0 0 3px rgba(6,182,212,0.2), 0 4px 10px rgba(0,0,0,0.4);
          transition: transform 0.15s ease;
        }
        .pc-range::-webkit-slider-thumb:hover { transform: scale(1.12); }
        .pc-range::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 9999px;
          background: #020617;
          border: 2px solid #06B6D4;
          box-shadow: 0 0 0 3px rgba(6,182,212,0.2), 0 4px 10px rgba(0,0,0,0.4);
        }
      `}</style>

      {/* Ambient brand glows */}
      <div
        className="pointer-events-none fixed -top-40 -right-32 w-[560px] h-[560px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.10) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed top-1/3 -left-40 w-[480px] h-[480px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed -bottom-32 -right-24 w-[480px] h-[480px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* ─── Header ─── */}
        <header className="flex items-center justify-between pc-card">
          <NexliLogo />
          <ShimmerPill>
            <Calculator size={14} className="text-blue-400" />
            <span className="text-white text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">Profit Calculator</span>
          </ShimmerPill>
        </header>

        {/* ─── Hero ─── */}
        <section className="pc-card" style={{ animationDelay: '0.05s' }}>
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tighter text-white" style={SYNE}>
                Let&apos;s run{' '}
                <span className={GRADIENT_TEXT}>your numbers.</span>
              </h1>
              <p className="text-[13px] mt-2 leading-relaxed text-neutral-300 max-w-xl">
                We hand you{' '}
                <span className="text-white font-semibold tabular-nums">
                  <AnimatedNumber value={inputs.consultsPerMonth} format={formatClients} /> consults a month
                </span>{' '}
                with people who have already paid{' '}
                <span className="text-white font-semibold tabular-nums">{formatCurrency(inputs.avgTaxPaid)}+</span> to the IRS. Here is
                what that does to your bottom line.
              </p>
              <p className="text-[13px] mt-1.5 leading-relaxed">
                <span className="text-white font-semibold">Drag the sliders. The numbers move with you.</span> ⚡
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-3.5 justify-center sm:justify-start">
                {/* Floating icon chips */}
                <div className="flex gap-2.5">
                  {chips.map(([accent, Icon], i) => (
                    <div
                      key={accent}
                      className={cn('w-10 h-10 rounded-xl flex items-center justify-center', ACCENT[accent].chip)}
                      style={{ filter: ACCENT[accent].chipGlow, animation: `pc-float 3s ease-in-out ${i * 0.35}s infinite` }}
                    >
                      <Icon size={20} className={ACCENT[accent].icon} />
                    </div>
                  ))}
                </div>

                <div className="inline-flex flex-col items-center sm:items-start">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Net profit {periodLabel}</span>
                  <span className={cn('text-lg font-bold leading-tight', negative ? LOSS_TEXT : GRADIENT_TEXT)}>
                    <AnimatedNumber value={results.netProfit} />
                  </span>
                </div>
              </div>
            </div>

            <ProgressRing
              percent={keepPct}
              display={results.grossProfit > 0 ? `${Math.round(keepPct)}%` : '—'}
              label="You keep"
            />
          </div>
        </section>

        {/* ─── Two columns: inputs | results ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-6 items-start">
          {/* Step 1: Their numbers */}
          <section className="pc-card" style={{ animationDelay: '0.1s' }}>
            <StepHeading
              step={1}
              title="Their numbers"
              pulse
              right={
                <button
                  type="button"
                  onClick={() => setInputs(DEFAULT_INPUTS)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  <RotateCcw size={11} />
                  Reset
                </button>
              }
            />

            <div className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/10 space-y-3.5">
              <SliderField label="Consults we deliver per month" value={inputs.consultsPerMonth} onChange={set('consultsPerMonth')} min={0} max={200} step={5} accent="blue" />

              <SliderField
                label="Their close rate"
                value={inputs.closeRate}
                onChange={set('closeRate')}
                min={0}
                max={100}
                step={1}
                adornment="%"
                accent="violet"
                hint={`${formatClients(results.closedClients)} closed ${periodShort}`}
              />

              <SliderField
                label="Average engagement fee"
                value={inputs.engagementFee}
                onChange={set('engagementFee')}
                min={0}
                max={100000}
                step={500}
                adornment="$"
                accent="emerald"
                hint="one-time, per closed client"
              />

              <SliderField
                label="Recurring retainer per client"
                value={inputs.recurringMonthly}
                onChange={set('recurringMonthly')}
                min={0}
                max={5000}
                step={50}
                adornment="$"
                accent="emerald"
                hint={inputs.recurringMonthly > 0 ? `per month, ${formatCurrency(inputs.recurringMonthly * 12)}/yr per client` : 'per month, optional'}
              />

              <SliderField label="Their profit margin" value={inputs.profitMargin} onChange={set('profitMargin')} min={0} max={100} step={1} adornment="%" accent="cyan" />

              <SliderField
                label="What they pay Nexli"
                value={inputs.nexliFee}
                onChange={set('nexliFee')}
                min={0}
                max={feeIsAnnual ? 300000 : 25000}
                step={feeIsAnnual ? 5000 : 250}
                adornment="$"
                accent="blue"
                hint={feeIsAnnual ? `= ${formatCurrency(inputs.nexliFee / 12)}/mo` : `= ${formatCurrency(inputs.nexliFee * 12)}/yr`}
              >
                <PeriodToggle value={inputs.nexliFeePeriod} onChange={set('nexliFeePeriod')} labels={['Per month', 'Per year']} layoutId="fee-pill" />
              </SliderField>

              <div className="pt-3 border-t border-white/10">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1.5">Avg tax each lead already paid</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500 pointer-events-none">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={5000}
                    value={inputs.avgTaxPaid}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      set('avgTaxPaid')(Number.isFinite(n) ? Math.max(0, n) : 0);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="pc-input pl-7 pr-4 text-sm font-bold tabular-nums"
                  />
                </div>
                <p className="mt-1 text-[10px] text-neutral-500">Context only. Does not affect the math.</p>
              </div>
            </div>
          </section>

          {/* Step 2: The bottom line */}
          <section className="pc-card lg:sticky lg:top-6 self-start" style={{ animationDelay: '0.15s' }}>
            <StepHeading
              step={2}
              title="The bottom line"
              right={<PeriodToggle value={view} onChange={setView} layoutId="view-pill" />}
            />

            {/* Centerpiece */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-[1.5px]">
              <span className="absolute inset-[-200%] animate-[shimmer_6s_linear_infinite] opacity-90" style={{ background: SHIMMER_CONIC }} />
              <span className="absolute inset-[-200%] animate-[shimmer_6s_linear_infinite] blur-xl opacity-30" style={{ background: SHIMMER_CONIC }} />
              <div className="relative z-10 rounded-[14px] sm:rounded-[22px] p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-cyan-950/40 to-slate-950">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/20 border border-cyan-500/30"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))' }}
                      >
                        <TrendingUp size={22} className="text-cyan-500" />
                      </div>
                      <span className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-cyan-500" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase text-cyan-300">
                        <Star size={11} className="text-cyan-400" style={{ fill: 'currentColor' }} />
                        Net profit {periodLabel}
                      </span>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">After paying Nexli</h3>
                    </div>
                    <Badge accent="cyan">{results.roiMultiple !== null ? `${formatMultiple(results.roiMultiple)} return` : 'no fee'}</Badge>
                  </div>

                  <div className={cn('mt-3 text-4xl sm:text-5xl font-black tracking-tighter leading-none', negative ? LOSS_TEXT : MONEY_TEXT)}>
                    <AnimatedNumber value={results.netProfit} />
                  </div>

                  <p className="text-sm leading-relaxed text-neutral-300 mt-2">
                    {negative ? (
                      <>
                        At these numbers you&apos;d be short{' '}
                        <span className="text-white font-semibold">
                          <AnimatedNumber value={Math.abs(results.netProfit)} />
                        </span>{' '}
                        {periodWord}. Let&apos;s move the sliders.
                      </>
                    ) : results.nexliCost === 0 ? (
                      <>
                        Would it be ridiculous to make{' '}
                        <span className="text-white font-semibold">
                          <AnimatedNumber value={results.netProfit} />
                        </span>{' '}
                        {periodWord}?
                      </>
                    ) : (
                      <>
                        Would it be ridiculous to make{' '}
                        <span className="text-white font-semibold">
                          <AnimatedNumber value={results.netProfit} />
                        </span>{' '}
                        {periodWord}, even though you pay us{' '}
                        <span className="text-white font-semibold">
                          <AnimatedNumber value={results.nexliCost} />
                        </span>
                        ?
                      </>
                    )}
                  </p>

                  {/* Flow */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-3 gap-x-2 mt-3.5 rounded-xl px-3 py-2.5 bg-white/5 border border-white/10">
                    {flow.map((n, i) => (
                      <div key={n.label} className="relative text-center">
                        {i > 0 && <ArrowRight size={12} className="hidden sm:block absolute -left-[10px] top-1/2 -translate-y-1/2 text-cyan-500/50" />}
                        <div className="text-[9px] font-black tracking-[0.15em] uppercase text-white/50 mb-0.5">{n.label}</div>
                        <div className={cn('text-sm sm:text-base font-black tracking-tight leading-none', n.money ? (negative ? LOSS_TEXT : MONEY_TEXT) : 'text-white')}>
                          <AnimatedNumber value={n.value} format={n.format} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stat tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 mt-3">
                    <StatTile
                      icon={Users}
                      label={`Closed ${periodShort}`}
                      value={results.closedClients}
                      format={formatClients}
                      sub={`${formatClients(results.consults)} consults at ${inputs.closeRate}%`}
                      accent="blue"
                    />
                    <StatTile
                      icon={DollarSign}
                      label="Gross revenue"
                      value={results.grossRevenue}
                      format={formatCurrency}
                      sub={
                        results.recurringRevenue > 0
                          ? `${formatCurrency(results.newEngagementRevenue)} + ${formatCurrency(results.recurringRevenue)}${periodShort} recurring`
                          : `${formatClients(results.closedClients)} × ${formatCurrency(inputs.engagementFee)}`
                      }
                      accent="emerald"
                    />
                    <StatTile icon={BarChart3} label="Gross profit" value={results.grossProfit} format={formatCurrency} sub={`at a ${inputs.profitMargin}% margin`} accent="emerald" />
                    <StatTile
                      icon={Zap}
                      label="Nexli investment"
                      value={results.nexliCost}
                      format={formatCurrency}
                      sub={results.costPerClosedClient !== null ? `${formatCurrency(results.costPerClosedClient)} per closed client` : `per ${periodWord.replace('a ', '')}`}
                      accent="blue"
                    />
                    <StatTile
                      icon={Target}
                      label="Break-even"
                      value={results.breakEvenClients}
                      format={(n) => `${formatClients(n)} client${n === 1 ? '' : 's'}`}
                      sub={results.breakEvenClients !== null ? `closed ${periodShort} covers our entire fee` : 'needs a fee and margin'}
                      accent="cyan"
                    />
                    <StatTile
                      icon={Landmark}
                      label="Tax already paid"
                      value={results.totalTaxAlreadyPaid}
                      format={formatCurrency}
                      sub={`${formatClients(results.closedClients)} clients × ${formatCurrency(inputs.avgTaxPaid)} to the IRS`}
                      accent="amber"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recurring vs Nexli fee, always on a monthly basis */}
            {inputs.recurringMonthly > 0 && (
              <div className="rounded-2xl px-4 py-3 mt-3 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', ACCENT.emerald.chip)} style={{ filter: ACCENT.emerald.chipGlow }}>
                    <Repeat size={15} className={ACCENT.emerald.icon} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-500">Recurring covers Nexli</span>
                </div>
                <div className="text-xl font-black text-white tabular-nums">
                  <AnimatedNumber value={results.recurringMonthlyRevenue} format={formatCurrency} />
                  <span className="text-sm text-neutral-400 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {results.recurringCoveragePct === null
                    ? `recurring revenue from the ${formatClients(inputs.consultsPerMonth * (inputs.closeRate / 100))} clients closed each month`
                    : results.recurringCoveragePct >= 100
                      ? `covers our entire ${formatCurrency(results.monthlyNexliFee)}/mo fee before a single engagement fee`
                      : `covers ${formatPercent(results.recurringCoveragePct)} of our ${formatCurrency(results.monthlyNexliFee)}/mo fee`}
                </p>
              </div>
            )}

            {/* Secondary stats */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', ACCENT.violet.chip)} style={{ filter: ACCENT.violet.chipGlow }}>
                    <TrendingUp size={15} className={ACCENT.violet.icon} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-500">Profit per $1 paid</span>
                </div>
                <div className="text-xl font-black text-white tabular-nums">
                  {results.roiMultiple !== null ? <AnimatedNumber value={results.roiMultiple} format={formatCurrency} /> : <span className="text-neutral-500">—</span>}
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">kept for every dollar paid to Nexli</p>
              </div>
              <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', ACCENT.amber.chip)} style={{ filter: ACCENT.amber.chipGlow }}>
                    <DollarSign size={15} className={ACCENT.amber.icon} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-500">Revenue per $1 paid</span>
                </div>
                <div className="text-xl font-black text-white tabular-nums">
                  {results.revenuePerDollar !== null ? <AnimatedNumber value={results.revenuePerDollar} format={formatCurrency} /> : <span className="text-neutral-500">—</span>}
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">gross revenue for every dollar paid to Nexli</p>
              </div>
            </div>
          </section>
        </div>

        <p className="text-center text-[11px] text-neutral-600">Nexli Automation · Internal sales tool</p>
      </div>
    </div>
  );
};

export default ProfitCalculator;
