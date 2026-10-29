// ---------------------------------------------------------------------------
// Advisory funnel — the SYSTEMS door.
//
// Goes after "I need to work harder". The turn is that effort is not the
// missing input: a firm owner doing twelve-hour days is not lazy, they are
// unsystematised, and most of those hours go on work that feels productive
// and moves nothing.
//
// Noindex and absent from the sitemap, like its two siblings — see the note
// in ../better-clients/page.tsx for why.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { VSL_ANGLE_SYSTEMS, qualifyPathForAngle } from '@/lib/advisory-config';
import SystemsVslClient from './systems-client';

const TITLE = 'The problem is not that you are not working hard enough | Nexli';
const DESCRIPTION =
  'A short video for CPA firms on why long hours stop scaling a practice — and what has to be systematised before more effort changes anything.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/advisory-pricing/systems',
    type: 'website',
  },
};

export default function SystemsVslPage() {
  return <SystemsVslClient ctaHref={qualifyPathForAngle(VSL_ANGLE_SYSTEMS)} />;
}
