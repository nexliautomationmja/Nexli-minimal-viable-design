/**
 * FAQ content for the Advisory, Better Clients, and Offer VSL pages.
 * Shape matches the accordion in components/VslFunnel.tsx and
 * components/VslFunnelOffer.tsx ({ q, a }) so the JSX stays untouched.
 *
 * Facts stated here must match lib/site.ts: $500K+ per year minimum,
 * Nexli runs the ads and the firm funds ad spend separately, pricing is
 * scoped on the strategy call, month to month, both written guarantees.
 */
export interface VslFaqItem {
  q: string;
  a: string;
}

const MINIMUM = '$500K+ per year (about $40K-$50K a month)';

const whatCounts: VslFaqItem = {
  q: 'What counts as a "qualified advisory opportunity"?',
  a: 'A US-based business owner or high-income individual who fits the advisory criteria we set with you and books a consultation on your calendar. That is what the 10-in-90-days guarantee counts: opportunities on your calendar, not closed revenue. Your close rate determines what you bank. If we do not hit 10 within 90 days of campaign launch, we keep working for free until we do. No extra fees, no renegotiation.',
};

const whatItCosts: VslFaqItem = {
  q: 'What does it cost?',
  a: "Every build is scoped to the firm, so there is no list price. We price it on the strategy call once we have seen what you already have and what needs to be built. Engagements are month to month with no annual contract. The math is simple: if the system helps you close 4-5 new advisory clients this year at $5,000-$25,000 each, it has paid for itself.",
};

const whoRunsAds: VslFaqItem = {
  q: 'Who runs the ads, and who pays for them?',
  a: 'We build and manage the campaigns. Ad spend is separate from our fee and runs through your own ad account, so you see exactly what is spent and where. We agree on a budget on the call before anything goes live.',
};

const howLong: VslFaqItem = {
  q: 'How long until we are live, and what do we need to do?',
  a: 'Most firms go live within 2-4 weeks. Once we have your branding, logins, approvals, and onboarding details, we guarantee the system is built and launched within 21 days. If the delay is on our end, you receive a $1,000 credit toward your next monthly payment. Your side is a short onboarding: answer our questions, send assets, approve the work. After launch, the system handles intake, follow-up, document collection, and review requests on its own, and your time goes to the consultations that land on your calendar.',
};

const existingWebsite: VslFaqItem = {
  q: 'What if I already have a website?',
  a: 'No problem. We can rebuild from scratch or strategically integrate the portal, automations, and review engine into your existing presence, whatever makes sense for your firm.',
};

const canWeCancel: VslFaqItem = {
  q: 'Can we cancel?',
  a: 'Yes. Engagements are month to month with no annual contracts. You stay because the system is producing, not because a contract says so.',
};

const salesPitch: VslFaqItem = {
  q: 'Is there a high-pressure sales pitch on the call?',
  a: "Absolutely not. The strategy call is a genuine audit of your current systems. We will identify gaps, show you what is possible, and give you a custom roadmap. If it is a fit, we talk pricing then. If not, you still walk away with actionable insights.",
};

const whatYouGet = (angle: string): VslFaqItem => ({
  q: 'What exactly do we get?',
  a: `Four systems, built and installed for you: a custom website positioned around ${angle}, a branded client portal for invoicing, engagement letters, document collection, and secure messaging, AI automations that capture, qualify, and nurture inquiries around the clock, and a Google review engine that adds 3-5 reviews a month. Then we run campaigns to it so qualified prospects land on your calendar.`,
});

const differentFrom: VslFaqItem = {
  q: 'How is this different from hiring a web designer, buying software, or hiring a marketing agency?',
  a: 'This is a done-for-you business infrastructure build, not a website project, a software subscription, or an ad retainer. We design, build, and integrate your entire client-facing system: website, portal, automations, and review engine. Then we drive the traffic to it and guarantee the result. You get a custom-built system, not a template, and one team accountable for the whole path from click to booked consultation.',
};

export const advisoryFaq: VslFaqItem[] = [
  {
    q: 'What kind of CPA firms do you work with?',
    a: `We exclusively partner with established CPA and accounting firms doing ${MINIMUM}, based in the US, that want more advisory clients. If you are a solo practitioner or still building your first client base, this is not the right fit yet.`,
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
    a: `We exclusively partner with established CPA and accounting firms doing ${MINIMUM}, based in the US, that are done competing for the $800 client and want to be positioned for the $8,000 one. If you are a solo practitioner or still building your first client base, this is not the right fit yet.`,
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
    a: `We exclusively partner with established tax and CPA firms doing ${MINIMUM}, based in the US, that can deliver real tax planning, not just compliance. If you are a solo practitioner or still building your first client base, this is not the right fit yet.`,
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
    q: 'What does the guarantee cover?',
    a: 'At least 10 qualified tax advisory opportunities on your calendar within 90 days of campaign launch. Qualified means a US-based business owner or high-income individual who fits your criteria and books a consultation. That is opportunity on the calendar, not closed revenue. If we miss it, we keep working for free until we hit 10. Separately, once we have your assets and access, the system is built and launched within 21 days or you receive a $1,000 credit toward your next monthly payment.',
  },
  whatItCosts,
  whoRunsAds,
  {
    q: 'How long until the first appointments show up?',
    a: 'The build takes most firms 2-4 weeks, then campaigns go live. Booked appointments typically start within the first few weeks of launch, and the guarantee is 10 qualified opportunities within 90 days of campaign launch.',
  },
  {
    q: 'What if we cannot handle the volume?',
    a: 'We set the pace on the strategy call based on your capacity for planning work, and campaigns can be throttled up or down as you go. The goal is a calendar you can actually serve, not a flood.',
  },
  canWeCancel,
  {
    q: 'Is there a high-pressure sales pitch on the call?',
    a: 'Absolutely not. The call is a genuine fit assessment. We walk through your market, your capacity for planning work, and what the client flow would look like. If it is a fit, we talk pricing then. If not, you still walk away knowing exactly what this opportunity looks like in your market.',
  },
];
