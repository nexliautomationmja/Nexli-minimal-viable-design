// ---------------------------------------------------------------------------
// The legal footer on the VSL pages.
//
// These pages suppress the site Footer (see ConditionalNavbar and Footer,
// which both name every VSL route), so until now an ad visitor could reach
// the bottom of a page that quotes engagement values and profit figures
// without ever seeing a disclaimer or a privacy link. That is the gap this
// closes.
//
// THE PLATFORM DISCLAIMER NAMES META, NOT JUST FACEBOOK. The boilerplate
// everyone copies still says "Facebook, Inc.", a company that has not
// existed under that name since 2021 — the entity is Meta Platforms, Inc.
// Instagram is named too, because the campaigns run across both placements
// and a disclaimer that covers one of the two surfaces a visitor might have
// clicked from is doing half a job.
//
// THE EARNINGS DISCLAIMER IS NOT DECORATION. These pages carry $15,000
// engagements, $100K+ a month in profit and a 10x. Every one of those is
// framed as an illustration in the copy itself, and this says the same
// thing in the place a reader goes looking for it.
//
// Rendered inside VslFunnel, so all four angles get it and none can be
// forgotten. /accelerator/next is a separate page and does NOT get it from
// here.
// ---------------------------------------------------------------------------

import React from 'react';
import PolicyLinks from '../legal/PolicyLinks';

const MUTED = 'var(--text-muted)';

const VslDisclaimer: React.FC = () => (
  <footer
    className="relative z-10 border-t px-4 py-10 md:py-14"
    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
  >
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
      <p className="text-[11px] leading-relaxed md:text-xs" style={{ color: MUTED }}>
        <span className="font-bold text-white/70">Earnings disclaimer.</span> Any
        figures on this page or in the video — engagement values, revenue,
        profit, multiples — are illustrations, not promises or projections of
        what your firm will earn. Nexli does not guarantee results of any
        kind. What a firm achieves depends on its market, its pricing, its
        capacity and the work it puts in. Nothing here is financial, legal or
        tax advice.
      </p>

      <p className="text-[11px] leading-relaxed md:text-xs" style={{ color: MUTED }}>
        This site is not a part of Facebook, Instagram or Meta Platforms,
        Inc., and it is not endorsed by Meta in any way. FACEBOOK, INSTAGRAM
        and META are trademarks of Meta Platforms, Inc.
      </p>

      {/* The full policy set and the business details, shared with the
          site footer and the funnel footer (components/legal). Opens in a
          new tab so reading a policy does not lose the video. */}
      <PolicyLinks newTab color={MUTED} className="pt-1" />

      {/* Matches the site Footer's wording exactly rather than inventing a
          second copyright line. */}
      <div
        className="text-[10px] font-black uppercase tracking-[0.2em]"
        style={{ color: MUTED }}
      >
        © 2026 Nexli Automation LLC.
      </div>
    </div>
  </footer>
);

export default VslDisclaimer;
