/**
 * Server-only resolver for Firm Foundation sites.
 *
 * Primary source is the `firm_sites` table (written by the dashboard admin);
 * the static registry in data/firm-sites is the fallback. Never import this
 * from middleware or client components: it touches the database.
 */
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { firmSites, type FirmSiteRow } from '../firm-sites-schema';
import { getFirmSite, getSlugForHost, normalizeHost } from './registry';
import type { FirmSiteConfig } from './types';
import { validateFirmSiteConfig } from './validate';

export interface ResolvedFirmSite {
  cfg: FirmSiteConfig;
  source: 'db' | 'static';
  status: 'draft' | 'published';
  isPreview: boolean;
}

export interface ResolveQuery {
  slug?: string;
  host?: string;
  /** From `?preview=<token>`; must strictly equal the row's preview_token. */
  previewToken?: string;
}

/** Apex form of a host: lowercased, port stripped, leading "www." removed. */
function apexOf(host: string): string {
  return normalizeHost(host).replace(/^www\./, '');
}

async function findRow(q: ResolveQuery): Promise<FirmSiteRow | null> {
  const db = getDb();
  if (!db) return null;

  let rows: FirmSiteRow[] = [];
  if (q.slug) {
    rows = await db.select().from(firmSites).where(eq(firmSites.slug, q.slug)).limit(1);
  } else if (q.host) {
    const apex = apexOf(q.host);
    if (!apex) return null;
    rows = await db.select().from(firmSites).where(eq(firmSites.domain, apex)).limit(1);
  }
  return rows[0] ?? null;
}

function fromRow(row: FirmSiteRow, previewToken?: string): ResolvedFirmSite | null {
  const isPreview = !!previewToken && previewToken === row.previewToken;
  const status: ResolvedFirmSite['status'] = row.status === 'published' ? 'published' : 'draft';
  if (status !== 'published' && !isPreview) return null;

  const validated = validateFirmSiteConfig(row.config);
  if (validated.ok === false) {
    console.error(`[firm-sites] Invalid config for site "${row.slug}":`, validated.errors);
    return null;
  }

  // The row's slug and domain are authoritative; the JSON may lag behind.
  const cfg: FirmSiteConfig = {
    ...validated.config,
    slug: row.slug,
    domain: row.domain ?? undefined,
  };
  return { cfg, source: 'db', status, isPreview };
}

function fromStatic(q: ResolveQuery): ResolvedFirmSite | null {
  const slug = q.slug ?? getSlugForHost(q.host);
  const cfg = slug ? getFirmSite(slug) : undefined;
  if (!cfg) return null;
  return { cfg, source: 'static', status: 'published', isPreview: false };
}

/**
 * Look a site up by slug or by request host. Returns null when nothing is
 * published (or previewable with the right token) under that identity.
 *
 * A DB row that exists but is not visible (draft without a matching preview
 * token, or invalid config) does NOT fall through to the static registry:
 * a firm's slug never resolves to someone else's demo.
 */
export async function resolveFirmSite(q: ResolveQuery): Promise<ResolvedFirmSite | null> {
  if (!q.slug && !q.host) return null;

  try {
    const row = await findRow(q);
    if (row) return fromRow(row, q.previewToken);
  } catch (err) {
    console.error('[firm-sites] DB lookup failed, using static registry:', err);
  }

  return fromStatic(q);
}
