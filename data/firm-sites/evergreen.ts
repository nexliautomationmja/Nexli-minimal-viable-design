import type { FirmSiteConfig } from '../../lib/firm-sites/types';

/**
 * THE DEMO FIRM.
 *
 * An invented CPA firm shown identically to every visitor in the demo funnel:
 * the website sandbox on /demo iframes this site, and the portal sandbox wears
 * the same name and colours. Nothing here is real.
 *
 * It is also the internal starting template. To build a real client site,
 * copy this file to data/firm-sites/<their-slug>.ts, swap the content and
 * register it in lib/firm-sites/registry.ts.
 *
 * Positioning: private-client tax & advisory. Deep forest green with a gold
 * accent, serif display type, style: 'solid' (editorial, not SaaS).
 */

/**
 * The nav/footer lockup: two open gold chevrons forming a conifer over a
 * trunk, a hairline gold divider, then a serif wordmark in warm white with a
 * letterspaced gold descriptor. Rendered through an <img>, so no webfont can
 * load inside it — `textLength` + `lengthAdjust` pin the metrics against
 * whatever serif/sans the OS substitutes. Source, before URL-encoding:
 *
 *   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268 56">
 *     <g fill="none" stroke="#D4A24C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
 *       <path d="M24 8 34 22 14 22Z"/>
 *       <path d="M24 21 39 39 9 39Z"/>
 *     </g>
 *     <rect x="22.6" y="39" width="2.8" height="9" rx="1.4" fill="#D4A24C" opacity=".7"/>
 *     <path d="M56 12V44" stroke="#D4A24C" stroke-width="1" opacity=".4"/>
 *     <text x="70" y="29" fill="#F4F1EA" font-family="Georgia,serif" font-size="26"
 *           textLength="184" lengthAdjust="spacingAndGlyphs">Evergreen</text>
 *     <text x="70" y="45" fill="#D4A24C" font-family="Outfit,Arial,sans-serif" font-size="9"
 *           font-weight="600" letter-spacing="2.6" textLength="183"
 *           lengthAdjust="spacingAndGlyphs">TAX &amp; ADVISORY</text>
 *   </svg>
 *
 * ink: 'mixed' is deliberate — `.fs-logo--mixed-ink` has no rule, so no backing
 * plate is drawn. On the site the lockup only ever renders on --fs-primary
 * (nav) and --fs-primary-deep (footer), both dark greens in both palettes.
 *
 * The portal sidebar is the exception: it goes #ffffff in light theme, where
 * the warm-white wordmark would vanish and the gold drops to 2.1:1. Hence
 * evergreenLogo(ink), and EVERGREEN_LOGO_ON_LIGHT below — same lockup, dark
 * wordmark, and a deeper antique gold that clears 4.5:1 on white.
 */
function evergreenLogo(wordmark: string, gold: string): string {
  const g = gold.replace('#', '%23');
  const w = wordmark.replace('#', '%23');
  return (
    'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268 56">' +
    `<g fill="none" stroke="${g}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">` +
    '<path d="M24 8 34 22 14 22Z"/><path d="M24 21 39 39 9 39Z"/></g>' +
    `<rect x="22.6" y="39" width="2.8" height="9" rx="1.4" fill="${g}" opacity=".7"/>` +
    `<path d="M56 12V44" stroke="${g}" stroke-width="1" opacity=".4"/>` +
    `<text x="70" y="29" fill="${w}" font-family="Georgia,serif" font-size="26" textLength="184" ` +
    'lengthAdjust="spacingAndGlyphs">Evergreen</text>' +
    `<text x="70" y="45" fill="${g}" font-family="Outfit,Arial,sans-serif" font-size="9" font-weight="600" ` +
    'letter-spacing="2.6" textLength="183" lengthAdjust="spacingAndGlyphs">TAX &amp; ADVISORY</text></svg>'
  );
}
const EVERGREEN_LOGO = evergreenLogo('#F4F1EA', '#D4A24C');

/**
 * Light-background variant, for the portal's white sidebar. #8F6619 is a deep
 * antique gold at 5.1:1 on white — the site's #D4A24C only manages 2.1:1, so
 * the descriptor line would be unreadable at 9px.
 */
export const EVERGREEN_LOGO_ON_LIGHT = evergreenLogo('#14201A', '#8F6619');

export const evergreenFirm: FirmSiteConfig = {
  slug: 'evergreen',
  firmName: 'Evergreen Tax & Advisory',
  // Rendered uppercase by .fs-eyebrow in the hero, and in sentence case in the
  // footer — so keep it in sentence case here.
  tagline: 'Private client tax & advisory',
  heroHeadline: 'Your tax bill is a decision, not a number.',
  heroSub:
    'Evergreen works with owners and high earners who want a plan for the year ahead, not a report on the year behind. We model the decisions while you can still make them.',
  logo: {
    src: EVERGREEN_LOGO,
    alt: 'Evergreen Tax & Advisory',
    width: 172,
    ink: 'mixed',
  },
  theme: 'dark',
  // Light palette — warm off-white canvas, deep forest, gold.
  colors: {
    primary: '#14532D',
    // GUARD: do not darken this gold past #D2A04A. contrastText() in
    // lib/firm-sites/color.ts flips to white ink below a relative luminance of
    // 0.40; #D4A24C sits at 0.4037, so it keeps dark ink at 7.4:1. One shade
    // darker silently drops .fs-btn-accent to ~2.4:1 (white on gold).
    accent: '#D4A24C',
    background: '#FBFAF7',
    surface: '#FFFFFF',
    text: '#14201A',
    textMuted: '#5B655F',
    border: '#E4E1D9',
  },
  // Dark palette (the default, and what the /demo sandbox shows first).
  darkColors: {
    primary: '#2E7D53',
    accent: '#E8C275',
    background: '#0A1310',
    surface: 'rgba(255, 255, 255, 0.035)',
    text: '#F4F3EF',
    textMuted: 'rgba(244, 243, 239, 0.66)',
    border: 'rgba(244, 243, 239, 0.12)',
  },
  fonts: {
    heading: "'Fraunces', Georgia, 'Times New Roman', serif",
    body: "'Outfit', system-ui, -apple-system, sans-serif",
  },
  style: 'solid',
  services: [
    {
      icon: 'target',
      title: 'Tax Strategy',
      description:
        'A written plan before the year closes: entity structure, compensation, timing of income, and the credits that only work if you act in time.',
    },
    {
      icon: 'trending-up',
      title: 'Fractional CFO',
      description:
        'A 13-week cash view, a monthly close you can act on, and a board-ready reporting pack. A finance function without a finance hire.',
    },
    {
      icon: 'scale',
      title: 'Entity & Structure',
      description:
        'Modelling of S-corp, partnership and holding-company alternatives, with a reasonable-compensation study and a filing calendar that survives an exam.',
    },
    {
      icon: 'landmark',
      title: 'Business & Owner Tax',
      description:
        'Federal, state and multi-state returns for the company and the people who own it, prepared as one picture instead of six files.',
    },
    {
      icon: 'chart',
      title: 'Financial Reporting',
      description:
        'Monthly books closed on a calendar, reconciled and reviewed, so lenders, investors and your own decisions run on current numbers.',
    },
    {
      icon: 'shield',
      title: 'Exit & Succession',
      description:
        'What the business is worth, what the sale costs in tax, and what to change in the two years before you need the answer.',
    },
  ],
  about: {
    heading: 'We are paid to change the outcome, not to report it.',
    body:
      'Evergreen was built for owners who met their accountant once a year, in March, to be told what they already owed. That is bookkeeping with a stamp on it.\n\nWe work on a planning calendar instead. We model the year ahead, bring you the decisions while they are still decisions, and put the documents, the signatures and the invoices in one place. Every engagement is led by a licensed CPA at a fee agreed in writing before any work begins.',
    highlights: [
      'A named CPA partner on every engagement',
      'Fixed fees, agreed in writing before work begins',
      'A written plan before the year closes, not after',
      'Quarterly working sessions, not an annual review',
    ],
  },
  team: [
    {
      name: 'Dana Whitfield, CPA',
      role: 'Founder & Managing Partner',
      bio: 'Twenty years in tax, focused on closely held businesses and real estate.',
    },
    {
      name: 'Marcus Reyes, CPA',
      role: 'Director, Tax Strategy',
      bio: 'Leads business tax and entity planning. Former Big Four senior associate.',
    },
    {
      name: 'Priya Natarajan',
      role: 'Director, Client Accounting',
      bio: 'Runs bookkeeping and payroll so owners always have clean, current numbers.',
    },
  ],
  testimonials: [
    {
      quote:
        'The first planning session found a restructure worth about thirty thousand a year. Our previous firm had filed the same return five times without raising it once.',
      name: 'Jordan Ellis',
      detail: 'Owner, Ellis Mechanical',
    },
    {
      quote:
        'They sit in the monthly leadership meeting. We stopped guessing at cash three quarters ago, and the bank noticed before we did.',
      name: 'Samantha Cho',
      detail: 'Managing Partner, Redwood Realty Partners',
    },
  ],
  stats: [
    { value: '14 yrs', label: 'Advising owner-led firms' },
    { value: '$4.6M', label: 'Client tax reduced last year' },
    { value: '$180M', label: 'Client revenue under advisory' },
    { value: '1 day', label: 'Partner response time' },
  ],
  // Evergreen is a *demo* of a client's firm, so neither CTA may leave the page:
  // pointing them at Nexli's own calendar or portal login breaks the illusion and
  // sends a prospect somewhere they were never meant to go. "#top" scrolls back to
  // the hero, and linkProps() (lib/firm-sites/links.ts) drops target="_blank" for
  // in-page anchors so these never spawn a second tab. Real firms keep absolute URLs.
  bookingUrl: '#top',
  portalUrl: '#top',
  contact: {
    phone: '(720) 555-0148',
    email: 'hello@evergreentax.example',
    address: '2120 S Broadway, Suite 210, Denver, CO 80210',
    hours: 'Mon to Fri, 8:30am to 5:00pm MT',
  },
  seo: {
    title: 'Evergreen Tax & Advisory | Private Client Tax & CFO Advisory',
    description:
      'Advisory-led CPA firm for owners and high earners: tax strategy, fractional CFO, entity structure and exit planning, with a secure client portal for documents, signatures and payments.',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/evergreen-tax-advisory',
    google: 'https://g.page/evergreen-tax-advisory',
  },
};
