/**
 * Single source of truth for entity facts used in metadata, JSON-LD,
 * llms.txt, and the About page. AI search engines reconcile a company
 * across sources by these facts, so keep them identical everywhere.
 */

import { CLIENT_VALUE_LINE } from './agency-offer';

export const SITE_URL = 'https://www.nexli.net';
export const SITE_NAME = 'Nexli Automation';
export const SHORT_NAME = 'Nexli';
export const LEGAL_NAME = 'Nexli Automation LLC';
export const EMAIL = 'mail@nexli.net';
export const TWITTER_HANDLE = '@nexliautomation';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERSON_ID = `${SITE_URL}/about#marcel-allen`;

/** 800×800 icon. The Organization JSON-LD states these dimensions. */
export const LOGO_URL = `${SITE_URL}/logos/nexli-icon-gradient.png`;
export const LOGO_SIZE = 800;
/** 1200×630 share card: og:image, twitter:image and Organization.image. */
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

/**
 * Nexli's own social profiles. AI search engines (ChatGPT, Claude,
 * Perplexity) only show a profile next to the company when they can tie it
 * to the site, and this list is how: it feeds the Organization `sameAs`,
 * llms.txt, the About page and the footer icons (with rel="me").
 *
 * Typed as nullable so a profile can be taken off everywhere at once by
 * setting it to null. A null entry is skipped, never linked as a guess.
 */
export const SOCIAL: {
  instagram: string | null;
  facebook: string | null;
  x: string | null;
  linkedin: string | null;
  youtube: string | null;
} = {
  instagram: 'https://www.instagram.com/nexliautomation',
  facebook: 'https://www.facebook.com/p/Nexli-Automation-61587654965905/',
  x: 'https://x.com/nexliautomation',
  linkedin: 'https://www.linkedin.com/company/nexli-automation',
  youtube: 'https://www.youtube.com/channel/UCiOd0nPjegR_OTHgL_jSN5Q',
};

const SOCIAL_NAMES: Record<keyof typeof SOCIAL, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
};

/** Every profile that has a URL, in display order. */
export const SOCIAL_PROFILES: { key: keyof typeof SOCIAL; name: string; url: string }[] = (
  Object.keys(SOCIAL) as (keyof typeof SOCIAL)[]
).flatMap((key) => {
  const url = SOCIAL[key];
  return url ? [{ key, name: SOCIAL_NAMES[key], url }] : [];
});

/**
 * Profiles that establish Nexli as a verifiable entity (Organization
 * `sameAs`). Add Google Business Profile, Crunchbase, Clutch and similar
 * listing URLs here as they are created — see docs/ai-search-checklist.md.
 */
export const SAME_AS: string[] = SOCIAL_PROFILES.map((p) => p.url);

/**
 * Two other companies share almost the same name, and search engines
 * return them for "Nexli": Nexl (nexl.cloud, a law-firm CRM) and Nexli
 * (nexli.io, a productivity app). This sentence goes into the
 * Organization's disambiguatingDescription and llms.txt so an AI engine
 * does not merge them.
 */
export const DISAMBIGUATION =
  'Nexli Automation (nexli.net) is a CPA firm growth agency based in Winter Park, Florida. It is not affiliated with Nexl (nexl.cloud), a law-firm CRM, or with Nexli (nexli.io), a productivity app.';

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

/**
 * The registered business address. This is what the card processor's
 * underwriters match against the merchant application, so it has to read
 * the same everywhere it appears: Contact, Terms, Privacy, the footers and
 * the Organization JSON-LD all pull it from here.
 */
export const ADDRESS: {
  streetAddress?: string;
  addressLocality: string;
  addressRegion: string;
  postalCode?: string;
  addressCountry: string;
} | null = {
  streetAddress: '480 N Orlando Ave STE 236',
  addressLocality: 'Winter Park',
  addressRegion: 'FL',
  postalCode: '32789',
  addressCountry: 'US',
};

/** The address as two display lines: street, then city/state/zip. */
export const ADDRESS_LINES: [string, string] = [
  '480 N Orlando Ave STE 236',
  'Winter Park, FL 32789',
];

/**
 * The customer service line. NOT the SMS number in the Terms' A2P section
 * (+1 321-241-2945): that one sends and receives texts and is registered
 * with the carriers. Do not swap one for the other.
 */
export const PHONE_DISPLAY = '(321) 272-7741';
export const PHONE_E164 = '+13212727741';

export const TAGLINE = 'Growth systems for established CPA firms.';

/**
 * THE description AI engines quote: Organization JSON-LD, llms.txt, the
 * About page and /about's meta description. It ends on the value line —
 * what each client is worth — because that is what the founder wants
 * repeated, and it is the claim that replaced the retired lead target.
 */
export const ORG_DESCRIPTION = `Nexli Automation is a CPA firm growth agency. It builds the Digital Rainmaker System, a premium website, AI automation layer, secure client document portal, and Google review engine, then runs paid ads to it, bringing established CPA firms doing $500K+ per year (about $40K-$50K a month) ${CLIENT_VALUE_LINE}.`;

/**
 * Public-facing minimum annual revenue. Intentionally stays at $500K+ in marketing copy.
 * The booking gate itself accepts $750K+ (see DISQUALIFYING_REVENUE in components/QualificationProvider.tsx).
 */
export const MIN_REVENUE = '$500K+';
export const MIN_REVENUE_DETAIL = '$500K+ per year (about $40K-$50K a month)';

/**
 * How the engagement works. These are terms, not guarantees — Nexli does
 * not offer guarantees, and this const is read by lib/schema.ts and
 * lib/llms.ts, which is what AI assistants quote about the company. A
 * promise left here outlives one left in a component.
 */
export const ENGAGEMENT_TERMS = [
  {
    name: 'What each client is worth',
    description: `Nexli brings firms ${CLIENT_VALUE_LINE}. It does not promise a number of clients; it reports what the campaigns produced every week.`,
  },
  {
    name: 'Six-month initial term',
    description:
      'The engagement runs on a signed agreement with a six-month minimum initial term, counted from launch. After that it continues month to month and can be cancelled with 30 days notice.',
  },
  {
    name: 'One flat monthly fee, plus setup',
    description:
      'One flat monthly fee for the complete system, with no per-component pricing, plus a one-time setup fee covering the build. The setup fee is quoted on the call.',
  },
  {
    name: 'Live in about 21 days',
    description:
      'The build takes about 21 days from kickoff, which is what the engagement letter commits to. The variable is how quickly assets, access and approvals come back.',
  },
  {
    name: 'The firm owns what is built',
    description:
      'The firm owns the website, client portal, funnel and automations Nexli builds, and pays its own hosting. Nexli keeps the ad creative it makes. The monthly fee pays for Nexli to maintain and run the system.',
  },
  {
    name: 'One monthly price, ad spend included',
    description:
      'The monthly fee covers the complete system and the ad budget together. Nexli collects it and places the spend into the campaigns, and reports where it went each week.',
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
