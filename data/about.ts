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
  { label: 'Headquarters', value: 'TODO: City, State' },
  { label: 'Founder', value: 'Marcel Allen' },
  { label: 'Email', value: 'mail@nexli.net' },
  { label: 'Serves', value: 'Established CPA and accounting firms with $500K+ in annual revenue (about $40K-$50K a month)' },
  { label: 'Contract terms', value: 'Month to month, no annual contracts' },
  { label: 'Launch time', value: 'Most firms live within 2 weeks; 14-day funnel launch guarantee' },
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
      'We do not work with startups, bookkeeping-only practices under the revenue threshold, or firms outside accounting. Pricing is not published. Firms apply for a strategy call, and we take on the ones where the system fits.',
    ],
  },
  {
    id: 'how-we-work',
    heading: 'How we work',
    body: [
      'Engagements start with an application and a strategy call. If the firm fits, we build the system first and turn on campaigns once it is live. Most firms go live within 2 weeks.',
      'Terms are month to month. There are no annual contracts, and the firm can stop at the end of any month.',
      'Two guarantees are written into every engagement.',
    ],
    bullets: [
      'Results guarantee: at least 50 qualified advisory leads within 90 days of campaign launch, or Nexli keeps working for free until it hits 50.',
      'Launch guarantee: live within 14 days, or a $1,000 credit toward the next monthly payment.',
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
      'Guarantees should be specific. A number, a deadline, and what happens if we miss.',
      'Month to month keeps us honest. The firm should stay because the system works, not because a contract says so.',
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
      'Email mail@nexli.net for anything that is not an application. Firms that want to work with Nexli should [apply for a strategy call](/vslfunnel-advisory).',
      'Nexli Automation is on Instagram and Facebook as Nexli Automation, and on X as @nexliautomation.',
    ],
    bullets: [
      'Website: https://www.nexli.net',
      'Email: mail@nexli.net',
      'Instagram: https://www.instagram.com/nexliautomation',
      'Facebook: https://www.facebook.com/p/Nexli-Automation-61587654965905/',
      'X: @nexliautomation',
    ],
  },
];
