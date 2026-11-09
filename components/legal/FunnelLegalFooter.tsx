// ---------------------------------------------------------------------------
// The legal footer for funnel pages that sell or deliver the $97 guide:
// /advisory-pricing/BOBA, its thank-you page, and /<angle>/next-steps.
//
// Those pages hide the site Footer (see components/Footer.tsx), which left
// the one page that takes a card with no Terms, no refund policy and no card
// marks on it. This puts all three back, styled for the dark funnel canvas.
// The colours are fixed, not theme variables: the canvas is dark whatever
// the visitor's theme is.
// ---------------------------------------------------------------------------

import React from 'react';
import CardLogos from './CardLogos';
import PolicyLinks from './PolicyLinks';
import { LEGAL_NAME } from '@/lib/site';

const MUTED = 'rgba(255,255,255,0.5)';

export default function FunnelLegalFooter({ className = '' }: { className?: string }) {
  return (
    <footer
      className={`relative z-10 border-t px-4 py-10 md:py-12 ${className}`}
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <CardLogos size="sm" className="justify-center" />
        <PolicyLinks newTab color={MUTED} />
        <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: MUTED }}>
          © 2026 {LEGAL_NAME}.
        </div>
      </div>
    </footer>
  );
}
