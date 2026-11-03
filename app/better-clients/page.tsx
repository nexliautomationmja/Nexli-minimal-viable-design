// ---------------------------------------------------------------------------
// Advisory funnel — the BETTER CLIENTS door.
//
// One of four VSLs feeding the same qualifier. Each argues against a
// different belief a firm owner already holds; this one goes after "I need
// more leads". The answer is that volume is the wrong axis — a book of $800
// returns is a race to the bottom no amount of lead flow wins.
//
// NOINDEX, unlike /advisory-pricing. That page is the ad destination AND the
// one that should rank; these three are near-identical siblings, and letting
// Google choose between four pages making the same offer is self-inflicted
// duplicate content. They are deliberately absent from app/sitemap.ts too.
//
// A TOP-LEVEL ROUTE, so the URL in the ad reads /better-clients rather than
// /advisory-pricing/better-clients. That costs two registrations that nesting would
// have given free: this path has to be added to BOTH ConditionalNavbar and
// Footer, or the page ships with the site navbar and footer wrapped around a
// funnel page. Those two lists are separate and have already drifted apart
// once, so when a fourth angle is added, add it to both.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { VSL_ANGLE_BETTER_CLIENTS, qualifyPathForAngle } from '@/lib/advisory-config';
import BetterClientsVslClient from './better-clients-client';

const TITLE = 'You do not need more leads | Nexli';
const DESCRIPTION =
  'A short video for CPA firms on why chasing lead volume keeps margins thin — and what changes when you filter for the clients who pay five figures for planning.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/better-clients',
    type: 'website',
  },
};

export default function BetterClientsVslPage() {
  return <BetterClientsVslClient ctaHref={qualifyPathForAngle(VSL_ANGLE_BETTER_CLIENTS)} />;
}
