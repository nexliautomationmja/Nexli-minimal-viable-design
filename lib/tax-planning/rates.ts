// ---------------------------------------------------------------------------
// Every federal figure the Tax Planning Tool uses, by tax year.
//
// NOTHING IS TYPED INLINE ANYWHERE ELSE. The engine reads these by name, so
// a new year is one new entry here and nothing more. Each figure was checked
// against the primary source named beside it on 2026-11-17 (CHECKED_ON).
//
// 2027 is here already: the IRS published its adjustments on 5 Nov 2026
// (IR-2026-133, Rev. Proc. 2026-35). The tool computes "this year" with the
// current year's figures and the next-year projection with the next year's,
// so on 1 January it rolls over by itself. A year with no entry falls back
// to the latest one there is, and the page prints which year it used.
//
// Statutory amounts that are not indexed (the Additional Medicare and child
// tax credit phase-out thresholds, the QBI phase-in range set by the One Big
// Beautiful Bill Act) are repeated per year on purpose: a year is one
// self-contained record that a reviewer can check against one document.
// ---------------------------------------------------------------------------

export type Filing = 'single' | 'mfj' | 'hoh';

/** [start of the bracket, marginal rate]. The first bracket starts at 0. */
export type Bracket = readonly [from: number, rate: number];

export interface YearRates {
  year: number;
  /** Ordinary income brackets, §1(j). */
  brackets: Record<Filing, readonly Bracket[]>;
  standardDeduction: Record<Filing, number>;
  /** Social Security (OASDI) wage base. */
  ssWageBase: number;
  /** §3101(b)(2): the 0.9% Additional Medicare tax starts here. */
  addlMedicareThreshold: Record<Filing, number>;
  /** §199A threshold and phase-in range (OBBBA widened the range for 2026+). */
  qbiThreshold: Record<Filing, number>;
  qbiRange: Record<Filing, number>;
  /** §24 child tax credit, per child under 17, and where it phases out. */
  ctcPerChild: number;
  ctcPhaseOut: Record<Filing, number>;
  /** §402(g) deferral, §415(c) annual additions, §414(v) catch-ups. */
  deferral: number;
  annualAdditions: number;
  catchUp50: number;
  catchUp60to63: number;
  /** §223 HSA limits. */
  hsaSelf: number;
  hsaFamily: number;
}

export const CHECKED_ON = '2026-11-17';

const ADDL_MEDICARE = { single: 200_000, mfj: 250_000, hoh: 200_000 } as const;
const CTC_PHASE_OUT = { single: 200_000, mfj: 400_000, hoh: 200_000 } as const;
const QBI_RANGE = { single: 75_000, mfj: 150_000, hoh: 75_000 } as const;

export const RATES: Record<number, YearRates> = {
  // Rev. Proc. 2025-32 (brackets, standard deduction, §199A, CTC);
  // SSA 2026 fact sheet (wage base); Notice 2025-67 (retirement);
  // Rev. Proc. 2025-19 (HSA).
  2026: {
    year: 2026,
    brackets: {
      single: [[0, 0.1], [12_400, 0.12], [50_400, 0.22], [105_700, 0.24], [201_775, 0.32], [256_225, 0.35], [640_600, 0.37]],
      mfj: [[0, 0.1], [24_800, 0.12], [100_800, 0.22], [211_400, 0.24], [403_550, 0.32], [512_450, 0.35], [768_700, 0.37]],
      hoh: [[0, 0.1], [17_700, 0.12], [67_450, 0.22], [105_700, 0.24], [201_750, 0.32], [256_200, 0.35], [640_600, 0.37]],
    },
    standardDeduction: { single: 16_100, mfj: 32_200, hoh: 24_150 },
    ssWageBase: 184_500,
    addlMedicareThreshold: ADDL_MEDICARE,
    qbiThreshold: { single: 201_750, mfj: 403_500, hoh: 201_750 },
    qbiRange: QBI_RANGE,
    ctcPerChild: 2_200,
    ctcPhaseOut: CTC_PHASE_OUT,
    deferral: 24_500,
    annualAdditions: 72_000,
    catchUp50: 8_000,
    catchUp60to63: 11_250,
    hsaSelf: 4_400,
    hsaFamily: 8_750,
  },
  // Rev. Proc. 2026-35 / IR-2026-133 (brackets, standard deduction, §199A,
  // CTC); SSA 2027 fact sheet, 14 Oct 2026 (wage base); Notice 2026-66
  // (retirement); Rev. Proc. 2026-24 (HSA).
  2027: {
    year: 2027,
    brackets: {
      single: [[0, 0.1], [12_800, 0.12], [52_025, 0.22], [109_125, 0.24], [208_325, 0.32], [264_550, 0.35], [661_375, 0.37]],
      mfj: [[0, 0.1], [25_600, 0.12], [104_050, 0.22], [218_250, 0.24], [416_650, 0.32], [529_100, 0.35], [793_650, 0.37]],
      hoh: [[0, 0.1], [18_250, 0.12], [69_650, 0.22], [109_100, 0.24], [208_300, 0.32], [264_550, 0.35], [661_350, 0.37]],
    },
    standardDeduction: { single: 16_600, mfj: 33_200, hoh: 24_925 },
    ssWageBase: 192_300,
    addlMedicareThreshold: ADDL_MEDICARE,
    qbiThreshold: { single: 208_300, mfj: 416_600, hoh: 208_300 },
    qbiRange: QBI_RANGE,
    ctcPerChild: 2_300,
    ctcPhaseOut: CTC_PHASE_OUT,
    deferral: 25_500,
    annualAdditions: 75_000,
    catchUp50: 8_500,
    catchUp60to63: 11_750,
    hsaSelf: 4_500,
    hsaFamily: 9_000,
  },
};

const YEARS = Object.keys(RATES)
  .map(Number)
  .sort((a, b) => a - b);

/** The figures for `year`, or the nearest year we have. */
export function ratesFor(year: number): YearRates {
  const exact = RATES[year];
  if (exact) return exact;
  const earlier = YEARS.filter((y) => y <= year);
  return RATES[earlier.length ? earlier[earlier.length - 1] : YEARS[0]];
}

/** Tax on `income` through a bracket table. */
export function bracketTax(income: number, brackets: readonly Bracket[], scale = 1): number {
  if (income <= 0) return 0;
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const from = brackets[i][0] * scale;
    const to = i + 1 < brackets.length ? brackets[i + 1][0] * scale : Infinity;
    if (income <= from) break;
    tax += (Math.min(income, to) - from) * brackets[i][1];
  }
  return tax;
}

/** The rate the next dollar of `income` is taxed at. */
export function marginalRate(income: number, brackets: readonly Bracket[], scale = 1): number {
  let rate = 0;
  for (const [from, r] of brackets) if (income > from * scale) rate = r;
  return rate;
}
