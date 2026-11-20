/**
 * FAQ content for the Advisory, Better Clients, and Offer VSL pages.
 * Shape matches the accordion in components/VslFunnel.tsx and
 * components/VslFunnelOffer.tsx ({ q, a }) so the JSX stays untouched.
 *
 * Facts stated here must match lib/site.ts and THE RETAINER in
 * lib/agency-offer.ts (Marcel, 2026-11-19): built for firms doing $1M–$5M+
 * a year (AUDIENCE_REVENUE, 2026-11-20: who we aim for, not a minimum),
 * a $10,000 monthly minimum with no separate setup fee, credited against a
 * 10% performance fee on agreed, attributable net revenue (since the
 * 2026-11-20 pitch-deck brief: credited, never added on top; only net above
 * $100,000 in a month is invoiced), the ad budget paid by the firm directly
 * to Meta, a six-month initial term that renews for six months at a time,
 * no guarantees offered.
 */
import {
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_MIN_AD_BUDGET,
  AGENCY_PERFORMANCE_PERCENT,
  AGENCY_RETAINER_MONTHLY,
  usd,
} from '../lib/agency-offer';
import { AUDIENCE_REVENUE } from '../lib/site';

export interface VslFaqItem {
  q: string;
  a: string;
}

/** "$15,000 to $55,000", from the one place the range is set. */
const CLIENT_VALUE = `${usd(AGENCY_ENGAGEMENT_LOW)} to ${usd(AGENCY_ENGAGEMENT_HIGH)}`;

/** Who we aim for, not a minimum (Marcel, 2026-11-20). See lib/site. */
const WHO = `${AUDIENCE_REVENUE} a year`;

// No lead count anywhere in these answers: the "50 in 90 days" target was
// retired (see lib/agency-offer.ts). Say what each client is worth instead.
const whatCounts: VslFaqItem = {
  q: 'What kind of client does the system bring in?',
  a: `A US-based business owner or high-income individual who meets the screening criteria we set with you and has asked your firm to contact them about tax planning. Planning engagements are often priced at ${CLIENT_VALUE}, depending on your firm's established offer, the client's fit and the scope; it is not a guaranteed value per appointment. Your close rate determines what you bank, and we report every week, so you are never guessing where you stand.`,
};

const whatItCosts: VslFaqItem = {
  q: 'What does it cost?',
  a: `A ${usd(AGENCY_RETAINER_MONTHLY)} monthly minimum for the website, the portal, the funnel and the automations, built and run for you, with no separate setup fee. Your ${usd(AGENCY_RETAINER_MONTHLY)} covers the first ${usd(AGENCY_RETAINER_MONTHLY * 10)} of net attributed revenue each month; above ${usd(AGENCY_RETAINER_MONTHLY * 10)}, we bill ${AGENCY_PERFORMANCE_PERCENT} of the difference. Net attributed revenue is what the clients the system brings you paid that month, minus the agreed ad spend and commissions (your referrals and your other sales stay yours, and it is never ${AGENCY_PERFORMANCE_PERCENT} of every sale). Your ad budget is separate: we recommend at least ${usd(AGENCY_MIN_AD_BUDGET)} a month, paid directly to Meta on your own card. The initial term is six months, renewing for six months at a time. As an illustration, not a forecast: two planning engagements collected in a month at ${usd(AGENCY_ENGAGEMENT_LOW)} is ${usd(AGENCY_ENGAGEMENT_LOW * 2)}, against ${usd(AGENCY_RETAINER_MONTHLY + AGENCY_MIN_AD_BUDGET)} for our minimum and the recommended ads.`,
};

const whoRunsAds: VslFaqItem = {
  q: 'Who runs the ads, and who pays for them?',
  a: `We do, in house. No white-label and no subcontractor. You pay for the ads yourself: at least ${usd(AGENCY_MIN_AD_BUDGET)} a month, straight to Meta on your own card, and it never passes through us. The weekly update shows exactly what was spent and what it produced.`,
};

const howLong: VslFaqItem = {
  q: 'How long until we are live, and what do we need to do?',
  a: 'The build takes about 21 days from kickoff, and that is what the engagement letter commits to. The variable is how fast your branding, logins, approvals and onboarding details come back from you. Your side is a short onboarding: answer our questions, send assets, approve the work. After launch, the system handles intake, follow-up, document collection, and review requests on its own, and your time goes to the consultations that land on your calendar.',
};

const existingWebsite: VslFaqItem = {
  q: 'What if I already have a website?',
  a: 'No problem. We can rebuild from scratch or strategically integrate the portal, automations, and review engine into your existing presence, whatever makes sense for your firm.',
};

const canWeCancel: VslFaqItem = {
  q: 'Can we cancel?',
  a: 'The initial term is six months from signing, which is how long it takes for the campaigns to have genuinely run. It then renews for six months at a time, and you can cancel any time before a term ends.',
};

const salesPitch: VslFaqItem = {
  q: 'Is there a high-pressure sales pitch on the call?',
  a: "Absolutely not. The strategy call is a genuine audit of your current systems. We will identify gaps, show you what is possible, and give you a custom roadmap. If it is a fit, we walk through the agreement then. If not, you still walk away with actionable insights.",
};

const whatYouGet = (angle: string): VslFaqItem => ({
  q: 'What exactly do we get?',
  a: `Four systems, built and installed for you: a custom website positioned around ${angle}, a branded client portal for invoicing, engagement letters, document collection, and secure messaging, AI automations that capture, qualify, and nurture inquiries around the clock, and a Google review engine that adds 3-5 reviews a month. Then we run campaigns to it so screened prospects can book onto your calendar.`,
});

const differentFrom: VslFaqItem = {
  q: 'How is this different from hiring a web designer, buying software, or hiring a marketing agency?',
  a: 'This is a done-for-you business infrastructure build, not a website project, a software subscription, or an ad retainer. We design, build, and integrate your entire client-facing system: website, portal, automations, and review engine. Then we drive the traffic to it and report on the result every week. You get a custom-built system, not a template, and one team accountable for the whole path from click to booked consultation.',
};

export const advisoryFaq: VslFaqItem[] = [
  {
    q: 'What kind of CPA firms do you work with?',
    a: `We partner with established CPA and accounting firms doing ${WHO}, based in the US, that want more advisory clients. If you are a solo practitioner or still building your first client base, this is not the right fit yet.`,
  },
  whatYouGet('your advisory offer'),
  differentFrom,
  whatCounts,
  {
    q: 'How do we know these clients can actually pay advisory fees?',
    a: 'Because we screen for it before they reach you. The campaigns target business owners and high-income individuals with tax exposure large enough that planning pays for itself many times over, and the intake qualifies for income, situation, and fit with your criteria. The $9,400 invoice in the headline is not a stretch for that client. It is small next to the number they are trying to move.',
  },
  {
    q: 'What if we mostly do compliance work today?',
    a: 'Then you already know your clients returns better than anyone. What is missing is a packaged advisory offer and a pipeline of clients who can pay for it. We build the offer into the site and the intake, and the first advisory engagements usually come from clients already in your book who fit.',
  },
  whatItCosts,
  whoRunsAds,
  howLong,
  existingWebsite,
  canWeCancel,
  salesPitch,
];

export const betterClientsFaq: VslFaqItem[] = [
  {
    q: 'What kind of CPA firms do you work with?',
    a: `We partner with established CPA and accounting firms doing ${WHO}, based in the US, that are done competing for the $800 client and want to be positioned for the $8,000 one. If you are a solo practitioner or still building your first client base, this is not the right fit yet.`,
  },
  {
    q: 'Why not just run ads now?',
    a: 'Because ads send people to whatever you have. If the site does not convert, nobody answers within minutes, and your reviews are thin next to the competitor down the street, the budget pays for clicks that go nowhere. We build the infrastructure first, then turn on campaigns, so every dollar lands on a system built to book.',
  },
  {
    q: 'What if we already run ads and they are not working?',
    a: 'Usually the ads are not the problem. What happens after the click is. On the strategy call we audit the whole path: landing page, response time, follow-up, reviews, booking. We show you where the leads leak, then run campaigns against a system that can convert them.',
  },
  whatYouGet('the clients you want, not the ones you are tired of'),
  differentFrom,
  whatCounts,
  whatItCosts,
  whoRunsAds,
  howLong,
  existingWebsite,
  canWeCancel,
  salesPitch,
];

export const offerFaq: VslFaqItem[] = [
  {
    q: 'What kind of firms do you work with?',
    a: `We partner with established tax and CPA firms doing ${WHO}, based in the US, that can deliver real tax planning, not just compliance. If you are a solo practitioner or still building your first client base, this is not the right fit yet.`,
  },
  {
    q: 'Where do these clients come from?',
    a: 'Targeted acquisition campaigns built to reach 6-and-7-figure earners who have been overpaying the IRS for years without anyone showing them proactive planning. We build the system that attracts them, run the ads, and qualify every lead before it reaches your calendar.',
  },
  {
    q: 'How are they screened before they reach my calendar?',
    a: 'Every lead goes through intake that checks income level, whether there is a genuine planning opportunity, that they are US-based, and that they fit the criteria we set with you. Only real cases get a booking link. You take the consultation. Everything before it is done.',
  },
  {
    q: 'Are the appointments exclusive to my firm?',
    a: 'Yes. These are not shared lead lists. The campaigns run for your firm, the prospects book on your calendar, and nobody else receives them.',
  },
  {
    q: 'What if my firm mostly does compliance work today?',
    a: 'Then you are sitting on the expertise these clients need. You already know their returns better than anyone. What firms lack is the pipeline of high earners who have realized they are overpaying, and that is the part we deliver. At $5K-$25K+ per planning engagement, even a few clients a quarter changes your revenue mix.',
  },
  {
    q: 'How is this different from buying leads?',
    a: 'Lead lists are shared, low-intent, and unfiltered. You pay to chase people who filled out a form once. We deliver booked appointments with pre-qualified, high-income taxpayers who already understand what planning is worth, exclusively to your firm, on a system we built and run.',
  },
  {
    q: 'Do you guarantee results?',
    a: `No, and we would be careful of anyone who does. We do not promise a number of clients. What we can tell you is what each one is worth: the system brings you tax-planning clients, each an engagement worth ${CLIENT_VALUE}. You get a written update every week showing exactly what the campaigns produced, and the engagement runs six months at a time, so you can leave at the end of any term.`,
  },
  whatItCosts,
  whoRunsAds,
  {
    q: 'How long until the first appointments show up?',
    a: `The build takes about 21 days, then campaigns go live. Booked appointments typically start within the first few weeks of launch, and each one is a tax-planning prospect worth ${CLIENT_VALUE} an engagement.`,
  },
  {
    q: 'What if we cannot handle the volume?',
    a: 'We set the pace on the strategy call based on your capacity for planning work, and campaigns can be throttled up or down as you go. The goal is a calendar you can actually serve, not a flood.',
  },
  canWeCancel,
  {
    q: 'Is there a high-pressure sales pitch on the call?',
    a: 'Absolutely not. The call is a genuine fit assessment. We walk through your market, your capacity for planning work, and what the client flow would look like. If it is a fit, we walk through the agreement then. If not, you still walk away knowing exactly what this opportunity looks like in your market.',
  },
];
