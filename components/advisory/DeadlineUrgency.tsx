'use client';

// ---------------------------------------------------------------------------
// The December 31 deadline, rendered without a hydration trap.
//
// 'use client' does not mean browser-only: this still server-renders, so a
// bare new Date() would run on the server clock and again on the visitor's
// and the two would disagree. components/demo/PortalDemo.tsx:449 hit exactly
// this and solved it by pinning a constant. Worse, the opt-in page has no
// `dynamic` export, so it is prerendered at BUILD — a server-computed day
// count there would freeze on deploy day and be silently wrong forever.
//
// So: the sentence is static and identical on both sides of hydration, and
// only the day-count chip is added after mount. Nothing swaps, nothing
// mismatches, and the message is true whether or not JS ever runs.
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { daysUntilYearEnd, filingYear, isPlanningSeason } from '@/lib/tax-year-deadline';

const RED_BG = 'rgba(239,68,68,0.12)';
const RED_BORDER = 'rgba(239,68,68,0.3)';

/** Null until mounted, so the first client render matches the server HTML. */
function useDeadline() {
  const [state, setState] = useState<{ days: number; inSeason: boolean; april: number } | null>(
    null,
  );
  useEffect(() => {
    const now = new Date();
    setState({
      days: daysUntilYearEnd(now),
      inSeason: isPlanningSeason(now),
      april: filingYear(now),
    });
  }, []);
  return state;
}

function DaysChip({ days }: { days: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 whitespace-nowrap"
      style={{ background: RED_BG, borderColor: RED_BORDER }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-red-400">
        {days === 0 ? 'Last day' : `${days} day${days === 1 ? '' : 's'} left`}
      </span>
    </span>
  );
}

/**
 * One compact line. For the opt-in, where the deadline is context rather
 * than the argument.
 */
export function DeadlinePill({ className = '' }: { className?: string }) {
  const d = useDeadline();
  const show = d?.inSeason ?? false;

  return (
    <p
      className={`flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm ${className}`}
      style={{ color: 'rgba(255,255,255,0.6)' }}
    >
      {show && d && <DaysChip days={d.days} />}
      <span>
        Most planning has to be executed before <strong className="text-white">December 31</strong>{' '}
        to land on April&apos;s return.
      </span>
    </p>
  );
}

/**
 * The explained version, for the sales page: states the mechanic rather than
 * just the date.
 *
 * Note the hedge — "most". IRA and HSA contributions, SEP funding and some
 * elections can legitimately land after year-end, so claiming everything
 * must be done by 31 December would be false, and a CPA is precisely the
 * reader who would catch it.
 */
export default function DeadlineUrgency({ className = '' }: { className?: string }) {
  const d = useDeadline();
  // No year until mounted. A UTC fallback would disagree with the Eastern
  // value for the few hours a year when the two calendars differ, and flash
  // the wrong April on 31 December evening — the one night it matters.
  const april = d?.april;

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${className}`}
      style={{ background: RED_BG, borderColor: RED_BORDER }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <CalendarClock size={18} className="text-red-400 shrink-0" aria-hidden="true" />
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">
          Why this has to be now
        </p>
        {d?.inSeason && <DaysChip days={d.days} />}
      </div>

      <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
        Most planning moves have to be <strong className="text-white">executed inside the tax year</strong>.
        Sell an engagement in November and your client sees the saving on the return you file
        in April. Sell the same engagement in February and the year is already written — you are
        charging for advice against numbers nobody can change any more.
      </p>

      <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
        Which is the whole reason to score your book now rather than after filing season. Every
        week you wait is a week of planning that cannot reach
        {april ? <> April&nbsp;{april}</> : ' next April'}.
      </p>
    </div>
  );
}
