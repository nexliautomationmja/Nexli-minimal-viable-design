'use client';

import VslFunnel from '../../components/VslFunnel';

export default function VslFunnelAds() {
  return (
    <VslFunnel
      variant="B"
      headline={
        <>
          Why CPA Firms That Run Ads Without This System Are{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Wasting Every Dollar
          </span>{' '}
          They Spend
        </>
      }
      subheadline="Before you spend a dollar on ads, your firm needs the infrastructure that makes ads work. Most CPA firms skip this step — and waste thousands finding out the hard way."
    />
  );
}
