'use client';

// The deck as pages: every slide in components/math/slides on its own
// 1280×720 page (a 16:9 slide, 13.33 × 7.5 in), under the deck's own glows,
// with the old PDF's header and footer: the logo and "See the math" across
// the top, the site, page number and copyright along the bottom.
//
// PrintContext switches the slides to paper (components/math/print): final
// states, no toggles or download buttons. Each slide still fits itself to
// the window the deck's way (useFitScale in components/math/ui), which is
// why the build script opens this at exactly 1280×720: the page and the
// window are the same size, and the slide leaves room for the header and
// footer exactly as it leaves room for the deck's logo and counter.
import React from 'react';
import { MotionConfig } from 'framer-motion';
import FunnelLogo from '@/components/FunnelLogo';
import { OUTFIT } from '@/components/funnel/primitives';
import { PrintContext } from '@/components/math/print';
import { SLIDES } from '@/components/math/slides';
import { FAINT } from '@/components/math/ui';

// Three print-only overrides, each for a reason found the hard way:
//  - overflow visible on html and body. globals.css gives both overflow-x:
//    hidden, which makes body a scroll container, and Chrome will not break
//    pages inside one: it sliced the deck every 720px instead, so each page
//    drifted further off its slide.
//  - gradient text as a solid colour. background-clip: text comes out of
//    Chrome's PDF as a clip that macOS Preview draws as a solid block over the
//    last word ("Three ways it plays ■").
//  - no shadows, glows or blur. Chrome rasterises them, and Preview drew the
//    soft glow behind a highlighted card as a solid cyan rectangle.
//  - the turning rainbow rims (RimCard, the shimmer badge) as a still
//    gradient. Their oversized spinning layer left seams across the card on
//    paper, and with blur off their glowing "orbs" printed as hard circles.
const PRINT_CSS = `
@page { size: 1280px 720px; margin: 0; }
html, body { background: #020617 !important; margin: 0; overflow: visible !important; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.print-page { width: 1280px; height: 720px; position: relative; overflow: hidden; break-after: page; }
.print-page:last-child { break-after: auto; }
.print-page section[data-slide] { height: 720px; }
.print-page .bg-clip-text { background-image: none !important; color: #8b9cfb !important; -webkit-text-fill-color: #8b9cfb !important; }
.print-page *, .print-page *::before, .print-page *::after {
  box-shadow: none !important; text-shadow: none !important; filter: none !important;
  backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
}
.print-page .rim-spin { display: none !important; }
.print-page :is(div, span):has(> .rim-spin) { background: linear-gradient(135deg, #3B82F6, #8B5CF6 40%, #06B6D4 70%, #F59E0B); }
.print-page div:has(> .rim-spin) [aria-hidden="true"].rounded-full { display: none !important; }
.deck-hint { display: none; }
`;

export default function MathPrint() {
  return (
    <PrintContext.Provider value={true}>
      <MotionConfig reducedMotion="always">
        <style>{PRINT_CSS}</style>
        <main className="text-white" style={{ backgroundColor: '#020617', ...OUTFIT }}>
          {SLIDES.map(({ id, C }, i) => (
            <div key={id} className="print-page" style={{ backgroundColor: '#020617' }}>
              {/* The deck's three glows, per page. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)' }}
                />
                <div
                  className="absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }}
                />
                <div
                  className="absolute -bottom-32 -right-24 h-[480px] w-[480px] rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)' }}
                />
              </div>

              <FunnelLogo scrollAway />
              <div
                className="absolute right-8 top-[46px] z-[110] text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                See the math
              </div>

              <C />

              <div
                className="absolute inset-x-8 bottom-6 z-[110] grid grid-cols-3 text-[11px] font-medium"
                style={{ color: FAINT }}
              >
                <span>www.nexli.net</span>
                <span className="text-center tabular-nums">
                  {i + 1} / {SLIDES.length}
                </span>
                <span className="text-right">© 2026 Nexli Automation</span>
              </div>
            </div>
          ))}
        </main>
      </MotionConfig>
    </PrintContext.Provider>
  );
}
