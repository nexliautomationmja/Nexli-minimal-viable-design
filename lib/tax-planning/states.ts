// ---------------------------------------------------------------------------
// State income tax for the Tax Planning Tool: every state and DC.
//
// Source: Tax Foundation, "State Individual Income Tax Rates and Brackets,
// 2026", single-filer brackets, read 2026-11-17. Each entry is
// [income the rate starts at, rate]; a first bracket starting above 0 means
// the income below it is untaxed (Ohio, Mississippi, North Dakota...).
//
// DELIBERATE SIMPLIFICATIONS, all printed on the page:
// - Married filing jointly doubles the single thresholds. Many states do
//   exactly that; some don't, and the tool says it is approximate.
// - The base is federal AGI less the federal standard deduction. States
//   have their own deductions and exemptions; this is close, not exact.
// - No city or county tax (NYC, Maryland counties, Ohio cities). The
//   "your rate" override is there for anyone who wants to fold those in.
// - The nine states with no tax on wages and business income are an
//   explicit empty table, so they compute to $0 rather than to a blank.
//   Washington taxes capital gains only, which this tool does not model.
// - The 2026 tables serve the next-year projection too.
//
// S-corp entity tax is modelled only where it is material and simple:
// California's 1.5% franchise tax ($800 minimum) and Illinois's 1.5%
// replacement tax, which Illinois also charges partnerships.
// ---------------------------------------------------------------------------
import type { Bracket } from './rates';

export interface StateInfo {
  code: string;
  name: string;
  brackets: readonly Bracket[];
  /** Entity-level tax on an S corp's income: a rate and a minimum. */
  sCorpTax?: { rate: number; min: number };
  /** Entity-level tax on a partnership's income. */
  partnershipTax?: { rate: number; min: number };
}

const pct = (rows: [number, number][]): Bracket[] => rows.map(([from, r]) => [from, r / 100] as const);
const NONE: Bracket[] = [];

export const STATES: readonly StateInfo[] = [
  { code: 'AL', name: 'Alabama', brackets: pct([[0, 2], [500, 4], [3_000, 5]]) },
  { code: 'AK', name: 'Alaska', brackets: NONE },
  { code: 'AZ', name: 'Arizona', brackets: pct([[0, 2.5]]) },
  { code: 'AR', name: 'Arkansas', brackets: pct([[0, 2], [4_600, 3.9]]) },
  {
    code: 'CA',
    name: 'California',
    brackets: pct([[0, 1], [11_079, 2], [26_264, 4], [41_452, 6], [57_542, 8], [72_724, 9.3], [371_479, 10.3], [445_771, 11.3], [742_953, 12.3], [1_000_000, 13.3]]),
    sCorpTax: { rate: 0.015, min: 800 },
  },
  { code: 'CO', name: 'Colorado', brackets: pct([[0, 4.4]]) },
  { code: 'CT', name: 'Connecticut', brackets: pct([[0, 2], [10_000, 4.5], [50_000, 5.5], [100_000, 6], [200_000, 6.5], [250_000, 6.9], [500_000, 6.99]]) },
  { code: 'DE', name: 'Delaware', brackets: pct([[2_000, 2.2], [5_000, 3.9], [10_000, 4.8], [20_000, 5.2], [25_000, 5.55], [60_000, 6.6]]) },
  { code: 'DC', name: 'District of Columbia', brackets: pct([[0, 4], [10_000, 6], [40_000, 6.5], [60_000, 8.5], [250_000, 9.25], [500_000, 9.75], [1_000_000, 10.75]]) },
  { code: 'FL', name: 'Florida', brackets: NONE },
  { code: 'GA', name: 'Georgia', brackets: pct([[0, 5.19]]) },
  { code: 'HI', name: 'Hawaii', brackets: pct([[0, 1.4], [9_600, 3.2], [14_400, 5.5], [19_200, 6.4], [24_000, 6.8], [36_000, 7.2], [48_000, 7.6], [125_000, 7.9], [175_000, 8.25], [225_000, 9], [275_000, 10], [325_000, 11]]) },
  { code: 'ID', name: 'Idaho', brackets: pct([[4_811, 5.3]]) },
  {
    code: 'IL',
    name: 'Illinois',
    brackets: pct([[0, 4.95]]),
    sCorpTax: { rate: 0.015, min: 0 },
    partnershipTax: { rate: 0.015, min: 0 },
  },
  { code: 'IN', name: 'Indiana', brackets: pct([[0, 2.95]]) },
  { code: 'IA', name: 'Iowa', brackets: pct([[0, 3.8]]) },
  { code: 'KS', name: 'Kansas', brackets: pct([[0, 5.2], [23_000, 5.58]]) },
  { code: 'KY', name: 'Kentucky', brackets: pct([[0, 3.5]]) },
  { code: 'LA', name: 'Louisiana', brackets: pct([[0, 3]]) },
  { code: 'ME', name: 'Maine', brackets: pct([[0, 5.8], [27_399, 6.75], [64_849, 7.15]]) },
  { code: 'MD', name: 'Maryland', brackets: pct([[0, 2], [1_000, 3], [2_000, 4], [3_000, 4.75], [100_000, 5], [125_000, 5.25], [150_000, 5.5], [250_000, 5.75], [500_000, 6.25], [1_000_000, 6.5]]) },
  { code: 'MA', name: 'Massachusetts', brackets: pct([[0, 5], [1_083_150, 9]]) },
  { code: 'MI', name: 'Michigan', brackets: pct([[0, 4.25]]) },
  { code: 'MN', name: 'Minnesota', brackets: pct([[0, 5.35], [33_310, 6.8], [109_430, 7.85], [203_150, 9.85]]) },
  { code: 'MS', name: 'Mississippi', brackets: pct([[10_000, 4]]) },
  { code: 'MO', name: 'Missouri', brackets: pct([[1_348, 2], [2_696, 2.5], [4_044, 3], [5_392, 3.5], [6_740, 4], [8_088, 4.5], [9_436, 4.7]]) },
  { code: 'MT', name: 'Montana', brackets: pct([[0, 4.7], [47_500, 5.65]]) },
  { code: 'NE', name: 'Nebraska', brackets: pct([[0, 2.46], [4_130, 3.51], [24_760, 4.55]]) },
  { code: 'NV', name: 'Nevada', brackets: NONE },
  { code: 'NH', name: 'New Hampshire', brackets: NONE },
  { code: 'NJ', name: 'New Jersey', brackets: pct([[0, 1.4], [20_000, 1.75], [35_000, 3.5], [40_000, 5.53], [75_000, 6.37], [500_000, 8.97], [1_000_000, 10.75]]) },
  { code: 'NM', name: 'New Mexico', brackets: pct([[0, 1.5], [5_500, 3.2], [16_500, 4.3], [33_500, 4.7], [66_500, 4.9], [210_000, 5.9]]) },
  { code: 'NY', name: 'New York', brackets: pct([[0, 3.9], [8_500, 4.4], [11_700, 5.15], [13_900, 5.4], [80_650, 5.9], [215_400, 6.85], [1_077_550, 9.65], [5_000_000, 10.3], [25_000_000, 10.9]]) },
  { code: 'NC', name: 'North Carolina', brackets: pct([[0, 3.99]]) },
  { code: 'ND', name: 'North Dakota', brackets: pct([[48_475, 1.95], [244_825, 2.5]]) },
  { code: 'OH', name: 'Ohio', brackets: pct([[26_050, 2.75]]) },
  { code: 'OK', name: 'Oklahoma', brackets: pct([[3_750, 2.5], [4_900, 3.5], [7_200, 4.5]]) },
  { code: 'OR', name: 'Oregon', brackets: pct([[0, 4.75], [4_550, 6.75], [11_400, 8.75], [125_000, 9.9]]) },
  { code: 'PA', name: 'Pennsylvania', brackets: pct([[0, 3.07]]) },
  { code: 'RI', name: 'Rhode Island', brackets: pct([[0, 3.75], [82_050, 4.75], [186_450, 5.99]]) },
  { code: 'SC', name: 'South Carolina', brackets: pct([[3_640, 3], [18_230, 6]]) },
  { code: 'SD', name: 'South Dakota', brackets: NONE },
  { code: 'TN', name: 'Tennessee', brackets: NONE },
  { code: 'TX', name: 'Texas', brackets: NONE },
  { code: 'UT', name: 'Utah', brackets: pct([[0, 4.5]]) },
  { code: 'VT', name: 'Vermont', brackets: pct([[0, 3.35], [49_400, 6.6], [119_700, 7.6], [249_700, 8.75]]) },
  { code: 'VA', name: 'Virginia', brackets: pct([[0, 2], [3_000, 3], [5_000, 5], [17_000, 5.75]]) },
  { code: 'WA', name: 'Washington', brackets: NONE },
  { code: 'WV', name: 'West Virginia', brackets: pct([[0, 2.22], [10_000, 2.96], [25_000, 3.33], [40_000, 4.44], [60_000, 4.82]]) },
  { code: 'WI', name: 'Wisconsin', brackets: pct([[0, 3.5], [15_110, 4.4], [51_950, 5.3], [332_720, 7.65]]) },
  { code: 'WY', name: 'Wyoming', brackets: NONE },
];

const BY_CODE = new Map(STATES.map((s) => [s.code, s]));

export function stateInfo(code: string): StateInfo {
  return BY_CODE.get(code) ?? BY_CODE.get('TX')!;
}

export function isStateCode(code: unknown): code is string {
  return typeof code === 'string' && BY_CODE.has(code);
}
