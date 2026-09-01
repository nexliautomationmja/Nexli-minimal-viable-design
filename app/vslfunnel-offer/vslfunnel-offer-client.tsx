'use client';

import { TrendingUp } from 'lucide-react';
import VslFunnelOffer from '../../components/VslFunnelOffer';

export default function VslFunnelOfferClient() {
  return (
    <VslFunnelOffer
      variant="Offer"
      muxPlaybackId="PE95PF1vknWBf3wpNkiYJND35n4XyWcraisBDYv5OmY"
      videoTitle="Jasmine VSL - Tax Planning Clients"
      eyebrowText="High-Income Tax-Planning Clients, Delivered to Your Firm"
      eyebrowIcon={TrendingUp}
      eyebrowTone="emerald"
      showHiddenDrain={false}
      showExitIntent={false}
      headline={
        <>
          The System that Books 6-and-7-Figure Taxpayers Who{' '}
          <span className="bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
            Overpay the IRS
          </span>{' '}
          Into Your Firm
        </>
      }
      subheadline="They've already written 6-and-7-figure checks to the IRS — money that's paid and gone. They can afford you; nobody's given them a reason. We build the system that attracts these S-tier taxpayers to your firm, run the ads, qualify every lead, and book them directly on your calendar."
    />
  );
}
