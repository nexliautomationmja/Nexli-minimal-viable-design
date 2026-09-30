// ---------------------------------------------------------------------------
// Qualification steps — pure data, safe to import from server routes.
// The six-step "High-Signal" funnel: Geography → Authority → Intent →
// Duration → Revenue → Tax-Planning Value. QualificationProvider re-exports
// everything here for client code.
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

export type QualificationStepKey =
  | 'usBased'
  | 'decisionRole'
  | 'goal'
  | 'problemDuration'
  | 'annualRevenue'
  | 'taxSavings';

export interface QualificationStepDef {
  key: QualificationStepKey;
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
    question: 'Is your firm based in the United States?',
    hint: 'We currently serve US-based CPA firms and accounting practices.',
    foundationHint: 'We build for US-based CPA firms and accounting practices.',
    options: null,
  },
  {
    key: 'decisionRole',
    question: "What's your role in the firm's decision-making?",
    hint: 'This helps us understand who will be involved in evaluating and implementing our system.',
    foundationHint: 'So we know who else to include in the next step.',
    options: decisionRoleOptions,
  },
  {
    key: 'goal',
    question: "What's the main thing you're trying to fix?",
    hint: 'This helps us prepare for your strategy session.',
    foundationHint: 'So we point you at the part of the system that matters most.',
    options: goalOptions,
  },
  {
    key: 'problemDuration',
    question: "How long has this been a problem you've wanted to solve?",
    hint: 'No wrong answer — we just want to understand where you are.',
    foundationHint: 'No wrong answer — we just want to understand where you are.',
    options: problemDurationOptions,
  },
  {
    key: 'annualRevenue',
    question: "What is your firm's approximate annual revenue?",
    hint: "This helps us tailor the strategy session to your firm's size and goals.",
    foundationHint: "This decides which of our two options actually fits your firm.",
    options: annualRevenueOptions,
  },
  {
    key: 'taxSavings',
    question: "What's the most you've ever saved a single client through tax planning?",
    hint: "This tells us how much advisory value you're already creating — and where the ceiling is.",
    foundationHint: "This tells us how much advisory value you're already creating.",
    options: taxSavingsOptions,
  },
];

export const QUALIFICATION_STEP_COUNT = QUALIFICATION_STEPS.length;

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
  };
}

/** Human-readable label for an answer value, or the raw value when unknown. */
export function qualificationLabel(key: QualificationStepKey, value: string | null): string | null {
  if (value == null) return null;
  const step = QUALIFICATION_STEPS.find((s) => s.key === key);
  return step?.options?.find((o) => o.value === value)?.label ?? value;
}
