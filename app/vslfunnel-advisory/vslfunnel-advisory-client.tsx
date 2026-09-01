'use client';

import { Award } from 'lucide-react';
import VslFunnel from '../../components/VslFunnel';

export default function VslFunnelAdvisory() {
  return (
    <VslFunnel
      variant="Advisory"
      muxPlaybackId="4PgKxwgHpzxGaVZgWeZoTBYGl31nev23IMiD8kiZFb00"
      eyebrowText="For Firms Who Want S-Tier Clients"
      eyebrowIcon={Award}
      eyebrowTone="violet"
      showHiddenDrain={false}
      showExitIntent={false}
      headline={
        <>
          Attract{' '}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
            S-Tier Clients
          </span>{' '}
          Who Can Pay a{' '}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
            $9,400 Invoice
          </span>{' '}
          for Your Advice — No Time Wasted
        </>
      }
      subheadline="Fewer clients. Higher fees. Deeper relationships. This is advisory."
    />
  );
}