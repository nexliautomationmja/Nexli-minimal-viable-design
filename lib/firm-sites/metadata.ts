import type { Metadata } from 'next';
import { isFirmCustomDomain } from './registry';
import type { FirmSiteConfig } from './types';

/**
 * Metadata for a rendered firm site.
 *
 * Only the firm's own domain is indexable. Previews at nexli.net/sites/<slug>
 * (and localhost / *.vercel.app) carry noindex so Google never sees
 * duplicates; the canonical always points at the custom domain when set.
 */
export function buildFirmSiteMetadata(
  cfg: FirmSiteConfig,
  host: string | null,
  opts?: { noindex?: boolean },
): Metadata {
  const onCustomDomain = isFirmCustomDomain(cfg, host);
  const indexable = onCustomDomain && !opts?.noindex;
  const canonical = cfg.domain ? `https://${cfg.domain}` : undefined;
  const ogImage = cfg.seo.ogImage;

  return {
    title: cfg.seo.title,
    description: cfg.seo.description,
    applicationName: cfg.firmName,
    alternates: canonical ? { canonical } : undefined,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: cfg.firmName,
      title: cfg.seo.title,
      description: cfg.seo.description,
      ...(canonical ? { url: canonical } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: cfg.seo.title,
      description: cfg.seo.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export const NOT_FOUND_METADATA: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};
