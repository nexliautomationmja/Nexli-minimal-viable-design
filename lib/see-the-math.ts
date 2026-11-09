// ---------------------------------------------------------------------------
// "See the Math" — the model behind /math and Nexli-See-The-Math.pdf.
//
// Pure functions, no React. Every number the page shows is computed here, so
// the page cannot drift from itself: change an input and the table, every
// chart and the break-even month all move together. The PDF in
// public/downloads is a static copy of the same numbers — if you change an
// input here, re-export the PDF too, or the leave-behind disagrees with the
// page that was just presented.
//
// THE SETUP FEE AND THE ANNUAL PLAN come from lib/agency-offer, like every
// other price here. They used to be defined in this file only, back when
// /math was the one place that priced them. Since 2026-11-09 the policy
// pages (/pricing, /terms, /refund-policy, /delivery-policy) price them too,
// for the card processor's underwriters, and a second copy here would be the
// first thing to drift. The sales pages still say "quoted on the call"; see
// the note in lib/agency-offer for which pages may import the figure.
// ---------------------------------------------------------------------------
import {
  AGENCY_AD_SPEND,
  AGENCY_ANNUAL_SERVICE_FEE,
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_MONTHLY_FEE,
  AGENCY_SETUP_FEE,
  AGENCY_TOTAL_MONTHLY,
} from '@/lib/agency-offer';

// ── What the firm pays ─────────────────────────────────────────────────────

/** One-time, due at signing. */
export const SETUP_FEE = AGENCY_SETUP_FEE;

/** Nexli's service fee when the service year is prepaid: $42,000 / 12. */
export const ANNUAL_SERVICE_MONTHLY = AGENCY_ANNUAL_SERVICE_FEE / 12;

/** Ads every month, either plan. */
export const AD_SPEND = AGENCY_AD_SPEND;

/** Paid monthly: ads + service, $9,997. */
export const MONTHLY_TOTAL = AGENCY_TOTAL_MONTHLY;

/** Paid annually, as a monthly figure: ads + prepaid service, $8,500. */
export const ANNUAL_MONTHLY_EQUIVALENT = AD_SPEND + ANNUAL_SERVICE_MONTHLY;

export type PlanId = 'monthly' | 'annual';

export interface Plan {
  id: PlanId;
  label: string;
  /** Due at signing. */
  upfront: number;
  /** Billed every month from launch (about day 21), months 1–12. */
  perMonth: number;
  /** Nexli's service line, as a monthly figure, for display. */
  serviceMonthly: number;
}

export const PLANS: Record<PlanId, Plan> = {
  monthly: {
    id: 'monthly',
    label: 'Paid monthly',
    upfront: SETUP_FEE,
    perMonth: MONTHLY_TOTAL,
    serviceMonthly: AGENCY_MONTHLY_FEE,
  },
  annual: {
    id: 'annual',
    label: 'Paid annually',
    // Setup plus the service year, prepaid: $74,000.
    upfront: SETUP_FEE + 12 * ANNUAL_SERVICE_MONTHLY,
    // Only the ads are billed monthly once the service year is prepaid.
    perMonth: AD_SPEND,
    serviceMonthly: ANNUAL_SERVICE_MONTHLY,
  },
};

/** Everything paid to Nexli in year one, setup included. */
export function yearOneCost(plan: Plan): number {
  return plan.upfront + 12 * plan.perMonth;
}

/**
 * The first month in which paying annually has cost less in total than
 * paying monthly. It costs $42,000 more at signing and $4,997 less a
 * month after, so it crosses during month 9.
 */
export function annualAheadFromMonth(): number {
  const { monthly, annual } = PLANS;
  for (let m = 1; m <= 24; m++) {
    if (annual.upfront + m * annual.perMonth < monthly.upfront + m * monthly.perMonth) return m;
  }
  return Infinity;
}

// ── What the firm earns ────────────────────────────────────────────────────

/** Booked calls that actually happen. Assumed, and labelled as such. */
export const SHOW_RATE = 0.7;

/**
 * A tax plan, at the conservative end of $15,000–$55,000.
 *
 * The range is the site's, from lib/agency-offer, and the same one Daniela
 * says in her intro on /candor. It said $50,000 here until 2026-11-08, which
 * put the deck one number away from the video a prospect had just watched.
 */
export const PLAN_FEE = 20_000;
export const PLAN_FEE_LOW = AGENCY_ENGAGEMENT_LOW;
export const PLAN_FEE_HIGH = AGENCY_ENGAGEMENT_HIGH;

/** Bookkeeping from $1,500 a month plus payroll from about $450: $2,000. */
export const BACK_END_MONTHLY = 2_000;
export const BACK_END_ANNUAL = BACK_END_MONTHLY * 12;

/** Half of planning clients move their books and payroll over. */
export const TAKE_RATE = 0.5;

export type ScenarioId = 'conservative' | 'moderate' | 'best';

export interface Scenario {
  id: ScenarioId;
  label: string;
  costPerBookedCall: number;
  closeRate: number;
}

export const SCENARIOS: Scenario[] = [
  { id: 'conservative', label: 'Conservative', costPerBookedCall: 250, closeRate: 0.15 },
  { id: 'moderate', label: 'Moderate', costPerBookedCall: 200, closeRate: 0.2 },
  { id: 'best', label: 'Best case', costPerBookedCall: 150, closeRate: 0.25 },
];

export const scenarioById = (id: ScenarioId): Scenario =>
  SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];

/**
 * Rounded DOWN at every step, as the PDF says: you cannot sign 2.1 clients.
 * The epsilon stops float noise (33 × 0.7 = 23.099999…) from costing a call.
 */
const down = (n: number) => Math.floor(n + 1e-9);

export interface Chain {
  adSpend: number;
  bookedCalls: number;
  callsHeld: number;
  clients: number;
  newFees: number;
  /** New fees ÷ the $9,997 monthly investment. */
  multiple: number;
}

/** The five numbers, for one month at full pace. */
export function chain(s: Scenario): Chain {
  const bookedCalls = down(AD_SPEND / s.costPerBookedCall);
  const callsHeld = down(bookedCalls * SHOW_RATE);
  const clients = down(callsHeld * s.closeRate);
  const newFees = clients * PLAN_FEE;
  return {
    adSpend: AD_SPEND,
    bookedCalls,
    callsHeld,
    clients,
    newFees,
    multiple: Math.round(newFees / MONTHLY_TOTAL),
  };
}

/** Days of new fees, at full pace, that cover the setup fee. */
export function setupCoverDays(s: Scenario): number {
  return (SETUP_FEE / chain(s).newFees) * 30;
}

/** One month's new clients, valued over their first year. */
export function yearOneValue(s: Scenario) {
  const { clients, newFees } = chain(s);
  const backEnd = clients * TAKE_RATE * BACK_END_ANNUAL;
  return { planning: newFees, backEnd, total: newFees + backEnd };
}

// ── The first twelve months ────────────────────────────────────────────────

export const MONTHS = 12;

/**
 * New planning clients signed in month m (1-based). Nothing in month 1 (the
 * build, then ads learning), half pace in months 2 and 3, full pace from 4.
 * Fractional on purpose: half of 3 a month is 1.5 on average, which is what
 * the PDF's moderate and best-case totals (30 and 50 by month 12) assume.
 */
export function clientsSignedIn(s: Scenario, m: number): number {
  const pace = chain(s).clients;
  if (m <= 1) return 0;
  if (m <= 3) return pace / 2;
  return pace;
}

/** Planning clients signed in months 1..m. */
export function clientsBy(s: Scenario, m: number): number {
  let total = 0;
  for (let i = 1; i <= m; i++) total += clientsSignedIn(s, i);
  return total;
}

/**
 * Bookkeeping and payroll as a yearly figure, after month m: what the
 * clients signed so far will pay over a year. The "stacking" chart.
 */
export function backEndAnnualAfter(s: Scenario, m: number): number {
  return clientsBy(s, m) * TAKE_RATE * BACK_END_ANNUAL;
}

/**
 * Bookkeeping and payroll actually billed in month m. It starts the month
 * after a client signs, so it is month m-1's client count that pays.
 */
export function backEndBilledIn(s: Scenario, m: number): number {
  return clientsBy(s, m - 1) * TAKE_RATE * BACK_END_MONTHLY;
}

/** Everything the firm takes in during month m: new plans plus the bundle. */
export function revenueIn(s: Scenario, m: number): number {
  return clientsSignedIn(s, m) * PLAN_FEE + backEndBilledIn(s, m);
}

/**
 * Where the firm stands after everything paid to Nexli, month 0 (signing)
 * to month 12. Index = month. Before the firm's own cost of doing the work.
 */
export function netSeries(s: Scenario, plan: Plan): number[] {
  const out = [-plan.upfront];
  for (let m = 1; m <= MONTHS; m++) {
    out.push(out[m - 1] + revenueIn(s, m) - plan.perMonth);
  }
  return out;
}

/** The first month the firm is back above zero. */
export function breakEvenMonth(s: Scenario, plan: Plan): number | null {
  const net = netSeries(s, plan);
  const m = net.findIndex((v, i) => i > 0 && v >= 0);
  return m === -1 ? null : m;
}

// ── Going into year two ────────────────────────────────────────────────────

/**
 * Share of clients still with the firm a year on: tax planning renewals and
 * bookkeeping and payroll alike. An ASSUMPTION, and labelled as one.
 *
 * Researched 2026-11-09. There is no rigorous study of year-over-year tax
 * planning retention; the published figures are vendors' and consultancies',
 * none sourced. The most specific (SmartFirm, "CPA Client Retention Rate
 * Benchmarks") puts full-service firms — tax planning plus bookkeeping and
 * payroll, which is what this system makes a firm — at 78–85% on average and
 * 93–96% at the top; advisory firms at 75–85% and 90–95%. Others call 90% a
 * healthy target. 80% is the bottom of the full-service average, on the same
 * rule as every other input here: plan below the going rate.
 */
export const RETENTION = 0.8;
export const RETENTION_BENCHMARK = { low: 0.78, high: 0.85, topLow: 0.93, topHigh: 0.96 } as const;
export const RETENTION_SOURCE = 'https://smartfirm.io/faq/good-client-retention-rate-accounting-firm/';

/**
 * The book of business a firm starts year two with: its year-one clients
 * only, before anyone new signs. Tax planning clients renew at the plan fee,
 * bookkeeping and payroll keep paying, RETENTION of each stay (rounded down,
 * as clients are everywhere else), and the system's year on the monthly plan
 * comes off. The setup fee is not in it: that is paid once, at signing.
 */
export function recurringBook(s: Scenario) {
  const planningClients = clientsBy(s, MONTHS);
  const backEndClients = planningClients * TAKE_RATE;
  const keptPlanning = down(planningClients * RETENTION);
  const keptBackEnd = down(backEndClients * RETENTION);
  const planning = keptPlanning * PLAN_FEE;
  const backEnd = keptBackEnd * BACK_END_ANNUAL;
  const total = planning + backEnd;
  const systemYear = MONTHLY_TOTAL * 12;
  return {
    planningClients,
    backEndClients,
    keptPlanning,
    keptBackEnd,
    planning,
    backEnd,
    total,
    systemYear,
    inTheGreen: total - systemYear,
  };
}

// ── Formatting ─────────────────────────────────────────────────────────────

/** $40,000, and −$41,997 with a real minus sign rather than "$-41,997". */
export const usd = (n: number) =>
  `${n < 0 ? '−' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;

/** $40K, $1.1M — for chart axes and labels where space is short. */
export function usdCompact(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(a % 1_000_000 === 0 ? 0 : 1)}M`;
  if (a >= 1_000) return `${sign}$${Math.round(a / 1_000)}K`;
  return `${sign}$${Math.round(a)}`;
}

/**
 * "About $602,000". Rounds to the nearest thousand with halves going to the
 * EVEN thousand — that is how the PDF got $602,500 → $602,000 and
 * $1,093,500 → $1,094,000, and the page has to say what the PDF says.
 */
export function aboutThousands(n: number): number {
  const k = n / 1000;
  const floor = Math.floor(k);
  const diff = k - floor;
  let r: number;
  if (Math.abs(diff - 0.5) < 1e-9) r = floor % 2 === 0 ? floor : floor + 1;
  else r = Math.round(k);
  return r * 1000;
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;
