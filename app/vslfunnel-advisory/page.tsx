import type { Metadata } from 'next';
import VslFunnelAdvisory from './vslfunnel-advisory-client';

export const metadata: Metadata = {
  title: 'If You Could Clone Your 5 Best Clients, Would Your Firm Still Feel Broken? | Nexli',
  description: 'Your best clients pay more, trust your advice, and stay longer. The problem is your current marketing is not built to attract enough of them. Nexli installs the systems that help established CPA firms become the obvious choice for premium advisory clients.',
  alternates: { canonical: '/vslfunnel-advisory' },
};

export default function VslFunnelAdvisoryPage() {
  return <VslFunnelAdvisory />;
}
