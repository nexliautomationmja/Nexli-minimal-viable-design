'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CalendarCheck, Check, ChevronDown, LayoutDashboard, Monitor, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// The "What You Actually Get" four-card grid.
//
// Lifted verbatim out of VslFunnelOffer.tsx, where it was four hand-written
// copies of the same markup with every colour repeated. A second, already
// drifted copy still lives in VslFunnel.tsx (different copy, and card 4 uses an
// inlined Google "G" SVG instead of a lucide icon) — that one is deliberately
// left alone.
//
// This renders the GRID ONLY, not the heading. The original h2 is set in Syne,
// which the demo funnel pages dropped in favour of Outfit, so each caller owns
// its own heading and picks its own font.
// ---------------------------------------------------------------------------

export interface TransformationCard {
  Icon: LucideIcon;
  /** Accent hex. Drives the card border, tile border and icon colour. */
  accent: string;
  /** Deep tinted background behind the icon. */
  tileBg: string;
  /** rgba() for the tile's outer glow, normally the accent at 0.5 alpha. */
  glowRgba: string;
  /** Colour stops for the badge's rotating rim. */
  conicStops: string;
  /** Tailwind classes for the badge star and its label. */
  starClass: string;
  labelClass: string;
  badge: string;
  title: string;
  body: string;
  /** Short bullets revealed on click. Only used where `expandable` is set. */
  details?: string[];
}

/**
 * The badge's inner pill.
 *
 * The original used `bg-[var(--bg-main)]`, which resolves to #ffffff on bare
 * :root and only goes dark under `.dark` (set on <html> in app/layout.tsx).
 * It renders correctly today, but a theme toggle would leave a white pill on a
 * near-black card. #020617 is exactly what the var resolves to in dark, and is
 * also `slate-950`, the card gradient's end stop — so this is pixel-identical
 * and cannot break.
 */
const PILL_BG = '#020617';

/**
 * The Digital Rainmaker four-colour sweep, for the house animated card rim
 * (see components/Services.tsx:196 for the canonical usage). Lives here
 * because this file already owns the Rainmaker palette — the alternative was
 * a third hardcoded copy of the same string.
 */
export const RAINMAKER_CONIC =
  'conic-gradient(from 0deg at 50% 50%, #60a5fa, #06B6D4, #a78bfa, #fbbf24, #60a5fa)';

/** #60a5fa + 0.2 -> "rgba(96, 165, 250, 0.2)". Keeps the alphas exact, where a
 *  hex suffix like `4d` would land on 0.302 instead of Tailwind's `/30`. */
function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export const DEFAULT_TRANSFORMATION_CARDS: TransformationCard[] = [
  {
    Icon: Monitor,
    accent: '#60a5fa',
    tileBg: '#0a1628',
    glowRgba: 'rgba(96, 165, 250, 0.5)',
    conicStops: '#60a5fa, #3b82f6, #60a5fa',
    starClass: 'text-blue-400 fill-blue-400',
    labelClass: 'text-blue-300',
    badge: 'Premium Trust Asset',
    title: 'Authority Positioning',
    body: 'A premium digital presence that makes a high earner trust your firm with their entire tax picture on the first visit — not a template, a trust asset.',
  },
  {
    Icon: LayoutDashboard,
    accent: '#06B6D4',
    tileBg: '#0a2832',
    glowRgba: 'rgba(6, 182, 212, 0.5)',
    conicStops: '#06B6D4, #3B82F6, #8B5CF6, #06B6D4',
    starClass: 'text-cyan-400 fill-cyan-400',
    labelClass: 'text-cyan-300',
    badge: 'The Growth Engine',
    title: 'High-Income Client Pipeline',
    body: 'Targeted acquisition that puts 6-and-7-figure earners in front of your firm — right after they\'ve written another painful check to the IRS and started wondering if it has to be this way.',
  },
  {
    Icon: Bot,
    accent: '#a78bfa',
    tileBg: '#1a0a28',
    glowRgba: 'rgba(167, 139, 250, 0.5)',
    conicStops: '#a78bfa, #8b5cf6, #a78bfa',
    starClass: 'text-purple-400 fill-purple-400',
    labelClass: 'text-purple-300',
    badge: 'Built for Urgency',
    title: 'Intake & Follow-Up Automations',
    body: 'High earners are busy — they book with the first credible firm that responds. Our automations answer, qualify, and book them instantly — 24/7, no manual follow-up.',
  },
  {
    Icon: CalendarCheck,
    accent: '#fbbf24',
    tileBg: '#1a1400',
    glowRgba: 'rgba(251, 191, 36, 0.5)',
    // Was Google's four brand colours, left behind when this card stopped being
    // about Google reviews — a gold "No Tire-Kickers" pill cycling blue/green/
    // red. Amber now, matching its own accent like the other three.
    conicStops: '#fbbf24, #f59e0b, #fbbf24',
    starClass: 'text-yellow-400 fill-yellow-400',
    labelClass: 'text-yellow-300',
    badge: 'No Tire-Kickers',
    title: 'Pre-Qualified Bookings',
    body: 'Only 6-and-7-figure-income cases with real planning opportunity reach your calendar. We screen income level and savings potential before they ever book.',
  },
];

/**
 * The glowing icon tile. Exported so the stats section can wear the same
 * treatment without a third hand-copy of these values.
 */
export const GlowTile: React.FC<{
  Icon: LucideIcon;
  accent: string;
  tileBg: string;
  glowRgba: string;
}> = ({ Icon, accent, tileBg, glowRgba }) => (
  <div
    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center border-2"
    style={{
      backgroundColor: tileBg,
      borderColor: alpha(accent, 0.3),
      filter: `drop-shadow(0 0 24px ${glowRgba})`,
    }}
  >
    <Icon className="w-9 h-9 md:w-11 md:h-11" style={{ color: accent }} strokeWidth={2} />
  </div>
);

/** The shimmer-rimmed badge pill. */
export const ShimmerBadge: React.FC<{
  conicStops: string;
  starClass: string;
  labelClass: string;
  children: React.ReactNode;
}> = ({ conicStops, starClass, labelClass, children }) => (
  <div className="relative inline-flex items-center rounded-full overflow-hidden p-[1px]">
    <span
      className="absolute inset-[-100%] animate-[shimmer_4s_linear_infinite] opacity-70"
      style={{ background: `conic-gradient(from 0deg at 50% 50%, ${conicStops})` }}
    />
    <span
      className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full"
      style={{ backgroundColor: PILL_BG }}
    >
      <Star size={12} className={starClass} />
      <span className={`text-[10px] font-black tracking-[0.15em] uppercase ${labelClass}`}>
        {children}
      </span>
    </span>
  </div>
);

const ValueCard: React.FC<{
  card: TransformationCard;
  index: number;
  expandable: boolean;
}> = ({ card, index, expandable }) => {
  const [open, setOpen] = useState(false);
  // Only interactive when the caller supplied something to reveal.
  const canExpand = expandable && !!card.details?.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: 'circOut', delay: index * 0.1 }}
      className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border"
      style={{ borderColor: alpha(card.accent, canExpand && open ? 0.45 : 0.2) }}
    >
      {/* A real <button> when it expands, a plain div when it does not — so the
          VSL pages keep inert markup and keyboard users get the right control. */}
      {React.createElement(
        canExpand ? 'button' : 'div',
        {
          ...(canExpand
            ? {
                type: 'button',
                onClick: () => setOpen((v) => !v),
                'aria-expanded': open,
                className:
                  'w-full text-left cursor-pointer p-6 md:p-8 transition-colors hover:bg-white/[0.02]',
              }
            : { className: 'p-6 md:p-8' }),
        },
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mb-4 md:mb-5"
          >
            <GlowTile
              Icon={card.Icon}
              accent={card.accent}
              tileBg={card.tileBg}
              glowRgba={card.glowRgba}
            />
          </motion.div>

          <div className="mb-3 md:mb-4">
            <ShimmerBadge
              conicStops={card.conicStops}
              starClass={card.starClass}
              labelClass={card.labelClass}
            >
              {card.badge}
            </ShimmerBadge>
          </div>

          <h3 className="text-lg md:text-2xl font-black tracking-tight mb-2 text-white">
            {card.title}
          </h3>
          <p className="text-xs md:text-sm max-w-md leading-relaxed text-neutral-300">
            {card.body}
          </p>

          {canExpand && (
            <span
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em]"
              style={{ color: card.accent }}
            >
              {open ? 'Hide' : "What's included"}
              <ChevronDown
                size={13}
                aria-hidden="true"
                style={{
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </span>
          )}
        </div>,
      )}

      {canExpand && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <ul
                className="mx-6 md:mx-8 mb-6 md:mb-8 space-y-2 border-t pt-4 list-none p-0"
                style={{ borderColor: alpha(card.accent, 0.2) }}
              >
                {card.details!.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-left text-xs md:text-sm text-neutral-300">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: card.accent }} aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

const TransformationCards: React.FC<{
  cards?: TransformationCard[];
  /** Turn the cards into click-to-expand disclosures. Off by default so the
   *  VSL pages keep the static section they have always had. */
  expandable?: boolean;
  /** Three-up for a three-card set; two-up everywhere else. */
  columns?: 2 | 3;
}> = ({ cards = DEFAULT_TRANSFORMATION_CARDS, expandable = false, columns = 2 }) => (
  <div
    className={`grid grid-cols-1 gap-6 md:gap-8 items-start ${
      columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'
    }`}
  >
    {cards.map((c, i) => (
      <ValueCard key={c.title} card={c} index={i} expandable={expandable} />
    ))}
  </div>
);

export default TransformationCards;
