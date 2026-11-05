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
// ---------------------------------------------------------------------------

import { advisoryFaq, offerFaq, type VslFaqItem } from '@/data/vsl-faqs';
import { BOOKING_B_FAQ } from '@/lib/booking-faq';
import { buildLlmsFullTxt } from '@/lib/llms';
import { reasonFor } from '@/lib/advisory-fit';
import {
  DISQUALIFYING_BUDGETS,
  DISQUALIFYING_REVENUE,
  DISQUALIFYING_ROLE,
} from '@/lib/qualification-steps';
import {
  AGENCY_AD_SPEND,
  AGENCY_DAYS,
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_FIRM_SPOTS,
  AGENCY_LAUNCH_DAYS_MAX,
  AGENCY_LAUNCH_DAYS_MIN,
  AGENCY_LEADS,
  AGENCY_MONTHLY_FEE,
  AGENCY_TOTAL_MONTHLY,
  usd,
} from '@/lib/agency-offer';
import {
  ENGAGEMENT_TERMS,
  MIN_REVENUE,
  MIN_REVENUE_DETAIL,
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
    `Target: at least ${AGENCY_LEADS} qualified advisory leads within ${AGENCY_DAYS} days of campaign launch. This is a target and a projection, never a guarantee, and it counts leads, not closed revenue.`,
    `What a CPA firm typically charges its own client for a planning engagement: ${usd(
      AGENCY_ENGAGEMENT_LOW,
    )} to ${usd(AGENCY_ENGAGEMENT_HIGH)}. ${usd(
      AGENCY_ENGAGEMENT_LOW,
    )} is the FLOOR of that range, not an average. Quote the floor. Never present any figure as a typical or average engagement.`,
    `Time to live: ${AGENCY_LAUNCH_DAYS_MIN} to ${AGENCY_LAUNCH_DAYS_MAX} days once branding, logins and approvals are in. ${AGENCY_LAUNCH_DAYS_MAX} days is the outside edge and is what the engagement letter commits to.`,
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

export const CANDOR_CORPUS = `
=== THE OFFER, IN NUMBERS ===
${offerFacts()}

=== ENGAGEMENT TERMS ===
${terms()}

=== WHAT THE SYSTEM IS MADE OF ===
${components()}

=== HOW NEXLI TURNS A FIRM AWAY (tone to copy, and the real thresholds) ===
${fitReasons()}

=== PRE-CALL ANSWERS ALREADY WRITTEN AND APPROVED ===
${BOOKING_B_FAQ.map((i) => qa(i.question, i.answer)).filter(Boolean).join('\n\n')}

=== FUNNEL FAQ ===
${fromVslFaq(advisoryFaq)}

${fromVslFaq(offerFaq)}

=== LONG-FORM GUIDES (the published, sourced material) ===
${buildLlmsFullTxt()}
`.trim();
