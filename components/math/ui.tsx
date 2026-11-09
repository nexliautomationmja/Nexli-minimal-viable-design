'use client';

// ---------------------------------------------------------------------------
// The pieces every /math slide is made of.
//
// Candor's visual language (app/candor/candor-client.tsx) at slide scale.
// Two of its rules carry over and matter here more than anywhere:
//
// PARAGRAPH COLOUR IS SET INLINE. globals.css colours `p` outside any
// @layer, and in Tailwind v4 that beats a utility class, so
// <p className="text-white"> still renders at 70% white. Use <Body> or set
// `style={{ color }}` — never a text-* class on a <p>.
//
// MOTION IS A REVEAL, NOT A SHOW. Content rises in once as its slide
// arrives. MathDeck wraps everything in <MotionConfig reducedMotion="user">,
// so under prefers-reduced-motion the transforms drop and it simply appears.
// ---------------------------------------------------------------------------
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { OUTFIT } from '@/components/funnel/primitives';
import { usePrint } from './print';

export const MUTED = 'rgba(255,255,255,0.62)';
export const FAINT = 'rgba(255,255,255,0.4)';

/** Chart and accent colours. Validated for colour-blind separation on the
 *  card surface with the dataviz skill's validator (see the README there). */
export const C = {
  planning: '#3B82F6',
  backEnd: '#14A877',
  monthly: '#0EA5C4',
  annual: '#8B5CF6',
  invest: '#F59E0B',
  surface: '#0d1526',
  grid: 'rgba(255,255,255,0.08)',
  axis: 'rgba(255,255,255,0.45)',
} as const;

/** The gradient half of every headline. Never split across lines on a
 *  desktop: the white half wraps, the gradient phrase moves down whole. */
export const GRADIENT_TEXT =
  'bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent lg:whitespace-nowrap';

/**
 * globals.css styles h1–h6 outside any @layer (weight 700, its own line
 * height and tracking), which beats Tailwind classes in v4 the same way the
 * `p` colour rule does. Headings here set them inline.
 */
export const HEADING: React.CSSProperties = {
  ...OUTFIT,
  fontWeight: 800,
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  color: '#fff',
};

export const PDF_HREF = '/downloads/nexli-see-the-math.pdf';
export const PDF_NAME = 'Nexli-See-The-Math.pdf';

/**
 * Presenting mode: a desktop window tall enough to show a slide at a time.
 * Shared by the deck (snapping, keys) and Slide (fit-to-height).
 */
export const DECK_QUERY = '(min-width: 1024px) and (min-height: 700px)';

/** Room a slide's content gets: the window less the logo row and counter,
 *  and less the side margins the logo and dot nav sit in. */
const CHROME_Y = 160;
const CHROME_X = 220;
const MAX_UP = 1.15;

/**
 * Scales a slide's content down to fit the window, as slide software does.
 *
 * The slides are laid out for a ~900px-tall window. A laptop browser with its
 * tabs and address bar is nearer 780, and a 1280×720 share less than that;
 * without this the bottom of every dense slide hangs off the screen. A
 * transform, not a smaller layout: charts keep measuring their real width,
 * and offsetHeight (the layout height) is unaffected by the transform, so
 * this cannot feed back on itself. Floor of 0.6 — below that, read it as a
 * page instead (the deck drops to reading mode under 700px anyway). It also
 * scales UP a little on a big screen; see update() below.
 */
function useFitScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(DECK_QUERY);
    const update = () => {
      if (!mq.matches) return setScale(1);
      // Height decides, width only caps it (the logo and dot nav sit in the
      // side margins). Up to MAX_UP on a big screen, where a 1920×1080 share
      // otherwise leaves the slide in the middle 60% of a Zoom window.
      const byHeight = (window.innerHeight - CHROME_Y) / el.offsetHeight;
      const byWidth = (window.innerWidth - CHROME_X) / el.offsetWidth;
      const s = Math.max(0.6, Math.min(byHeight, byWidth, MAX_UP));
      setScale(Math.abs(s - 1) < 0.02 ? 1 : s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    mq.addEventListener('change', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      mq.removeEventListener('change', update);
    };
  }, [ref]);
  return scale;
}

/** One slide. Full-viewport in deck mode, natural height on a phone. */
export function Slide({
  id,
  children,
  className = '',
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const scale = useFitScale(inner);
  return (
    <section
      id={id}
      data-slide
      className={`deck-slide relative flex w-full items-center px-5 py-16 sm:px-8 sm:py-20 lg:px-16 ${className}`}
    >
      <div
        ref={inner}
        className="mx-auto w-full max-w-6xl 2xl:max-w-7xl"
        style={scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: 'center center' } : undefined}
      >
        {children}
      </div>
    </section>
  );
}

const rise = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  // On paper it is simply there.
  if (usePrint()) return <div className={className}>{children}</div>;
  return (
    <motion.div
      {...rise}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400 sm:text-xs">
      {children}
    </div>
  );
}

export function Heading({
  kicker,
  children,
  sub,
  className = '',
  as: Tag = 'h2',
}: {
  kicker: string;
  children: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <Reveal className={className}>
      <Kicker>{kicker}</Kicker>
      <Tag
        className="mt-3 max-w-5xl text-pretty text-[1.85rem] sm:text-4xl lg:text-[clamp(2.4rem,3.4vw,3.75rem)] 2xl:max-w-6xl"
        style={HEADING}
      >
        {children}
      </Tag>
      {sub && (
        <p
          className="mt-4 max-w-4xl text-[15px] leading-relaxed sm:text-base lg:text-lg"
          style={{ color: MUTED }}
        >
          {sub}
        </p>
      )}
    </Reveal>
  );
}

export function Body({
  children,
  className = '',
  muted = true,
}: {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <p
      className={`text-[15px] leading-relaxed sm:text-base ${className}`}
      style={{ color: muted ? MUTED : 'rgba(255,255,255,0.92)' }}
    >
      {children}
    </p>
  );
}

/** The glass panel charts and tables sit on. */
export function Panel({
  children,
  className = '',
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 p-4 sm:p-6 ${className}`}
      style={{ background: 'linear-gradient(160deg, rgba(16,28,51,0.85) 0%, rgba(10,16,32,0.85) 100%)' }}
    >
      {title && (
        <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400/90 sm:text-[11px]">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/** Who moves a number: Nexli, the firm, or both. Timeline and assumptions. */
export type Who = 'NEXLI' | 'YOU' | 'NEXLI + YOU' | null;

export function Badge({ who }: { who: Who }) {
  if (!who) return null;
  const tone =
    who === 'NEXLI'
      ? 'border-cyan-400/50 text-cyan-300'
      : who === 'YOU'
        ? 'border-emerald-400/50 text-emerald-300'
        : 'border-white/25 text-white/70';
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] ${tone}`}>{who}</span>
  );
}

/** A cited source: opens in a new tab, marked as external. */
export function Src({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-cyan-300 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-300"
    >
      {children}
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}

/** A highlighted callout, the PDF's cyan-ruled box. */
export function Callout({
  label,
  children,
  tone = 'cyan',
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  tone?: 'cyan' | 'amber' | 'emerald';
  className?: string;
}) {
  const tones = {
    cyan: { rule: '#06B6D4', border: 'rgba(6,182,212,0.35)', bg: 'rgba(6,182,212,0.07)', text: 'text-cyan-300' },
    amber: { rule: '#F59E0B', border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.06)', text: 'text-amber-300' },
    emerald: { rule: '#14A877', border: 'rgba(20,168,119,0.4)', bg: 'rgba(20,168,119,0.08)', text: 'text-emerald-300' },
  }[tone];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border py-4 pl-6 pr-5 sm:py-5 sm:pl-7 ${className}`}
      style={{ borderColor: tones.border, background: tones.bg }}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1" style={{ background: tones.rule }} />
      <div className={`text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px] ${tones.text}`}>{label}</div>
      <div className="mt-1.5 text-[15px] leading-relaxed text-white/90 sm:text-base">{children}</div>
    </div>
  );
}

/** Measures an element's width, for charts drawn at true pixel size. */
export function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Fires once, the first time the element is mostly on screen. */
export function useSeen<T extends Element>(amount = 0.35): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  // Print mode starts seen: every chart drawn in full, wherever it sits.
  const print = usePrint();
  const [seen, setSeen] = useState(print);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, seen]);
  return [ref, seen];
}
