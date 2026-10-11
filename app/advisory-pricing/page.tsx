// ---------------------------------------------------------------------------
// Advisory funnel, page 1 — /advisory-pricing. THE VSL.
//
// There is no opt-in any more. The ad lands here, the video does the selling
// and names the price, and the only CTA is the qualifier — which is where
// contact details are collected, because a form in front of the video was
// costing more leads than it captured.
//
// Public and indexable on purpose: this is the ad destination. Everything
// after it is noindex.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { ADVISORY_QUALIFY_PATH } from '@/lib/advisory-config';
import AdvisoryVslClient from './advisory-vsl-client';

const TITLE = 'Why the $15,000 client never calls your firm | Nexli';
const DESCRIPTION =
  'A short video on what established CPA firms put in place before they spend a dollar on ads — and why the firms that skip it burn the budget finding out.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: '/advisory-pricing' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/advisory-pricing',
    type: 'website',
  },
};

export default function AdvisoryVslPage() {
  return <AdvisoryVslClient ctaHref={ADVISORY_QUALIFY_PATH} />;
}
