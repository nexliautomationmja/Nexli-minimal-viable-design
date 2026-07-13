'use client';

import { Flame } from 'lucide-react';
import VslFunnel from '../../components/VslFunnel';

export default function VslFunnelBetterClients() {
  return (
    <VslFunnel
      variant="BetterClients"
      muxPlaybackId="4VURlgj96a94Ro8U3qwxG01L4hNUEAyMZ3I02ItScldMs"
      videoTitle="Jasmine VSL - CPA Ads"
      eyebrowText="Stop Setting Your Ad Budget on Fire"
      eyebrowIcon={Flame}
      eyebrowTone="orange"
      showHiddenDrain={false}
      showExitIntent={false}
      headline={
        <>
          Without This System, You&apos;ll{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Burn Money on Ads
          </span>
        </>
      }
      subheadline="Before you spend a dollar on ads, your firm needs the infrastructure that makes ads work. Most CPA firms skip this step — and waste thousands finding out the hard way."
    />
  );
}
