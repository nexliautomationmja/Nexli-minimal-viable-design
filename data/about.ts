import { AGENCY_ENGAGEMENT_HIGH, AGENCY_ENGAGEMENT_LOW, AGENCY_TOTAL_MONTHLY, usd } from '../lib/agency-offer';
import { ADDRESS_LINES, PHONE_DISPLAY, SOCIAL_PROFILES } from '../lib/site';

const CLIENT_VALUE = `${usd(AGENCY_ENGAGEMENT_LOW)} to ${usd(AGENCY_ENGAGEMENT_HIGH)}`;

export interface AboutSection {
  id: string;
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface AboutFact {
  label: string;
  value: string;
}

export const aboutIntro: string =
  'Nexli Automation is a CPA firm growth agency founded by Marcel Allen. It builds and runs the Digital Rainmaker System, a client-acquisition and operations infrastructure for established CPA and accounting firms, made up of a premium website, an AI automation layer, a secure client document portal, and a Google review engine, backed by paid ads. Nexli works only with CPA and accounting firms doing $500K or more in annual revenue (about $40K-$50K a month).';

export const aboutFacts: AboutFact[] = [
  { label: 'Legal name', value: 'Nexli Automation LLC' },
  { label: 'Founded', value: 'TODO: year' },
  { label: 'Headquarters', value: 'Winter Park, FL' },
  { label: 'Founder', value: 'Marcel Allen' },
  { label: 'Email', value: 'mail@nexli.net' },
  { label: 'Serves', value: 'Established CPA and accounting firms with $500K+ in annual revenue (about $40K-$50K a month)' },
  { label: 'Contract terms', value: 'Six-month initial term from launch, then month to month' },
  { label: 'Launch time', value: 'About 21 days from kickoff, which is what the engagement letter commits to' },
];

export const founderBio: string[] = [
  'Marcel Allen is the founder of Nexli Automation. He started the company to give established CPA firms the client-acquisition and operations infrastructure that larger firms build in-house: a website that converts, automated intake and booking, a secure client portal, a review engine, and paid campaigns that feed all of it.',
  'His view is that most firms between $500K and $5M in revenue do not have a demand problem or a talent problem so much as an infrastructure problem. The partners are good at the work. What they lack is the front-end system that turns referrals and searches into booked advisory consultations without a partner answering every call.',
  'Marcel leads the strategy work with each firm and runs Nexli with a small team.',
];

export const aboutSections: AboutSection[] = [
  {
    id: 'what-we-do',
    heading: 'What we do',
    body: [
      'Nexli builds the Digital Rainmaker System for CPA firms and then runs paid ads to it. The system has four parts, built in a set order so each part feeds the next.',
      'Once it is live, the firm receives qualified tax advisory consultations on its calendar without a partner handling the first call, and clients move documents through the portal instead of email.',
    ],
    bullets: [
      'A premium website built around one advisory offer, with a clear booking path.',
      'An AI automation layer: missed-call text-back, 24/7 intake, automated booking, and nurture sequences.',
      'A secure client document portal with checklists and automated reminders.',
      'A Google review engine that produces 3-5 extra Google reviews per month.',
      'Paid ads that send niche-intent traffic to the system.',
    ],
  },
  {
    id: 'who-we-work-with',
    heading: 'Who we work with',
    body: [
      'Nexli works exclusively with established CPA and accounting firms doing $500K or more in annual revenue. The firms we work best with already have a stable client base, deliver good work, and want more advisory clients without adding headcount to get them.',
      `We do not work with startups, bookkeeping-only practices under the revenue threshold, or firms outside accounting. Pricing is ${usd(AGENCY_TOTAL_MONTHLY)} a month, covering the complete system and the ad budget together, plus a one-time setup fee for the build quoted on the call ([pricing](/pricing)). Firms apply for a strategy call, and we take on the ones where the system fits.`,
    ],
  },
  {
    id: 'how-we-work',
    heading: 'How we work',
    body: [
      'Engagements start with an application and a strategy call. If the firm fits, we build the system first and turn on campaigns once it is live. The build takes about 21 days.',
      'The initial term is six months from launch — long enough for the campaigns to have actually run — and after that it continues month to month. There is a one-time setup fee for the build, quoted on the call. The firm owns what we build, the website, the portal and the automations, and pays its own hosting; the monthly fee pays for us to maintain and run it.',
      `We do not offer performance guarantees or promise a number of clients. What we tell a firm is what each client is worth: the system brings in tax-planning clients, each an engagement worth ${CLIENT_VALUE}. Every week the firm gets a written update showing what the campaigns produced.`,
    ],
    bullets: [
      `What each client is worth: a tax-planning engagement of ${CLIENT_VALUE}.`,
      'Build time: the whole system live about 21 days after kickoff.',
      'Reported: a written update every week on what was done in the ad account and what it produced.',
    ],
  },
  {
    id: 'why-cpa-firms-only',
    heading: 'Why CPA firms only',
    body: [
      'A generalist agency has to learn each new industry from scratch. We only build for CPA and accounting firms, so the website structure, the intake questions, the booking flow, the portal checklists, the review requests, and the ad campaigns are already built for how a tax and advisory engagement actually works.',
      'That focus is why the timeline is measured in weeks and why we can put a number on the results. Every firm we launch makes the system better for the next one.',
    ],
  },
  {
    id: 'what-we-believe',
    heading: 'What we believe',
    body: ['A few principles that shape how we build and what we promise.'],
    bullets: [
      'Revenue per client matters more than client count. Advisory is where CPA firms earn their rate.',
      'Growth should not require hiring. Capacity comes from intake, collection, and delivery systems before it comes from payroll.',
      'A firm should own its demand. Referrals are a gift; a booked calendar is a system.',
      'Targets should be specific and reported. A number, a date, and an honest weekly update on the pace.',
      'Six months, then month to month. Long enough to judge the work on results rather than on a first impression, short enough that we have to keep earning it.',
    ],
  },
  {
    id: 'press-and-mentions',
    heading: 'Press and mentions',
    body: ['Press coverage, podcast appearances, and industry mentions will be listed here as they are published.'],
  },
  {
    id: 'contact',
    heading: 'Contact',
    body: [
      'Email mail@nexli.net for anything that is not an application. Firms that want to work with Nexli should [apply for a strategy call](/agency).',
      `Nexli Automation is on ${SOCIAL_PROFILES.map((p) => p.name).join(', ').replace(/, ([^,]*)$/, ' and $1')}.`,
    ],
    // Socials come from lib/site.ts SOCIAL, so a profile added there (the
    // LinkedIn and YouTube URLs are still to be supplied) appears here too.
    bullets: [
      'Website: https://www.nexli.net',
      'Email: mail@nexli.net',
      `Phone: ${PHONE_DISPLAY}`,
      `Address: ${ADDRESS_LINES.join(', ')}`,
      ...SOCIAL_PROFILES.map((p) => `${p.name}: ${p.url}`),
    ],
  },
];
