'use client';

// ---------------------------------------------------------------------------
// Getting around /math when it reads as a page: a phone, a tablet, a short
// window (see "ONE PAGE, TWO WAYS TO READ IT" in app/math/math-deck).
//
// THE PROBLEM IT SOLVES. On a phone the deck is one long page, about twenty
// screens of it, and the only sign of where you were was a 3px line at the
// top. A firm owner opening the link a week later usually wants one slide —
// when they break even, or what it costs — and had to scroll past
// everything else to find it.
//
// THE BAR, along the bottom where a thumb already is:
//   ↑  back to the start of this slide, or the one before when you are
//      already at its start (a music player's "previous")
//   the slide you are on, "04 / 15 · New fees each month"; tap it for the
//      list of every slide, and the PDF
//   ↓  the next slide
// Slides are taller than a phone screen, so ↑ and ↓ work from where the
// slides actually are on screen, not from a slide number.
//
// THE LIST is a bottom sheet: a dialog, focus inside it while it is open,
// Escape or a tap outside closes it, and the page behind does not scroll.
// ---------------------------------------------------------------------------
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Download, List, X } from 'lucide-react';
import { PDF_HREF, PDF_NAME } from './ui';

const pad = (n: number) => String(n).padStart(2, '0');

/** What the bar takes from the bottom of the page, so nothing ends under it. */
export const READING_NAV_SPACE = 'calc(76px + env(safe-area-inset-bottom, 0px))';

export default function ReadingNav({
  slides,
  current,
  atStart,
  atEnd,
  onStep,
  onGo,
}: {
  slides: readonly { id: string; title: string }[];
  current: number;
  atStart: boolean;
  atEnd: boolean;
  onStep: (dir: 1 | -1) => void;
  onGo: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const currentItem = useRef<HTMLButtonElement>(null);

  // The page behind the sheet stays put. Set and cleared in the handlers, not
  // an effect, so a picked slide can scroll the moment the sheet lets go.
  const lock = (on: boolean) => {
    document.documentElement.style.overflow = on ? 'hidden' : '';
  };
  useEffect(() => () => lock(false), []);

  const show = () => {
    lock(true);
    setOpen(true);
  };
  const hide = useCallback((refocus = true) => {
    lock(false);
    setOpen(false);
    if (refocus) requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }, []);
  const pick = (i: number) => {
    hide(false);
    onGo(i);
  };

  // Into the sheet on the slide you are on; Escape out; Tab stays inside.
  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => currentItem.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        hide();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>('button, a[href]');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, hide]);

  const title = slides[current]?.title ?? '';

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-[115] border-t border-white/10 bg-[#020617]/85 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <nav aria-label="Slides" className="mx-auto flex max-w-xl items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={() => onStep(-1)}
            disabled={atStart}
            aria-label="Previous slide"
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/85 transition-colors [-webkit-tap-highlight-color:transparent] active:bg-white/[0.12] disabled:opacity-30"
          >
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            ref={trigger}
            type="button"
            onClick={show}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={`All slides. You're on ${current + 1} of ${slides.length}: ${title}`}
            className="flex h-11 min-w-0 flex-1 touch-manipulation items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] pl-4 pr-3.5 text-left transition-colors [-webkit-tap-highlight-color:transparent] active:bg-white/[0.12]"
          >
            <span className="shrink-0 text-[12px] font-bold tabular-nums tracking-[0.06em] text-cyan-300">
              {pad(current + 1)}
              <span className="text-white/35"> / {pad(slides.length)}</span>
            </span>
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-white/90">{title}</span>
            <List className="h-4 w-4 shrink-0 text-white/55" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onStep(1)}
            disabled={atEnd}
            aria-label="Next slide"
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-transform [-webkit-tap-highlight-color:transparent] active:scale-95 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 disabled:shadow-none"
          >
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="slides-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="slides-sheet-title"
            className="fixed inset-0 z-[130]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 1 }}
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
              onClick={() => hide()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              ref={panel}
              className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[85svh] max-w-xl flex-col rounded-t-3xl border border-b-0 border-white/10 bg-[#0b1220] shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.8)]"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 34, stiffness: 340 }}
            >
              <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-white/20" />
              <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">See the math</div>
                  <div id="slides-sheet-title" className="mt-0.5 text-lg font-bold text-white">
                    Jump to a slide
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => hide()}
                  aria-label="Close"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/75 [-webkit-tap-highlight-color:transparent] active:bg-white/[0.12]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <ol className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
                {slides.map((s, i) => {
                  const here = i === current;
                  return (
                    <li key={s.id}>
                      <button
                        ref={here ? currentItem : undefined}
                        type="button"
                        onClick={() => pick(i)}
                        aria-current={here ? 'step' : undefined}
                        className={`flex w-full touch-manipulation items-center gap-3.5 rounded-xl px-3 py-[11px] text-left outline-none transition-colors [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                          here ? 'bg-cyan-400/[0.10]' : 'active:bg-white/[0.07]'
                        }`}
                      >
                        <span
                          className={`w-6 shrink-0 text-[12px] font-bold tabular-nums ${here ? 'text-cyan-300' : 'text-white/35'}`}
                        >
                          {pad(i + 1)}
                        </span>
                        <span className={`min-w-0 flex-1 text-[15px] ${here ? 'font-bold text-white' : 'font-medium text-white/80'}`}>
                          {s.title}
                        </span>
                        {here && (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">
                            You&apos;re here
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="shrink-0 border-t border-white/[0.08] px-4 pb-4 pt-3">
                <a
                  href={PDF_HREF}
                  download={PDF_NAME}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.05] text-sm font-semibold text-white/90 [-webkit-tap-highlight-color:transparent] active:bg-white/[0.1]"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download the PDF
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
