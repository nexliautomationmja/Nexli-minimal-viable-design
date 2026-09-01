import type { Metadata } from 'next';
import VslFunnelOfferClient from './vslfunnel-offer-client';

export const metadata: Metadata = {
  title: 'We Book 6-7 Figure IRS-Problem Taxpayers Into Your Tax Firm | Nexli',
  description:
    'High-income taxpayers with IRS problems pay $5,000-$25,000+ to make the pain stop — and they don\'t price-shop. Nexli finds, qualifies, and books them directly onto your firm\'s calendar.',
  alternates: {
    canonical: '/vslfunnel-offer',
  },
};

export default function VslFunnelOfferPage() {
  return <VslFunnelOfferClient />;
}
