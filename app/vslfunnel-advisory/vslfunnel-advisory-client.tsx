'use client';

import VslFunnel from '../../components/VslFunnel';

export default function VslFunnelAdvisory() {
  return (
    <VslFunnel
      variant="Advisory"
      headline={
        <>
          Stop Being a Tax-Prep Firm That{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Resents Its Own Clients
          </span>{' '}
          — There&apos;s a Better Business Model on the Other Side
        </>
      }
      subheadline="Tax-prep clients haggle over $400, vanish after April, and leave you dreading every season. Advisory clients pay 10x more, stay year-round, and actually value your expertise. The difference isn't luck — it's infrastructure."
    />
  );
}
