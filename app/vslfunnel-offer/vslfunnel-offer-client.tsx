'use client';

import { AlertTriangle } from 'lucide-react';
import VslFunnelOffer from '../../components/VslFunnelOffer';

export default function VslFunnelOfferClient() {
  return (
    <VslFunnelOffer
      variant="Offer"
      muxPlaybackId="4VURlgj96a94Ro8U3qwxG01L4hNUEAyMZ3I02ItScldMs"
      videoTitle="Jasmine VSL - IRS Problem Clients"
      eyebrowText="High-Income IRS-Problem Clients, Delivered to Your Firm"
      eyebrowIcon={AlertTriangle}
      eyebrowTone="orange"
      showHiddenDrain={false}
      showExitIntent={false}
      headline={
        <>
          We Book 6-and-7-Figure Taxpayers With{' '}
          <span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
            IRS Problems
          </span>{' '}
          Into Your Firm
        </>
      }
      subheadline="They need the IRS off their back — and they'll pay $5,000-$25,000+ to make it happen. Nexli finds them, qualifies them, and books them on your calendar. You do the work and charge what it takes to end their pain."
    />
  );
}
