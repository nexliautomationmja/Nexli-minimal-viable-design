// ---------------------------------------------------------------------------
// The Digital Rainmaker System's numbers — one source of truth.
//
// These were module-local in the old GuaranteeSection, and
// components/demo/AdsDashboard.tsx had already grown a second, independent
// copy of ENGAGEMENT_AVG. A third copy was about to appear on the advisory
// thank-you page, so they live here instead.
//
// Tune them here. The pipeline math everywhere else is computed from them.
// ---------------------------------------------------------------------------

// ── What the firm pays Nexli ──────────────────────────────────────────────
// Two numbers only, and they are NOT itemised anywhere. The system is sold
// whole: one fee for the website, the portal, the funnel and the automations
// together. Do not add setup-fee or per-component constants here — the moment
// the price has parts, the sales page starts arguing about the parts.
//
// Keep these distinct from AGENCY_ENGAGEMENT_* below, which is a completely
// different thing: what the CPA charges THEIR client. Conflating the two is
// the easiest mistake to make in this file.

/** The complete system, flat, every month. No setup fee, no contract. */
export const AGENCY_MONTHLY_FEE = 4_997;

/**
 * The firm's own ad budget. Paid to the platforms through their account, not
 * to Nexli — which is why it is a separate number rather than folded in.
 */
export const AGENCY_AD_SPEND = 5_000;

/** What it actually costs them to run this: $9,997. */
export const AGENCY_TOTAL_MONTHLY = AGENCY_MONTHLY_FEE + AGENCY_AD_SPEND;

// ── What the system is built to produce ──────────────────────────────────

/**
 * Qualified leads the system is built to produce in AGENCY_DAYS.
 *
 * A projection, not a promise. Nexli does not offer guarantees — never
 * phrase this as "we guarantee", "or we keep working free", or anything
 * with a penalty attached.
 */
export const AGENCY_LEADS = 50;

/** The window that projection runs over. */
export const AGENCY_DAYS = 90;

// ── What the CPA charges their own client ────────────────────────────────

export const AGENCY_ENGAGEMENT_LOW = 5_000;
export const AGENCY_ENGAGEMENT_HIGH = 25_000;

/** Midpoint of the engagement range — $15,000. */
export const AGENCY_ENGAGEMENT_AVG =
  (AGENCY_ENGAGEMENT_LOW + AGENCY_ENGAGEMENT_HIGH) / 2;

/**
 * $750,000. What those leads would be worth IF every one closed at the
 * average fee — which no firm does.
 *
 * Never render this without the accompanying disclaimer. Even the lead count
 * is a projection now; this number is a ceiling on top of it, and presenting
 * it as revenue would be a claim we cannot stand behind.
 */
export const AGENCY_PIPELINE_VALUE = AGENCY_LEADS * AGENCY_ENGAGEMENT_AVG;

/**
 * How long a build takes, as a range rather than a deadline. Most firms are
 * live by AGENCY_LAUNCH_DAYS; AGENCY_LAUNCH_DAYS_MAX is the realistic worst
 * case when assets, access and approvals come back slowly. Not the same
 * clock as AGENCY_DAYS, and no longer a guarantee with a credit attached.
 */
export const AGENCY_LAUNCH_DAYS = 14;
export const AGENCY_LAUNCH_DAYS_MIN = 10;
export const AGENCY_LAUNCH_DAYS_MAX = 24;

export const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
