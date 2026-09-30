/**
 * Registry of every Firm Foundation client site.
 *
 * Imported by middleware.ts (Edge runtime), so keep this file and every
 * config it imports free of Node-only modules. Plain data only.
 *
 * To add a firm: create data/firm-sites/<slug>.ts, import it below and add it
 * to CONFIGS. See lib/firm-sites/README.md.
 */
import type { FirmSiteConfig } from './types';
import { exampleFirm } from '../../data/firm-sites/example-firm';
import { evergreenFirm } from '../../data/firm-sites/evergreen';

const CONFIGS: FirmSiteConfig[] = [evergreenFirm, exampleFirm];

export const FIRM_SITES: Record<string, FirmSiteConfig> = Object.fromEntries(
  CONFIGS.map((cfg) => [cfg.slug, cfg]),
);

/** Lowercased apex and www hostnames mapped to their slug. */
export const DOMAIN_TO_SLUG: Record<string, string> = Object.fromEntries(
  CONFIGS.filter((cfg) => !!cfg.domain).flatMap((cfg) => {
    const apex = normalizeHost(cfg.domain!);
    return [
      [apex, cfg.slug],
      [`www.${apex}`, cfg.slug],
    ];
  }),
);

/** Lowercase and strip any port. A leading "www." is kept: both forms are registered in DOMAIN_TO_SLUG. */
export function normalizeHost(host: string | null | undefined): string {
  if (!host) return '';
  return host.trim().toLowerCase().replace(/:\d+$/, '');
}

export function getFirmSite(slug: string): FirmSiteConfig | undefined {
  return FIRM_SITES[slug];
}

export function getSlugForHost(host: string | null | undefined): string | undefined {
  const normalized = normalizeHost(host);
  if (!normalized) return undefined;
  return DOMAIN_TO_SLUG[normalized];
}

/** True when the request host is the firm's own custom domain (apex or www). */
export function isFirmCustomDomain(cfg: FirmSiteConfig, host: string | null | undefined): boolean {
  if (!cfg.domain) return false;
  const normalized = normalizeHost(host);
  const apex = normalizeHost(cfg.domain);
  return normalized === apex || normalized === `www.${apex}`;
}

export function getAllSlugs(): string[] {
  return CONFIGS.map((cfg) => cfg.slug);
}
