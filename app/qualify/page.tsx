import type { Metadata } from 'next';
import QualifyClient from './qualify-client';

export const metadata: Metadata = {
  title: 'See If Your Firm Qualifies | Nexli',
  description: 'Answer five quick questions to see if your CPA firm is eligible for a Nexli strategy call.',
  alternates: { canonical: '/qualify' },
  // Modal trigger page with no standalone content; keep it out of search and AI indexes.
  robots: 'noindex, nofollow',
};

export default function QualifyPage() {
  return <QualifyClient />;
}
