// ---------------------------------------------------------------------------
// December 31 — the only real deadline in this funnel.
//
// Most tax planning has to be executed inside the tax year to show up on the
// return filed the following April. A firm that starts in January is selling
// planning against a year that is already written. That makes the date worth
// putting on a page; it is not manufactured scarcity.
//
// Pure functions, no React, `now` always injected — so the states can be
// tested at an arbitrary date without touching the system clock.
//
// Everything is computed in America/New_York. "The tax year ends" is a US
// calendar claim, not a UTC one: at 7pm Eastern on 31 December a UTC clock
// has already rolled over to 1 January and would report zero days left on a
// day that still has five hours of planning time in it. Reading the civil
// date through Intl rather than offsetting by hand also keeps DST out of it.
// ---------------------------------------------------------------------------

const TAX_ZONE = 'America/New_York';

const PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: TAX_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** The civil Y/M/D in the US tax calendar, whatever zone the caller is in. */
function civilDate(now: Date): { year: number; month: number; day: number } {
  const parts = PARTS.formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  return { year: get('year'), month: get('month'), day: get('day') };
}

/**
 * Whole days from today to 31 December of the current tax year.
 * 0 on 31 December itself; never negative.
 */
export function daysUntilYearEnd(now: Date = new Date()): number {
  const { year, month, day } = civilDate(now);
  // UTC arithmetic on civil dates — both ends are midnight-anchored, so the
  // difference is a clean whole number of days with no DST drift.
  const today = Date.UTC(year, month - 1, day);
  const yearEnd = Date.UTC(year, 11, 31);
  return Math.max(0, Math.round((yearEnd - today) / 86_400_000));
}

/** The tax year the deadline belongs to — what shows up on next April's return. */
export function currentTaxYear(now: Date = new Date()): number {
  return civilDate(now).year;
}

/** The April in which this year's planning shows up as a refund. */
export function filingYear(now: Date = new Date()): number {
  return currentTaxYear(now) + 1;
}

/**
 * Is the deadline close enough to be the reason to act today?
 *
 * 120 days puts the switch at about 2 September. Outside the window the
 * countdown is not just weak but actively counterproductive — on 2 January
 * "363 days left" destroys the urgency it exists to create — so the UI shows
 * an evergreen line instead of a number.
 */
export function isPlanningSeason(now: Date = new Date()): boolean {
  return daysUntilYearEnd(now) <= 120;
}
