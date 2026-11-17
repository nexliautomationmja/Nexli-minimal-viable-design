'use client';

// ---------------------------------------------------------------------------
// The Tax Planning Tool's inputs, in /math's visual language.
//
// Money is a text field, not type="number": a number input can't show
// "1,050,000", and a prospect reading their own revenue back without commas
// misreads it. Digits only go in; the value is reformatted as they type.
//
// Labels are <label>/<div>, never <p>: globals.css colours <p> outside any
// layer, which beats Tailwind's text-* classes (see components/math/ui.tsx).
// ---------------------------------------------------------------------------
import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ChevronDown } from 'lucide-react';

const LABEL = 'block text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 sm:text-[11px]';
const HINT = 'mt-1.5 text-xs leading-snug text-white/45';
export const INPUT =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-base font-bold text-white tabular-nums outline-none transition-colors placeholder:font-semibold placeholder:text-white/25 hover:border-white/20 focus:border-cyan-400/60 focus:bg-white/[0.06] sm:text-[17px]';

export function Field({
  label,
  hint,
  htmlFor,
  aside,
  children,
  className = '',
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  /** Right of the label: a live growth chip, a margin. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* A fixed height, so a field with a chip beside its label (growth)
          lines up with the field next to it. */}
      <div className="mb-1.5 flex h-5 items-center justify-between gap-2">
        <label htmlFor={htmlFor} className={LABEL}>
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint && <div className={HINT}>{hint}</div>}
    </div>
  );
}

export function MoneyField({
  label,
  value,
  onChange,
  hint,
  aside,
  max = 100_000_000,
  placeholder = '0',
  className,
}: {
  label: React.ReactNode;
  value: number;
  onChange: (n: number) => void;
  hint?: React.ReactNode;
  aside?: React.ReactNode;
  max?: number;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} aside={aside} className={className}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value > 0 ? Math.round(value).toLocaleString('en-US') : ''}
          placeholder={placeholder}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
            onChange(digits ? Math.min(max, parseInt(digits, 10)) : 0);
          }}
          className={`${INPUT} pl-7 pr-3`}
        />
      </div>
    </Field>
  );
}

/** A small whole number with − and + either side: days, kids. */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max,
  hint,
  className,
}: {
  label: React.ReactNode;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max: number;
  hint?: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:border-white/25 hover:text-white disabled:opacity-30 disabled:hover:border-white/10';
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= min} aria-label="Fewer">
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={String(value)}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
            set(digits ? parseInt(digits, 10) : 0);
          }}
          className={`${INPUT} min-w-0 px-2 text-center`}
        />
        <button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= max} aria-label="More">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </Field>
  );
}

/**
 * A row of pressed buttons with /math's sliding blue→cyan pill
 * (components/math/ScenarioBits.tsx). A grid rather than inline-flex, so a
 * four-way choice wraps to two rows on a phone instead of overflowing.
 */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
  cols = 'grid-cols-2',
}: {
  label: React.ReactNode;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: React.ReactNode;
  /** Tailwind grid-cols classes. */
  cols?: string;
}) {
  const layoutId = useId();
  return (
    <Field label={label} hint={hint}>
      <div role="group" className={`grid gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 ${cols}`}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={`relative rounded-xl px-2 py-2 text-[13px] font-semibold leading-tight transition-colors sm:text-sm ${
                on ? 'text-white' : 'text-white/55 hover:text-white/90'
              }`}
            >
              {on && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  hint?: React.ReactNode;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT} cursor-pointer appearance-none pl-3.5 pr-10 [&>option]:bg-[#0d1526]`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (on: boolean) => void;
  /** Read by screen readers; the visible label sits beside it. */
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        checked ? 'border-transparent bg-gradient-to-r from-blue-500 to-cyan-400' : 'border-white/15 bg-white/[0.06]'
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

/** A panel of questions, optionally numbered. */
export function QuestionPanel({
  step,
  title,
  sub,
  children,
}: {
  step?: number;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border border-white/10 p-4 sm:p-6"
      style={{ background: 'linear-gradient(160deg, rgba(16,28,51,0.85) 0%, rgba(10,16,32,0.85) 100%)' }}
    >
      <div className="mb-5 flex items-start gap-3">
        {step != null && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[13px] font-black text-white shadow-lg shadow-blue-500/25">
            {step}
          </span>
        )}
        <div>
          <div className="text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">{title}</div>
          {sub && <div className="mt-0.5 text-[13px] leading-snug text-white/50 sm:text-sm">{sub}</div>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/**
 * A percentage, typed as text so "2" on the way to "25" and "5." on the way
 * to "5.5" survive mid-entry. `empty` decides what clearing it means: null
 * for an optional override, or "keep the last value" for a required one.
 */
export function PercentField({
  label,
  value,
  onChange,
  max = 100,
  placeholder,
  hint,
  emptyIsNull = false,
  className,
}: {
  label: React.ReactNode;
  value: number | null;
  onChange: (v: number | null) => void;
  max?: number;
  placeholder?: string;
  hint?: React.ReactNode;
  emptyIsNull?: boolean;
  className?: string;
}) {
  const id = useId();
  const show = (v: number | null) => (v == null ? '' : String(Math.round(v * 10) / 10));
  const [text, setText] = React.useState(show(value));
  // Follow changes made elsewhere (a typed profit moves the margin; Start
  // over clears an override), but never fight the typing.
  React.useEffect(() => {
    setText((t) => {
      const n = parseFloat(t);
      if (value == null) return Number.isFinite(n) ? '' : t;
      return Number.isFinite(n) && Math.abs(n - value) < 0.05 ? t : show(value);
    });
  }, [value]);
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={text}
          placeholder={placeholder}
          onFocus={(e) => e.target.select()}
          onBlur={() => setText(show(value))}
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d.]/g, '').slice(0, 5);
            setText(t);
            const n = parseFloat(t);
            if (t === '' || !Number.isFinite(n)) {
              if (emptyIsNull) onChange(null);
              return;
            }
            onChange(Math.min(max, n));
          }}
          className={`${INPUT} pl-3.5 pr-8`}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40">%</span>
      </div>
    </Field>
  );
}
