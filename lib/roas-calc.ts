// ---------------------------------------------------------------------------
// /roas-calculator — the arithmetic and the benchmark numbers.
//
// THE BASELINE IS THE SPREADSHEET. Marcel, 2026-11-27: this is a copy of the
// ROAS calculator sheet he was given (tabs "B2C - ROAS Calculator", "B2B -
// ROAS Calculator" and "Benchmarks"). Its formulas and numbers are carried
// over as they are, and must NOT be adjusted to match anything Nexli says
// elsewhere about where metrics should be (lib/agency-offer.ts, the VSL
// FAQs, the pitch deck). If the two ever disagree, this file follows the
// sheet. The formulas, cell for cell (row 16 = Best, 17 = Average, 18 = Worst):
//
//   C2  Monthly spend   = B2 * 30                    (B2 = daily ad spend)
//   B16 Leads           = C2 / CPL
//   C16 Calls           = C2 / CPBC                  (NOT leads × a rate)
//   D16 Showed calls    = (Calls * Show-up %) / 100
//   E16 Sales           = (Showed * Close %) / 100
//   F16 Revenue         = ROUND(Sales, 0) * B3       (B3 = offer contract price)
//   G16 ROAS            = Revenue / C2
//
// Only Sales is rounded inside the arithmetic, and only where it turns into
// revenue. Leads, calls and showed calls stay fractional and are rounded for
// display, which is exactly what the sheet's number formats do. Rounding
// them earlier changes results: B2C Average at the sheet's defaults is 24.75
// calls → 12.375 showed → 3.71 sales → 4 sales. Rounding calls to 25 first
// gives 12.5 showed.
// ---------------------------------------------------------------------------

export type Model = 'b2c' | 'b2b';
export type ScenarioKey = 'best' | 'average' | 'worst';

export const SCENARIOS: readonly { key: ScenarioKey; label: string }[] = [
  { key: 'best', label: 'Best case' },
  { key: 'average', label: 'Average case' },
  { key: 'worst', label: 'Worst case' },
] as const;

/** One column of the sheet's input grid (rows 7–10). */
export interface ScenarioInputs {
  /** Cost per lead, dollars. */
  cpl: number;
  /** Cost per booked call, dollars. */
  cpbc: number;
  /** Show-up rate as the sheet stores it: 70 means 70%. */
  show: number;
  /** Close rate, same scale. */
  close: number;
}

export type Grid = Record<ScenarioKey, ScenarioInputs>;

export interface CalcInputs {
  /** B2: ad spend per day. */
  daily: number;
  /** B3: the price of one sale. */
  price: number;
  grid: Grid;
}

export interface ScenarioResult {
  leads: number;
  calls: number;
  showed: number;
  sales: number;
  /** ROUND(sales) — what revenue is built on. */
  salesRounded: number;
  revenue: number;
  roas: number;
}

/** Sheets' ROUND: half away from zero, on a 15-significant-digit value, so
 *  a float like 4.4999999999 (which Sheets reads as 4.5) rounds the same way. */
export function sheetRound(x: number): number {
  if (!Number.isFinite(x)) return 0;
  const clean = Number(x.toPrecision(15));
  return Math.sign(clean) * Math.round(Math.abs(clean));
}

/** C2 = B2 * 30. */
export function monthlySpend(daily: number): number {
  return daily * 30;
}

const div = (a: number, b: number) => (b > 0 ? a / b : 0);

export function runScenario(spend: number, price: number, s: ScenarioInputs): ScenarioResult {
  const leads = div(spend, s.cpl);
  const calls = div(spend, s.cpbc);
  const showed = (calls * s.show) / 100;
  const sales = (showed * s.close) / 100;
  const salesRounded = sheetRound(sales);
  const revenue = salesRounded * price;
  const roas = div(revenue, spend);
  return { leads, calls, showed, sales, salesRounded, revenue, roas };
}

export function run(inputs: CalcInputs): { spend: number; results: Record<ScenarioKey, ScenarioResult> } {
  const spend = monthlySpend(inputs.daily);
  return {
    spend,
    results: {
      best: runScenario(spend, inputs.price, inputs.grid.best),
      average: runScenario(spend, inputs.price, inputs.grid.average),
      worst: runScenario(spend, inputs.price, inputs.grid.worst),
    },
  };
}

/**
 * Sales needed in a month for revenue to equal the ad spend (ROAS 1.00).
 * Not in the sheet; derived from its own numbers and labelled as such.
 */
export function breakEvenSales(spend: number, price: number): number {
  return price > 0 ? Math.ceil(spend / price) : 0;
}

// ── The sheet's numbers ────────────────────────────────────────────────────

const g = (
  best: [number, number, number, number],
  average: [number, number, number, number],
  worst: [number, number, number, number],
): Grid => {
  const col = ([cpl, cpbc, show, close]: [number, number, number, number]) => ({ cpl, cpbc, show, close });
  return { best: col(best), average: col(average), worst: col(worst) };
};

/** The calculator tabs as they open: B2..B3 and B7..D10. */
export const DEFAULTS: Record<Model, CalcInputs> = {
  b2c: {
    daily: 165,
    price: 30_000,
    grid: g([5, 150, 70, 40], [12, 200, 50, 30], [25, 400, 30, 10]),
  },
  b2b: {
    daily: 200,
    price: 10_000,
    grid: g([25, 250, 70, 40], [50, 500, 50, 30], [100, 1000, 30, 10]),
  },
};

export interface Benchmark {
  id: string;
  name: string;
  /** What kind of campaign this is, in a line. Ours, not the sheet's. */
  blurb: string;
  grid: Grid;
}

/** The Benchmarks tab, column for column. B2C has a fourth funnel (Lead
 *  Form) that the B2B side of the sheet does not. */
export const BENCHMARKS: Record<Model, readonly Benchmark[]> = {
  b2c: [
    {
      id: 'follower',
      name: 'Follower funnel',
      blurb: 'Ads that grow an audience first; the booked call comes later.',
      grid: g([1, 150, 70, 40], [2, 200, 60, 30], [5, 400, 50, 10]),
    },
    {
      id: 'dm',
      name: 'DM ads & indirect conversion',
      blurb: 'Ads that open a conversation or a soft opt-in before the call.',
      grid: g([5, 150, 70, 40], [15, 200, 60, 30], [30, 400, 50, 10]),
    },
    {
      id: 'vsl',
      name: 'Direct VSL / application',
      blurb: 'Ad → video → application → booked call.',
      grid: g([70, 150, 70, 40], [100, 200, 50, 30], [200, 400, 30, 10]),
    },
    {
      id: 'leadform',
      name: 'Lead form',
      blurb: 'An instant form inside the ad platform.',
      grid: g([15, 150, 70, 40], [25, 200, 60, 30], [40, 400, 50, 10]),
    },
  ],
  b2b: [
    {
      id: 'follower',
      name: 'Follower funnel',
      blurb: 'Ads that grow an audience first; the booked call comes later.',
      grid: g([2, 250, 70, 40], [5, 500, 60, 30], [10, 750, 50, 10]),
    },
    {
      id: 'dm',
      name: 'DM ads & indirect conversion',
      blurb: 'Ads that open a conversation or a soft opt-in before the call.',
      grid: g([25, 250, 70, 40], [40, 500, 60, 30], [100, 750, 50, 10]),
    },
    {
      id: 'vsl',
      name: 'Direct VSL / application',
      blurb: 'Ad → video → application → booked call.',
      grid: g([150, 250, 70, 40], [200, 500, 50, 30], [500, 1000, 30, 10]),
    },
  ],
};

export const MODEL_LABEL: Record<Model, string> = { b2c: 'B2C', b2b: 'B2B' };

/** Clamp anything restored from storage back into sane, finite numbers. */
export function sanitize(raw: unknown, fallback: CalcInputs): CalcInputs {
  const num = (v: unknown, d: number, max: number) =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.min(v, max) : d;
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<CalcInputs>;
  const grid = (r.grid && typeof r.grid === 'object' ? r.grid : {}) as Partial<Grid>;
  const col = (k: ScenarioKey): ScenarioInputs => {
    const c = (grid[k] && typeof grid[k] === 'object' ? grid[k] : {}) as Partial<ScenarioInputs>;
    const d = fallback.grid[k];
    return {
      cpl: num(c.cpl, d.cpl, 1_000_000),
      cpbc: num(c.cpbc, d.cpbc, 1_000_000),
      show: num(c.show, d.show, 100),
      close: num(c.close, d.close, 100),
    };
  };
  return {
    daily: num(r.daily, fallback.daily, 1_000_000),
    price: num(r.price, fallback.price, 100_000_000),
    grid: { best: col('best'), average: col('average'), worst: col('worst') },
  };
}
