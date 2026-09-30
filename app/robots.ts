import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';

const DISALLOW = [
  '/api/',
  '/_next/',
  '/dashboard/',
  '/qualify',
  '/thank-you',
  '/booking-confirmed',
  '/sites/preview',
  '/profit-calculator',
  // Inner demo-funnel steps: entered from /demo-opt-in -> /demo, never
  // meaningful as a search result.
  '/demo/qualify',
  '/demo/call',
  '/demo/offer',
  '/demo/thank-you',
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
