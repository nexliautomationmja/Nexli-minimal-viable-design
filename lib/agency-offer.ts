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

/** $9,997, $15,000. Declared first: CLIENT_VALUE_LINE below calls it at load. */
export const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

// ── What the firm pays Nexli ──────────────────────────────────────────────
// The RECURRING side, and it is NOT itemised anywhere. The system is sold
// whole: one monthly fee for the website, the portal, the funnel and the
// automations together. Do not add per-component constants — the moment the
// monthly has parts, the sales page starts arguing about the parts.
//
// There is also a ONE-TIME SETUP FEE covering the build: AGENCY_SETUP_FEE.
//
// WHERE IT IS PRICED (Marcel, 2026-11-09): on the policy pages — /pricing,
// /terms, /refund-policy, /delivery-policy — and on /math. The card
// processor's underwriters match the charges they process against those
// pages, and a $32,000 or $74,000 charge that no page prices is the first
// thing they would query. The SALES pages (booking page, FAQs, VSLs, Candor)
// still say "quoted on the call" and do not import it. Keep that split:
// import AGENCY_SETUP_FEE only into a policy page or the /math model.
//
// IT IS FLAT. The same fee for every firm, because every firm gets the same
// build — the website, the portal, the funnel and the automations. It is not
// scoped per firm and there is no smaller version to sell, because the
// system does not work with a piece missing.
//
// This comment used to read "because it varies with what a firm already
// has". That was removed from the pages on 2026-10-20 and the reason is in
// components/booking/PricingBlock: it read as a reason the fee might move
// and invited a firm to negotiate down from a number nobody had said yet.
// The comment here was missed in that pass, which is how lib/candor-corpus
// then inherited the old claim from it. Do not reintroduce it. Pages must DISCLOSE it —
// a $9,997 sticker with an unmentioned setup fee is a bait.
//
// OWNERSHIP AND HOSTING (Marcel, 2026-11-09). The client owns what is built:
// the website, the portal, the funnel, the automations. Nexli does not pay
// for hosting; the client pays the hosting provider directly. The service
// fee pays for Nexli's upkeep and management of the whole system, not for
// the right to use it. Never describe the monthly as including hosting, and
// never say the portal or automations stop when the engagement ends.
//
// Keep these distinct from AGENCY_ENGAGEMENT_* below, which is a completely
// different thing: what the CPA charges THEIR client. Conflating the two is
// the easiest mistake to make in this file.

/** The recurring service fee, flat, every month, billed from launch. It pays
 *  for Nexli's upkeep and management of the whole system. Six-month minimum
 *  initial term from launch, then month to month — see
 *  components/TermsAndConditions. */
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

/** One-time, due at signing, non-refundable. See the note at the top for
 *  which pages may show it.
 *
 *  HOW EACH CHARGE IS PAID (Marcel, 2026-11-09). This fee and
 *  AGENCY_ANNUAL_UPFRONT are paid by ACH bank transfer or wire ONLY, never
 *  by card. Every other charge (the monthly plan, the annual plan's monthly
 *  ad budget, the $97 guide) is paid by credit or debit card. The card
 *  processor's underwriters match what they process against the policy
 *  pages, so /terms, /pricing, /refund-policy, /delivery-policy and /privacy
 *  all say exactly this. Change it here and on all five, or not at all. */
export const AGENCY_SETUP_FEE = 32_000;

/**
 * The annual plan: the service year prepaid at signing, $42,000 instead of
 * twelve months at AGENCY_MONTHLY_FEE. The ad budget is still billed monthly
 * from launch. Twelve-month term from launch, non-refundable, and it does
 * NOT renew automatically (Marcel, 2026-11-09).
 */
export const AGENCY_ANNUAL_SERVICE_FEE = 42_000;

/** Due at signing on the annual plan: setup plus the service year, $74,000. */
export const AGENCY_ANNUAL_UPFRONT = AGENCY_SETUP_FEE + AGENCY_ANNUAL_SERVICE_FEE;

/** Minimum initial term on the monthly plan, in months, counted from launch. */
export const AGENCY_INITIAL_TERM_MONTHS = 6;

/** The annual plan's term, in months, counted from launch. */
export const AGENCY_ANNUAL_TERM_MONTHS = 12;

/** Written notice to cancel the monthly plan once the initial term is done. */
export const AGENCY_CANCEL_NOTICE_DAYS = 30;

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
 * the ad account and invoicing. Launch is the day the ads go live, and the
 * day monthly billing and the minimum term both start.
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
