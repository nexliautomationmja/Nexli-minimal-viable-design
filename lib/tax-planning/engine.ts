// ---------------------------------------------------------------------------
// The Tax Planning Tool's arithmetic. Pure: no React, no DOM, no clock.
//
// ONE RUNNING SCENARIO, STRATEGIES APPLIED IN ORDER. Compute the baseline,
// apply each strategy on top of the last, and credit each with the drop in
// the total it caused. Total savings = baseline − final, so the rows always
// add up to the headline and every interaction is real: an S corp shrinks
// the QBI deduction and changes retirement capacity, retirement shrinks QBI,
// and so on. Summing strategies computed in isolation overstates the total,
// and a CPA spots that in a minute (docs/advisory-calculator-build-brief.md,
// "The architecture decision").
//
// "TOTAL" IS WHAT PLANNING CAN MOVE: federal and state income tax, the
// self-employment tax or both halves of payroll tax on the owner's salary,
// the Additional Medicare tax, and, once an S corp is elected, its running
// costs and any state entity tax. Social Security and Medicare withheld
// from a spouse's or a second job's wages are the same either way and are
// left out.
//
// Every simplification is listed in ASSUMPTIONS / NOT_CONSIDERED below and
// printed on the page and the PDF.
// ---------------------------------------------------------------------------
import { bracketTax, ratesFor, type Filing, type YearRates } from './rates';
import { stateInfo } from './states';

export type Entity = 'sole' | 'partnership' | 'scorp' | 'ccorp';
export type AgeBand = 'under50' | '50to59' | '60to63' | '64plus';
export type StrategyId = 'scorp' | 'reimburse' | 'augusta' | 'kids' | 'retire' | 'hsa';

/** The order the plan applies them in. */
export const STRATEGY_IDS: readonly StrategyId[] = ['scorp', 'reimburse', 'augusta', 'kids', 'retire', 'hsa'];

export interface Answers {
  // Your business
  revenueLastYear: number;
  revenueThisYear: number;
  /** The owner's share of this year's profit, before paying themselves. */
  profit: number;
  entity: Entity;
  /** A specified service business (§199A(d)(2)): health, law, accounting... */
  sstb: boolean;
  /** W-2 payroll to employees, not counting the owner. */
  payroll: number;
  /** The owner's own salary. S corps only. */
  salary: number;
  // You
  filing: Filing;
  state: string;
  /** A flat state rate in percent that replaces the state's brackets. */
  stateRate: number | null;
  /** The owner's W-2 wages from another employer. */
  otherWages: number;
  /** A spouse's income, treated as wages. Married filing jointly only. */
  spouseIncome: number;
  kids: number;
  age: AgeBand;
  /** What the owner already puts into retirement each year. */
  retirementNow: number;
  // Optional
  taxLastYear: number;
  prepFee: number;
  preparedFor: string;
  // Strategy inputs
  reimburse: number;
  augustaDays: number;
  augustaRate: number;
  kidsHired: number;
  kidWage: number;
  /** null: the tool's default (10% of profit, at most $30,000, within capacity). */
  retireTarget: number | null;
  hsaCoverage: 'self' | 'family';
  /** Strategies the person at the keyboard switched off. */
  strategyOff: StrategyId[];
}

/**
 * The sample prospect the page opens with, so a firm can demo it in the
 * first thirty seconds. A growing single-member LLC in Georgia.
 */
export const SAMPLE: Answers = {
  revenueLastYear: 800_000,
  revenueThisYear: 1_050_000,
  profit: 300_000,
  entity: 'sole',
  sstb: false,
  payroll: 0,
  salary: 0,
  filing: 'mfj',
  state: 'GA',
  stateRate: null,
  otherWages: 0,
  spouseIncome: 0,
  // Optional details start neutral: a prospect who never opens "More
  // detail" shouldn't inherit the sample's kids or income.
  kids: 0,
  age: 'under50',
  retirementNow: 0,
  taxLastYear: 0,
  prepFee: 1_500,
  preparedFor: '',
  reimburse: 3_000,
  augustaDays: 12,
  augustaRate: 800,
  kidsHired: 1,
  kidWage: 12_000,
  retireTarget: null,
  hsaCoverage: 'family',
  strategyOff: [],
};

// ── Assumptions, each named once ────────────────────────────────────────────

/** Payroll service plus the S corp's own return, a year. */
export const S_CORP_RUNNING_COST = 2_000;
/** Below this profit an election rarely pays (brief: "refuse below ~$60K"). */
export const S_CORP_MIN_PROFIT = 60_000;
/** No reasonable salary below this, whatever the percentage says. */
export const SALARY_FLOOR = 40_000;
/** An existing S corp salary under this share of the target is flagged. */
export const LOW_SALARY_SHARE = 0.75;
/** The default retirement contribution: 10% of profit, at most $30,000. */
export const DEFAULT_RETIREMENT = 30_000;
export const DEFAULT_RETIREMENT_SHARE = 0.1;
export const MAX_AUGUSTA_DAYS = 14;
export const DEFAULT_SALARY_PCT = 40;

const SE_BASE = 0.9235;
const SS = 0.062;
const MED = 0.0145;

// ── The scenario the strategies change ──────────────────────────────────────

interface Scenario {
  entity: 'sole' | 'partnership' | 'scorp';
  /** Elected by the plan, so the running costs are new. */
  newSCorp: boolean;
  salary: number;
  reimburse: number;
  augustaRent: number;
  kidWages: number;
  /** Total owner contributions; capped at capacity when computed. */
  retirement: number;
  hsa: number;
}

export interface Breakdown {
  /** Federal income tax after the child tax credit. */
  federal: number;
  /** SE tax, or both halves of payroll tax on the owner's and kids' pay. */
  employment: number;
  addlMedicare: number;
  state: number;
  /** S corp running costs (new elections) and state entity tax. */
  entity: number;
  total: number;
  agi: number;
  taxableIncome: number;
  qbiDeduction: number;
  /** Payroll tax that goes through payroll rather than estimates. */
  viaPayroll: number;
  /** How much the owner could put into a retirement plan. */
  retirementCapacity: number;
  /** What actually went in, after the cap. */
  retirement: number;
}

function catchUp(age: AgeBand, r: YearRates): number {
  if (age === '60to63') return r.catchUp60to63;
  if (age === '50to59' || age === '64plus') return r.catchUp50;
  return 0;
}

/** §199A, simplified: no UBIA, no capital-gain cap, no aggregation. */
export function qbiDeduction(qbi: number, w2: number, tiBeforeQbi: number, sstb: boolean, filing: Filing, r: YearRates): number {
  if (qbi <= 0 || tiBeforeQbi <= 0) return 0;
  const phase = Math.min(1, Math.max(0, (tiBeforeQbi - r.qbiThreshold[filing]) / r.qbiRange[filing]));
  // A service business keeps only the "applicable percentage" of its QBI
  // and wages through the phase-in, and none of them above it.
  const share = sstb ? 1 - phase : 1;
  const full = 0.2 * qbi * share;
  const wageLimit = 0.5 * w2 * share;
  let ded = full;
  if (phase >= 1) ded = Math.min(full, wageLimit);
  else if (phase > 0) ded = full - Math.max(0, full - wageLimit) * phase;
  return Math.max(0, Math.min(ded, 0.2 * tiBeforeQbi));
}

function computeTax(a: Answers, r: YearRates, s: Scenario): Breakdown {
  const filing = a.filing;
  const st = stateInfo(a.state);
  const spouse = filing === 'mfj' ? a.spouseIncome : 0;
  const cu = catchUp(a.age, r);
  const ssRoom = Math.max(0, r.ssWageBase - a.otherWages);

  let agi: number;
  let qbi: number;
  let w2: number;
  let employment: number;
  let medicareWages: number;
  let entity = 0;
  let viaPayroll = 0;
  let capacity: number;
  let contrib: number;

  if (s.entity === 'scorp') {
    const salary = Math.max(0, Math.min(s.salary, a.profit));
    capacity = Math.min(r.annualAdditions + cu, Math.min(r.deferral + cu, salary) + 0.25 * salary);
    contrib = Math.min(s.retirement, capacity);
    const deferral = Math.min(contrib, r.deferral + cu, salary);
    const employerContrib = contrib - deferral;

    const employerFica = SS * Math.min(salary, r.ssWageBase) + MED * salary;
    // The employee's Social Security stops at the wage base across all
    // employers (the excess comes back as a credit); the employer's doesn't.
    const employeeFica = SS * Math.min(salary, ssRoom) + MED * salary;
    const kidFica = 2 * (SS + MED) * s.kidWages;
    const running = s.newSCorp ? S_CORP_RUNNING_COST : 0;

    const beforeEntityTax =
      a.profit - salary - employerFica - s.kidWages - (SS + MED) * s.kidWages - s.reimburse - s.augustaRent - employerContrib - running;
    const entityTax = st.sCorpTax ? Math.max(st.sCorpTax.min, st.sCorpTax.rate * Math.max(0, beforeEntityTax)) : 0;
    const k1 = beforeEntityTax - entityTax;

    agi = salary - deferral + k1 + a.otherWages + spouse - s.hsa;
    qbi = Math.max(0, k1);
    w2 = salary + a.payroll + s.kidWages;
    employment = employerFica + employeeFica + kidFica;
    viaPayroll = employment;
    medicareWages = salary + a.otherWages + spouse;
    entity = running + entityTax;
  } else {
    const beforeEntityTax = a.profit - s.reimburse - s.kidWages - (s.entity === 'partnership' ? s.augustaRent : 0);
    const pTax = s.entity === 'partnership' ? st.partnershipTax : undefined;
    const entityTax = pTax ? Math.max(pTax.min, pTax.rate * Math.max(0, beforeEntityTax)) : 0;
    const net = beforeEntityTax - entityTax;

    const nese = net > 0 ? net * SE_BASE : 0;
    const seTax = nese >= 400 ? 2 * SS * Math.min(nese, ssRoom) + 2 * MED * nese : 0;
    const halfSE = seTax / 2;
    const earned = Math.max(0, net - halfSE);
    capacity = Math.min(r.annualAdditions + cu, earned, Math.min(r.deferral + cu, earned) + 0.2 * earned);
    contrib = Math.min(s.retirement, capacity);

    agi = net - halfSE - contrib + a.otherWages + spouse - s.hsa;
    qbi = Math.max(0, net - halfSE - contrib);
    w2 = a.payroll + s.kidWages;
    employment = seTax;
    medicareWages = (nese >= 400 ? nese : 0) + a.otherWages + spouse;
    entity = entityTax;
  }

  const addlMedicare = 0.009 * Math.max(0, medicareWages - r.addlMedicareThreshold[filing]);

  const std = r.standardDeduction[filing];
  const tiBeforeQbi = Math.max(0, agi - std);
  const qbiDed = qbiDeduction(qbi, w2, tiBeforeQbi, a.sstb, filing, r);
  const taxableIncome = Math.max(0, tiBeforeQbi - qbiDed);
  const regular = bracketTax(taxableIncome, r.brackets[filing]);
  const ctcFull = a.kids * r.ctcPerChild;
  const ctcLost = 50 * Math.ceil(Math.max(0, agi - r.ctcPhaseOut[filing]) / 1_000);
  // Non-refundable only: an owner this tool is for owes more than the credit.
  const ctc = Math.min(regular, Math.max(0, ctcFull - ctcLost));
  const federal = regular - ctc;

  const stateBase = Math.max(0, agi - std);
  const state =
    a.stateRate != null
      ? stateBase * (a.stateRate / 100)
      : bracketTax(stateBase, st.brackets, filing === 'mfj' ? 2 : 1);

  const total = federal + employment + addlMedicare + state + entity;
  return {
    federal,
    employment,
    addlMedicare,
    state,
    entity,
    total,
    agi,
    taxableIncome,
    qbiDeduction: qbiDed,
    viaPayroll,
    retirementCapacity: capacity,
    retirement: contrib,
  };
}

// ── The plan ────────────────────────────────────────────────────────────────

export interface StepResult {
  id: StrategyId;
  /** applied: in the plan. skipped: the engine said no, with a reason. off: switched off. */
  status: 'applied' | 'skipped' | 'off';
  savings: number;
  /** Retirement defers tax; everything else saves it for good. */
  kind: 'saves' | 'defers';
  title: string;
  how: string;
  /** What this row assumed, in a line. */
  detail?: string;
  reason?: string;
}

export interface Flag {
  id: 'low-salary';
  text: string;
}

export interface PlanResult {
  year: number;
  /** False for a C corp: no numbers, a "talk to the firm" message instead. */
  supported: boolean;
  baseline: Breakdown;
  planned: Breakdown;
  savings: number;
  steps: StepResult[];
  flags: Flag[];
  salaryTarget: number;
  /** Retirement room left at the point the retirement step runs. */
  retirementCapacity: number;
  retirementDefault: number;
  /** Each of four quarterly estimates under the plan, before payroll withholding. */
  quarterly: number;
}

export function salaryTarget(profit: number, salaryPct: number): number {
  if (profit <= 0) return 0;
  return Math.min(profit, Math.max(SALARY_FLOOR, Math.round((profit * salaryPct) / 100)));
}

const usd0 = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

const TITLES: Record<StrategyId, string> = {
  scorp: 'Elect S corp status',
  reimburse: 'Home office, vehicle and phone',
  augusta: 'Rent your home to your business',
  kids: 'Hire your kids',
  retire: 'Solo 401(k)',
  hsa: 'Health savings account',
};

const HOW: Record<StrategyId, string> = {
  scorp:
    'Pay yourself a reasonable salary and take the rest as distributions, which skip the 15.3% self-employment tax.',
  reimburse:
    'The business pays back the home office, mileage and phone it really uses: deductible to the business, tax-free to you.',
  augusta:
    'Hold business meetings at your home, up to 14 days a year, at a fair rent. Deductible to the business and tax-free to you (the "Augusta rule").',
  kids:
    'Real work at a fair wage. Deductible to the business, and up to the standard deduction they owe no income tax on it.',
  retire:
    'Put more away for retirement. The tax is deferred, not erased: you pay it when you take the money out.',
  hsa: 'With a high-deductible health plan: deductible going in, tax-free coming out for medical costs.',
};

export interface PlanOptions {
  /** Firm's reasonable-salary assumption, percent of profit. */
  salaryPct: number;
  /** Strategies the firm does not offer: not shown at all. */
  firmOff: readonly StrategyId[];
}

export function plan(a: Answers, r: YearRates, opts: PlanOptions): PlanResult {
  const target = salaryTarget(a.profit, opts.salaryPct);
  const flags: Flag[] = [];

  if (a.entity === 'scorp' && a.profit > 0 && a.salary < target * LOW_SALARY_SHARE) {
    flags.push({
      id: 'low-salary',
      text: `A ${usd0(a.salary)} salary on ${usd0(a.profit)} of profit may not pass the IRS's "reasonable compensation" test. Fixing it costs a little tax; an audit that fixes it for you costs far more.`,
    });
  }

  if (a.entity === 'ccorp') {
    const zero = computeTax(a, r, baseScenario({ ...a, entity: 'sole' }));
    return {
      year: r.year,
      supported: false,
      baseline: zero,
      planned: zero,
      savings: 0,
      steps: [],
      flags,
      salaryTarget: target,
      retirementCapacity: 0,
      retirementDefault: 0,
      quarterly: 0,
    };
  }

  let s = baseScenario(a);
  const baseline = computeTax(a, r, s);
  let current = baseline;
  const steps: StepResult[] = [];
  let retirementCapacity = 0;
  let retirementDefault = 0;

  for (const id of STRATEGY_IDS) {
    if (opts.firmOff.includes(id)) continue;
    const step: StepResult = {
      id,
      status: 'applied',
      savings: 0,
      kind: id === 'retire' ? 'defers' : 'saves',
      title: TITLES[id],
      how: HOW[id],
    };

    // What this strategy would change, or why it can't.
    let next: Scenario | null = null;
    let reason: string | undefined;

    switch (id) {
      case 'scorp': {
        if (a.entity === 'scorp') {
          step.title = 'Right-size your salary';
          step.how = 'Every dollar of salary above a reasonable level pays 15.3% payroll tax that a distribution would not.';
          if (a.salary > target * 1.05) {
            next = { ...s, salary: target };
            step.detail = `Salary from ${usd0(a.salary)} to ${usd0(target)}, ${opts.salaryPct}% of profit.`;
          } else {
            reason = a.salary < target * LOW_SALARY_SHARE
              ? 'Your salary is already low. See the note on reasonable compensation.'
              : 'Your salary is already about right.';
          }
        } else if (a.profit < S_CORP_MIN_PROFIT) {
          reason = 'Under about $60,000 of profit, payroll and the extra return usually cost more than an S corp saves.';
        } else {
          next = { ...s, entity: 'scorp', newSCorp: true, salary: target };
          step.detail = `Salary of ${usd0(target)} (${Math.round((target / a.profit) * 100)}% of profit), the rest as distributions. After about ${usd0(S_CORP_RUNNING_COST)} a year of payroll and filing costs.`;
        }
        break;
      }
      case 'reimburse': {
        if (s.entity === 'scorp') step.title = 'Accountable plan';
        if (a.reimburse <= 0) reason = 'Add what the business could reimburse.';
        else {
          next = { ...s, reimburse: a.reimburse };
          step.detail = `${usd0(a.reimburse)} a year the business isn't covering today.`;
        }
        break;
      }
      case 'augusta': {
        const days = Math.min(MAX_AUGUSTA_DAYS, Math.max(0, Math.round(a.augustaDays)));
        const rent = days * a.augustaRate;
        if (s.entity === 'sole') reason = 'A sole proprietor can’t rent to themselves. It takes an S corp or partnership.';
        else if (rent <= 0) reason = 'Add the days and a fair daily rent.';
        else {
          next = { ...s, augustaRent: rent };
          step.detail = `${days} days at ${usd0(a.augustaRate)} a day: ${usd0(rent)} of rent.`;
        }
        break;
      }
      case 'kids': {
        const hired = Math.min(Math.max(0, Math.round(a.kidsHired)), a.kids);
        const wage = Math.min(a.kidWage, r.standardDeduction.single);
        if (a.kids <= 0) reason = 'No kids under 17 entered. Add them under “More detail”.';
        else if (hired <= 0 || wage <= 0) reason = 'Add how many could do real work, and their pay.';
        else {
          next = { ...s, kidWages: hired * wage };
          step.detail =
            (hired === 1 ? `1 child at ${usd0(wage)}. ` : `${hired} children at ${usd0(wage)} each. `) +
            (s.entity === 'scorp'
              ? 'Through an S corp their pay carries payroll tax, already netted off.'
              : 'Under 18, working for a parent’s business: no Social Security or Medicare tax.');
        }
        break;
      }
      case 'retire': {
        if (a.payroll > 0) step.title = '401(k) plan';
        retirementCapacity = current.retirementCapacity;
        retirementDefault = Math.min(
          retirementCapacity,
          Math.max(a.retirementNow, Math.min(DEFAULT_RETIREMENT, Math.round((a.profit * DEFAULT_RETIREMENT_SHARE) / 500) * 500)),
        );
        const wanted = Math.min(retirementCapacity, a.retireTarget ?? retirementDefault);
        if (retirementCapacity <= 0) reason = 'No room for a contribution at these numbers.';
        else if (wanted <= current.retirement) reason = 'You already put away this much.';
        else {
          next = { ...s, retirement: wanted };
          // The amount and the cap are on the card's own input.
          if (a.payroll > 0) step.detail = 'With employees, the plan may need contributions for them too.';
        }
        break;
      }
      case 'hsa': {
        const amount = a.hsaCoverage === 'family' ? r.hsaFamily : r.hsaSelf;
        next = { ...s, hsa: amount };
        step.detail = `${usd0(amount)} a year, the ${a.hsaCoverage === 'family' ? 'family' : 'self-only'} limit.`;
        break;
      }
    }

    if (a.strategyOff.includes(id)) {
      step.status = 'off';
    } else if (!next) {
      step.status = 'skipped';
      step.reason = reason;
    } else {
      const after = computeTax(a, r, next);
      const saved = current.total - after.total;
      if (saved <= 0) {
        step.status = 'skipped';
        step.reason =
          id === 'scorp'
            ? 'At these numbers the payroll tax saved doesn’t cover the costs.'
            : 'It doesn’t lower the bill at these numbers.';
      } else {
        step.savings = saved;
        s = next;
        current = after;
      }
    }
    steps.push(step);
  }

  const planned = current;
  return {
    year: r.year,
    supported: true,
    baseline,
    planned,
    savings: baseline.total - planned.total,
    steps,
    flags,
    salaryTarget: target,
    retirementCapacity,
    retirementDefault,
    quarterly: quarterlyEstimate(planned),
  };
}

/**
 * One of four quarterly estimated payments on a bill: everything except the
 * payroll tax that goes through payroll and the entity's own costs. Before
 * any income tax withheld from paychecks, which the page says.
 */
export function quarterlyEstimate(b: Breakdown): number {
  return Math.max(0, b.total - b.viaPayroll - b.entity) / 4;
}

function baseScenario(a: Answers): Scenario {
  return {
    entity: a.entity === 'scorp' ? 'scorp' : a.entity === 'partnership' ? 'partnership' : 'sole',
    newSCorp: false,
    salary: a.entity === 'scorp' ? a.salary : 0,
    reimburse: 0,
    augustaRent: 0,
    kidWages: 0,
    retirement: a.retirementNow,
    hsa: 0,
  };
}

// ── Growth ──────────────────────────────────────────────────────────────────

/** This year's revenue over last year's, held to −50%…+100% for the projection. */
export function growthFactor(a: Answers): number {
  if (a.revenueLastYear <= 0 || a.revenueThisYear <= 0) return 1;
  return Math.min(2, Math.max(0.5, a.revenueThisYear / a.revenueLastYear));
}

/** Next year at this year's pace: revenue, profit, payroll and salary scale. */
export function nextYearAnswers(a: Answers): Answers {
  const f = growthFactor(a);
  return {
    ...a,
    revenueLastYear: a.revenueThisYear,
    revenueThisYear: a.revenueThisYear * f,
    profit: a.profit * f,
    payroll: a.payroll * f,
    salary: a.salary * f,
  };
}

export interface FullResult {
  thisYear: PlanResult;
  nextYear: PlanResult;
  growth: number;
}

export function run(a: Answers, year: number, opts: PlanOptions): FullResult {
  return {
    thisYear: plan(a, ratesFor(year), opts),
    nextYear: plan(nextYearAnswers(a), ratesFor(year + 1), opts),
    growth: growthFactor(a) - 1,
  };
}

// ── What the page says about all this ──────────────────────────────────────

export const ASSUMPTIONS: readonly string[] = [
  'A full year of planning, in place from January. Some moves, like an S corp election, have deadlines early in the year.',
  'The standard deduction, not itemized deductions.',
  'An S corp salary at the firm’s reasonable-compensation assumption, with about $2,000 a year of payroll and filing costs.',
  'Kids hired by a sole proprietorship or a partnership owned only by their parents, so no payroll tax under 18.',
  'State tax from 2026 state brackets on federal income less the standard deduction; joint filers’ brackets doubled. No city or county tax.',
  'Every figure rounded to the nearest $100.',
];

export const NOT_CONSIDERED: readonly string[] = [
  'Alternative minimum tax and the 3.8% net investment income tax',
  'Itemized deductions, the SALT cap and pass-through entity tax elections',
  'Capital gains, rental income and depreciation',
  'Income in more than one state',
  'Credits other than the child tax credit',
  'Health insurance and other fringe benefits',
];

/** The trust signal: the promoter schemes a good firm will not sell you. */
export const WONT_SELL: readonly string[] = [
  'Micro-captive insurance',
  'Syndicated conservation easements',
  '"Infinite banking" life insurance',
  'Monetized installment sales',
  'Charitable LLCs',
  'ERC mills',
];

// ── Saved answers ───────────────────────────────────────────────────────────

const ENTITIES: readonly Entity[] = ['sole', 'partnership', 'scorp', 'ccorp'];
const FILINGS: readonly Filing[] = ['single', 'mfj', 'hoh'];
const AGES: readonly AgeBand[] = ['under50', '50to59', '60to63', '64plus'];

/**
 * Answers read back from localStorage, checked field by field against the
 * sample. Anything missing, mistyped or out of range takes the sample's
 * value, so an old or hand-edited save can never feed the engine garbage.
 */
export function sanitizeAnswers(raw: unknown, isState: (code: unknown) => boolean): Answers {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const num = (k: keyof Answers, max = 1e9): number => {
    const v = o[k];
    return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.min(v, max) : (SAMPLE[k] as number);
  };
  const pick = <T,>(k: keyof Answers, allowed: readonly T[]): T =>
    allowed.includes(o[k] as T) ? (o[k] as T) : (SAMPLE[k] as T);
  const stateRate = o.stateRate;
  const retireTarget = o.retireTarget;
  return {
    revenueLastYear: num('revenueLastYear'),
    revenueThisYear: num('revenueThisYear'),
    profit: num('profit'),
    entity: pick('entity', ENTITIES),
    sstb: typeof o.sstb === 'boolean' ? o.sstb : SAMPLE.sstb,
    payroll: num('payroll'),
    salary: num('salary'),
    filing: pick('filing', FILINGS),
    state: isState(o.state) ? (o.state as string) : SAMPLE.state,
    stateRate:
      typeof stateRate === 'number' && Number.isFinite(stateRate) && stateRate >= 0 && stateRate <= 20 ? stateRate : null,
    otherWages: num('otherWages'),
    spouseIncome: num('spouseIncome'),
    kids: Math.round(num('kids', 20)),
    age: pick('age', AGES),
    retirementNow: num('retirementNow'),
    taxLastYear: num('taxLastYear'),
    prepFee: num('prepFee'),
    preparedFor: typeof o.preparedFor === 'string' ? o.preparedFor.slice(0, 80) : '',
    reimburse: num('reimburse', 50_000),
    augustaDays: Math.round(num('augustaDays', MAX_AUGUSTA_DAYS)),
    augustaRate: num('augustaRate', 10_000),
    kidsHired: Math.round(num('kidsHired', 20)),
    kidWage: num('kidWage', 100_000),
    retireTarget:
      typeof retireTarget === 'number' && Number.isFinite(retireTarget) && retireTarget >= 0 ? retireTarget : null,
    hsaCoverage: o.hsaCoverage === 'self' || o.hsaCoverage === 'family' ? o.hsaCoverage : SAMPLE.hsaCoverage,
    strategyOff: Array.isArray(o.strategyOff)
      ? (o.strategyOff.filter((x) => (STRATEGY_IDS as readonly unknown[]).includes(x)) as StrategyId[])
      : [],
  };
}
