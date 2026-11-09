'use client';

// ---------------------------------------------------------------------------
// /math — the "See the Math" deck.
//
// ONE PAGE, TWO WAYS TO READ IT.
//
// Presenting (a desktop window at least 1024×700, i.e. a Zoom share): every
// slide fills the viewport, the scroll snaps slide to slide, and the arrow
// keys / space / PageUp-Down step through. F toggles fullscreen so the
// browser chrome is gone from the share. A progress bar, a dot nav and a
// counter show where you are.
//
// Reading afterwards (a phone, or a short window): no snapping, no captured
// keys. Slides take their natural height and it reads like an article,
// which is what a firm owner opening the link a week later needs. A bar
// along the bottom says which slide you are on and steps or jumps between
// them (components/math/ReadingNav): twenty phone screens with no way to
// find "when do I break even" was the phone's biggest problem.
//
// WHY THE DECK HAS ITS OWN SCROLL CONTAINER. globals.css gives both html and
// body `overflow-x: hidden`, which makes body a scroll container. Snap areas
// attach to their nearest scroll container, so `scroll-snap-type` on html
// would never see the slides. In presenting mode the deck scrolls itself
// (.deck-scroller); on a phone it stays in the normal document flow so the
// browser's address bar still collapses as you scroll.
//
// The current slide goes into the URL hash (replaceState, so Back still
// leaves the page), which means /math#break-even opens on that slide.
// ---------------------------------------------------------------------------
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Download, Maximize2, Minimize2 } from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import { OUTFIT } from '@/components/funnel/primitives';
import ReadingNav, { READING_NAV_SPACE } from '@/components/math/ReadingNav';
import { SLIDES } from '@/components/math/slides';
import { PDF_NAME } from '@/components/math/pdf';
import { usePdfHref } from '@/components/math/pdf-link';
import { DECK_QUERY } from '@/components/math/ui';

const DECK_CSS = `
.deck-hint { display: none; }
@media ${DECK_QUERY} {
  .deck-scroller {
    height: 100svh;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-snap-type: y mandatory;
    overscroll-behavior: contain;
  }
  .deck-slide {
    /* Exactly one screen: Slide scales content that would not fit. */
    height: 100svh;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
  .deck-hint { display: flex; }
}
`;

const pad = (n: number) => String(n).padStart(2, '0');

const slideEls = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<HTMLElement>('[data-slide]') ?? []);

export default function MathDeck() {
  const [current, setCurrent] = useState(0);
  const [deckMode, setDeckMode] = useState(false);
  // The phone PDF on a phone, the slides anywhere else (components/math/pdf).
  const pdfHref = usePdfHref();
  // Which mode is not known until the first effect; nothing mode-specific
  // renders before then, or the reading bar would flash on a desktop.
  const [ready, setReady] = useState(false);
  // Reading mode: is there anywhere to step back or forward to?
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  // Any desktop width, short or not: the fullscreen control lives here, and
  // fullscreen is exactly what turns a short laptop window into a deck.
  const [wide, setWide] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // Where a run of key presses is heading. The observer lags behind a smooth
  // scroll, so pressing → three times fast has to count from the target, not
  // from whatever slide happens to be under the middle of the screen.
  const target = useRef(0);
  const navigatingUntil = useRef(0);
  const scroller = useRef<HTMLElement>(null);

  const goTo = useCallback((i: number, smooth = true) => {
    const els = slideEls(scroller.current);
    const next = Math.max(0, Math.min(els.length - 1, i));
    const el = els[next];
    if (!el) return;
    target.current = next;
    navigatingUntil.current = performance.now() + 900;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
  }, []);

  // Presenting or reading.
  useEffect(() => {
    const mq = window.matchMedia(DECK_QUERY);
    const wq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      setDeckMode(mq.matches);
      setWide(wq.matches);
      setReady(true);
    };
    sync();
    mq.addEventListener('change', sync);
    wq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      wq.removeEventListener('change', sync);
    };
  }, []);

  // Which slide is under the middle of the screen.
  useEffect(() => {
    const els = slideEls(scroller.current);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = els.indexOf(e.target as HTMLElement);
          if (i < 0) continue;
          setCurrent(i);
          if (performance.now() > navigatingUntil.current) target.current = i;
          const url = i === 0 ? window.location.pathname + window.location.search : `#${SLIDES[i].id}`;
          window.history.replaceState(window.history.state, '', url);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Reading mode: whether ↑ and ↓ have anywhere to go. Off the slides'
  // real positions, once a frame at most.
  useEffect(() => {
    if (!ready || deckMode) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      setAtStart(window.scrollY < 8);
      setAtEnd(
        window.innerHeight + window.scrollY >= doc.scrollHeight - 4 ||
          !slideEls(scroller.current).some((el) => el.getBoundingClientRect().top > 8),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ready, deckMode]);

  /**
   * Reading mode's ↑ and ↓. Slides are taller than a phone, so these go by
   * where the slides are on screen: ↓ to the next slide that starts below
   * the top, ↑ to the start of the slide you are in, or the one before if
   * you are already at its start. A second tap during the scroll counts on
   * from where the first is heading, as the keys do.
   */
  const step = useCallback(
    (dir: 1 | -1) => {
      if (performance.now() < navigatingUntil.current) return goTo(target.current + dir);
      const tops = slideEls(scroller.current).map((el) => el.getBoundingClientRect().top);
      if (dir > 0) {
        const i = tops.findIndex((t) => t > 8);
        goTo(i === -1 ? tops.length - 1 : i);
      } else {
        let i = 0;
        tops.forEach((t, k) => {
          if (t < -8) i = k;
        });
        goTo(i);
      }
    },
    [goTo],
  );

  // A link to a slide opens on that slide.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const i = SLIDES.findIndex((s) => s.id === id);
    if (i > 0) requestAnimationFrame(() => goTo(i, false));
  }, [goTo]);

  // The keys. Slide keys in presenting mode only: on a phone or a short
  // window the arrows and space keep doing what they always do, which is
  // scroll. F works at any desktop width, because fullscreen is the way out
  // of a window too short to present in.
  useEffect(() => {
    if (!wide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable) return;
      // Space and Enter on a focused control are that control's.
      const onControl = tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY';
      if (!deckMode && e.key !== 'f' && e.key !== 'F') return;

      let to: number | null = null;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          to = target.current + 1;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          to = target.current - 1;
          break;
        case ' ':
          if (onControl) return;
          to = target.current + (e.shiftKey ? -1 : 1);
          break;
        case 'Home':
          to = 0;
          break;
        case 'End':
          to = SLIDES.length - 1;
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          return;
        default:
          return;
      }
      e.preventDefault();
      goTo(to);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deckMode, wide, goTo]);

  useEffect(() => {
    const sync = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <style>{DECK_CSS}</style>
      <main
        ref={scroller}
        className="deck-scroller relative overflow-x-hidden text-white"
        style={{
          backgroundColor: '#020617',
          ...OUTFIT,
          ...(ready && !deckMode ? { paddingBottom: READING_NAV_SPACE } : null),
        }}
      >
        {/* Candor's three glows, fixed so every slide sits under them. */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
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

        {/* Progress across the top. */}
        <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[120] h-[3px] bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-violet-400 to-cyan-400 transition-[width] duration-500 ease-out"
            style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
          />
        </div>

        {/* Pinned while presenting; in reading mode they scroll away with the
            first slide instead of sitting on every slide's opening line (a
            tablet, a phone on its side). The PDF is in the bar's list there. */}
        <FunnelLogo scrollAway={!deckMode} />

        <div
          className={`${deckMode ? 'fixed' : 'absolute'} right-5 top-6 z-[110] flex items-center gap-2 md:right-8 md:top-8`}
        >
          <a
            href={pdfHref}
            download={PDF_NAME}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3.5 text-[13px] font-semibold text-white/80 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white sm:px-4"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">PDF</span>
            <span className="sr-only sm:hidden">Download the PDF</span>
          </a>
          {wide && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              title={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/75 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
        </div>

        {SLIDES.map(({ id, C }) => (
          <C key={id} />
        ))}

        {deckMode && (
          <>
            <nav aria-label="Slides" className="fixed right-5 top-1/2 z-[100] flex -translate-y-1/2 flex-col items-end gap-2.5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}: ${s.title}`}
                  aria-current={i === current ? 'step' : undefined}
                  className="group flex items-center gap-3"
                >
                  <span className="pointer-events-none whitespace-nowrap rounded-md bg-[#0b1220]/95 px-2 py-1 text-xs font-medium text-white/85 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {s.title}
                  </span>
                  <span
                    className={`block w-1.5 rounded-full transition-all duration-300 ${
                      i === current ? 'h-6 bg-cyan-400' : 'h-1.5 bg-white/25 group-hover:bg-white/60'
                    }`}
                  />
                </button>
              ))}
            </nav>

            <div className="pointer-events-none fixed bottom-6 right-8 z-[100] text-xs font-semibold tabular-nums tracking-[0.12em] text-white/45">
              <span className="text-white/85">{pad(current + 1)}</span> / {pad(SLIDES.length)}
            </div>
          </>
        )}

        {ready && !deckMode && (
          <ReadingNav
            slides={SLIDES}
            current={current}
            atStart={atStart}
            atEnd={atEnd}
            onStep={step}
            onGo={(i) => goTo(i)}
          />
        )}
      </main>
    </MotionConfig>
  );
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen?.();
  } else {
    void document.documentElement.requestFullscreen?.().catch(() => {});
  }
}
