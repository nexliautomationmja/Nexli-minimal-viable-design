import type { Metadata } from 'next';
import FreeGuide from '../../components/FreeGuide';

export const metadata: Metadata = {
  title: 'Free Guide | How CPAs Can Attract High-Value Clients Online | Nexli',
  description: 'Download the free guide for CPAs and financial advisors on attracting high-net-worth clients through premium website design and AI-powered automation.',
  alternates: { canonical: '/free-guide' },
};

export default function FreeGuidePage() {
  return <FreeGuide />;
}
