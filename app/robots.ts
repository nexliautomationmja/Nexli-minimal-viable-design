import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
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
  '/sites/preview',
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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
      { userAgent: '*', allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
