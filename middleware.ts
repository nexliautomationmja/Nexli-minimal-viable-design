import { NextResponse, type NextRequest } from 'next/server';
import { getSlugForHost } from './lib/firm-sites/registry';
import { isOwnHost } from './lib/firm-sites/hosts';

/**
 * Host-based routing for Firm Foundation client sites.
 *
 * Two kinds of firm domain are served here:
 *
 *   1. Static registry (data/firm-sites, lib/firm-sites/registry.ts): a host
 *      with a registered slug is rewritten to /sites/<slug>. Fallback and
 *      reference example only.
 *   2. Database-driven (primary): any other host that is not one of our own
 *      (see lib/firm-sites/hosts.ts) is rewritten to /sites/host/<host>, and
 *      the page looks the domain up in the `firm_sites` table at request time.
 *      Publishing a site or attaching a domain in the dashboard therefore
 *      needs NO deploy. Unknown hosts simply 404 there.
 *
 * In both cases the browser URL stays on the firm's domain. Requests to
 * nexli.net, *.vercel.app, localhost / IP literals and anything listed in
 * NEXT_PUBLIC_OWN_HOSTS pass through untouched (that env var is the escape
 * hatch if a host of ours is ever misclassified as a firm domain).
 *
 * The domain must still be attached to the Vercel project so the request
 * reaches us at all:
 *   1. Vercel > this project > Settings > Domains > Add the apex and www
 *      hostnames (e.g. ridgelinetax.com and www.ridgelinetax.com).
 *   2. At the firm's registrar, point DNS at Vercel:
 *        apex  A      76.76.21.21
 *        www   CNAME  cname.vercel-dns.com
 *      (or follow the exact records Vercel shows for the domain).
 *   3. Set the domain on the firm's site in the dashboard admin (DB-driven),
 *      or `domain: 'ridgelinetax.com'` in data/firm-sites/<slug>.ts and
 *      deploy (static).
 *   Vercel issues the TLS certificate automatically once DNS resolves.
 *
 * Note: Next.js 16 prefers the file name proxy.ts; middleware.ts still works.
 */
export const config = {
  // Skip Next internals, API routes, static files (anything with an extension)
  // and the /sites tree itself so a rewritten request is never rewritten twice.
  matcher: ['/((?!api/|_next/|sites/|.*\\..*).*)'],
};

export function middleware(req: NextRequest) {
  const host = req.headers.get('host');
  const { pathname, search } = req.nextUrl;
  const suffix = pathname === '/' ? '' : pathname;

  const slug = getSlugForHost(host);
  if (slug) {
    const target = new URL(`/sites/${slug}${suffix}`, req.url);
    target.search = search;
    return NextResponse.rewrite(target);
  }

  if (host && !isOwnHost(host)) {
    const target = new URL(`/sites/host/${encodeURIComponent(host)}${suffix}`, req.url);
    target.search = search;
    return NextResponse.rewrite(target);
  }

  return NextResponse.next();
}
