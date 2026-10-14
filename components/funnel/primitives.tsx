// ---------------------------------------------------------------------------
// Shared funnel primitives.
//
// Lifted out of components/demo/DemoExperience.tsx, which is the house visual
// standard. Same move TransformationCards.tsx made, and for the same reason:
// Eyebrow, SectionHeading and Segmented were already defined twice (here and
// in components/demo/OfferPage.tsx), and Eyebrow had quietly drifted into
// three different components wearing one name.
//
// NO 'use client' in this file, deliberately. Everything here is pure, and
// the advisory opt-in, next-steps and DeliveryBlock are all server components
// — a client directive would make them ship JS they do not need. Anything
// needing an event handler goes in ./FunnelCta.tsx instead.
// ---------------------------------------------------------------------------
import type React from 'react';
import { RAINMAKER_CONIC } from '@/components/TransformationCards';

export const OUTFIT: React.CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

/** The funnel canvas. */
export const CANVAS = '#0a0f1c';

/**
 * The page-level glow every funnel page sits under. Hand-rolled in six places
 * before this, and the advisory pages had drifted to a different blob.
 */
export function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
      style={{
        background:
          'radial-gradient(60% 60% at 50% 0%, rgba(59,130,246,0.14) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }}
    />
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-[0.2em] text-[10px] font-black px-3.5 py-1.5">
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  id,
  align = 'left',
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  id?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div
      id={id}
      className={`max-w-3xl scroll-mt-24${align === 'center' ? ' mx-auto text-center' : ''}`}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className="mt-4 text-2xl sm:text-3xl md:text-[2.5rem] font-black tracking-[-0.03em] leading-[1.08] text-white"
        style={OUTFIT}
      >
        {title}
      </h2>
      {sub && (
        <p
          className="mt-4 text-base md:text-lg leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/**
 * The house showpiece card: two spinning conic layers, one crisp and one
 * blurred, over an interior that MUST be fully opaque.
 *
 * That last part is the trap this component exists to close. At any alpha the
 * blurred layer bleeds through and washes the whole card gold-teal. The
 * warning was written twice in DemoExperience and the markup was still
 * hand-copied into five files; the arithmetic between `p-[1.5px]` and
 * `rounded-[calc(1.5rem-1.5px)]` is the other thing that gets copied wrong.
 *
 * `.rim-spin` is a named class rather than Tailwind's
 * `animate-[shimmer_6s_linear_infinite]` so that one media query in
 * globals.css can stop every rim on the site under prefers-reduced-motion.
 */
export function RimCard({
  children,
  className = '',
  innerClassName = 'px-5 sm:px-7 py-5 sm:py-7',
  orbs = true,
}: {
  children: React.ReactNode;
  /** Outer wrapper — put width and margin here (e.g. `max-w-4xl mt-10`). */
  className?: string;
  /** Interior padding. Cards use `p-6 sm:p-8`; banners the default. */
  innerClassName?: string;
  orbs?: boolean;
}) {
  return (
    <div className={`relative rounded-3xl overflow-hidden p-[1.5px] isolate ${className}`}>
      <span
        aria-hidden="true"
        className="absolute inset-[-200%] rim-spin opacity-90 pointer-events-none"
        style={{ background: RAINMAKER_CONIC }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-[-200%] rim-spin blur-xl opacity-30 pointer-events-none"
        style={{ background: RAINMAKER_CONIC }}
      />
      <div
        className={`relative z-10 h-full overflow-hidden rounded-[calc(1.5rem-1.5px)] ${innerClassName}`}
        // Opaque. See the note above before changing this.
        style={{ background: 'linear-gradient(140deg, #101c33 0%, #0a1020 55%, #0b1f28 100%)' }}
      >
        {orbs && (
          <>
            {/* The "lit from inside" read is mostly these, not the rim. */}
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none"
            />
          </>
        )}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
