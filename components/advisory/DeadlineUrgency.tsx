'use client';

// ---------------------------------------------------------------------------
// The tax-year deadline, rendered without a hydration trap.
//
// THE ARGUMENT CHANGED IN LATE 2026 AND THE DATE IS WHY. These pages used
// to say "most planning has to be executed before December 31", which is
// true and was the right line in September. It stopped being the right line
// once there were about sixty days left: a build is up to
// AGENCY_LAUNCH_DAYS_MAX days, and then the firm still has to run ads,
// qualify people and close them. Telling a firm in November that they can
// catch this tax year is selling them something the calendar will not
// deliver.
//
// So the urgency moved from the deadline to the RUNWAY: get built now, be
// live before filing season, and sell the next tax year from January
// instead of scrambling for the end of this one. Same honest pressure,
// and it survives January, when the old line became actively false.
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
import { currentTaxYear, daysUntilYearEnd, isPlanningSeason } from '@/lib/tax-year-deadline';

// Red, and it stays red.
//
// It was briefly switched to emerald on the reasoning that the message is
// now permission rather than a deadline, and switched straight back. The
// bar is the only urgency on the page that is not the capacity pill, and
// red is what makes it read as urgency at a glance; green made it look
// like a status notice people scroll past.
//
// The COPY is still the runway version - the bar argues "61 days to get
// built", not "December 31 or you miss it". Red carries that fine: a short
// runway is a real deadline, just not the one it used to name.
const RED_BG = 'rgba(239,68,68,0.12)';
const RED_BORDER = 'rgba(239,68,68,0.3)';

/** Null until mounted, so the first client render matches the server HTML. */
function useDeadline() {
  const [state, setState] = useState<{
    days: number;
    inSeason: boolean;
    thisYear: number;
    nextYear: number;
  } | null>(null);
  useEffect(() => {
    const now = new Date();
    const year = currentTaxYear(now);
    setState({
      days: daysUntilYearEnd(now),
      inSeason: isPlanningSeason(now),
      thisYear: year,
      // The next TAX year - the one a firm built now actually gets to sell
      // into. Deliberately not filingYear(), which is also year + 1 but
      // means "the April this year's planning shows up in". The two numbers
      // agree today and mean different things, which is exactly how the
      // wrong one gets used.
      nextYear: year + 1,
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
        {days === 0
          ? 'Last day to start'
          : `${days} day${days === 1 ? '' : 's'} to get built`}
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
        Start now and spend{' '}
        <strong className="text-white">{d ? d.nextYear : 'next year'}</strong> selling planning,
        not building.
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
  // the wrong year on 31 December evening — the one night it matters.
  const thisYear = d?.thisYear;
  const nextYear = d?.nextYear;

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
        Planning moves have to be{' '}
        <strong className="text-white">executed inside the tax year</strong> to show up on the
        return. So a firm that starts selling planning in February is selling against a year
        that is already written — charging for advice against numbers nobody can change.
      </p>

      <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
        Which is why the build happens now and not in the new year. Ads, intake and a full
        calendar take weeks to stand up, and filing season is the worst possible time to be
        learning them. Start now and{thisYear ? <> {thisYear} ends</> : ' the year ends'} with
        your firm already running, selling{nextYear ? <> {nextYear}</> : ' next year'} planning
        from January rather than scrambling for what is left of this one.
      </p>
    </div>
  );
}

/**
 * The full-bleed bar at the very top of the VSL.
 *
 * Same hydration contract as the other two: the sentence is static and
 * identical on both sides of hydration, and only the day chip is added after
 * mount. /advisory-pricing has no `dynamic` export, so it is prerendered at
 * BUILD — a server-computed day count there would freeze on deploy day.
 *
 * In the page flow rather than fixed. VslFunnel already has a fixed logo, a
 * fixed scarcity pill and a sticky bottom CTA; a fourth pinned element would
 * leave the hero fighting for what is left of a phone screen. The caller
 * offsets the two fixed chips so nothing lands on top of this.
 *
 * Out of season it renders the sentence with no number, which is still true
 * and still worth reading. It never renders nothing — a bar that vanishes for
 * eight months of the year is a layout nobody has ever looked at.
 */
export function DeadlineBanner({ className = '' }: { className?: string }) {
  const d = useDeadline();

  return (
    <div
      className={`relative z-[120] w-full border-b px-4 py-1.5 sm:py-2.5 ${className}`}
      style={{ background: RED_BG, borderColor: RED_BORDER }}
    >
      {/*
        Deliberately NOT flex-wrap. Wrapping put the chip on its own line and
        took the bar to 80px on a 390px screen, which both ate the hero and
        ran underneath the fixed logo. The chip holds its width, the sentence
        wraps inside the space that is left, and the bar stays at ~42px.
      */}
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-2.5">
        <CalendarClock size={15} className="hidden shrink-0 text-red-400 sm:block" aria-hidden="true" />
        {d?.inSeason && <DaysChip days={d.days} />}
        <span
          className="text-left text-[11px] font-semibold leading-snug sm:text-center sm:text-sm"
          style={{ color: 'rgba(255,255,255,0.82)' }}
        >
          Start now and spend{' '}
          <strong className="font-black text-white">
            {d ? d.nextYear : 'next year'}
          </strong>{' '}
          selling planning, not building.
        </span>
      </div>
    </div>
  );
}
