import type { MetadataRoute } from 'next';
import { blogPosts } from '../data/blogPosts';
import { guides } from '../data/guides';
import { PORTFOLIO_SLUGS } from '../lib/portfolio-meta';
import { SITE_URL } from '../lib/site';

type Entry = MetadataRoute.Sitemap[number];
type Freq = NonNullable<Entry['changeFrequency']>;

const BUILD_TIME = new Date();

/**
 * Deliberately excluded: /qualify, /thank-you, /booking-confirmed,
 * /roadmap/thank-you (noindex), /funnel and /vslfunnel* (paid-traffic
 * landers; indexable but not part of the canonical content set).
 */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Freq }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/guides', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/rainmaker', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/ai-automations', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/client-dashboard', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/smart-reviews', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/portfolio', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/free-guide', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/revenuecalc', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/roadmap', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: Entry[] = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: BUILD_TIME,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const guideEntries: Entry[] = guides.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const blogEntries: Entry[] = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : BUILD_TIME,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const portfolioEntries: Entry[] = PORTFOLIO_SLUGS.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}`,
    lastModified: BUILD_TIME,
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  return [...staticEntries, ...guideEntries, ...blogEntries, ...portfolioEntries];
}
