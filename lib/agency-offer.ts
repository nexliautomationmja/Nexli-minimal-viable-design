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
// SAY IT PLAINLY, AND NEVER AS A CUT OF EVERY SALE (Marcel, 2026-11-19).
// "Agreed, attributable net revenue" is the contract's term. In plain words
// it is Marcel's own definition, PERFORMANCE_NET_PLAIN below: what the
// clients our ads bring the firm paid that month, minus its ad spend and
// commissions. Only revenue from the ads: the firm's referrals and other
// sales stay its own (PERFORMANCE_YOURS). Use his words, not a paraphrase of them. Never describe the
// 10% as 10% of the firm's revenue, and never as 10% of every sale: it is
// one number, worked out once a month, and the $10,000 counts toward it.
// How much of a prepayment counts toward each month is the agreement's to
// say; no page puts a number on it.
//
// WHERE EACH PART IS SAID (Marcel, 2026-11-19):
//   THE 10% IS EXPLAINED, the same plain way, everywhere it is mentioned
//     EXCEPT THE VSLs (Marcel, later the same day, reversing "named, not
//     explained"): /booking-confirmed-b (components/booking/
//     PerformancePayExplainer, via PricingBlock's explainPerformance),
//     /pitch, /math, Candor, the booking FAQ, lib/site, llms and the guides,
//     with the $150,000 → $5,000 and $80,000 → $0 months. "As if a baby was
//     looking at it": nobody should leave thinking we take 10% of every sale.
//   THE VSLs leave the math out (Marcel: "show that real math on the
//     booking confirmed page only"). Their card says it is not 10% of every
//     sale and that it is walked through on the call.
//   THE PREPAY: not on the VSLs, /booking-confirmed-b or /pitch. /math and
//     Candor may offer it as the way to save.
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
 * The top of the ad-budget range the VSLs and /booking-confirmed-b show:
 * "$5K–$15K a month" (Marcel, 2026-11-19). It was $30K, which he lowered
 * "so it doesn't spook them": the card says we recommend $5,000 a month as
 * the minimum and that ad spend is talked through on the call. The page
 * does not call it a cap. Every ROI model uses the minimum, the worst case.
 */
export const AGENCY_MAX_AD_BUDGET = 15_000;

/** "$5K", "$15K": the compact form the price cards use for the range. */
export const usdK = (n: number) => `$${Math.round(n / 1000)}K`;

/** Of agreed, attributable net revenue, when it beats the monthly minimum. */
export const AGENCY_PERFORMANCE_RATE = 0.1;

/** "10%", for copy. */
export const AGENCY_PERFORMANCE_PERCENT = `${Math.round(AGENCY_PERFORMANCE_RATE * 100)}%`;

/** A month's total compensation for a given attributable net revenue. */
export const agencyCompensation = (attributableNetRevenue: number) =>
  Math.max(AGENCY_RETAINER_MONTHLY, Math.round(attributableNetRevenue * AGENCY_PERFORMANCE_RATE));

/**
 * The month's agreed, attributable net revenue above which 10% beats the
 * $10,000 minimum: $100,000. At or below it, the $10,000 is the whole fee.
 */
export const PERFORMANCE_THRESHOLD = AGENCY_RETAINER_MONTHLY / AGENCY_PERFORMANCE_RATE;

/**
 * The big month, Marcel's example (2026-11-19): $150,000 → 10% is $15,000 →
 * $10,000 already paid → a $5,000 invoice at the end of the month. It
 * replaced $120,000 → $2,000 everywhere, the policy pages included.
 */
export const PERFORMANCE_EXAMPLE_REVENUE = 150_000;
export const PERFORMANCE_EXAMPLE_TOTAL = agencyCompensation(PERFORMANCE_EXAMPLE_REVENUE);
export const PERFORMANCE_EXAMPLE_EXTRA = PERFORMANCE_EXAMPLE_TOTAL - AGENCY_RETAINER_MONTHLY;

/**
 * The quiet month, shown beside the big one so it is obvious most months
 * cost nothing extra: $80,000 → 10% is $8,000, less than the $10,000
 * already paid → nothing more.
 */
export const PERFORMANCE_QUIET_REVENUE = 80_000;
/** 10% of the quiet month: $8,000. Not agencyCompensation, which floors at $10,000. */
export const PERFORMANCE_QUIET_SHARE = Math.round(PERFORMANCE_QUIET_REVENUE * AGENCY_PERFORMANCE_RATE);
export const PERFORMANCE_QUIET_EXTRA = agencyCompensation(PERFORMANCE_QUIET_REVENUE) - AGENCY_RETAINER_MONTHLY;

/** The example, in the form Marcel first wrote it. For the policy pages;
 *  the numbers come from the constants. */
export const PERFORMANCE_EXAMPLE = `At ${usd(PERFORMANCE_EXAMPLE_REVENUE)} of agreed attributable net revenue, total agency compensation is ${usd(PERFORMANCE_EXAMPLE_TOTAL)}. Since ${usd(AGENCY_RETAINER_MONTHLY)} has already been paid, the additional invoice is ${usd(PERFORMANCE_EXAMPLE_EXTRA)}.`;

/** The performance-pay rule in one sentence, for the policy pages. */
export const PERFORMANCE_RULE = `Each month, Nexli's compensation is the greater of the ${usd(AGENCY_RETAINER_MONTHLY)} monthly minimum or ${AGENCY_PERFORMANCE_PERCENT} of agreed, attributable net revenue, as your agreement defines it. The agency fee already paid for that month is credited against it, not added to it; on a prepaid term, the share of the prepayment allocated to that month is credited the same way. Only the difference, if any, is invoiced.`;

/**
 * Marcel's definition, word for word in substance (2026-11-19): the number
 * the 10% is taken from. A phrase, so it drops into a sentence: "10% of
 * ${PERFORMANCE_NET_PLAIN}".
 */
export const PERFORMANCE_NET_PLAIN = 'what the clients our ads bring you paid that month, minus your ad spend and commissions';

/**
 * What the 10% never touches (Marcel, 2026-11-19): "only from the revenue
 * that we generate, your referrals and your other sales stay yours. Only
 * attributed net income from the ads."
 */
export const PERFORMANCE_YOURS = 'Your referrals and your other sales stay yours.';

/** The policy pages' plain-terms gloss on the contract's phrase. */
export const PERFORMANCE_DEFINITION_PLAIN = `In plain terms, agreed, attributable net revenue is what the clients Nexli's ads bring you paid that month, minus your ad spend and commissions. Your referrals and your other sales are not part of it. It is not your firm's total revenue, and the ${AGENCY_PERFORMANCE_PERCENT} is not taken from every sale. On the monthly plan, while it stays at or under ${usd(PERFORMANCE_THRESHOLD)} in a month, nothing more is invoiced.`;

/**
 * The 10%, explained in one short paragraph, for Candor, the booking FAQ
 * and anywhere else that explains it in words rather than with
 * components/booking/PerformancePayExplainer.
 */
export const PERFORMANCE_PLAIN = `The ${AGENCY_PERFORMANCE_PERCENT} performance pay is not ${AGENCY_PERFORMANCE_PERCENT} of every sale, and not ${AGENCY_PERFORMANCE_PERCENT} of your firm's revenue. It is one number, worked out once a month: ${PERFORMANCE_NET_PLAIN}. Only revenue from the clients our ads bring you counts. ${PERFORMANCE_YOURS} ${AGENCY_PERFORMANCE_PERCENT} of that is our fee for the month, and the ${usd(AGENCY_RETAINER_MONTHLY)} you paid at the start of the month counts toward it, so only the difference is invoiced at the end of the month. If that number is ${usd(PERFORMANCE_EXAMPLE_REVENUE)}, ${AGENCY_PERFORMANCE_PERCENT} is ${usd(PERFORMANCE_EXAMPLE_TOTAL)}; you already paid ${usd(AGENCY_RETAINER_MONTHLY)}, so we invoice ${usd(PERFORMANCE_EXAMPLE_EXTRA)}. If it is ${usd(PERFORMANCE_QUIET_REVENUE)}, ${AGENCY_PERFORMANCE_PERCENT} is ${usd(PERFORMANCE_QUIET_SHARE)}, less than the ${usd(AGENCY_RETAINER_MONTHLY)} you already paid, so there is nothing more to pay. Until that number passes ${usd(PERFORMANCE_THRESHOLD)} in a month, the ${usd(AGENCY_RETAINER_MONTHLY)} is all you pay us.`;

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
