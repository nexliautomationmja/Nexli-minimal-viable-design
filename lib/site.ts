/**
 * Single source of truth for entity facts used in metadata, JSON-LD,
 * llms.txt, and the About page. AI search engines reconcile a company
 * across sources by these facts, so keep them identical everywhere.
 */

export const SITE_URL = 'https://www.nexli.net';
export const SITE_NAME = 'Nexli Automation';
export const SHORT_NAME = 'Nexli';
export const LEGAL_NAME = 'Nexli Automation LLC';
export const EMAIL = 'mail@nexli.net';
export const TWITTER_HANDLE = '@nexliautomation';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERSON_ID = `${SITE_URL}/about#marcel-allen`;

export const LOGO_URL = `${SITE_URL}/logos/nexli-icon-gradient.png`;
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

export const SOCIAL = {
  instagram: 'https://www.instagram.com/nexliautomation',
  facebook: 'https://www.facebook.com/p/Nexli-Automation-61587654965905/',
  x: 'https://x.com/nexliautomation',
} as const;

/**
 * Profiles that establish Nexli as a verifiable entity.
 * TODO: add LinkedIn company page, Google Business Profile, Crunchbase,
 * Clutch, and DesignRush listing URLs as they are created.
 */
export const SAME_AS: string[] = [SOCIAL.instagram, SOCIAL.facebook, SOCIAL.x];

export const FOUNDER = {
  id: PERSON_ID,
  name: 'Marcel Allen',
  jobTitle: 'Founder',
  image: `${SITE_URL}/Founder%20Photos/marcel-headshot-2.png`,
  url: `${SITE_URL}/about`,
  /** TODO: add LinkedIn profile URL. */
  sameAs: [] as string[],
};

/** TODO: set when known, ISO date e.g. '2024-01-15'. */
export const FOUNDING_DATE: string | null = null;

/** TODO: set when a public business address exists. */
export const ADDRESS: {
  streetAddress?: string;
  addressLocality: string;
  addressRegion: string;
  postalCode?: string;
  addressCountry: string;
} | null = null;

export const TAGLINE = 'Growth systems for established CPA firms.';

export const ORG_DESCRIPTION =
  'Nexli Automation is a CPA firm growth agency. It builds the Digital Rainmaker System, a premium website, AI automation layer, secure client document portal, and Google review engine, then runs paid ads to it so established CPA firms doing $500K+ per year (about $40K-$50K a month) land high-value tax advisory clients.';

/**
 * Public-facing minimum annual revenue. Intentionally stays at $500K+ in marketing copy.
 * The booking gate itself accepts $400K+ (see DISQUALIFYING_REVENUE in components/QualificationProvider.tsx).
 */
export const MIN_REVENUE = '$500K+';
export const MIN_REVENUE_DETAIL = '$500K+ per year (about $40K-$50K a month)';

export const GUARANTEES = [
  {
    name: '50 Qualified Leads in 90 Days',
    description:
      'At least 50 qualified advisory leads within 90 days of campaign launch, or Nexli keeps working for free until it hits 50.',
  },
  {
    name: '14-Day Funnel Launch Guarantee',
    description:
      'Your whole funnel — website, landing pages, booking flow, follow-up and portal — is live within 14 days of kickoff, or you receive a $1,000 credit toward your next monthly payment.',
  },
] as const;

export const SYSTEM_COMPONENTS = [
  {
    name: 'Premium Website',
    description:
      'A custom, conversion-focused website for CPA and accounting firms that turns the prospects already searching for you into booked consultations.',
    path: '/rainmaker',
  },
  {
    name: 'AI Automation Layer',
    description:
      'Missed-call text-back, 24/7 intake, automated booking, and nurture sequences so no inquiry goes unanswered.',
    path: '/ai-automations',
  },
  {
    name: 'Secure Client Document Portal',
    description:
      'Branded document collection, e-signatures, and secure sharing that replace email chaos during tax season.',
    path: '/client-dashboard',
  },
  {
    name: 'Google Review Engine',
    description:
      'Systematic review requests and routing that add 3-5 extra Google reviews per month.',
    path: '/smart-reviews',
  },
] as const;

export const KNOWS_ABOUT = [
  'CPA firm growth',
  'CPA firm marketing',
  'Accounting firm lead generation',
  'Tax advisory client acquisition',
  'CPA website design',
  'AI automation for accounting firms',
  'Client intake automation',
  'Google review management for CPAs',
  'Client document portals for tax professionals',
  'Paid advertising for CPA firms',
];

/**
 * Absolute site origin for Stripe success/cancel URLs and CAPI source URLs.
 * Honors NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000 in dev).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  return raw.replace(/\/+$/, '');
}
