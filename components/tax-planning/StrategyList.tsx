'use client';

// ---------------------------------------------------------------------------
// One card per strategy: what it is, what it's worth on these numbers, and
// the one or two inputs that drive it, right there in the card so nobody
// has to wonder where a figure came from.
//
// Each card's amount is its step in the sequential plan (lib/tax-planning/
// engine.ts), so the cards add up to the headline exactly. A strategy the
// engine says no to stays on screen with the reason: a list that only ever
// shows wins reads as a pitch.
// ---------------------------------------------------------------------------
import React from 'react';
import AnimatedNumber from '@/components/AnimatedNumber';
import {
  MAX_AUGUSTA_DAYS,
  type Answers,
  type PlanResult,
  type StepResult,
  type StrategyId,
} from '@/lib/tax-planning/engine';
import type { YearRates } from '@/lib/tax-planning/rates';
import { MoneyField, Segmented, Stepper, Switch } from './fields';
import { usd } from '@/lib/see-the-math';
import { money } from './format';

export default function StrategyList({
  result,
  answers,
  set,
  rates,
  salaryPct,
  firm,
}: {
  result: PlanResult;
  answers: Answers;
  set: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  rates: YearRates;
  salaryPct: number;
  firm: string;
}) {
  const toggle = (id: StrategyId, on: boolean) =>
    set('strategyOff', on ? answers.strategyOff.filter((x) => x !== id) : [...answers.strategyOff, id]);

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
      {result.steps.map((step) => (
        <Row key={step.id} step={step} onToggle={(on) => toggle(step.id, on)}>
          {step.status !== 'off' && (
            <Inputs
              id={step.id}
              answers={answers}
              set={set}
              result={result}
              rates={rates}
              salaryPct={salaryPct}
              firm={firm}
            />
          )}
        </Row>
      ))}
    </div>
  );
}

function Row({
  step,
  onToggle,
  children,
}: {
  step: StepResult;
  onToggle: (on: boolean) => void;
  children: React.ReactNode;
}) {
  const on = step.status !== 'off';
  const applied = step.status === 'applied';
  return (
    <div
      className={`flex flex-col rounded-2xl border p-4 transition-colors sm:p-5 ${
        applied ? 'border-white/12' : 'border-white/[0.07]'
      }`}
      style={{
        background: applied
          ? 'linear-gradient(160deg, rgba(16,28,51,0.9) 0%, rgba(10,16,32,0.9) 100%)'
          : 'rgba(255,255,255,0.02)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Switch checked={on} onChange={onToggle} label={step.title} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-[15px] font-bold leading-tight sm:text-base ${on ? 'text-white' : 'text-white/45'}`}>
              {step.title}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                step.kind === 'defers'
                  ? 'border-violet-400/40 text-violet-300'
                  : 'border-emerald-400/40 text-emerald-300'
              } ${on ? '' : 'opacity-50'}`}
            >
              {step.kind === 'defers' ? 'Defers' : 'Saves'}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          {applied ? (
            <AnimatedNumber value={Math.round(step.savings / 100) * 100} format={money} className="text-lg font-black text-emerald-300 sm:text-xl" />
          ) : (
            <span className="text-sm font-semibold text-white/30">{step.status === 'off' ? 'Off' : '$0'}</span>
          )}
        </div>
      </div>

      <div className={`mt-2 text-[13px] leading-relaxed sm:text-sm ${on ? 'text-white/60' : 'text-white/35'}`}>{step.how}</div>

      {children && <div className="mt-4">{children}</div>}

      {on && applied && step.detail && <div className="mt-3 text-xs leading-snug text-white/45">{step.detail}</div>}
      {on && step.status === 'skipped' && step.reason && (
        <div className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs leading-snug text-amber-100/85">
          {step.reason}
        </div>
      )}
    </div>
  );
}

/** Statutory limits print exactly (usd); estimates round to $100 (money). */
function Inputs({
  id,
  answers: a,
  set,
  result,
  rates,
  salaryPct,
  firm,
}: {
  id: StrategyId;
  answers: Answers;
  set: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  result: PlanResult;
  rates: YearRates;
  salaryPct: number;
  firm: string;
}) {
  switch (id) {
    case 'scorp':
      return (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-snug text-white/55">
          {firm} starts reasonable compensation at {salaryPct}% of profit. The real figure comes from your role and
          your market.
        </div>
      );
    case 'reimburse':
      return <MoneyField label="Reimbursed a year" value={a.reimburse} onChange={(v) => set('reimburse', v)} max={50_000} />;
    case 'augusta':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Stepper label="Days a year" value={a.augustaDays} max={MAX_AUGUSTA_DAYS} onChange={(v) => set('augustaDays', v)} />
          <MoneyField label="Fair rent a day" value={a.augustaRate} onChange={(v) => set('augustaRate', v)} max={10_000} />
        </div>
      );
    case 'kids':
      // No kids entered: the card's note points to "More detail" instead.
      if (a.kids <= 0) return null;
      return (
        <div className="grid grid-cols-2 gap-3">
          <Stepper
            label="Kids hired"
            value={Math.min(a.kidsHired, a.kids)}
            max={Math.max(0, a.kids)}
            onChange={(v) => set('kidsHired', v)}
          />
          <MoneyField
            label="Pay each, a year"
            value={a.kidWage}
            onChange={(v) => set('kidWage', v)}
            max={rates.standardDeduction.single}
            hint={`Up to ${usd(rates.standardDeduction.single)}`}
          />
        </div>
      );
    case 'retire':
      return (
        <MoneyField
          label="Put in a year"
          value={a.retireTarget ?? result.retirementDefault}
          onChange={(v) => set('retireTarget', v)}
          max={Math.max(0, Math.round(result.retirementCapacity))}
          hint={result.retirementCapacity > 0 ? `You could put in up to ${money(result.retirementCapacity)}.` : undefined}
        />
      );
    case 'hsa':
      return (
        <Segmented
          label="Coverage"
          value={a.hsaCoverage}
          onChange={(v) => set('hsaCoverage', v)}
          options={[
            { value: 'self', label: `Just you · ${usd(rates.hsaSelf)}` },
            { value: 'family', label: `Family · ${usd(rates.hsaFamily)}` },
          ]}
        />
      );
  }
}
