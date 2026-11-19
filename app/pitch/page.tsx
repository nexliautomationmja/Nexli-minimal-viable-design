import type { Metadata, Viewport } from 'next';
import PitchDeck from './pitch-deck';

// Unlisted, like /math: shared by link on a call, never a search result
// (app/robots.ts disallows it; it is not in the sitemap or llms.txt).
export const metadata: Metadata = {
  title: 'Agency Pitch Deck | Nexli',
  description: 'How Nexli puts tax-planning clients on a CPA firm’s calendar: the ad, the AI avatar, the VSL, the qualifier, the calendar and the follow-up.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/pitch' },
};

// The same as /math: the reading bar pads for the home indicator.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export default function PitchPage() {
  return <PitchDeck />;
}
