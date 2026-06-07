'use client';

import VslFunnel from '../../components/VslFunnel';

export default function VslFunnelAdvisory() {
  return (
    <VslFunnel
      variant="Advisory"
      headline={
        <>
          If You Could Clone Your 5 Best Clients, Would Your Firm Still Feel{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Broken?
          </span>
        </>
      }
      subheadline="Your best clients pay more, trust your advice, and stay longer. The problem is your current marketing is not built to attract enough of them. Nexli installs the systems that help established CPA firms become the obvious choice for premium advisory clients."
    />
  );
}
