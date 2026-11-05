// ---------------------------------------------------------------------------
// The "Candor" chip above Daniela.
//
// The lime is the portal's Meta chip (nexli-portal
// src/components/creative-studio/meta.tsx) and the same #A3E635 this site
// already uses as CHIP_GREEN on the "Campaigns built and run on Meta" chip.
// Defined here rather than imported from components/VslFunnel, because
// importing that 1,900-line module for one colour would put all of it in
// this page's bundle — the same reason UrgencyPill was lifted out of it.
//
// Rim on `.rim-spin`, not the portal's animate-[shimmer_5s...]: .rim-spin is
// one of the few animations globals.css stops under prefers-reduced-motion,
// and an arbitrary-value class cannot be targeted.
// ---------------------------------------------------------------------------

import React from 'react';
import { Sparkles } from 'lucide-react';

const LIME = '#A3E635';
const LIME_CONIC =
  'conic-gradient(from 0deg at 50% 50%, #bef264, #3f6212, #bef264, #3f6212, #bef264)';
/** Tinted but opaque, the house trick: a translucent fill would let the
 *  spinning rim show through the whole chip. */
const LIME_FILL = 'linear-gradient(rgba(163,230,53,0.12), rgba(163,230,53,0.12)), #0b1220';

export default function CandorChip() {
  return (
    <span className="relative inline-flex rounded-full p-px">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <span className="rim-spin absolute inset-[-100%]" style={{ background: LIME_CONIC }} />
      </span>
      <span
        className="relative z-10 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
        style={{ background: LIME_FILL }}
      >
        <Sparkles size={14} strokeWidth={2.2} style={{ color: LIME }} aria-hidden="true" />
        <span className="text-sm font-semibold tracking-wide" style={{ color: LIME }}>
          Candor
        </span>
      </span>
    </span>
  );
}
