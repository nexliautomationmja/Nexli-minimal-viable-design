import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL } from '../lib/site';
import { isOwnHost } from '../lib/firm-sites/hosts';
import {
  VSL_ANGLES,
  callPathForAngle,
  nextStepsPathForAngle,
  qualifyPathForAngle,
} from '../lib/advisory-config';

const DISALLOW = [
  '/api/',
  '/_next/',
  '/dashboard/',
  '/qualify',
  '/booking-confirmed',
  '/booking-confirmed-b',
  // Client firm websites, as nexli.net sees them. Each firm's site lives on
  // its own domain; the /sites/... copies on nexli.net are an internal
  // rewrite target, and crawling them put firms' content under Nexli's name.
  '/sites/',
  '/profit-calculator',
  // The $97 tier, still under the original path.
  '/advisory-pricing/BOBA',
  '/advisory-pricing/BOBA-thank-you',
  // Every angle's inner steps. DERIVED from VSL_ANGLES rather than typed
  // out: twelve hand-written lines is twelve chances to forget one, and a
  // fifth angle would silently ship a crawlable qualifier. The four landing
  // pages themselves stay crawlable — they are the ad destinations.
  ...VSL_ANGLES.flatMap((angle) => [
    qualifyPathForAngle(angle),
    callPathForAngle(angle),
    nextStepsPathForAngle(angle),
  ]),
  // Accelerator funnel inner steps. /accelerator itself stays crawlable —
  // it is the ad destination and a legitimate free-resource page.
  // Candor is an unlisted link in the booking email sequence, not a search
  // destination.
  '/candor',
  // The See the Math sales deck and its PDF: they price the setup fee,
  // which no public page does. Shown on the call and sent after it.
  '/math',
  '/downloads/nexli-see-the-math.pdf',
  '/downloads/nexli-see-the-math-phone.pdf',
  '/accelerator/qualify',
  '/accelerator/next',
  '/accelerator/sending',
];

/**
 * AI search and answer engines. Listed explicitly so a future blanket
 * restriction never accidentally removes Nexli from AI citations.
 * Training crawlers (GPTBot, ClaudeBot, Google-Extended) are allowed on
 * purpose: being in training data is how a brand gets recommended.
 */
const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  // A client firm's domain reaches this file too: middleware.ts skips any
  // path with a dot, so firmdomain.com/robots.txt is served from here. It
  // used to hand back Nexli's rules and Nexli's sitemap, which tells a
  // crawler the firm's site and nexli.net are the same property. A firm
  // domain gets a plain allow-all instead, with no Nexli URLs in it.
  const host = (await headers()).get('host');
  if (!isOwnHost(host)) {
    return { rules: [{ userAgent: '*', allow: '/' }] };
  }

  return {
    rules: [
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
      { userAgent: '*', allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
