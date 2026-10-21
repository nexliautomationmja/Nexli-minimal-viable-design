import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';

const DISALLOW = [
  '/api/',
  '/_next/',
  '/dashboard/',
  '/qualify',
  '/booking-confirmed',
  '/booking-confirmed-b',
  '/sites/preview',
  '/profit-calculator',
  // Advisory funnel inner steps. The bare /advisory-pricing landing page is
  // the ad destination and stays crawlable.
  '/advisory-pricing/BOBA',
  '/advisory-pricing/BOBA-thank-you',
  '/advisory-pricing/qualify',
  '/advisory-pricing/call',
  '/advisory-pricing/next-steps',
  // Accelerator funnel inner steps. /accelerator itself stays crawlable —
  // it is the ad destination and a legitimate free-resource page.
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
