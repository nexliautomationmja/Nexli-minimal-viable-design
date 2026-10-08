// ---------------------------------------------------------------------------
// The Digital Rainmaker System's numbers — one source of truth.
//
// These were module-local in components/GuaranteeSection.tsx, and
// components/demo/AdsDashboard.tsx had already grown a second, independent
// copy of ENGAGEMENT_AVG. A third copy was about to appear on the advisory
// thank-you page, so they live here instead.
//
// Tune them here. The pipeline math everywhere else is computed from them.
// ---------------------------------------------------------------------------

/** Qualified leads written into the agreement. This one IS guaranteed. */
export const AGENCY_LEADS = 50;

/** The window the guarantee runs over. */
export const AGENCY_DAYS = 90;

export const AGENCY_ENGAGEMENT_LOW = 5_000;
export const AGENCY_ENGAGEMENT_HIGH = 25_000;

/** Midpoint of the engagement range — $15,000. */
export const AGENCY_ENGAGEMENT_AVG =
  (AGENCY_ENGAGEMENT_LOW + AGENCY_ENGAGEMENT_HIGH) / 2;

/**
 * $750,000. What the guaranteed leads are worth IF every one closed at the
 * average fee — which no firm does.
 *
 * Never render this without the accompanying disclaimer. The leads are a
 * promise; this number is a ceiling used to size the opportunity, and
 * presenting it as revenue would be a claim we cannot stand behind.
 */
export const AGENCY_PIPELINE_VALUE = AGENCY_LEADS * AGENCY_ENGAGEMENT_AVG;

/** Days to launch the funnel. Not the same clock as AGENCY_DAYS. */
export const AGENCY_LAUNCH_DAYS = 14;

export const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
