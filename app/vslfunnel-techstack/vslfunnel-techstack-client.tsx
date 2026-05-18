'use client';

import VslFunnel from '../../components/VslFunnel';

export default function VslFunnelTechStack() {
  return (
    <VslFunnel
      variant="TechStack"
      headline={
        <>
          Your CPA Firm Is Paying $30,000 a Year for Software That&apos;s{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Slowing You Down
          </span>
        </>
      }
      subheadline="Most firms are running 5 disconnected tools and paying for the chaos. One system fixes all of it — at half the cost."
    />
  );
}
