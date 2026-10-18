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
// The RECURRING side, and it is NOT itemised anywhere. The system is sold
// whole: one monthly fee for the website, the portal, the funnel and the
// automations together. Do not add per-component constants — the moment the
// monthly has parts, the sales page starts arguing about the parts.
//
// There is also a ONE-TIME SETUP FEE covering the build. It is deliberately
// not a constant here and not a number on any page: it is quoted on the call,
// because it varies with what a firm already has. Pages must DISCLOSE it —
// a $9,997 sticker with an unmentioned setup fee is a bait — they just must
// not price it.
//
// Keep these distinct from AGENCY_ENGAGEMENT_* below, which is a completely
// different thing: what the CPA charges THEIR client. Conflating the two is
// the easiest mistake to make in this file.

/** The recurring fee, flat, every month. A one-time setup fee is quoted
 *  separately on the call. Six-month minimum initial term, then month to
 *  month — see components/TermsAndConditions. */
export const AGENCY_MONTHLY_FEE = 4_997;

/**
 * The ad budget, collected by Nexli as part of the monthly and placed into
 * the campaigns. It is NOT billed separately and the firm does not pay the
 * platforms itself — running it through us is what keeps spend on schedule.
 *
 * Kept as its own constant only so the split can be disclosed. The price
 * quoted anywhere is AGENCY_TOTAL_MONTHLY, one number.
 */
export const AGENCY_AD_SPEND = 5_000;

/** The sticker price. One number, quoted everywhere: $9,997 a month. */
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

/**
 * What a tax planning engagement actually sells for, revised 18 Oct 2026
 * after looking at what competitors charge. It was $5,000-$25,000 with
 * $15,000 as the midpoint; the real floor is higher and the ceiling is a
 * long way higher.
 *
 * AGENCY_ENGAGEMENT_LOW is the number the funnel leads with, and it is the
 * FLOOR, not an average. That is a deliberate change of framing: "$15,000
 * is the worst this pays" is a stronger and safer claim than "$15,000 is
 * typical", because the first one cannot be beaten downward by a sceptic
 * and the second invites the question of who is below it.
 */
export const AGENCY_ENGAGEMENT_LOW = 15_000;
export const AGENCY_ENGAGEMENT_HIGH = 55_000;

/**
 * The midpoint, $35,000.
 *
 * Use it ONLY where the word "average" is actually meant. Every headline
 * figure on the site reads AGENCY_ENGAGEMENT_LOW instead, so the public
 * claim stays conservative — nothing quotes $35,000 at a prospect as if a
 * typical engagement lands there, because nobody has measured that.
 */
export const AGENCY_ENGAGEMENT_AVG =
  (AGENCY_ENGAGEMENT_LOW + AGENCY_ENGAGEMENT_HIGH) / 2;

/**
 * What those leads would be worth IF every one closed — at the FLOOR fee,
 * not the midpoint, which keeps the ceiling on this number as low as the
 * range honestly allows. No firm closes every lead anyway.
 *
 * Never render this without the accompanying disclaimer. Even the lead count
 * is a projection now; this number is a ceiling on top of it, and presenting
 * it as revenue would be a claim we cannot stand behind.
 */
export const AGENCY_PIPELINE_VALUE = AGENCY_LEADS * AGENCY_ENGAGEMENT_LOW;

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
