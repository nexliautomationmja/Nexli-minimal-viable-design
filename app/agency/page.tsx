// ---------------------------------------------------------------------------
// Advisory funnel, page 1 — /agency. THE VSL.
//
// Goes after "I hired an agency and got trash leads". The turn is that the
// agency did deliver what it sold: the failure was lead QUALITY, which
// nobody was measuring, not lead count.
//
// There is no opt-in any more. The ad lands here, the video does the selling
// and names the price, and the only CTA is the qualifier — which is where
// contact details are collected, because a form in front of the video was
// costing more leads than it captured.
//
// LIVED AT /advisory-pricing UNTIL 4 NOVEMBER 2026. The old URL 301s here
// (next.config.ts) because it is in live ads and in sent email, and the
// funnel's inner steps deliberately stayed put — /advisory-pricing/qualify,
// /call and /next-steps are shared by all four angles, so moving them would
// have renamed a path that is not this page's to rename.
//
// Public and indexable on purpose: this is the ad destination, and the only
// one of the four angles that is indexed. Everything after it is noindex.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { VSL_ANGLE_AGENCY, qualifyPathForAngle } from '@/lib/advisory-config';
import AgencyVslClient from './agency-client';

const TITLE = 'Why the $15,000 client never calls your firm | Nexli';
const DESCRIPTION =
  'A short video on what established CPA firms put in place before they spend a dollar on ads — and why the firms that skip it burn the budget finding out.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: '/agency' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/agency',
    type: 'website',
  },
};

export default function AgencyVslPage() {
  // Carries ?angle=agency now. It used to hand over a bare
  // ADVISORY_QUALIFY_PATH, which meant the one page actually taking ad
  // traffic was the only one of the four arriving in GoHighLevel untagged.
  return <AgencyVslClient ctaHref={qualifyPathForAngle(VSL_ANGLE_AGENCY)} />;
}
