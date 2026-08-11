import type { Metadata } from 'next';
import VslFunnelAdvisory from './vslfunnel-advisory-client';

export const metadata: Metadata = {
  title: 'Attract S-Tier Clients Who Can Pay a $9,400 Invoice for Your Advice | Nexli',
  description: 'Fewer clients. Higher fees. Deeper relationships. This is advisory. Nexli installs the systems that make established CPA firms the obvious choice for high-value advisory clients.',
  alternates: { canonical: '/vslfunnel-advisory' },
};

export default function VslFunnelAdvisoryPage() {
  return <VslFunnelAdvisory />;
}
