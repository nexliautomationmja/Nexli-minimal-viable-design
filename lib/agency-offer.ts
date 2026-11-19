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

/** $10,000, $15,000. Declared first: CLIENT_VALUE_LINE below calls it at load. */
export const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

// ── THE RETAINER: what the firm pays Nexli (Marcel, 2026-11-19) ──────────
// It replaced the setup-fee model ($40,000 setup + $9,997 a month with the
// ads inside it, or an $82,000 annual plan, and a first-month ad bonus) on
// every page at once: the VSLs, /booking-confirmed-b, /terms, /pricing,
// /refund-policy, /delivery-policy, /math, Candor, lib/site and the guides.
//
//   - $10,000 a month, the agency minimum. NO SETUP FEE.
//   - Billed from SIGNING: the first month is due when the agreement is
//     signed, and the six-month initial term counts from signing.
//   - After six months it RENEWS for another six months, and so on, unless
//     the firm cancels before the current term ends.
//   - Or PREPAY the six months: $50,000 instead of $60,000, a $10,000 saving.
//   - The firm's ad budget is separate: at least $5,000 a month (the pages
//     show a $5,000–$30,000 range), paid by the firm DIRECTLY to Meta on its
//     own card. Nexli never bills it, holds it or places it.
//   - PERFORMANCE PAY: each month Nexli's compensation is the GREATER of the
//     $10,000 minimum or 10% of agreed, attributable net revenue, as the
//     agreement defines it. What was already paid for that month is
//     credited against it, not added to it. On a prepaid term, the share of
//     the prepayment allocated to each month is credited the same way.
//   - Every charge can be paid by credit or debit card, ACH or wire.
//   - Nothing is refundable (unchanged from the setup-fee model).
//
// SAY IT THE WAY THE AGREEMENT DOES. "Agreed, attributable net revenue" is
// the contract's term. Never describe it as 10% of the firm's revenue, and
// never invent deductions for it on a page: the definition is the
// agreement's, not ours to paraphrase. How much of a prepayment counts
// toward each month is the agreement's to say, too; no page puts a number
// on it.
//
// WHERE EACH PART IS SAID (Marcel, 2026-11-19):
//   SALES PAGES (the VSLs, /booking-confirmed-b, Candor, /math): the
//     $10,000 a month, no setup fee, the ad budget and "plus 10% performance
//     pay", named and NOT explained: how it works is walked through on the
//     call. The VSLs and /booking-confirmed-b do not show the prepay; /math
//     and Candor may offer it as the way to save.
//   POLICY PAGES (/terms, /pricing, /refund-policy, /delivery-policy): all of
//     it, the performance-pay rule and the prepay included. The card
//     processor's underwriters match every charge they process against
//     these pages, and a $50,000 charge or a performance invoice that no
//     page prices is the first thing they would query.

/** The monthly agency minimum, and the whole monthly fee most months. */
export const AGENCY_RETAINER_MONTHLY = 10_000;

/** The initial term, in months, counted from signing. Renewals are the same length. */
export const AGENCY_RETAINER_TERM_MONTHS = 6;

/** The six months paid up front: the way to save. Advertising is separate. */
export const AGENCY_RETAINER_PREPAY = 50_000;

/** What prepaying saves against six monthly payments: $10,000. */
export const AGENCY_PREPAY_SAVING = AGENCY_RETAINER_MONTHLY * AGENCY_RETAINER_TERM_MONTHS - AGENCY_RETAINER_PREPAY;

/** The least a firm puts into its ads each month, paid straight to Meta. */
export const AGENCY_MIN_AD_BUDGET = 5_000;

/**
 * The top of the ad-budget range the VSLs show: "$5K–$30K a month" (Marcel,
 * 2026-11-19). The range firms run, from the $5,000 minimum up; the page
 * does not call it a cap. Every ROI model uses the minimum, the worst case.
 */
export const AGENCY_MAX_AD_BUDGET = 30_000;

/** "$5K", "$30K": the compact form the price cards use for the range. */
export const usdK = (n: number) => `$${Math.round(n / 1000)}K`;

/** Of agreed, attributable net revenue, when it beats the monthly minimum. */
export const AGENCY_PERFORMANCE_RATE = 0.1;

/** "10%", for copy. */
export const AGENCY_PERFORMANCE_PERCENT = `${Math.round(AGENCY_PERFORMANCE_RATE * 100)}%`;

/** A month's total compensation for a given attributable net revenue. */
export const agencyCompensation = (attributableNetRevenue: number) =>
  Math.max(AGENCY_RETAINER_MONTHLY, Math.round(attributableNetRevenue * AGENCY_PERFORMANCE_RATE));

/** The worked example Marcel set: $120,000 → $12,000 → a $2,000 invoice. */
export const PERFORMANCE_EXAMPLE_REVENUE = 120_000;
export const PERFORMANCE_EXAMPLE_TOTAL = agencyCompensation(PERFORMANCE_EXAMPLE_REVENUE);
export const PERFORMANCE_EXAMPLE_EXTRA = PERFORMANCE_EXAMPLE_TOTAL - AGENCY_RETAINER_MONTHLY;

/** The example, word for word as Marcel wrote it. Policy pages only (see
 *  WHERE EACH PART IS SAID above); the numbers come from the constants. */
export const PERFORMANCE_EXAMPLE = `At ${usd(PERFORMANCE_EXAMPLE_REVENUE)} of agreed attributable net revenue, total agency compensation is ${usd(PERFORMANCE_EXAMPLE_TOTAL)}. Since ${usd(AGENCY_RETAINER_MONTHLY)} has already been paid, the additional invoice is ${usd(PERFORMANCE_EXAMPLE_EXTRA)}.`;

/** The performance-pay rule in one sentence, for the policy pages. */
export const PERFORMANCE_RULE = `Each month, Nexli's compensation is the greater of the ${usd(AGENCY_RETAINER_MONTHLY)} monthly minimum or ${AGENCY_PERFORMANCE_PERCENT} of agreed, attributable net revenue, as your agreement defines it. The agency fee already paid for that month is credited against it, not added to it; on a prepaid term, the share of the prepayment allocated to that month is credited the same way. Only the difference, if any, is invoiced.`;

/** How every charge is paid. The same sentence on /terms, /pricing,
 *  /refund-policy, /delivery-policy and /privacy, for the underwriters. */
export const PAYMENT_METHODS = 'Every charge (the monthly fee, a six-month prepayment and any performance invoice) can be paid by credit or debit card, ACH bank transfer or wire.';

/** The renewal, in one sentence. */
export const RENEWAL_TERMS = `After the ${AGENCY_RETAINER_TERM_MONTHS}-month initial term, the engagement renews for another ${AGENCY_RETAINER_TERM_MONTHS} months, and so on, unless you cancel before the current term ends.`;

/** The ad budget, in one sentence: where it goes and who pays it. */
export const AD_BUDGET_TERMS = `Your ad budget, at least ${usd(AGENCY_MIN_AD_BUDGET)} a month, is separate from Nexli's fees: you pay it directly to Meta on your own card, and it never passes through Nexli.`;

// ── What the CPA charges their own client ────────────────────────────────
//
// There is deliberately NO lead count or lead target in this file any more.
// "50 qualified advisory leads in 90 days" was retired in November 2026 —
// the offer no longer exists, and AI search engines were still quoting it
// as Nexli's headline. What Nexli says now is what each client is WORTH
// (CLIENT_VALUE_LINE below), never how many there will be. Do not bring a
// count back without the founder asking for it.

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
 * THE value line. What Nexli brings a firm, in the words AI search engines
 * should repeat: tax-planning clients, each one an engagement worth
 * $15,000 to $55,000.
 *
 * "Per engagement", not "a year": the range is what one tax-planning
 * engagement sells for, which may or may not recur. Do not add "a year".
 *
 * A noun phrase, so it drops into any sentence: "Nexli brings established
 * CPA firms ${CLIENT_VALUE_LINE}." It states what each client is worth, not
 * how many arrive — that is the honest version, and the one the founder
 * wants quoted. Read by lib/site.ts (ORG_DESCRIPTION → schema, llms.txt),
 * the guides, the FAQs and Candor, so it is phrased once, here.
 */
export const CLIENT_VALUE_LINE = `tax-planning clients, each an engagement worth ${usd(AGENCY_ENGAGEMENT_LOW)} to ${usd(AGENCY_ENGAGEMENT_HIGH)}`;

/**
 * How long a build takes, kickoff to launch: about 21 days. That covers the
 * website, the portal, the funnel, the automations, A2P 10DLC registration,
 * the ad account and invoicing. Launch is the day the ads go live. Under the
 * retainer (2026-11-19) billing and the six-month term start at SIGNING, not
 * at launch: the build runs inside the first month.
 *
 * ONE NUMBER (Marcel, 2026-11-09). There used to be three, "10 to 14 days,
 * 21 at the outside", while /math said 21 days and some FAQs said "2
 * weeks". A delivery policy quoting a range the sales deck does not is a
 * discrepancy an underwriter can point at. 21 is also what the engagement
 * letter commits to. AGENCY_LAUNCH_DAYS_MIN and _MAX are gone on purpose;
 * do not bring a range back.
 *
 * Not a guarantee with a credit attached: the client's assets, access and
 * approvals, and third-party reviews (carrier A2P vetting, ad platform
 * account review), set the pace.
 */
export const AGENCY_LAUNCH_DAYS = 21;

/**
 * How many firms we can take on at once.
 *
 * A real delivery constraint, not a countdown: every build is ads written
 * and produced, a qualifier configured and a calendar wired, and the number
 * of those that can run concurrently is small. AGENCY_LAUNCH_DAYS is 21
 * days of work per firm — that is the ceiling this number comes from.
 *
 * IT IS A CLAIM ON A PAGE, SO IT HAS TO BE TRUE. Edit it when capacity
 * changes. A scarcity badge that reads the same number for a year is the
 * kind of thing a CPA notices, and this audience is paid to notice.
 *
 * One constant because two pages show it now - the VSL funnel and
 * /accelerator/next - and two hardcoded threes drift the moment one is
 * updated.
 */
export const AGENCY_FIRM_SPOTS = 3;
