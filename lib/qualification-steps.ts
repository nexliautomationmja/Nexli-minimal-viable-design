// ---------------------------------------------------------------------------
// Qualification steps — pure data, safe to import from server routes.
// QualificationProvider re-exports everything here for client code.
//
// TWO step lists, deliberately:
//
//   QUALIFICATION_STEPS          the original six — Geography, Authority,
//                                Intent, Duration, Revenue, Tax-Planning
//                                Value. Still used by the demo funnel and by
//                                the site-wide qualification modal. Frozen.
//
//   ADVISORY_QUALIFICATION_STEPS the advisory funnel's. Four questions, then
//                                contact details, then the budget question
//                                that routes to the calendar or the downsell.
//
// They are separate rather than one filtered list because the demo funnel's
// payload, GHL note and progress bar are all shaped by its six, and nothing
// about this funnel should be able to move them.
// ---------------------------------------------------------------------------

export interface QualificationAnswers {
  usBased: boolean | null;
  decisionRole: string | null;
  goal: string | null;
  goalTag: string | null;
  problemDuration: string | null;
  annualRevenue: string | null;
  taxSavings: string | null;
  taxSavingsTag: string | null;
  /** Advisory funnel only; always null on the demo funnel. */
  budget: string | null;
}

/**
 * Contact details, collected mid-qualifier now that the advisory funnel has
 * no opt-in step in front of it. Kept out of QualificationAnswers because
 * these map to their own lead columns and must not pass through
 * normalizeQualificationAnswers, which whitelists against option lists.
 */
export interface QualificationContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firmName: string;
  marketingSmsOptIn: boolean;
}

export interface QualificationOption {
  value: string;
  label: string;
}

export const EMPTY_QUALIFICATION_ANSWERS: QualificationAnswers = {
  usBased: null,
  decisionRole: null,
  goal: null,
  goalTag: null,
  problemDuration: null,
  annualRevenue: null,
  taxSavings: null,
  taxSavingsTag: null,
  budget: null,
};

export const decisionRoleOptions: QualificationOption[] = [
  { value: 'sole-owner', label: "I'm the sole owner — I make all the decisions" },
  { value: 'partner-authority', label: "I'm a partner with authority to make this decision" },
  { value: 'partner-need-approval', label: "I'm a partner but other partners would need to weigh in" },
  { value: 'not-decision-maker', label: "I'm not involved in decisions like this" },
];

export const DISQUALIFYING_ROLE = 'not-decision-maker';

export const goalOptions: QualificationOption[] = [
  { value: 'generate-leads', label: 'We need help generating new leads and finding clients' },
  { value: 'better-website', label: 'Upgrade our website and digital presence' },
  { value: 'streamline-ops', label: 'Streamline operations and reduce manual work' },
  { value: 'more-reviews', label: 'Get more Google reviews and improve our reputation' },
];

export const goalTagMap: Record<string, string> = {
  'generate-leads': 'hot_full_system',
  'better-website': 'warm_full_system',
  'streamline-ops': 'warm_automations',
  'more-reviews': 'soft_single_pillar',
};

export const problemDurationOptions: QualificationOption[] = [
  { value: 'just-started', label: 'Just started looking' },
  { value: 'few-months', label: 'A few months' },
  { value: '6-12-months', label: '6–12 months' },
  { value: 'over-a-year', label: 'Over a year' },
];

export const annualRevenueOptions: QualificationOption[] = [
  { value: 'under-400k', label: 'Under $400K per year' },
  { value: '400k-500k', label: '$400K – $500K per year' },
  { value: '500k-1m', label: '$500K – $1M per year' },
  { value: '1m-5m', label: '$1M – $5M per year' },
  { value: '5m+', label: '$5M+ per year' },
];

export const DISQUALIFYING_REVENUE = 'under-400k';

export const taxSavingsOptions: QualificationOption[] = [
  { value: '100k-plus', label: '$100K+ saved in a single engagement' },
  { value: '50k-100k', label: '$50K – $100K' },
  { value: '10k-50k', label: '$10K – $50K' },
  { value: 'under-10k', label: "Under $10K — or we don't do much tax planning yet" },
];

export const taxSavingsTagMap: Record<string, string> = {
  '100k-plus': 'taxplan_elite',
  '50k-100k': 'taxplan_strong',
  '10k-50k': 'taxplan_developing',
  'under-10k': 'taxplan_compliance',
};

// ── Budget: the advisory funnel's last question and its real gate ────────
// Phrased around the all-in number because that is what they actually pay:
// AGENCY_MONTHLY_FEE + AGENCY_AD_SPEND. Labels stay in sync with
// lib/agency-offer.ts by hand — they are prose, not computed, because a
// templated sentence here reads worse than a written one.

export const budgetOptions: QualificationOption[] = [
  { value: 'ready', label: "That works — we're ready to invest at that level" },
  { value: 'tight', label: "Workable, but we'd want to phase into the ad spend" },
  { value: 'under', label: 'Under $5,000 a month is realistic for us right now' },
  { value: 'no', label: "We're not looking to invest in growth at the moment" },
];

/**
 * Who the budget question turns away. Separate from the option list so the
 * bar can move without touching the copy — same pattern as
 * DISQUALIFYING_ROLE and DISQUALIFYING_REVENUE.
 */
export const DISQUALIFYING_BUDGETS = ['under', 'no'];

export type QualificationStepKey =
  | 'usBased'
  | 'decisionRole'
  | 'goal'
  | 'problemDuration'
  | 'annualRevenue'
  | 'taxSavings'
  | 'contact'
  | 'budget';

/**
 * What the card renders for a step. Before this existed the card branched on
 * the step KEY and `options: null` secretly meant "render Yes/No", so adding
 * a step meant editing three exhaustive Record lookups and a ternary.
 */
export type QualificationStepType = 'boolean' | 'choice' | 'contact';

export interface QualificationStepDef {
  key: QualificationStepKey;
  type: QualificationStepType;
  question: string;
  /** Sub-copy for the call funnel. */
  hint: string;
  /** Sub-copy for the demo funnel's qualifier (no strategy-session framing —
   *  at this point the visitor does not yet know which path they will get). */
  foundationHint: string;
  /** Option list; usBased is a yes/no step and has no options. */
  options: QualificationOption[] | null;
}

export const QUALIFICATION_STEPS: QualificationStepDef[] = [
  {
    key: 'usBased',
    type: 'boolean',
    question: 'Is your firm based in the United States?',
    hint: 'We currently serve US-based CPA firms and accounting practices.',
    foundationHint: 'We build for US-based CPA firms and accounting practices.',
    options: null,
  },
  {
    key: 'decisionRole',
    type: 'choice',
    question: "What's your role in the firm's decision-making?",
    hint: 'This helps us understand who will be involved in evaluating and implementing our system.',
    foundationHint: 'So we know who else to include in the next step.',
    options: decisionRoleOptions,
  },
  {
    key: 'goal',
    type: 'choice',
    question: "What's the main thing you're trying to fix?",
    hint: 'This helps us prepare for your strategy session.',
    foundationHint: 'So we point you at the part of the system that matters most.',
    options: goalOptions,
  },
  {
    key: 'problemDuration',
    type: 'choice',
    question: "How long has this been a problem you've wanted to solve?",
    hint: 'No wrong answer — we just want to understand where you are.',
    foundationHint: 'No wrong answer — we just want to understand where you are.',
    options: problemDurationOptions,
  },
  {
    key: 'annualRevenue',
    type: 'choice',
    question: "What is your firm's approximate annual revenue?",
    hint: "This helps us tailor the strategy session to your firm's size and goals.",
    foundationHint: "This decides which of our two options actually fits your firm.",
    options: annualRevenueOptions,
  },
  {
    key: 'taxSavings',
    type: 'choice',
    question: "What's the most you've ever saved a single client through tax planning?",
    hint: "This tells us how much advisory value you're already creating — and where the ceiling is.",
    foundationHint: "This tells us how much advisory value you're already creating.",
    options: taxSavingsOptions,
  },
];

export const QUALIFICATION_STEP_COUNT = QUALIFICATION_STEPS.length;

/**
 * The advisory funnel's qualifier.
 *
 * Four questions, then contact, then budget. The order is the point: two or
 * three easy answers build enough momentum that the contact step is no
 * longer the first thing asked of a cold visitor, and the contact step sits
 * BEFORE the budget question so a firm that fails on budget has still
 * identified itself — that is who the $297 downsell exists for.
 *
 * problemDuration and taxSavings are deliberately absent. They were
 * collected and never used for anything: no routing, no tag, no copy.
 */
export const ADVISORY_QUALIFICATION_STEPS: QualificationStepDef[] = [
  {
    key: 'usBased',
    type: 'boolean',
    question: 'Is your firm based in the United States?',
    hint: 'We currently serve US-based CPA firms and accounting practices.',
    foundationHint: 'We build for US-based CPA firms and accounting practices.',
    options: null,
  },
  {
    key: 'decisionRole',
    type: 'choice',
    question: "What's your role in the firm's decision-making?",
    hint: 'This helps us understand who will be involved in evaluating and implementing our system.',
    foundationHint: 'So we know who else to include in the next step.',
    options: decisionRoleOptions,
  },
  {
    key: 'annualRevenue',
    type: 'choice',
    question: "What is your firm's approximate annual revenue?",
    hint: "This helps us tailor the strategy session to your firm's size and goals.",
    foundationHint: 'This decides which of our two options actually fits your firm.',
    options: annualRevenueOptions,
  },
  {
    key: 'goal',
    type: 'choice',
    question: "What's the main thing you're trying to fix?",
    hint: 'This helps us prepare for your strategy session.',
    foundationHint: 'So we point you at the part of the system that matters most.',
    options: goalOptions,
  },
  {
    key: 'contact',
    type: 'contact',
    question: 'Where should we send your results?',
    hint: 'So we can send the details and get the right person on the call.',
    foundationHint: 'So we can send the details and get the right person on the call.',
    options: null,
  },
  {
    key: 'budget',
    type: 'choice',
    question: 'Where does that sit for your firm right now?',
    hint: 'The complete system is $4,997 a month, plus about $5,000 a month in ad spend you control and pay the platforms directly — roughly $10,000 a month all in.',
    foundationHint: 'The complete system is $4,997 a month, plus about $5,000 a month in ad spend you control — roughly $10,000 a month all in.',
    options: budgetOptions,
  },
];

export const ADVISORY_QUALIFICATION_STEP_COUNT = ADVISORY_QUALIFICATION_STEPS.length;

function pickOption(value: unknown, options: QualificationOption[]): string | null {
  return typeof value === 'string' && options.some((o) => o.value === value) ? value : null;
}

/**
 * Coerce untrusted input into QualificationAnswers. Unknown option values
 * become null; derived tags are recomputed from the validated values.
 */
export function normalizeQualificationAnswers(input: unknown): QualificationAnswers {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const goal = pickOption(raw.goal, goalOptions);
  const taxSavings = pickOption(raw.taxSavings, taxSavingsOptions);
  return {
    usBased: typeof raw.usBased === 'boolean' ? raw.usBased : null,
    decisionRole: pickOption(raw.decisionRole, decisionRoleOptions),
    goal,
    goalTag: goal ? goalTagMap[goal] ?? null : null,
    problemDuration: pickOption(raw.problemDuration, problemDurationOptions),
    annualRevenue: pickOption(raw.annualRevenue, annualRevenueOptions),
    taxSavings,
    taxSavingsTag: taxSavings ? taxSavingsTagMap[taxSavings] ?? null : null,
    budget: pickOption(raw.budget, budgetOptions),
  };
}

/** Human-readable label for an answer value, or the raw value when unknown. */
export function qualificationLabel(key: QualificationStepKey, value: string | null): string | null {
  if (value == null) return null;
  const step =
    QUALIFICATION_STEPS.find((s) => s.key === key) ??
    ADVISORY_QUALIFICATION_STEPS.find((s) => s.key === key);
  return step?.options?.find((o) => o.value === value)?.label ?? value;
}
