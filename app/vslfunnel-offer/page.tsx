import type { Metadata } from 'next';
import VslFunnelOfferClient from './vslfunnel-offer-client';

export const metadata: Metadata = {
  title: 'The System That Books 6-7 Figure Taxpayers Who Overpay the IRS Into Your Firm | Nexli',
  description:
    'High-income earners have already paid the IRS six and seven figures — and think it\'s normal. Show them what tax planning saves and they\'ll pay you whatever it takes. Nexli finds, qualifies, and books them onto your firm\'s calendar.',
  alternates: {
    canonical: '/vslfunnel-offer',
  },
};

export default function VslFunnelOfferPage() {
  return <VslFunnelOfferClient />;
}
