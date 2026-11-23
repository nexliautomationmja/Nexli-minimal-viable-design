'use client';

// ---------------------------------------------------------------------------
// The sticky "book again" button on /math, /candor and /ai-avatars
// (Marcel, 2026-11-16).
//
// WHY. Firms that already booked are retargeted back to these pages, many
// after missing the call. So the button reads the visitor first, for its
// label only:
//
//   booked     booked before                 "Pick a new time"
//   qualified  qualified, never booked       "Book your call"
//   unknown    anyone else                   "Book a call"
//
// Every one goes to REBOOK_PATH, the Better Clients VSL's booking section:
// the price, then the calendar (Marcel, 2026-11-23). Booking happens there
// now with no qualifier in front of it, so the unknown visitor no longer
// gets "See if you qualify" and "Already qualified?" (the qualifier and
// /book); one button does it.
//
// The pages are static, so the state comes from one GET per page load
// (/api/advisory-pricing/rebook), shared by every copy of the button on the
// page. Nothing renders until it answers, so the label never flips in front
// of anyone. It carries no name: the cookie names whoever last went through
// the funnel on this browser.
//
// THREE SHAPES
//   bar     pinned along the bottom, full width: phones, /candor, avatar pages
//   pill    floating, bottom centre: the decks in presenting mode, where a
//           full-width bar would sit on the slide. The slides keep ~80px
//           clear at the bottom (CHROME_Y in components/math/ui), and the
//           counter sits at the same bottom-6.
//   inline  just the buttons, for a bar that already exists (/math's slide
//           bar, /candor's composer)
// ---------------------------------------------------------------------------
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { REBOOK_PATH } from '@/lib/advisory-config';
import type { BookingState } from '@/lib/booking-access';
import { BOOK_GREEN } from './RebookCallButton';

/** What the bar takes from the bottom of the page, so nothing ends under it. */
export const BOOK_BAR_SPACE = 'calc(70px + env(safe-area-inset-bottom, 0px))';

let pending: Promise<BookingState> | null = null;

function loadState(): Promise<BookingState> {
  pending ??= fetch('/api/advisory-pricing/rebook', { cache: 'no-store', credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d): BookingState => (d?.state === 'booked' || d?.state === 'qualified' ? d.state : 'unknown'))
    .catch((): BookingState => 'unknown');
  return pending;
}

/** null until the API answers. */
export function useBookingState(): BookingState | null {
  const [state, setState] = useState<BookingState | null>(null);
  useEffect(() => {
    let live = true;
    loadState().then((s) => live && setState(s));
    return () => {
      live = false;
    };
  }, []);
  return state;
}

const TAGLINE: Record<BookingState, string> = {
  unknown: 'Want this running for your firm?',
  qualified: 'You already qualified. No questions this time.',
  booked: 'Missed your call or need a new time? No questions this time.',
};

/** Green, like Rebook call at the top of the page (Marcel, 2026-11-16). */
const primary = `group inline-flex min-w-0 touch-manipulation items-center justify-center gap-1.5 whitespace-nowrap rounded-full ${BOOK_GREEN} px-5 font-bold no-underline shadow-lg transition-[filter] [-webkit-tap-highlight-color:transparent] hover:brightness-105 active:brightness-95`;

const LABEL: Record<BookingState, string> = {
  booked: 'Pick a new time',
  qualified: 'Book your call',
  unknown: 'Book a call',
};

/** `grow` is how the button fills the row it sits in. */
function Actions({ state, height, grow }: { state: BookingState; height: string; grow: string }) {
  return (
    <Link href={REBOOK_PATH} prefetch={false} className={`${primary} ${height} ${grow} text-[14px]`}>
      {LABEL[state]}
      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export default function BookAgainCta({
  variant,
  show = true,
  className = '',
}: {
  variant: 'bar' | 'pill' | 'inline';
  /** For the decks: off on the cover, and off while presenting fullscreen. */
  show?: boolean;
  className?: string;
}) {
  const state = useBookingState();
  const reduce = useReducedMotion();
  const visible = show && state !== null;

  if (variant === 'inline') {
    if (!visible) return null;
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Actions state={state} height="h-10" grow="flex-1" />
      </div>
    );
  }

  const enter = { opacity: 0, y: reduce ? 0 : variant === 'bar' ? 24 : 16 };

  return (
    <AnimatePresence>
      {visible &&
        (variant === 'bar' ? (
          <motion.div
            key="book-bar"
            className={`fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-[#020617]/85 backdrop-blur-xl ${className}`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={enter}
            animate={{ opacity: 1, y: 0 }}
            exit={enter}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 sm:gap-4">
              <p className="hidden min-w-0 flex-1 truncate text-sm font-medium text-white/70 sm:block">
                {TAGLINE[state]}
              </p>
              <Actions state={state} height="h-11" grow="flex-1 sm:flex-none" />
            </div>
          </motion.div>
        ) : (
          // Centred with flex, not translate-x: framer owns this transform.
          <motion.div
            key="book-pill"
            className={`pointer-events-none fixed inset-x-0 bottom-5 z-[105] flex justify-center ${className}`}
            initial={enter}
            animate={{ opacity: 1, y: 0 }}
            exit={enter}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#020617]/80 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              {state !== 'unknown' && (
                <span className="hidden pl-3 pr-1 text-[13px] font-medium text-white/65 xl:inline">{TAGLINE[state]}</span>
              )}
              <Actions state={state} height="h-10" grow="" />
            </div>
          </motion.div>
        ))}
    </AnimatePresence>
  );
}
