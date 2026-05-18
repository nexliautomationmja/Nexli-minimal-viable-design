import type { Metadata } from 'next';
import VslFunnelAds from './vslfunnel-ads-client';

export const metadata: Metadata = {
  title: 'Why CPA Firms That Run Ads Without This System Waste Every Dollar | Nexli',
  description: 'Before you spend a dollar on ads, your firm needs the infrastructure that makes ads work. Most CPA firms skip this step — and waste thousands finding out the hard way.',
  alternates: { canonical: '/vslfunnel-ads' },
};

export default function VslFunnelAdsPage() {
  return <VslFunnelAds />;
}
