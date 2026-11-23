// ---------------------------------------------------------------------------
// The green "Rebook call" button at the top of /math, /candor and
// /ai-avatars (Marcel, 2026-11-16: "so that way they see it").
//
// The sticky button at the bottom (BookAgainCta) reads the visitor first and
// changes its label. This one does not: it says the same thing to everyone,
// so it is on screen from the first paint. Both go to REBOOK_PATH, the
// Better Clients VSL's booking section: the price, then the calendar
// (Marcel, 2026-11-23). Until then they went to /book, which sorted
// visitors by whether they had qualified; the VSL calendar asks nobody to
// qualify first.
//
// Green so it reads apart from the blue buttons that move through the page
// (Meet the cast, the slide arrows). The sticky booking button at the bottom
// is the same green (Marcel, 2026-11-16): green means "book". Dark text on
// it: white on a green this bright is hard to read.
// ---------------------------------------------------------------------------
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { REBOOK_PATH } from '@/lib/advisory-config';

/** The booking green, shared with the sticky button (BookAgainCta). */
export const BOOK_GREEN = 'bg-gradient-to-r from-emerald-500 to-green-400 text-[#03231a] shadow-emerald-500/20';

const BASE = `group inline-flex shrink-0 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-full ${BOOK_GREEN} font-bold no-underline shadow-xl transition-[transform,filter] [-webkit-tap-highlight-color:transparent] hover:scale-[1.02] hover:brightness-105 active:brightness-95`;

const SIZE = {
  /** Beside "Meet the cast": the same height and type. */
  md: 'px-6 py-3 text-sm sm:text-base',
  /** In a row of h-10 header buttons. No icon on a phone, where the row is
   *  short of room. */
  sm: 'h-10 px-3.5 text-[13px] sm:px-4',
} as const;

export default function RebookCallButton({
  size = 'md',
  className = '',
}: {
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <Link href={REBOOK_PATH} prefetch={false} className={`${BASE} ${SIZE[size]} ${className}`}>
      <CalendarClock
        className={`h-4 w-4 shrink-0 ${size === 'sm' ? 'hidden sm:block' : ''}`}
        aria-hidden="true"
      />
      Rebook call
    </Link>
  );
}
