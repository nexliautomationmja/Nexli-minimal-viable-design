// ---------------------------------------------------------------------------
// Lead Scoring — Server-side only
// ---------------------------------------------------------------------------
// Edit the arrays below to adjust qualification criteria.
// No logic changes needed — just add or remove values from the lists.
// ---------------------------------------------------------------------------

export type LeadClassification = 'raw' | 'qualified' | 'disqualified';

export interface LeadData {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  usBased?: boolean | null;
  decisionRole?: string | null;
  annualRevenue?: string | null;
  goal?: string | null;
  goalTag?: string | null;
  problemDuration?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  formSource?: string | null;
}

export interface ScoringResult {
  classification: LeadClassification;
  reason: string;
}

// ---------------------------------------------------------------------------
// Configurable thresholds — EDIT THESE to change qualification criteria
// ---------------------------------------------------------------------------

/** Revenue tiers that qualify a lead */
const QUALIFYING_REVENUES = ['500k-1m', '1m-5m', '5m+'];

/** Revenue tiers that disqualify a lead */
const DISQUALIFYING_REVENUES = ['under-500k'];

/** Decision roles that qualify a lead */
const QUALIFYING_ROLES = ['sole-owner', 'partner-authority'];

/** Decision roles that disqualify a lead */
const DISQUALIFYING_ROLES = ['not-decision-maker'];

/** Disposable email domains — leads from these are disqualified */
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'trashmail.com',
  'dispostable.com',
  'maildrop.cc',
  'fakeinbox.com',
];

/** Obviously fake test emails */
const FAKE_EMAIL_PATTERNS = [
  /^test@test\./i,
  /^test@example\./i,
  /^asdf@/i,
  /^a@a\./i,
  /^fake@/i,
  /^noreply@/i,
];

// ---------------------------------------------------------------------------
// Scoring logic
// ---------------------------------------------------------------------------

export function scoreLead(data: LeadData): ScoringResult {
  // ------ Disqualification checks ------

  // Missing email entirely
  if (!data.email || data.email.trim().length < 5) {
    return { classification: 'disqualified', reason: 'missing_email' };
  }

  const emailLower = data.email.trim().toLowerCase();

  // Disposable email domain
  const domain = emailLower.split('@')[1];
  if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { classification: 'disqualified', reason: 'disposable_email' };
  }

  // Fake email patterns
  for (const pattern of FAKE_EMAIL_PATTERNS) {
    if (pattern.test(emailLower)) {
      return { classification: 'disqualified', reason: 'fake_email' };
    }
  }

  // Not US-based (hard disqualifier from QualificationProvider)
  if (data.usBased === false) {
    return { classification: 'disqualified', reason: 'not_us_based' };
  }

  // Disqualifying decision role
  if (data.decisionRole && DISQUALIFYING_ROLES.includes(data.decisionRole)) {
    return { classification: 'disqualified', reason: 'not_decision_maker' };
  }

  // Disqualifying revenue
  if (data.annualRevenue && DISQUALIFYING_REVENUES.includes(data.annualRevenue)) {
    return { classification: 'disqualified', reason: 'revenue_too_low' };
  }

  // ------ Qualification checks ------
  // Only leads with full qualification data can be "qualified"
  // (lighter forms like free-guide will be "raw")

  const hasQualificationData = data.formSource === 'qualification-gate';

  if (hasQualificationData) {
    const revenueQualifies =
      data.annualRevenue != null && QUALIFYING_REVENUES.includes(data.annualRevenue);
    const roleQualifies =
      data.decisionRole != null && QUALIFYING_ROLES.includes(data.decisionRole);

    if (revenueQualifies && roleQualifies) {
      return { classification: 'qualified', reason: 'meets_all_criteria' };
    }
  }

  // ------ Default: raw lead ------
  return { classification: 'raw', reason: 'insufficient_qualification_data' };
}
