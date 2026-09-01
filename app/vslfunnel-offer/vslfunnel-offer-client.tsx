'use client';

import { TrendingUp } from 'lucide-react';
import VslFunnelOffer from '../../components/VslFunnelOffer';

export default function VslFunnelOfferClient() {
  return (
    <VslFunnelOffer
      variant="Offer"
      muxPlaybackId="4VURlgj96a94Ro8U3qwxG01L4hNUEAyMZ3I02ItScldMs"
      videoTitle="Jasmine VSL - Tax Planning Clients"
      eyebrowText="High-Income Tax-Planning Clients, Delivered to Your Firm"
      eyebrowIcon={TrendingUp}
      eyebrowTone="emerald"
      showHiddenDrain={false}
      showExitIntent={false}
      headline={
        <>
          We Book 6-and-7-Figure Taxpayers Who{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
            Overpay the IRS
          </span>{' '}
          Into Your Firm
        </>
      }
      subheadline="They've already written six-figure checks to the IRS — and they think that's just what success costs. Nobody has ever shown them real tax planning. Show them the savings, and your fee becomes a rounding error. Nexli finds them, qualifies them, and books them on your calendar."
    />
  );
}
