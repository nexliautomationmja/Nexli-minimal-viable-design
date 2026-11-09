// ---------------------------------------------------------------------------
// Open Graph and Twitter tags for a page, built the same way every time.
//
// WHY THIS EXISTS. In Next 16 a page's `openGraph` REPLACES the root
// layout's rather than merging with it. Seven pages set their own title and
// description there and, without meaning to, dropped og:image — so a crawler
// or an AI engine looking for a picture of Nexli on /about, /agency or any
// guide found none, and chose its own. (ChatGPT was showing an unrelated
// accounting firm's website next to Nexli's name.) Pages that set no
// openGraph had the opposite problem: they inherited the homepage's og:url,
// so a /portfolio sample of a fictional firm told crawlers it WAS the
// homepage.
//
// Every page that sets openGraph should build it here, so it always carries
// its own URL and the Nexli share image.
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';
import { OG_IMAGE_URL, SITE_NAME, SITE_URL, TWITTER_HANDLE } from './site';

export const OG_IMAGE = {
  url: OG_IMAGE_URL,
  width: 1200,
  height: 630,
  alt: 'Nexli Automation, a CPA firm growth agency',
};

interface SocialMetaOptions {
  title: string;
  description: string;
  /** The page's path, e.g. '/about'. Becomes og:url. */
  path: string;
  type?: 'website' | 'article';
  /** Article-only fields. */
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}

export function socialMeta(opts: SocialMetaOptions): Pick<Metadata, 'openGraph' | 'twitter'> {
  const { title, description, path } = opts;
  const base = {
    title,
    description,
    url: `${SITE_URL}${path === '/' ? '/' : path}`,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [OG_IMAGE],
  };

  const openGraph: Metadata['openGraph'] =
    opts.type === 'article'
      ? {
          ...base,
          type: 'article',
          publishedTime: opts.publishedTime,
          modifiedTime: opts.modifiedTime,
          authors: opts.authors,
          section: opts.section,
        }
      : { ...base, type: 'website' };

  return {
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
      site: TWITTER_HANDLE,
    },
  };
}
