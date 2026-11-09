// ---------------------------------------------------------------------------
// Is the page being rendered a client firm's website rather than Nexli's?
//
// Firm sites are served by this same app. A firm's custom domain is
// rewritten by middleware.ts to /sites/host/<domain> (or /sites/<slug>) while
// the address bar stays on the firm's domain — so usePathname() returns "/"
// there, and a `pathname.startsWith('/sites')` check never fires. That is how
// Nexli's navbar, footer (with Nexli's address, phone and card marks) and
// Organization JSON-LD were all rendering on client firms' websites.
//
// useSelectedLayoutSegments() reads the route that was actually rendered,
// which is the rewritten one, so it is right on both nexli.net/sites/... and
// firmdomain.com/. Call it from a client component inside the root layout:
// it returns the segments below the layout it is called from.
// ---------------------------------------------------------------------------

import { useSelectedLayoutSegments } from 'next/navigation';

export function useIsFirmSite(): boolean {
  return useSelectedLayoutSegments()[0] === 'sites';
}
