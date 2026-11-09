'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SCENARIOS, type ScenarioId } from '@/lib/see-the-math';
import { usePrint } from './print';
import { MUTED } from './ui';

/**
 * Conservative / Moderate / Best case. Buttons with aria-pressed, not a
 * radio group: radios take the arrow keys, and on this page the arrow keys
 * belong to the deck.
 */
export function ScenarioToggle({
  value,
  onChange,
  layoutId,
}: {
  value: ScenarioId;
  onChange: (id: ScenarioId) => void;
  /** Unique per toggle, so two toggles' pills do not fly between slides. */
  layoutId: string;
}) {
  // Nothing to click on paper.
  if (usePrint()) return null;
  return (
    <div
      role="group"
      aria-label="Scenario"
      className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1"
    >
      {SCENARIOS.map((s) => {
        const on = s.id === value;
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(s.id)}
            className={`relative rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors sm:px-5 sm:text-sm ${
              on ? 'text-white' : 'text-white/60 hover:text-white/90'
            }`}
          >
            {on && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Every booked call as a dot: the ones that show up, and the ones that sign.
 * The point of the picture is how few it takes — 2 of 20 is the whole
 * conservative case.
 */
export function FunnelDots({ booked, held, signed }: { booked: number; held: number; signed: number }) {
  return (
    <div>
      {/* Eleven to a row: 20, 25 and 33 calls fill two or three tidy rows
          rather than wrapping wherever the panel width happens to land. */}
      <div
        className="grid w-fit grid-cols-11 gap-2 sm:gap-2.5"
        role="img"
        aria-label={`${booked} booked calls, ${held} held, ${signed} signed`}
      >
        {Array.from({ length: booked }, (_, i) => {
          const state = i < signed ? 'signed' : i < held ? 'held' : 'booked';
          return (
            <span
              key={i}
              aria-hidden="true"
              className="relative h-5 w-5 rounded-full transition-all duration-500 sm:h-6 sm:w-6"
              style={{
                transitionDelay: `${i * 12}ms`,
                ...(state === 'signed'
                  ? {
                      background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
                      boxShadow: '0 0 0 3px rgba(34,211,238,0.22), 0 0 18px rgba(34,211,238,0.55)',
                    }
                  : state === 'held'
                    ? { background: 'rgba(59,130,246,0.55)' }
                    : { background: 'transparent', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.28)' }),
              }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]" style={{ color: MUTED }}>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)' }} />
          Booked, didn&apos;t show
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: 'rgba(59,130,246,0.55)' }} />
          Call held
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
          Signed a tax plan
        </span>
      </div>
    </div>
  );
}
