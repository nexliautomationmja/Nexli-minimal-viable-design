// ---------------------------------------------------------------------------
// The corpus Candor answers from.
//
// WHY THIS EXISTS AT ALL. app/api/faq-voice/route.ts asks a model to answer a
// prospect's pre-call question with no source material whatsoever — it
// improvises from pretraining. That is fine for a 60-word voice memo and not
// fine for a tool that will be asked about price, terms and what a firm can
// expect to earn. Every number Candor says has to come from the same constant
// the rest of the site reads, or the tool becomes the one place where Nexli
// contradicts itself.
//
// BUILT BY EVALUATING THE MODULES, NEVER BY READING THE FILES. lib/booking-faq
// writes its answers as template literals over lib/agency-offer — parse the
// source and the corpus ships "${usd(AGENCY_RETAINER_MONTHLY)}" to the model
// instead of "$10,000". Importing is also what keeps this honest: change a
// price in agency-offer and Candor's answers change with it, with no second
// place to remember.
//
// COMPUTED ONCE AT MODULE SCOPE. It is ~30K tokens and it is byte-stable,
// which is the entire reason the route can cache it. Anything that varies per
// request — the date, the visitor's name — belongs in the route's own
// after-the-breakpoint block, not in here.
//
// WHAT IS DELIBERATELY LEFT OUT:
//   - data/about.ts `aboutFacts`. Two of its eight entries are the literal
//     strings 'TODO: year' and 'TODO: City, State'. A grounded model states
//     them with total confidence, and "Nexli was founded in TODO: year" is a
//     worse answer than no answer.
//   - data/taxForms.ts. 93KB, unrelated to anything a prospect asks here.
//   - betterClientsFaq. It overlaps advisoryFaq almost entirely; the two
//     differ by one angle word, and paying for both every request buys
//     nothing.
//   (The 10% performance pay WAS left out, named and not explained, until
//   Marcel asked for it to be explained plainly everywhere, 2026-11-19. It
//   is PERFORMANCE_PLAIN from lib/agency-offer now, under THE OFFER.)
// ---------------------------------------------------------------------------

import { advisoryFaq, offerFaq, type VslFaqItem } from '@/data/vsl-faqs';
import { BOOKING_B_FAQ } from '@/lib/booking-faq';
import { buildLlmsFullTxt } from '@/lib/llms';
import { reasonFor } from '@/lib/advisory-fit';
import {
  ADVISORY_PRICE_DISPLAY,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_REFUND_DAYS,
  REBOOK_PATH,
} from '@/lib/advisory-config';
import { INTRO_TRANSCRIPT } from '@/lib/candor-intro';
import { PDF_SHARE_PATH } from '@/components/math/pdf';
import { DISQUALIFYING_REVENUE, DISQUALIFYING_ROLE } from '@/lib/qualification-steps';
import {
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_FIRM_SPOTS,
  AGENCY_LAUNCH_DAYS,
  AGENCY_MAX_AD_BUDGET,
  AGENCY_MIN_AD_BUDGET,
  AGENCY_PERFORMANCE_PERCENT,
  AGENCY_PREPAY_SAVING,
  AGENCY_RETAINER_MONTHLY,
  AGENCY_RETAINER_PREPAY,
  AGENCY_RETAINER_TERM_MONTHS,
  CLIENT_VALUE_LINE,
  PAYMENT_METHODS,
  PERFORMANCE_PLAIN,
  PERFORMANCE_THRESHOLD,
  usd,
} from '@/lib/agency-offer';
// The deck's own model, so Candor quotes exactly what /math shows.
import {
  BACK_END_ANNUAL,
  BACK_END_MONTHLY,
  MONTHLY_TOTAL,
  MONTHS,
  PLANS,
  PLAN_FEE,
  PLAN_FEE_HIGH,
  PLAN_FEE_LOW,
  RETENTION,
  RETENTION_BENCHMARK,
  SCENARIOS,
  SHOW_RATE,
  TAKE_RATE,
  aboutThousands,
  backEndAnnualAfter,
  backEndBilledIn,
  breakEvenMonth,
  chain,
  clientsBy,
  pct,
  recurringBook,
  times,
  yearOneValue,
  type Scenario,
} from '@/lib/see-the-math';
import {
  ENGAGEMENT_TERMS,
  AUDIENCE_REVENUE,
  SITE_URL,
  SYSTEM_COMPONENTS,
} from '@/lib/site';

/**
 * Four FAQ shapes exist in this repo — `{q,a}` in data/vsl-faqs,
 * `{question,answer}` in the guides and data/faqs, and
 * `{question,audio?,answer?}` in components/booking/DanielaFaq. Normalising
 * here rather than at each call site is the only way the corpus reads as one
 * document.
 */
function qa(question: string, answer: string | undefined): string {
  return answer ? `Q: ${question}\nA: ${answer}` : '';
}

function fromVslFaq(items: VslFaqItem[]): string {
  return items.map((i) => qa(i.q, i.a)).filter(Boolean).join('\n\n');
}

/** The numbers, stated once, so no answer has to infer one. */
function offerFacts(): string {
  return [
    `Price (THE RETAINER, Marcel, 2026-11-19): ${usd(AGENCY_RETAINER_MONTHLY)} a month for the complete system, the agency minimum, plus ${AGENCY_PERFORMANCE_PERCENT} performance pay. There is NO setup fee. The ${usd(AGENCY_RETAINER_MONTHLY)} covers the website, the portal, the funnel and the automations, built and run, and running the campaigns. There is no per-component pricing and no smaller version, because the system does not work with a piece missing.`,
    `Performance pay (explain it plainly when asked, in these words and with these two examples): ${PERFORMANCE_PLAIN} The agreement's term for that number is "agreed, attributable net revenue". On the six-month prepay, that month's share of the prepayment counts toward it instead of the ${usd(AGENCY_RETAINER_MONTHLY)}; the agreement sets that share, so never put a number on it. Never call it ${AGENCY_PERFORMANCE_PERCENT} of the firm's revenue, and never ${AGENCY_PERFORMANCE_PERCENT} of every sale.`,
    `The term: a signed agreement with a ${AGENCY_RETAINER_TERM_MONTHS}-month initial term, counted from signing. It then renews for another ${AGENCY_RETAINER_TERM_MONTHS} months at a time unless the firm cancels before the current term ends. Do not describe it as month to month; it is not.`,
    `Prepaying: a firm can pay the ${AGENCY_RETAINER_TERM_MONTHS} months up front for ${usd(AGENCY_RETAINER_PREPAY)} instead of ${usd(AGENCY_RETAINER_MONTHLY * AGENCY_RETAINER_TERM_MONTHS)}, saving ${usd(AGENCY_PREPAY_SAVING)}. The ad budget is still separate. Bring it up only when they ask about paying up front, a discount or lowering the cost.`,
    `There is NO lead target and no lead count. Nexli does not promise a number of leads or clients, and you must never quote one. An old "50 qualified advisory leads in 90 days" target was retired; if a prospect mentions it, say it is no longer part of the offer. What Nexli says instead is what each client is worth: it brings established CPA firms ${CLIENT_VALUE_LINE}.`,
    `What a CPA firm typically charges its own client for a planning engagement: ${usd(
      AGENCY_ENGAGEMENT_LOW,
    )} to ${usd(AGENCY_ENGAGEMENT_HIGH)}. ${usd(
      AGENCY_ENGAGEMENT_LOW,
    )} is the FLOOR of that range, not an average. Quote the floor. Never present any figure as a typical or average engagement. (THE MATH below assumes ${usd(
      PLAN_FEE,
    )} a plan. That is the model's deliberately low assumption, and you call it that, never a typical fee.)`,
    `Time to live: about ${AGENCY_LAUNCH_DAYS} days from kickoff for the whole build (website, portal, funnel, automations, A2P texting registration, ad account, invoicing), once branding, logins and approvals are in. That is what the engagement letter commits to. The first month's ${usd(AGENCY_RETAINER_MONTHLY)} is billed at signing, so the build is paid for, and the term counts from signing. Never quote a shorter range such as "10 to 14 days" or "2 weeks"; those were retired.`,
    `Capacity, and who Nexli takes on: Nexli takes ${AGENCY_FIRM_SPOTS} firms at a time, because it can only run so many accounts well. It chooses who it works with and does not take every firm that applies or every firm that can pay; booking a call is not the same as being accepted. A firm that qualifies and is a good fit is onboarded. There is NO city or territory exclusivity: Nexli may also work with another firm in the same market, and you never promise otherwise. What IS exclusive is each firm's own campaigns, leads and calendar; nobody else receives them. Make no growth claim beyond THE MATH: no "double your firm", no "5 to 10x", nothing of the kind.`,
    `Paying: ${PAYMENT_METHODS}`,
    `Refunds (the published Refund Policy): no Digital Rainmaker fee is refundable: not a monthly fee once charged, not a six-month prepayment and not a performance invoice. The one exception is a billing error (a double charge, a wrong amount), which is always refunded in full. The ad budget is not Nexli's to refund: the firm pays it to Meta itself. The ${ADVISORY_PRODUCT_NAME} (${ADVISORY_PRICE_DISPLAY}) has a ${ADVISORY_REFUND_DAYS}-day full refund. "No refund" and "no guarantee" are separate answers: "be careful of anyone who offers one" belongs to guarantees only, never to refunds.`,
    `The ad budget is the firm's own and is NOT part of Nexli's fee: at least ${usd(AGENCY_MIN_AD_BUDGET)} a month (the pages show a range of ${usd(AGENCY_MIN_AD_BUDGET)} to ${usd(AGENCY_MAX_AD_BUDGET)}+, where ${usd(AGENCY_MAX_AD_BUDGET)} is not a cap and bigger firms spend more, recommend ${usd(AGENCY_MIN_AD_BUDGET)} as the minimum, and say the right ad spend for their firm is talked through on the call), paid by the firm directly to Meta on its own card, in its own ad account. It never passes through Nexli, and Nexli never holds, places or keeps any of it. Nexli runs the campaigns, and the weekly written update shows where the budget went and what it produced. If they ask what happens to ad money when they leave, there is nothing of theirs with Nexli: the budget and the ad account were always theirs. There is no ad-credit or first-month bonus; if they mention one from an older page, say it is no longer part of the offer.`,
    `Pausing: it is one system, and parts of it cannot be removed or paused (the Terms). What flexes is the pace: it is set on the call to the firm's capacity for planning work, and campaigns can be throttled up or down as they go.`,
    `Ownership: the firm owns the website, client portal, funnel and automations Nexli builds, along with its content, domain, client data and its ad account (with the account's history, audiences and data), and it pays its own hosting. The ONE exception is the ad creative: the videos and images Nexli makes for the campaigns stay Nexli's, along with the tools Nexli makes them with. Never say the firm owns "everything" or "all of it" without that exception. When the engagement ends, Nexli stops running the firm's ads, and because the creative is Nexli's, the ads Nexli made stop with it. The firm keeps the ad account, with its history, audiences and data, and can run its own ads in it.`,
    `AI avatars (Marcel, 2026-11-11): Nexli makes each firm's ads with an AI-generated avatar, a presenter that is not a real person, cast by Nexli to fit the firm's market, audience and ideal client. Firms do NOT pick their avatar (Marcel, 2026-11-19): who appears in an ad changes who Meta shows it to, so the avatar is a targeting decision, not a matter of taste. If asked, say we cast it for them and why, neutrally; there is no option to choose one, and no fee for one. The source, if they want it: researchers at Northeastern, USC and Upturn (Ali et al., 2019) ran Facebook ads with identical targeting and changed only the image, headline and text, and who the ads were delivered to changed with them. ONE AVATAR, ONE FIRM: while a firm is a client, no other client's ads use its avatar; after it leaves, the avatar can go to another firm. Like all ad creative, the avatar stays Nexli's. Daniela is Nexli's own avatar and is never offered to a client. WHY NEXLI DOES IT (Marcel, 2026-11-13): most agencies run the same ads across all their clients, so the same people see the same ad with a different firm's name on it. That is ad fatigue, and firms that all look the same get treated the same and priced the same. A firm's own avatar sets it apart and makes it a brand. The library is a public page on the site; you may mention it, but do not write a link to it.`,
    `Who does what, confirmed by Marcel (2026-11-11). The strategy call is with Marcel, the founder: 45 minutes, camera on. He walks the firm through how the system works (the ad, the AI avatar, the video page, the qualifier, the calendar, the follow-up) on a short deck. Never say there is no slide deck. Nexli makes and runs the ads; it is the marketing side of the engagement, and the firm does NOT approve each ad before it runs. Never say "nothing runs without your sign-off" or that they approve every ad. If they worry about their state board's advertising rules, say the ads run in the firm's own ad account and that any rule their board has is worth raising on the call; do not promise how Nexli would handle it. Nexli never runs or sits in on a firm's sales calls: the firm runs every one, with Nexli's sales framework and assets.`,
    `Who Nexli is for (Marcel, 2026-11-20): CPA firms doing ${AUDIENCE_REVENUE} a year. Say it as who we aim for, never as a minimum: there is no published revenue minimum, so never quote a floor or a cutoff figure, and never say "$500K+" (retired). If a firm under $1M asks whether it is a fit, say firms a little under $1M can still be, and it is settled on the call. A solo practice, or a firm just starting out or far below that, is not the right fit yet.`,
    `Booking: the video pages have no qualifier in front of the calendar any more (Marcel, 2026-11-19). A firm sees the price and books straight from the calendar under it. Nexli still chooses who it works with (see Capacity), and that is settled on the call. Never say anyone is turned away for budget.`,
  ].join('\n');
}

function terms(): string {
  return ENGAGEMENT_TERMS.map((t) => `${t.name}: ${t.description}`).join('\n');
}

function components(): string {
  return SYSTEM_COMPONENTS.map((c) => `${c.name} — ${c.description}`).join('\n');
}

/**
 * How Nexli turns a firm away, in its own words.
 *
 * Included because the tone is the lesson as much as the content: the site
 * gives the specific reason rather than a generic "you don't qualify", on the
 * stated grounds that the generic version "is what turns a gate into an
 * insult". Candor is asked questions by people who may not qualify, and these
 * four answers are the model for how to tell them.
 */
function fitReasons(): string {
  const cases = [
    { usBased: false, decisionRole: null, annualRevenue: null },
    { usBased: true, decisionRole: DISQUALIFYING_ROLE, annualRevenue: null },
    { usBased: true, decisionRole: null, annualRevenue: DISQUALIFYING_REVENUE },
    // No budget case: the qualifier stopped asking on 2026-11-11, so nobody
    // is turned away on budget any more and Candor must not describe it.
    { usBased: true, decisionRole: null, annualRevenue: null },
  ];
  return cases
    .map((c) => {
      const r = reasonFor(c);
      return `${r.heading}\n${r.body}`;
    })
    .join('\n\n');
}

/**
 * /math — "See the Math", the deck Nexli walks a firm through on the call —
 * as prose Candor can answer from.
 *
 * The REVENUE side (the chain, the scenarios, the back end, year two) is
 * built from lib/see-the-math, the module the deck itself renders, so a
 * change to an assumption there reaches Candor the way a price change in
 * agency-offer does. Copy the deck's REASONING here when it changes; the
 * numbers take care of themselves.
 *
 * The cost side is the deck's too, on THE RETAINER (Marcel, 2026-11-19):
 * Nexli's $10,000 a month and the $5,000 minimum ad budget the firm pays
 * Meta, $15,000 a month, with no setup fee. Performance pay is not counted,
 * the same as the deck: how it works is for the call.
 *
 * TRUST IS ANSWERED WITH THE MATH (Marcel, 2026-11-09). Candor used to meet
 * "I've been burned before" with "we're new with no track record", echoing
 * the persona rule against citing results. Now it walks the $5,000 chain,
 * offers the weekly update as the yardstick, and hands over the deck and the
 * PDF (/math/pdf picks phone or slides), so the prospect checks it instead
 * of taking Nexli's word for it.
 */
/** What the model counts the firm paying each month: Nexli's fee and the minimum ads. */
const MONTHLY_COST = MONTHLY_TOTAL;

function theMath(): string {
  const [cons, mod, best] = SCENARIOS;
  const c = chain(cons);
  const scenario = (s: Scenario) => {
    const x = chain(s);
    return `${s.label}: ${usd(s.costPerBookedCall)} a booked call gives ${x.bookedCalls} booked calls, ${x.callsHeld} held, and at a ${pct(s.closeRate)} close rate ${x.clients} clients. That is ${usd(x.newFees)} in new tax planning fees a month, about ${times(x.multiple)} the ${usd(MONTHLY_COST)} a month the firm puts in (Nexli's ${usd(AGENCY_RETAINER_MONTHLY)} and ${usd(AGENCY_MIN_AD_BUDGET)} in ads).`;
  };
  const yearOne = (s: Scenario) => {
    const v = yearOneValue(s);
    return `${s.label.toLowerCase()} ${chain(s).clients} clients, ${usd(v.planning)} + ${usd(v.backEnd)} = ${usd(v.total)}`;
  };
  const billed = Array.from({ length: MONTHS }, (_, i) => backEndBilledIn(cons, i + 1));
  const coversIdx = billed.findIndex((v) => v >= MONTHLY_COST);
  const covers = coversIdx + 1;
  const by12 = clientsBy(cons, MONTHS);
  const book = recurringBook;
  const yearTwo = book(cons);
  // What it takes to cover the monthly cost on planning fees alone, over a
  // year at full pace. Per-year, not per-month: the chain rounds clients down
  // each month, and a 5% close on 14 held calls is 0 a month but 8 a year.
  const yearBill = 12 * MONTHLY_COST;
  const plansToCover = Math.ceil(yearBill / PLAN_FEE);
  const heldYear = c.callsHeld * 12;
  const coverRate = `${((plansToCover / heldYear) * 100).toFixed(1)}%`;
  // The worked example for a doubter: the lowest whole close rate whose year
  // of plans still covers the bill, and the one below it, which does not.
  let coverPct = 1;
  while (Math.floor((heldYear * coverPct) / 100) < plansToCover && coverPct < 100) coverPct++;
  const atCover = Math.floor((heldYear * coverPct) / 100);
  const below = coverPct - 1;
  const atBelow = Math.floor((heldYear * below) / 100);

  const coverStory =
    coversIdx === -1
      ? `Meanwhile bookkeeping and payroll, the MRR their clients pay every month, build up to ${usd(billed[MONTHS - 1])} a month by month ${MONTHS}.`
      : `Meanwhile bookkeeping and payroll, the MRR their clients pay every month, build up until by month ${covers} they cover the whole monthly cost on their own (${usd(billed[covers - 1])} a month), and reach ${usd(billed[MONTHS - 1])} a month by month ${MONTHS}. From then on the firm is not hunting new business just to stay even, and every new tax plan, paid up front, is the bonus, the cherry on top, rather than what keeps the lights on.`;

  const be = (s: Scenario) => {
    const m = breakEvenMonth(s, PLANS.monthly);
    return m === null ? `not within ${MONTHS} months` : `by month ${m}`;
  };

  return `This is "See the Math", the model you walk a firm through on the strategy call. Answer from it when they ask how the math works, what the ROI is, whether it is worth it, what they can expect, how many calls or clients it brings, or when they break even. Explain it the way it is built: the chain first, then what each client is worth, then when they break even. Show the arithmetic. They run numbers for a living, and the case is stronger for being checkable.

What it is, and is not: every figure is an illustration built from the assumptions below. It is not a projection of what their firm will earn, not a promise and not Nexli client results, and you say so whenever you give a number from it. Where a firm lands depends on its market, its offer and how it runs its calls. Nexli publishes no lead target or client count, so never present this model as one.

WHAT THE MODEL COUNTS AS THE COST. ${usd(MONTHLY_COST)} a month from month 1: Nexli's ${usd(AGENCY_RETAINER_MONTHLY)} and the ${usd(AGENCY_MIN_AD_BUDGET)} minimum ad budget the firm pays Meta directly. There is no setup fee to add. It does not count the ${AGENCY_PERFORMANCE_PERCENT} performance pay. If they ask why: every pace in the model stays at or under ${usd(PERFORMANCE_THRESHOLD)} a month from the clients Nexli's ads bring in, and under that the ${usd(AGENCY_RETAINER_MONTHLY)} is all they pay Nexli (see Performance pay under THE OFFER).

THE CHAIN. Every scenario starts with the same ${usd(AGENCY_MIN_AD_BUDGET)} a month in ads. Five numbers decide the result: ad spend divided by the cost per booked call gives booked calls; ${pct(SHOW_RATE)} of booked calls are held; calls held times the close rate gives clients signed; clients times ${usd(PLAN_FEE)} a tax plan gives new fees. Calls and clients are rounded down at every step, because nobody signs 2.1 clients.
${scenario(cons)}
${scenario(mod)}
${scenario(best)}
The point to land: at the conservative pace the whole case rests on ${c.bookedCalls} booked calls and ${c.clients} new clients a month. It is not a game of 100 leads. These are the figures once ads reach full pace; the first months are slower (see THE FIRST 90 DAYS).

THE ASSUMPTIONS, AND WHO CONTROLS EACH ONE.
Cost per booked call, ${usd(best.costPerBookedCall)} to ${usd(cons.costPerBookedCall)}. Nexli's number. Tax and accounting appointment leads run $65 to $150 (WebTonic's tax and accounting Facebook ads statistics). Nexli goes after business owners who can pay for real planning, and that audience costs more per call. The model budgets above the going rate on purpose, so the math still works if ads cost more than expected.
Show rate, ${pct(SHOW_RATE)}. Nexli's number. Booked is not held. Between the booking and the call, Nexli's automated follow-up keeps the reason they booked in front of them: the problem, the issue or the goal that made them raise their hand. The model still plans on ${Math.round((1 - SHOW_RATE) * 10)} in 10 not showing.
Close rate, ${pct(cons.closeRate)} to ${pct(best.closeRate)}. THE FIRM'S number. Every call is with an owner who saw the price and chose to book. The same source puts appointment bookings at 25 to 40%; the model plans below that, because closing comes down to the firm's sales process. Tell them to track it every month: if calls are happening and closes are not, that points to the sales process, not the leads, and it is the first thing to fix. They do not fix it alone (THE SALES FRAMEWORK, below).
Tax plan, ${usd(PLAN_FEE)}. The firm's fee. The model's assumption per plan, set deliberately near the bottom of the ${usd(PLAN_FEE_LOW)} to ${usd(PLAN_FEE_HIGH)} range a planning engagement runs (${usd(PLAN_FEE_LOW)} is the floor), so a bigger engagement only moves the numbers up. Call it the model's assumption. Never call it typical or average.
Back end, ${usd(BACK_END_MONTHLY)} a month (${usd(BACK_END_ANNUAL)} a year) for each client who takes it. The firm's fee. Bookkeeping runs from $1,500 a month to about $2,000 depending on the business (EightX's bookkeeping costs by revenue band), plus payroll, which depends on the business and its headcount. The model counts ${usd(BACK_END_MONTHLY)} a month for both together, the low end for a $1M to $5M business. Compliance work is not counted at all.
Take rate, half. The firm's number. Some clients keep their bookkeeper and payroll company. The model assumes half of planning clients move theirs over, and each one who does turns a one-time engagement into a client who pays every month.

TAX PLANNING IS THE FRONT DOOR. The tax plan proves the firm's expertise. Once a client trusts them, the firm bundles in the work that client already pays someone else for: bookkeeping and payroll. Planning earns the trust; the back end builds the firm. One month's new clients at full pace, valued over their first year, plan plus back end: ${yearOne(cons)}; ${yearOne(mod)}; ${yearOne(best)}.
The one-stop shop: today a business owner usually has four providers, a tax planner, a bookkeeper, a payroll company and a tax preparer. Four bills, four logins, four relationships. The firm becomes one relationship, one bill, one trusted advisor: tax planning as the front door, with bookkeeping, payroll and compliance behind it.

CLIENTS STACK. In year one a tax plan is paid once, up front, and bookkeeping and payroll pay every month; the deck counts the plan's renewal only from year two (GOING INTO YEAR TWO, below). The model has no new clients in month 1 (the build, then the ads learning), half pace in months 2 and 3, and full pace from month 4. At the conservative pace that is ${by12} planning clients by month ${MONTHS}, ${by12 * TAKE_RATE} of them on bookkeeping and payroll: about ${usd(backEndAnnualAfter(cons, MONTHS))} a year in back-end work alone, on top of every tax plan, and it repeats every year they stay. The moderate pace reaches ${clientsBy(mod, MONTHS)} planning clients by month ${MONTHS} and the best case ${clientsBy(best, MONTHS)}. Recurring revenue is also what makes a firm worth more, whether they sell it, borrow against it or bring in a partner.

THEIR NEW BOOKKEEPING AND PAYROLL CLIENTS COVER THE MONTHLY COST FOR THEM. That is the picture, in three steps, at the conservative pace and on the ${usd(MONTHLY_COST)} a month (Nexli's ${usd(AGENCY_RETAINER_MONTHLY)} and the ${usd(AGENCY_MIN_AD_BUDGET)} in ads). First, tax planning pays for it: from month 2 the new plans bring in ${usd((chain(cons).clients / 2) * PLAN_FEE)} a month, then ${usd(chain(cons).clients * PLAN_FEE)} from month 4. ${coverStory}

GOING INTO YEAR TWO. The deck's payoff: the recurring book a firm starts year two with, from its year-one clients only, before anyone new signs. Tax planning clients renew every year at the plan fee, and bookkeeping and payroll keep paying. The deck assumes ${pct(RETENTION)} of both stay. Call that an assumption: the published benchmarks are thin and unsourced, putting full-service firms (tax planning plus bookkeeping and payroll) at ${pct(RETENTION_BENCHMARK.low)} to ${pct(RETENTION_BENCHMARK.high)} on average and ${pct(RETENTION_BENCHMARK.topLow)} to ${pct(RETENTION_BENCHMARK.topHigh)} at the best firms, and the deck takes the low end on purpose. At the conservative pace: ${yearTwo.keptPlanning} of ${yearTwo.planningClients} planning clients renewing at ${usd(PLAN_FEE)} is ${usd(yearTwo.planning)} a year, plus ${yearTwo.keptBackEnd} of ${yearTwo.backEndClients} on bookkeeping and payroll at ${usd(BACK_END_ANNUAL)} a year is ${usd(yearTwo.backEnd)}: ${usd(yearTwo.total)} a year in recurring revenue. Less a year of the monthly cost (${usd(MONTHLY_COST)} × 12 = ${usd(yearTwo.systemYear)}, Nexli's fee and the minimum ads), that is about ${usd(aboutThousands(yearTwo.inTheGreen))} a year in the green going into year two. The moderate pace starts year two about ${usd(aboutThousands(book(mod).inTheGreen))} a year in the green, the best case about ${usd(aboutThousands(book(best).inTheGreen))}; lead with the conservative figure. Like every number here it is an illustration from stated assumptions, not a promise, and performance pay is not counted in it.

WHO DOES WHAT. Nexli builds and runs the website and funnel, the client portal and AI automations, and the ads, with the creative testing and scaling. The firm runs every sales call on its calendar, sells the tax plan, upsells bookkeeping, payroll and compliance, and delivers the work. The sales process is the one part Nexli does not run, and how well they sell decides where they land in these scenarios. Say that plainly; it is the honest half.

THE SALES FRAMEWORK. Running the calls does not mean winging them. Nexli gives every client its sales framework, a written document for running the call so it is not improvised, along with sales documents and assets to use on their calls. If a firm's closes fall off, those are what Nexli brings in to get the close rate back up. Use this whenever they worry about their close rate, about selling planning, or about what happens if calls are not turning into clients: concede that the close rate is theirs, then say they get the framework and the assets rather than being left to figure it out. It is built to lift the close rate, not a promise of one: never put a number on how much it raises closes, and never imply Nexli runs or joins their calls.

THE FIRST 90 DAYS, as the model plans them. Days 1 to 21: the build (website, funnel, client portal, AI automations and ads), 21 days at most. Day 21: ads go live, and the first 7 to 14 days test creative; new ad accounts take the longest to find their footing, so it will not be perfect yet. By day 30: the first couple of calls land on their calendar, and they run them. Days 30 to 90: Nexli puts the budget behind the winning ads, bookings get steadier, and they sign their first tax planning clients. Day 90 on: full pace, results start to compound, they upsell bookkeeping, payroll and compliance, and Nexli amplifies ad spend. Why the systems are built before a single ad runs: Meta ads are cold traffic, and cold traffic exposes a firm's systems, who it is targeting and whether people are the right fit.

PAYING FOR IT. ${usd(AGENCY_RETAINER_MONTHLY)} a month to Nexli, billed from signing, with no setup fee, plus ${AGENCY_PERFORMANCE_PERCENT} performance pay, which is not ${AGENCY_PERFORMANCE_PERCENT} of every sale (explained under THE OFFER). The ads are separate: at least ${usd(AGENCY_MIN_AD_BUDGET)} a month, paid by the firm straight to Meta (the model uses ${usd(AGENCY_MIN_AD_BUDGET)}). The term is ${AGENCY_RETAINER_TERM_MONTHS} months from signing, then ${AGENCY_RETAINER_TERM_MONTHS} months at a time. To save: prepay the ${AGENCY_RETAINER_TERM_MONTHS} months for ${usd(AGENCY_RETAINER_PREPAY)} instead of ${usd(AGENCY_RETAINER_MONTHLY * AGENCY_RETAINER_TERM_MONTHS)}, ${usd(AGENCY_PREPAY_SAVING)} less. Bring up the prepay only if they ask about paying up front or lowering the cost. There is no first-month bonus or ad credit.

WHAT IT TAKES TO COVER THE MONTHLY. The answer to "what if it does not work as well as that", and the most useful number in the model for a doubter: at ${usd(PLAN_FEE)} a plan, ${plansToCover} tax plans a year cover the whole monthly cost for the year (${usd(MONTHLY_COST)} × 12 = ${usd(yearBill)}, Nexli's fee and the minimum ads), before a dollar of bookkeeping or payroll. At the conservative ${c.callsHeld} held calls a month, a year at full pace is ${heldYear} held calls, so getting there takes a close rate of about ${coverRate}, against the ${pct(cons.closeRate)} the model plans on.
When they plug in a worse number of their own (a lower close rate, a smaller fee, dearer calls), run it through the chain over a year, not a single month: rounding down one month at a time throws away fractions that add up across twelve. Then set the result against the ${plansToCover} plans it takes. Example: at a ${coverPct}% close rate the conservative pace is ${heldYear} × ${coverPct}% = about ${atCover} plans a year, enough to cover the monthly cost on planning fees alone; at ${below}% it is about ${atBelow}, just short, and then the back end (bookkeeping and payroll) is what closes the gap. Never say a figure will not cover the bill without doing that arithmetic first. If their number genuinely falls short, say so plainly and show the arithmetic, then count the back end, which the ${plansToCover}-plan figure leaves out. When the worse number is their close rate, add THE SALES FRAMEWORK: they get a written framework and sales assets for their calls, and a falling close rate is when Nexli brings them in. Like everything here it is an illustration from stated assumptions, not a promise.

BREAK-EVEN. Paying monthly, counting Nexli's ${usd(AGENCY_RETAINER_MONTHLY)} at the start of each month and the ${usd(AGENCY_MIN_AD_BUDGET)} in ads, and the whole bundle (each plan when it is signed, bookkeeping and payroll from the month after), before the firm's own cost of doing the work: the conservative pace is in the green ${be(cons)}, the moderate ${be(mod)}, the best case ${be(best)}. There is no setup fee to earn back first. Performance pay is not counted, the same as everywhere in the model.

WHEN THE QUESTION IS TRUST. They have been burned by an agency before, they ask why they should believe any of this or what proof there is, or they ask what happens if it does not work. Answer with the math, because the math does not ask them to take anyone's word for it. Concede the scar in a sentence. Then put the ${usd(AGENCY_MIN_AD_BUDGET)} a month on the table and walk it: at the conservative pace, ${usd(cons.costPerBookedCall)} a booked call is ${c.bookedCalls} booked calls, ${c.callsHeld} held and ${c.clients} new clients a month, with every assumption written down, the benchmarks named and each one set on the cautious side. Then give them what the agency that burned them never did, a yardstick: the weekly written update says where the budget went and what it produced, so they hold it against this chain every week. Close with THE LINKS so they can check it before the call. No guarantee still means no guarantee: the math is what they measure against, not a promise.

THE LINKS. There are three, and they are the only links you ever write, exactly like this. Two are the deck: [See the Math](${SITE_URL}/math), and the same deck as a PDF they can save, print or forward to a partner, [download the PDF](${SITE_URL}${PDF_SHARE_PATH}). Give both together, in one sentence, when the question is trust (above), when they want the full math (the scenarios, the charts and when they break even), or when they want to check the numbers for themselves. Give them once in a conversation; after that, refer back to the math without writing the links again. Describe them only as the full model. The third is the calendar, [pick a time](${SITE_URL}${REBOOK_PATH}), and it is only for booking: write it when they ask to book, rebook or reschedule a call, or say they missed theirs. Tell them to use the button at the bottom of this page or that link, which opens the price with the calendar right under it, and that there are no questions to answer first. You cannot see, move or cancel a booking and never say you can. If they still have a call booked and want to move it, the reschedule link in their confirmation email does that without adding a second one.
ON THE CALL, these numbers get run with the firm's own fees. When they want their own version, that is exactly what the call is for.

YOUR INTRO VIDEO AND THIS MODEL. The math part of your video uses this model's cost per call and booked calls: $150 to $250 a booked call, 20 to 33 booked calls. Its fee examples are the two ends of the planning range instead: two clients at $15,000 as the bare minimum, and five at the top of the range for $275,000. It may be playing right above your answer. Do not contradict it: those are examples, not a forecast, and this model works through one set of assumptions at ${usd(PLAN_FEE)} a plan. When you give numbers, give these.`;
}

export const CANDOR_CORPUS = `
=== THE OFFER, IN NUMBERS ===
${offerFacts()}

=== ENGAGEMENT TERMS ===
${terms()}

=== WHAT THE SYSTEM IS MADE OF ===
${components()}

=== THE MATH: WHAT ${usd(AGENCY_MIN_AD_BUDGET)} A MONTH IN ADS CAN TURN INTO ===
${theMath()}

=== HOW NEXLI TURNS A FIRM AWAY (tone to copy, and the real thresholds) ===
${fitReasons()}

=== YOUR OWN INTRO VIDEO, WORD FOR WORD ===
This is the 2½-minute video of you on this page: it plays when they tap your photo, and parts of it play above your answers. They are your words, so stay consistent with them — the system, the AI-made ads, how Meta finds the right owner, the example math.
The rules above still win. Its figures are examples, not promises: never present them as what a firm will get. Do not repeat "the numbers are inevitable", "your only route" or the S&P 500 line as claims of your own. If a number here ever differs from THE OFFER, IN NUMBERS or THE MATH, those are the current ones.
Do not assume they have watched it, and do not tell them where on the page to find it.

${INTRO_TRANSCRIPT}

=== PRE-CALL ANSWERS ALREADY WRITTEN AND APPROVED ===
${BOOKING_B_FAQ.map((i) => qa(i.question, i.answer)).filter(Boolean).join('\n\n')}

=== FUNNEL FAQ ===
${fromVslFaq(advisoryFaq)}

${fromVslFaq(offerFaq)}

=== LONG-FORM GUIDES (the published, sourced material) ===
${buildLlmsFullTxt()}
`.trim();
