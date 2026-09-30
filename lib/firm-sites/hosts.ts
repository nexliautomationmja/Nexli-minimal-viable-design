/**
 * Which request hosts belong to Nexli itself (marketing site, previews,
 * local dev) as opposed to a Firm Foundation client's custom domain.
 *
 * Imported by middleware.ts (Edge runtime): no DB, no Node-only modules.
 * Any host that is NOT one of ours is treated as a potential firm domain and
 * rewritten to /sites/host/<host>, where the DB lookup happens.
 *
 * NEXT_PUBLIC_OWN_HOSTS (comma-separated) is the escape hatch for hosts we
 * cannot predict here, e.g. a staging alias. Each entry matches the exact host
 * or, as an apex, any subdomain of it.
 */
import { normalizeHost } from './registry';

const BUILT_IN_APEXES = ['nexli.net', 'vercel.app'];
const LOOPBACK = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

function matchesApex(host: string, apex: string): boolean {
  return host === apex || host.endsWith(`.${apex}`);
}

function configuredOwnHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_OWN_HOSTS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((h) => normalizeHost(h))
    .filter(Boolean);
}

export function isOwnHost(host: string | null | undefined): boolean {
  const h = normalizeHost(host);
  if (!h) return true;
  if (LOOPBACK.has(h) || h.endsWith('.localhost')) return true;
  if (IPV4.test(h)) return true;
  if (BUILT_IN_APEXES.some((apex) => matchesApex(h, apex))) return true;
  return configuredOwnHosts().some((own) => matchesApex(h, own));
}
