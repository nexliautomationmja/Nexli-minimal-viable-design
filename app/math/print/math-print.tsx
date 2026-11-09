'use client';

// The deck as pages, in two formats, both printed by scripts/build-math-pdf.mjs.
//
// DESKTOP (/math/print): every slide on its own 1280×720 page (a 16:9 slide,
// 13.33 × 7.5 in), under the deck's own glows, with the logo and "See the
// math" across the top and the site, page number and copyright along the
// bottom. Each slide fits itself to the window the deck's way (useFitScale
// in components/math/ui), which is why the build opens this at exactly
// 1280×720: the page and the window are the same size.
//
// PHONE (/math/print/phone): the deck's phone layout, 390px wide, one slide
// per page and each page exactly as tall as its slide, so a phone's PDF
// viewer fits it to the screen and the slide scrolls like the web page. The
// heights are only known once the slides are drawn, so this measures every
// page after mount, gives each a named page (`page: pN`) with its own
// `@page pN { size: 390px <h>px }`, and sets data-pages-ready on <html> for
// the build to wait on.
//
// Both: PrintContext switches the slides to paper (components/math/print):
// final states, no toggles or download buttons.
import React, { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import FunnelLogo from '@/components/FunnelLogo';
import { OUTFIT } from '@/components/funnel/primitives';
import { PrintContext } from '@/components/math/print';
import { SLIDES } from '@/components/math/slides';
import { YearTwoSlide } from '@/components/math/slides-b';
import { FAINT } from '@/components/math/ui';
import { SCENARIOS } from '@/lib/see-the-math';

export type PrintFormat = 'desktop' | 'phone';

/** Phone pages: the deck's phone width. */
const PHONE_W = 390;

/**
 * The PDF's pages: the deck's slides in order, except that "Going into year
 * two" gets a page per scenario. In the deck a toggle switches between
 * them; on paper Marcel wanted all three in full (2026-11-09).
 */
const PAGES = SLIDES.flatMap(({ id, C }) =>
  id === 'year-two'
    ? SCENARIOS.map((s) => ({ key: `${id}-${s.id}`, node: <YearTwoSlide scenario={s.id} /> }))
    : [{ key: id, node: <C /> }],
);

// Print-only overrides shared by both formats, each for a reason found the
// hard way:
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
//  - the year-two slide's striped amber "system" slice as solid amber.
//    Preview dropped Chrome's repeating-stripe pattern entirely, leaving the
//    slice transparent over the green.
const SHARED_CSS = `
html, body { background: #020617 !important; margin: 0; overflow: visible !important; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.print-page { position: relative; overflow: hidden; break-after: page; }
.print-page:last-child { break-after: auto; }
.print-page .bg-clip-text { background-image: none !important; color: #8b9cfb !important; -webkit-text-fill-color: #8b9cfb !important; }
.print-page *, .print-page *::before, .print-page *::after {
  box-shadow: none !important; text-shadow: none !important; filter: none !important;
  backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
}
.print-page .system-hatch { background: #F59E0B !important; }
.print-page .rim-spin { display: none !important; }
.print-page :is(div, span):has(> .rim-spin) { background: linear-gradient(135deg, #3B82F6, #8B5CF6 40%, #06B6D4 70%, #F59E0B); }
.print-page div:has(> .rim-spin) [aria-hidden="true"].rounded-full { display: none !important; }
.deck-hint { display: none; }
`;

const DESKTOP_CSS = `
@page { size: 1280px 720px; margin: 0; }
.print-page { width: 1280px; height: 720px; }
.print-page section[data-slide] { height: 720px; }
`;

// The slide's own top padding is the deck's room for its logo; here the
// header sits in it, so give every slide the same clearance below it.
const PHONE_CSS = `
@page { size: ${PHONE_W}px 844px; margin: 0; }
.print-page { width: ${PHONE_W}px; }
.print-page section[data-slide] { padding-top: 92px !important; padding-bottom: 72px !important; }
`;

export default function MathPrint({ format = 'desktop' }: { format?: PrintFormat }) {
  const phone = format === 'phone';
  // Phone only: each page's measured height, once the slides are drawn.
  const [heights, setHeights] = useState<number[] | null>(null);

  useEffect(() => {
    if (!phone) return;
    let cancelled = false;
    (async () => {
      await document.fonts.ready;
      // Charts measure their width, then draw; let them settle first.
      await new Promise((r) => setTimeout(r, 900));
      if (cancelled) return;
      const pages = Array.from(document.querySelectorAll<HTMLElement>('.print-page'));
      setHeights(pages.map((el) => Math.ceil(el.getBoundingClientRect().height)));
    })();
    return () => {
      cancelled = true;
    };
  }, [phone]);

  useEffect(() => {
    if (heights) document.documentElement.dataset.pagesReady = String(heights.length);
  }, [heights]);

  const namedPages = heights
    ? heights.map((h, i) => `@page p${i + 1} { size: ${PHONE_W}px ${h}px; margin: 0; }`).join('\n')
    : '';

  return (
    <PrintContext.Provider value={true}>
      <MotionConfig reducedMotion="always">
        <style>{SHARED_CSS + (phone ? PHONE_CSS + namedPages : DESKTOP_CSS)}</style>
        <main className="text-white" style={{ backgroundColor: '#020617', ...OUTFIT }}>
          {PAGES.map(({ key, node }, i) => (
            <div
              key={key}
              className="print-page"
              style={{
                backgroundColor: '#020617',
                ...(phone && heights ? { page: `p${i + 1}`, height: heights[i] } : null),
              }}
            >
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
              {phone ? (
                <div
                  className="absolute right-6 top-[34px] z-[110] text-right text-[10px] font-bold uppercase leading-tight tracking-[0.16em]"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  See the math
                  <div className="mt-0.5 tabular-nums tracking-[0.08em]" style={{ color: FAINT }}>
                    {String(i + 1).padStart(2, '0')} / {PAGES.length}
                  </div>
                </div>
              ) : (
                <div
                  className="absolute right-8 top-[46px] z-[110] text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  See the math
                </div>
              )}

              {node}

              {phone ? (
                <div
                  className="absolute inset-x-6 bottom-6 z-[110] flex justify-between text-[10px] font-medium"
                  style={{ color: FAINT }}
                >
                  <span>www.nexli.net</span>
                  <span>© 2026 Nexli Automation</span>
                </div>
              ) : (
                <div
                  className="absolute inset-x-8 bottom-6 z-[110] grid grid-cols-3 text-[11px] font-medium"
                  style={{ color: FAINT }}
                >
                  <span>www.nexli.net</span>
                  <span className="text-center tabular-nums">
                    {i + 1} / {PAGES.length}
                  </span>
                  <span className="text-right">© 2026 Nexli Automation</span>
                </div>
              )}
            </div>
          ))}
        </main>
      </MotionConfig>
    </PrintContext.Provider>
  );
}
