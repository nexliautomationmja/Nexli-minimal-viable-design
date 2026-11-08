'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on funnel pages (covers all /vslfunnel* variants
  // and the whole /demo-opt-in -> /demo demo funnel)
  if (
    pathname === '/revenuecalc' ||
    // Prefix, so the -b variant is covered too, same shape as /vslfunnel.
    pathname.startsWith('/booking-confirmed') ||
    pathname === '/qualify' ||
    pathname === '/thank-you' ||
    pathname === '/profit-calculator' ||
    pathname === '/demo-opt-in' ||
    pathname.startsWith('/vslfunnel') ||
    pathname.startsWith('/sites') ||
    // The demo funnel: /demo itself and every step under it. Written as an
    // exact match plus a '/demo/' prefix so a future route that merely starts
    // with the letters (e.g. /demo-reel) keeps its navbar.
    pathname === '/demo' ||
    pathname.startsWith('/demo/') ||
    // The advisory funnel, same exact-plus-prefix shape.
    pathname === '/advisory-pricing' ||
    pathname.startsWith('/advisory-pricing/') ||
    // The belief-angle VSLs. Top-level routes so the ad URL is short, which
    // is why they need naming here at all — their three siblings under
    // /advisory-pricing/ are covered by the prefix above. THIS LIST AND
    // FOOTER'S ARE SEPARATE AND HAVE DRIFTED BEFORE: a fourth angle has to
    // be added to both.
    // Exact match plus the '/<angle>/' prefix, because each angle now owns
    // its whole funnel — /systems/qualify, /systems/call and
    // /systems/next-steps all have to lose the chrome too. Before the
    // restructure those steps sat under '/advisory-pricing/' and were
    // covered by the prefix above; exact matches alone would have put the
    // navbar and footer back on nine funnel pages.
    // Candor, the pre-call AI tool. Its own chrome, same as the funnel pages.
    pathname === '/candor' ||
    pathname.startsWith('/candor/') ||
    // /math, the See the Math sales-call deck. Full-screen slides with
    // their own chrome; the site nav would sit on top of every one of them.
    pathname === '/math' ||
    pathname.startsWith('/math/') ||
    pathname === '/agency' ||
    pathname.startsWith('/agency/') ||
    pathname === '/better-clients' ||
    pathname.startsWith('/better-clients/') ||
    pathname === '/systems' ||
    pathname.startsWith('/systems/') ||
    pathname === '/acquisition' ||
    pathname.startsWith('/acquisition/') ||
    // The Accelerator funnel. The landing page is crawlable and the inner
    // steps are not, but that is a robots question — every page here is
    // still a funnel page, and a funnel page with the site nav on it is
    // five ways out of a page with one job.
    pathname === '/accelerator' ||
    pathname.startsWith('/accelerator/')
  ) {
    return null;
  }

  return <Navbar />;
}
