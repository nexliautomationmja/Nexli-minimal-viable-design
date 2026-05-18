import type { Metadata } from 'next';
import VslFunnelTechStack from './vslfunnel-techstack-client';

export const metadata: Metadata = {
  title: 'Your CPA Firm Is Paying $30K/Year for Software That Slows You Down | Nexli',
  description: 'Most firms are running 5 disconnected tools and paying for the chaos. One system fixes all of it — at half the cost.',
  alternates: { canonical: '/vslfunnel-techstack' },
};

export default function VslFunnelTechStackPage() {
  return <VslFunnelTechStack />;
}
