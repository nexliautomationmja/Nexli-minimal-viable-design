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
// source and the corpus ships "${usd(AGENCY_TOTAL_MONTHLY)}" to the model
// instead of "$9,997". Importing is also what keeps this honest: change a
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
//   - lib/see-the-math's SETUP_FEE, and every figure that pins it down. See
//     theMath() below.
// ---------------------------------------------------------------------------

import { advisoryFaq, offerFaq, type VslFaqItem } from '@/data/vsl-faqs';
import { BOOKING_B_FAQ } from '@/lib/booking-faq';
import { buildLlmsFullTxt } from '@/lib/llms';
import { reasonFor } from '@/lib/advisory-fit';
import { INTRO_TRANSCRIPT } from '@/lib/candor-intro';
import {
  DISQUALIFYING_BUDGETS,
  DISQUALIFYING_REVENUE,
  DISQUALIFYING_ROLE,
} from '@/lib/qualification-steps';
import {
  AGENCY_AD_SPEND,
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_FIRM_SPOTS,
  AGENCY_LAUNCH_DAYS,
  AGENCY_MONTHLY_FEE,
  CLIENT_VALUE_LINE,
  AGENCY_TOTAL_MONTHLY,
  usd,
} from '@/lib/agency-offer';
import {
  AD_SPEND,
  ANNUAL_SERVICE_MONTHLY,
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
  annualAheadFromMonth,
  backEndAnnualAfter,
  backEndBilledIn,
  breakEvenMonth,
  chain,
  clientsBy,
  pct,
  recurringBook,
  yearOneCost,
  yearOneValue,
  type Scenario,
} from '@/lib/see-the-math';
import {
  ENGAGEMENT_TERMS,
  MIN_REVENUE,
  MIN_REVENUE_DETAIL,
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
    `Price: ${usd(AGENCY_TOTAL_MONTHLY)} a month, one invoice. That is ${usd(
      AGENCY_MONTHLY_FEE,
    )} for the system and ${usd(AGENCY_AD_SPEND)} of ad budget, which Nexli places into the campaigns.`,
    `There is ALSO a one-time setup fee covering the build. It is FLAT — the same for every firm — and it is NOT scoped per firm. Every firm gets the same thing: the website, the portal, the funnel and the automations. There is no smaller version to buy, because the system does not work with a piece missing. It is real work and all of it happens before the firm sees a single lead, which is why it is a fee at all. The build is the same whatever a firm walks in with, and in practice almost nobody arrives with any of it already in place — so do not offer to fold an existing site into the build or imply the scope flexes. The number is given on the call. Never state or estimate that number, and never say the fee varies, depends on what a firm already has, or is scoped to their situation — it does not.`,
    `There is NO lead target and no lead count. Nexli does not promise a number of leads or clients, and you must never quote one. An old "50 qualified advisory leads in 90 days" target was retired; if a prospect mentions it, say it is no longer part of the offer. What Nexli says instead is what each client is worth: it brings established CPA firms ${CLIENT_VALUE_LINE}.`,
    `What a CPA firm typically charges its own client for a planning engagement: ${usd(
      AGENCY_ENGAGEMENT_LOW,
    )} to ${usd(AGENCY_ENGAGEMENT_HIGH)}. ${usd(
      AGENCY_ENGAGEMENT_LOW,
    )} is the FLOOR of that range, not an average. Quote the floor. Never present any figure as a typical or average engagement. (THE MATH below assumes ${usd(
      PLAN_FEE,
    )} a plan. That is the model's deliberately low assumption, and you call it that, never a typical fee.)`,
    `Time to live: about ${AGENCY_LAUNCH_DAYS} days from kickoff for the whole build (website, portal, funnel, automations, A2P texting registration, ad account, invoicing), once branding, logins and approvals are in. That is what the engagement letter commits to. Monthly billing starts at launch, not at signing. Never quote a shorter range such as "10 to 14 days" or "2 weeks"; those were retired.`,
    `Capacity: Nexli takes ${AGENCY_FIRM_SPOTS} firms at a time.`,
    `Public minimum firm revenue: ${MIN_REVENUE_DETAIL}. Marketing copy says ${MIN_REVENUE}.`,
    `The booking gate is stricter than the public minimum: the qualifier turns away firms under $750K a year, firms where the person is not a decision maker, and firms that say the monthly is not where they are. Do not conflate the public ${MIN_REVENUE} figure with the $750K gate.`,
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
 * five answers are the model for how to tell them.
 */
function fitReasons(): string {
  const cases = [
    { usBased: false, decisionRole: null, annualRevenue: null },
    { usBased: true, decisionRole: DISQUALIFYING_ROLE, annualRevenue: null },
    { usBased: true, decisionRole: null, annualRevenue: DISQUALIFYING_REVENUE },
    {
      usBased: true,
      decisionRole: null,
      annualRevenue: null,
      budget: DISQUALIFYING_BUDGETS[0],
    },
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
 * Built from lib/see-the-math, the module the deck itself renders, so a
 * change to an assumption there reaches Candor the way a price change in
 * agency-offer does. Copy the deck's REASONING here when it changes; the
 * numbers take care of themselves.
 *
 * THE SETUP FEE STAYS OUT, and so does everything that pins it down. /math
 * prices it because /math is the call. Candor is a public page, and the rule
 * in the route's persona is that the number comes on the call. That rules out
 * more than SETUP_FEE: the annual plan's total at signing, year-one totals,
 * net dollars by month 12 and "one month of fees covers the setup" each let
 * a CPA back the fee out in one line. None of them are here. Break-even
 * MONTHS are: they say when, not how much.
 *
 * The deck itself is a different matter. Marcel's call (2026-11-08): Candor
 * may hand out the /math link, and a prospect who reads all the way through
 * it finds the fee there — that much homework marks a serious buyer. Candor
 * just never says it, confirms it, or points to where it is.
 */
function theMath(): string {
  const [cons, mod, best] = SCENARIOS;
  const c = chain(cons);
  const scenario = (s: Scenario) => {
    const x = chain(s);
    return `${s.label}: ${usd(s.costPerBookedCall)} a booked call gives ${x.bookedCalls} booked calls, ${x.callsHeld} held, and at a ${pct(s.closeRate)} close rate ${x.clients} clients. That is ${usd(x.newFees)} in new tax planning fees a month, about ${x.multiple}× the ${usd(MONTHLY_TOTAL)} monthly investment.`;
  };
  const yearOne = (s: Scenario) => {
    const v = yearOneValue(s);
    return `${s.label.toLowerCase()} ${chain(s).clients} clients, ${usd(v.planning)} + ${usd(v.backEnd)} = ${usd(v.total)}`;
  };
  const billed = Array.from({ length: MONTHS }, (_, i) => backEndBilledIn(cons, i + 1));
  const covers = billed.findIndex((v) => v >= MONTHLY_TOTAL) + 1;
  const by12 = clientsBy(cons, MONTHS);
  const yearTwo = recurringBook(cons);
  const be = (s: Scenario) => breakEvenMonth(s, PLANS.monthly);
  const saved = yearOneCost(PLANS.monthly) - yearOneCost(PLANS.annual);
  const extraUpfront = PLANS.annual.upfront - PLANS.monthly.upfront;

  return `This is "See the Math", the model you walk a firm through on the strategy call. Answer from it when they ask how the math works, what the ROI is, whether it is worth it, what they can expect, how many calls or clients it brings, or when they break even. Explain it the way it is built: the chain first, then what each client is worth, then when they break even. Show the arithmetic. They run numbers for a living, and the case is stronger for being checkable.

What it is, and is not: every figure is an illustration built from the assumptions below. It is not a projection of what their firm will earn, not a promise and not Nexli client results, and you say so whenever you give a number from it. Where a firm lands depends on its market, its offer and how it runs its calls. Nexli publishes no lead target or client count, so never present this model as one.

THE CHAIN. Every scenario starts with the same ${usd(AD_SPEND)} a month in ads. Five numbers decide the result: ad spend divided by the cost per booked call gives booked calls; ${pct(SHOW_RATE)} of booked calls are held; calls held times the close rate gives clients signed; clients times ${usd(PLAN_FEE)} a tax plan gives new fees. Calls and clients are rounded down at every step, because nobody signs 2.1 clients.
${scenario(cons)}
${scenario(mod)}
${scenario(best)}
The point to land: at the conservative pace the whole case rests on ${c.bookedCalls} booked calls and ${c.clients} new clients a month. It is not a game of 100 leads. These are the figures once ads reach full pace; the first months are slower (see THE FIRST 90 DAYS).

THE ASSUMPTIONS, AND WHO CONTROLS EACH ONE.
Cost per booked call, ${usd(best.costPerBookedCall)} to ${usd(cons.costPerBookedCall)}. Nexli's number. Tax and accounting appointment leads run $65 to $150 (WebTonic's tax and accounting Facebook ads statistics). Nexli goes after business owners who can pay for real planning, and that audience costs more per call. The model budgets above the going rate on purpose, so the math still works if ads cost more than expected.
Show rate, ${pct(SHOW_RATE)}. Nexli's number. Booked is not held. Between the booking and the call, Nexli's automated follow-up keeps the reason they booked in front of them: the problem, the issue or the goal that made them raise their hand. The model still plans on ${Math.round((1 - SHOW_RATE) * 10)} in 10 not showing.
Close rate, ${pct(cons.closeRate)} to ${pct(best.closeRate)}. THE FIRM'S number. Every call has passed the qualifier, so they are talking to owners who fit. The same source puts appointment bookings at 25 to 40%; the model plans below that, because closing comes down to the firm's sales process. Tell them to track it every month: if calls are happening and closes are not, that points to the sales process, not the leads, and it is the first thing to fix.
Tax plan, ${usd(PLAN_FEE)}. The firm's fee. The model's assumption per plan, set deliberately near the bottom of the ${usd(PLAN_FEE_LOW)} to ${usd(PLAN_FEE_HIGH)} range a planning engagement runs (${usd(PLAN_FEE_LOW)} is the floor), so a bigger engagement only moves the numbers up. Call it the model's assumption. Never call it typical or average.
Back end, ${usd(BACK_END_MONTHLY)} a month (${usd(BACK_END_ANNUAL)} a year) for each client who takes it. The firm's fee. Bookkeeping runs from $1,500 a month to about $2,000 depending on the business (EightX's bookkeeping costs by revenue band), plus payroll, which depends on the business and its headcount. The model counts ${usd(BACK_END_MONTHLY)} a month for both together, the low end for a $1M to $5M business. Compliance work is not counted at all.
Take rate, half. The firm's number. Some clients keep their bookkeeper and payroll company. The model assumes half of planning clients move theirs over, and each one who does turns a one-time engagement into a client who pays every month.

TAX PLANNING IS THE FRONT DOOR. The tax plan proves the firm's expertise. Once a client trusts them, the firm bundles in the work that client already pays someone else for: bookkeeping and payroll. Planning earns the trust; the back end builds the firm. One month's new clients at full pace, valued over their first year, plan plus back end: ${yearOne(cons)}; ${yearOne(mod)}; ${yearOne(best)}.
The one-stop shop: today a business owner usually has four providers, a tax planner, a bookkeeper, a payroll company and a tax preparer. Four bills, four logins, four relationships. The firm becomes one relationship, one bill, one trusted advisor: tax planning as the front door, with bookkeeping, payroll and compliance behind it.

CLIENTS STACK. In year one a tax plan is paid once, up front, and bookkeeping and payroll pay every month; the deck counts the plan's renewal only from year two (GOING INTO YEAR TWO, below). The model has no new clients in month 1 (the build, then the ads learning), half pace in months 2 and 3, and full pace from month 4. At the conservative pace that is ${by12} planning clients by month ${MONTHS}, ${by12 * TAKE_RATE} of them on bookkeeping and payroll: about ${usd(backEndAnnualAfter(cons, MONTHS))} a year in back-end work alone, on top of every tax plan, and it repeats every year they stay. The moderate pace reaches ${clientsBy(mod, MONTHS)} planning clients by month ${MONTHS} and the best case ${clientsBy(best, MONTHS)}. Recurring revenue is also what makes a firm worth more, whether they sell it, borrow against it or bring in a partner.

THEIR NEW BOOKKEEPING AND PAYROLL CLIENTS COVER NEXLI'S MONTHLY FEE FOR THEM. That is how the deck puts it, as one picture in three steps, at the conservative pace and on the monthly bill of ${usd(MONTHLY_TOTAL)} (ads and Nexli's service; the setup fee is not part of this picture). First, tax planning pays for it: from month 2 the new plans bring in ${usd((chain(cons).clients / 2) * PLAN_FEE)} a month, then ${usd(chain(cons).clients * PLAN_FEE)} from month 4. Meanwhile bookkeeping and payroll, the MRR their clients pay every month, build up until by month ${covers} they cover the whole monthly bill on their own (${usd(billed[covers - 1])} a month), and reach ${usd(billed[MONTHS - 1])} a month by month ${MONTHS}. From then on the firm is not hunting new business just to stay even, and every new tax plan, paid up front, is the bonus, the cherry on top, rather than what keeps the lights on.

GOING INTO YEAR TWO. The deck's payoff: the recurring book a firm starts year two with, from its year-one clients only, before anyone new signs. Tax planning clients renew every year at the plan fee, and bookkeeping and payroll keep paying. The deck assumes ${pct(RETENTION)} of both stay. Call that an assumption: the published benchmarks are thin and unsourced, putting full-service firms (tax planning plus bookkeeping and payroll) at ${pct(RETENTION_BENCHMARK.low)} to ${pct(RETENTION_BENCHMARK.high)} on average and ${pct(RETENTION_BENCHMARK.topLow)} to ${pct(RETENTION_BENCHMARK.topHigh)} at the best firms, and the deck takes the low end on purpose. At the conservative pace: ${yearTwo.keptPlanning} of ${yearTwo.planningClients} planning clients renewing at ${usd(PLAN_FEE)} is ${usd(yearTwo.planning)} a year, plus ${yearTwo.keptBackEnd} of ${yearTwo.backEndClients} on bookkeeping and payroll at ${usd(BACK_END_ANNUAL)} a year is ${usd(yearTwo.backEnd)}: ${usd(yearTwo.total)} a year in recurring revenue. Less the system for a year on the monthly plan (${usd(MONTHLY_TOTAL)} × 12 = ${usd(yearTwo.systemYear)}, ads and Nexli's service), that is about ${usd(aboutThousands(yearTwo.inTheGreen))} a year in the green going into year two. The deck lets them switch scenario: the moderate pace starts year two about ${usd(aboutThousands(recurringBook(mod).inTheGreen))} a year in the green, the best case about ${usd(aboutThousands(recurringBook(best).inTheGreen))}; lead with the conservative figure. The setup fee is paid once, at signing, and is not part of this figure. Like every number here it is an illustration from stated assumptions, not a promise.

WHO DOES WHAT. Nexli builds and runs the website and funnel, the qualifier that screens out bad fits, the client portal and AI automations, and the ads, with the creative testing and scaling. The firm runs every sales call on its calendar, sells the tax plan, upsells bookkeeping, payroll and compliance, and delivers the work. The sales process is the one part Nexli does not run, and how well they sell decides where they land in these scenarios. Say that plainly; it is the honest half.

THE FIRST 90 DAYS, as the model plans them. Days 1 to 21: the build (website, funnel and qualifier, client portal, AI automations and ads), 21 days at most. Day 21: ads go live, and the first 7 to 14 days test creative; new ad accounts take the longest to find their footing, so it will not be perfect yet. By day 30: the first couple of calls land on their calendar, and they run them. Days 30 to 90: Nexli puts the budget behind the winning ads, bookings get steadier, and they sign their first tax planning clients. Day 90 on: full pace, results start to compound, they upsell bookkeeping, payroll and compliance, and Nexli amplifies ad spend. Why the systems are built before a single ad runs: Meta ads are cold traffic, and cold traffic exposes a firm's systems, who it is targeting and whether people are the right fit.

PAYING FOR IT. Paying monthly: ${usd(MONTHLY_TOTAL)} a month (${usd(AD_SPEND)} ads plus ${usd(PLANS.monthly.serviceMonthly)} service), and nothing monthly is billed until the build is done and ads launch (the model uses day 21). Plus the one-time setup fee at signing, whose number comes on the call: the rule about it above holds here too. The deck calls this plan "Paid monthly"; it has the six-month initial term from launch in ENGAGEMENT TERMS. The annual plan runs twelve months from launch and does not renew automatically. Paying annually: the service year is prepaid at ${usd(ANNUAL_SERVICE_MONTHLY)} a month instead of ${usd(PLANS.monthly.serviceMonthly)}, and the ads are the only monthly bill. That puts ${usd(extraUpfront)} more in at signing, breaks even in the same month or one month later, is ahead of paying monthly from month ${annualAheadFromMonth()}, and keeps about ${usd(aboutThousands(saved))} more by month ${MONTHS}. Bring up the annual option only if they ask about paying up front, annual billing or lowering the monthly cost.

BREAK-EVEN, setup fee included. Counting everything paid to Nexli and the whole bundle (each plan when it is signed, bookkeeping and payroll from the month after), before the firm's own cost of doing the work, and paying monthly: the conservative pace is in the green by month ${be(cons)}, the moderate by month ${be(mod)}, the best case by month ${be(best)}. Never turn these into dollars by month ${MONTHS}, or into how long the setup fee takes to earn back: both put a number on the setup fee.
THE DECK SHOWS THE SETUP FEE, AND THAT IS THE DECK'S JOB, NEVER YOURS. The full deck is public at ${SITE_URL}/math, and it does price the setup fee. Anyone who reads all the way through it will find the number, and Nexli is fine with that: a firm owner who does that much homework is serious. You still never state, confirm, estimate or bracket the setup fee, never say the deck contains it, and never point to where in the deck it is. If they quote it back to you, never deny what it says or suggest Nexli would not put it in writing. Say you leave that number to the deck and the call, and do not restate or confirm it.

THE LINK. When they want the full math (the scenarios, the charts and when they break even) or want to check the numbers for themselves, offer the deck, once in a conversation, written exactly like this: [See the Math](${SITE_URL}/math). It is the only link you ever write. Do not attach it to every answer, and describe it only as the full model.
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

=== THE MATH: WHAT ${usd(AD_SPEND)} A MONTH IN ADS CAN TURN INTO ===
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
