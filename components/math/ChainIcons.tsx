'use client';

// ---------------------------------------------------------------------------
// The Rainmaker page's floating icons, brought to /math.
//
// Same vocabulary as the hero in components/Services (the /rainmaker page):
// coloured tiles that bob and tilt in 3D, and the shimmer badge over the
// headline. Marcel wanted the deck as fun as the rest of the site without
// overdoing it, so they appear in exactly two places, and both carry
// meaning:
//
//   TITLE SLIDE. The five links of the chain the whole deck is about — ads,
//   booked calls, calls held, clients signed, fees — float under the
//   headline. Tap or click them to go to the slide that walks through it.
//   HOW THE MATH WORKS. Each of the five step cards wears its link's tile,
//   and the tiles pop when you switch scenario, as the numbers recount.
//
// Motion is framer-motion's, inside the deck's <MotionConfig
// reducedMotion="user">, so under reduced motion the tiles hold still. The
// badge's rim turns on .rim-spin, which globals.css also stops.
// ---------------------------------------------------------------------------
import React from 'react';
import { motion } from 'framer-motion';
import { usePrint } from './print';
import {
  CalendarCheck,
  ChevronRight,
  CircleDollarSign,
  Droplets,
  Megaphone,
  PenLine,
  Video,
  type LucideIcon,
} from 'lucide-react';

type Tone = 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber';

/** The Rainmaker hero's tile colours, plus emerald for "signed". */
const TONES: Record<Tone, { bg: string; border: string; text: string; shadow: string }> = {
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', shadow: 'rgba(37,99,235,0.35)' },
  violet: { bg: 'bg-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400', shadow: 'rgba(139,92,246,0.35)' },
  cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', shadow: 'rgba(6,182,212,0.35)' },
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', shadow: 'rgba(16,185,129,0.35)' },
  amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', shadow: 'rgba(245,158,11,0.35)' },
};

/** The chain, in order: the five steps on the "How the math works" slide. */
export const CHAIN: readonly { label: string; Icon: LucideIcon; tone: Tone }[] = [
  { label: 'Ads', Icon: Megaphone, tone: 'blue' },
  { label: 'Booked', Icon: CalendarCheck, tone: 'violet' },
  { label: 'Held', Icon: Video, tone: 'cyan' },
  { label: 'Signed', Icon: PenLine, tone: 'emerald' },
  { label: 'Fees', Icon: CircleDollarSign, tone: 'amber' },
];

function Tile({ step, className, iconClassName }: { step: (typeof CHAIN)[number]; className: string; iconClassName: string }) {
  const t = TONES[step.tone];
  return (
    <div
      className={`flex items-center justify-center border ${t.bg} ${t.border} ${className}`}
      style={{ filter: `drop-shadow(0 4px 8px ${t.shadow})` }}
    >
      <step.Icon className={`${t.text} ${iconClassName}`} aria-hidden="true" />
    </div>
  );
}

/**
 * The title slide's floating chain. One link: it goes to the next slide,
 * which walks through these five steps with the numbers. Scrolled to rather
 * than navigated to, so it adds no history entry (the deck keeps the hash
 * with replaceState for the same reason).
 */
export function FloatingChain() {
  // On paper they are simply there: no fade-in to be caught half-way.
  const print = usePrint();
  const go = (e: React.MouseEvent) => {
    const how = document.getElementById('how');
    if (!how) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    how.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <a
      href="#how"
      onClick={go}
      aria-label="See how the math works: ads, booked calls, calls held, clients signed, fees"
      className="group inline-flex touch-manipulation items-start gap-1 rounded-2xl outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#020617] sm:gap-2"
      style={{ perspective: '600px' }}
    >
      {CHAIN.map((step, i) => (
        <React.Fragment key={step.label}>
          {i > 0 && (
            <motion.span
              aria-hidden="true"
              className="mt-[15px] sm:mt-5"
              initial={print ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 + i * 0.15, duration: 0.4 }}
            >
              <ChevronRight className="h-3.5 w-3.5 text-white/25" />
            </motion.span>
          )}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              initial={print ? false : { opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -6, 0],
                rotateX: [0, 4, 0],
                rotateY: [0, i % 2 === 0 ? 6 : -6, 0],
                rotateZ: [0, i % 2 === 0 ? 2 : -2, 0],
              }}
              transition={{
                opacity: { delay: 0.3 + i * 0.15, duration: 0.6 },
                y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                rotateZ: { delay: 0.8 + i * 0.15, duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Tile step={step} className="h-11 w-11 rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl" iconClassName="h-5 w-5 sm:h-7 sm:w-7" />
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 transition-colors group-hover:text-white/75">
              {step.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </a>
  );
}

/**
 * A step card's tile on "How the math works", with the step number on its
 * corner. `popKey` changes with the scenario, which remounts the tile and
 * springs it back in: the cards pop in turn as the numbers recount.
 */
export function StepTile({ index, popKey }: { index: number; popKey: string }) {
  const step = CHAIN[index];
  const print = usePrint();
  return (
    <motion.div
      key={popKey}
      className="relative inline-flex"
      initial={print ? false : { scale: 0.55, rotate: -14, opacity: 0.4 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 15, delay: index * 0.06 }}
      whileHover={{ scale: 1.08, rotate: index % 2 === 0 ? 4 : -4 }}
    >
      <Tile step={step} className="h-10 w-10 rounded-xl" iconClassName="h-5 w-5" />
      <span
        aria-hidden="true"
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-[#020617] ring-2 ring-[#0b1220]"
      >
        {index + 1}
      </span>
    </motion.div>
  );
}

/** The Rainmaker hero's badge: a turning rainbow rim on a dark pill. */
export function ShimmerBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex overflow-hidden rounded-full p-[1.5px]">
      <span
        aria-hidden="true"
        className="rim-spin absolute inset-[-100%] opacity-80"
        style={{ background: 'conic-gradient(from 0deg at 50% 50%, #3B82F6, #8B5CF6, #06B6D4, #F59E0B, #3B82F6)' }}
      />
      <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-[#030a1c] px-3.5 py-1.5 sm:px-4 sm:py-2">
        <Droplets size={14} className="shrink-0 text-blue-400" aria-hidden="true" />
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white sm:text-[11px]">{children}</span>
      </span>
    </span>
  );
}
