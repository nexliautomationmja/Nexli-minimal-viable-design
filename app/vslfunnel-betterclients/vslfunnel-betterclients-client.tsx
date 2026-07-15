'use client';

import { TrendingUp } from 'lucide-react';
import VslFunnel from '../../components/VslFunnel';

export default function VslFunnelBetterClients() {
  return (
    <VslFunnel
      variant="BetterClients"
      muxPlaybackId="4VURlgj96a94Ro8U3qwxG01L4hNUEAyMZ3I02ItScldMs"
      videoTitle="Jasmine VSL - CPA Ads"
      eyebrowText="For Firms Done Chasing $800 Clients"
      eyebrowIcon={TrendingUp}
      eyebrowTone="emerald"
      showHiddenDrain={false}
      showExitIntent={false}
      headline={
        <>
          Stop Competing for the $800 Client.{' '}
          Get Positioned for the{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            $8,000 One
          </span>
        </>
      }
      subheadline="Before you spend a dollar on ads, your firm needs the infrastructure that makes ads work. Most CPA firms skip this step — and waste thousands finding out the hard way."
    />
  );
}
