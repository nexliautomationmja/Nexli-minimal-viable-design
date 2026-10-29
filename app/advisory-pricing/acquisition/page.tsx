// ---------------------------------------------------------------------------
// Advisory funnel — the ACQUISITION door.
//
// Goes after "referrals work better". The turn is not that referrals are
// bad — they built most of these firms — but that they cannot be forecast,
// controlled or bought more of, which is why a book built entirely on them
// is worth very little when somebody values it.
//
// The slug says what the firm NEEDS, not what it currently believes. People
// read address bars, and /referrals would look like a page about referrals.
// Same reasoning as /advisory-pricing/next-steps being called that rather
// than /not-a-fit.
//
// Noindex and absent from the sitemap, like its two siblings.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { VSL_ANGLE_ACQUISITION, qualifyPathForAngle } from '@/lib/advisory-config';
import AcquisitionVslClient from './acquisition-client';

const TITLE = 'Referrals built your firm. They will not scale it | Nexli';
const DESCRIPTION =
  'A short video for CPA firms on why a book built on referrals cannot be forecast or valued — and what a predictable acquisition channel changes.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/advisory-pricing/acquisition',
    type: 'website',
  },
};

export default function AcquisitionVslPage() {
  return <AcquisitionVslClient ctaHref={qualifyPathForAngle(VSL_ANGLE_ACQUISITION)} />;
}
