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
//   ADVISORY_QUALIFICATION_STEPS the four VSL funnels'. Four questions, then
//                                contact details, and the answers route to
//                                the calendar or the downsell. (It ended on a
//                                budget question until 2026-11-11.)
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
  // Label only. The VALUE stays 'streamline-ops', so nothing stored,
  // scored or tagged changes - goalTagMap below still maps it to
  // warm_automations, and every existing lead keeps its answer. Adding a
  // fifth option instead would have split one intent across two values
  // and made the goal breakdown useless.
  { value: 'streamline-ops', label: 'Implement AI and systems to reduce manual work' },
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

// ── Revenue: the floor moved to $750K on 3 November 2026 ─────────────────
//
// It was $400K, split across five bands. The bar is now $750K and anything
// under it is a hard no, so the three bands below the line collapse into
// one: there is no decision to make with the difference between a $200K
// firm and a $600K firm when both get the same answer. Four options also
// beats five on a step every visitor has to clear.
//
// $5M+ stays its own band rather than merging into $1M+. Those firms
// qualify like any other, but they are the enterprise conversation, and
// that is worth being able to see in the data.
//
// THE OLD VALUES STILL EXIST IN THE DATABASE. Leads captured before today
// carry 'under-400k', '400k-500k' and '500k-1m'. Nothing rewrites them and
// nothing should — they are what the firm actually answered. Two
// consequences: qualificationLabel falls back to printing the raw value for
// a band no longer listed here, and lib/lead-scoring keeps the retired
// values in its own lists so re-scoring an old lead still lands somewhere
// sensible. '500k-1m' straddles the new line and is deliberately in neither
// of those lists, because a firm that answered it could be either side.
export const annualRevenueOptions: QualificationOption[] = [
  { value: 'under-750k', label: 'Under $750K per year' },
  { value: '750k-1m', label: '$750K – $1M per year' },
  { value: '1m-5m', label: '$1M – $5M per year' },
  { value: '5m+', label: '$5M+ per year' },
];

export const DISQUALIFYING_REVENUE = 'under-750k';

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

// ── Budget: RETIRED as a question on 2026-11-11 ──────────────────────────
// It was the advisory funnel's last step: "Where does that sit for your firm
// right now?" under the $9,997 price. Marcel took it out because it was
// friction the VSL had already done the work of: every VSL page shows the
// price, the setup fee and the term before anyone reaches the qualifier.
//
// The options, the bar and the column all stay. Leads captured before the
// change carry a budget answer, lib/advisory-fit still explains a turn-away
// from it, and a visitor mid-flow on the old bundle at deploy time still
// sends one. normalizeQualificationAnswers keeps accepting it, and
// recordQualification still gates on it when present.

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
 * The advisory funnel's qualifier, shared by the four VSL angles.
 *
 * Four questions, then contact, and contact is LAST. The order is the
 * point: easy answers first build enough momentum that the contact step is
 * not the first thing asked of a cold visitor, and submitting it is the
 * finish, so there is no step left to abandon after giving details.
 *
 * No budget question since 2026-11-11 (see budgetOptions above). With
 * contact last, the qualifier page must NOT pass a partialEndpoint: that
 * banks contact details "before the remaining questions", and with none
 * remaining it would tag every lead as incomplete a moment before they
 * finish.
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
    // GIVES A REASON WORTH THE DETAILS. "Where should we send your results?"
    // asked for a phone number in exchange for a noun nobody had been
    // promised - there is no "results" document at the end of this, and the
    // visitor can tell. Both reasons below are things the funnel actually
    // does: the answers are on the screen in front of whoever takes the
    // call, and recordQualification stores a resume destination so a closed
    // tab comes back to the calendar rather than to question one.
    key: 'contact',
    type: 'contact',
    question: 'Who should we prepare this for?',
    hint: 'So we read your answers before the call rather than on it — and so you can pick up where you left off if this tab closes.',
    foundationHint: 'So we read your answers before the call rather than on it — and so you can pick up where you left off if this tab closes.',
    options: null,
  },
];

export const ADVISORY_QUALIFICATION_STEP_COUNT = ADVISORY_QUALIFICATION_STEPS.length;

/**
 * The Accelerator funnel's five questions: the advisory list minus budget.
 *
 * DERIVED, NOT COPIED. A second literal array would drift — someone edits a
 * question on one funnel, the other keeps the old wording, and two ad
 * campaigns quietly start asking different things. Filtering the existing
 * array means the keys, the option lists and the question text can only
 * ever be identical.
 *
 * DROPPING BUDGET IS SAFE. recordQualification only gates on budget when it
 * is non-null, and normalizeQualificationAnswers yields null for a step
 * that was never asked. The demo funnel has always run through that same
 * code path without a budget question.
 *
 * WHY BUDGET GOES AT ALL: nothing here costs anything. Asking a firm what
 * it can spend, before handing it a free guide, is the fastest way to lose
 * the lead this funnel exists to collect.
 */
const ACCELERATOR_OVERRIDES: Partial<
  Record<QualificationStepKey, Partial<QualificationStepDef>>
> = {
  // The advisory hint says this decides "which of our two options actually
  // fits your firm". There is only one thing on offer here.
  annualRevenue: { foundationHint: 'So we know which version of the playbook applies to you.' },
  // And this is what they are actually getting.
  //
  // The question is pinned too, not just the hint. The advisory funnel's
  // contact step now asks "Who should we prepare this for?", which is right
  // when the next step is a call and wrong when it is a PDF download — the
  // Accelerator keeps the wording it has always had.
  contact: {
    question: 'Where should we send your results?',
    foundationHint: 'Where we send the Accelerator. It arrives by email in a few minutes.',
  },
};

export const ACCELERATOR_QUALIFICATION_STEPS: QualificationStepDef[] =
  // The advisory list has had no budget step since 2026-11-11, so this filter
  // is a no-op today. Kept so the Accelerator can never ask about money if a
  // budget step ever comes back to the advisory funnel.
  ADVISORY_QUALIFICATION_STEPS.filter((step) => step.key !== 'budget').map((step) => {
    const override = ACCELERATOR_OVERRIDES[step.key];
    return override ? { ...step, ...override } : step;
  });

export const ACCELERATOR_QUALIFICATION_STEP_COUNT = ACCELERATOR_QUALIFICATION_STEPS.length;

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
  // Budget is in no step list any more, but older leads still carry an
  // answer to it, and that should print as its label rather than 'under'.
  const options =
    key === 'budget'
      ? budgetOptions
      : (QUALIFICATION_STEPS.find((s) => s.key === key) ??
          ADVISORY_QUALIFICATION_STEPS.find((s) => s.key === key))?.options;
  return options?.find((o) => o.value === value)?.label ?? value;
}
