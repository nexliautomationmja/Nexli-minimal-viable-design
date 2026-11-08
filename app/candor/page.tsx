// ---------------------------------------------------------------------------
// Candor — /candor
//
// The pre-call tool. A firm owner who has booked a strategy call asks the
// thing that is actually bothering them, and gets a straight answer grounded
// in what this site already publishes.
//
// UNGATED, for the same reason /booking-confirmed-b is: the link arrives by
// email and gets opened on a phone that has never visited the site. A cookie
// gate there is a dead end, and the page shows nothing that is not already in
// the pitch. Nobody is greeted by name — see CandorPage below.
//
// Noindex and absent from the sitemap. It is an unlisted link in an email
// sequence, not a search destination, and four near-identical AI chat pages
// is not something to invite a crawler into.
// ---------------------------------------------------------------------------
import type { Metadata, Viewport } from 'next';
import { readDemoLead } from '@/lib/demo-session';
import CandorClient from './candor-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Candor | Nexli',
  description: 'Ask anything before your strategy call. Straight answers.',
  robots: 'noindex, nofollow',
};

/**
 * Two things a phone needs that a desktop does not.
 *
 * viewportFit 'cover' is what makes env(safe-area-inset-bottom) report a
 * real number on iOS. Without it Safari returns 0, so the padding meant to
 * lift the pinned composer clear of the home indicator silently did
 * nothing. NOTE: no page on this site sets it, so the same padding on
 * VslFunnel's StickyCTA is inert on iPhone too — scoped to /candor here
 * rather than changed site-wide, because cover also lets content run under
 * the notch in landscape and every fixed element would need checking.
 *
 * themeColor tints Safari's own toolbar to the page, so the top of the
 * screen is one dark surface instead of a grey browser bar above a navy
 * page.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export default async function CandorPage() {
  // The cookie's lead id rides along to the transcript webhook as a hint,
  // never shown to the visitor. The page no longer greets anyone by name:
  // the cookie names whoever last went through the funnel on this browser,
  // which on a shared phone or after a test run is somebody else.
  let leadId: string | null = null;
  try {
    leadId = await readDemoLead();
  } catch (err) {
    console.error('[Candor] cookie read failed:', err);
  }

  return <CandorClient leadId={leadId} />;
}
