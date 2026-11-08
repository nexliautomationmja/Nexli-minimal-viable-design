// ---------------------------------------------------------------------------
// /math — "See the Math", the sales-call deck.
//
// Marcel screen-shares this on Zoom, then sends the link (and the PDF it
// offers) afterwards as the leave-behind. Built from Nexli-See-The-Math.pdf;
// the numbers come from lib/see-the-math.
//
// UNLISTED. It prices the setup fee, which no public page does (see the note
// in lib/see-the-math), so it is noindexed here, disallowed in app/robots.ts,
// left out of the sitemap and llms.txt, and linked from nowhere on the site.
// The site navbar and footer are suppressed for it in ConditionalNavbar and
// Footer, the same as Candor.
//
// Static: it reads no cookies and no data, so it prerenders.
// ---------------------------------------------------------------------------
import type { Metadata, Viewport } from 'next';
import MathDeck from './math-deck';

export const metadata: Metadata = {
  title: 'See the Math | Nexli',
  description:
    'What $5,000 a month in ads can turn into: three scenarios from conservative to best case, the back end, the first 90 days and when you break even.',
  robots: 'noindex, nofollow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export default function MathPage() {
  return <MathDeck />;
}
