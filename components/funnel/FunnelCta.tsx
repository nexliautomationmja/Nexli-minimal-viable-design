'use client';

// ---------------------------------------------------------------------------
// The one funnel button.
//
// `rounded-full`, `bg-blue-600`, and that specific blue drop shadow — used
// five times in DemoExperience and twice in OfferPage, and already broken
// twice in the advisory pages, which shipped `rounded-xl` with a gradient
// fill. One component so the next page cannot get it wrong.
//
// It also owns its own error line. On a page with four live checkout buttons
// a single error rendered near the price block means a failure triggered from
// the hero shows nothing where the user actually clicked.
// ---------------------------------------------------------------------------

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

const SIZES = {
  // Inside a card.
  md: 'px-7 py-3.5 text-sm sm:text-base',
  // Same as md from sm up, but tighter on a phone so a long label stays on
  // one line — a wrapped label costs ~20px of height, which is the difference
  // between the thank-you CTA card fitting the fold and not.
  mdTight: 'px-4 py-3 text-[13px] sm:px-7 sm:py-3.5 sm:text-base',
  // Standalone, below a section.
  lg: 'px-8 py-4 text-base',
  // The sticky mobile bar.
  sm: 'px-6 py-3.5 text-sm',
} as const;

export interface FunnelCtaProps {
  children: React.ReactNode;
  /** Renders a Link when set, a button otherwise. */
  href?: string;
  onClick?: () => void;
  size?: keyof typeof SIZES;
  /** Swaps the label for a spinner and disables the button. */
  pending?: boolean;
  pendingLabel?: string;
  /** Rendered directly beneath, so it appears where the user clicked. */
  error?: string | null;
  /** Full width on mobile, auto from `sm` up. */
  block?: boolean;
  className?: string;
  arrow?: boolean;
}

export default function FunnelCta({
  children,
  href,
  onClick,
  size = 'md',
  pending = false,
  pendingLabel = 'One moment...',
  error,
  block = true,
  className = '',
  arrow = true,
}: FunnelCtaProps) {
  const cls = [
    SIZES[size],
    block ? 'w-full sm:w-auto' : '',
    'inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500',
    'rounded-full font-bold text-white transition-transform',
    'hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style = { boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' } as const;

  const label = pending ? (
    <>
      <Loader2 size={17} className="animate-spin" aria-hidden="true" />
      {pendingLabel}
    </>
  ) : (
    <>
      {children}
      {arrow && <ArrowRight size={17} aria-hidden="true" />}
    </>
  );

  return (
    <>
      {href ? (
        <Link href={href} className={cls} style={style}>
          {label}
        </Link>
      ) : (
        <button type="button" onClick={onClick} disabled={pending} className={cls} style={style}>
          {label}
        </button>
      )}
      {error && (
        <p className="mt-3 text-sm" style={{ color: '#fca5a5' }} role="alert">
          {error}
        </p>
      )}
    </>
  );
}

/** Secondary/ghost button, the benchmark's pair to the above. */
export function FunnelGhostCta({
  children,
  href,
  onClick,
  block = true,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  block?: boolean;
}) {
  const cls = `${
    block ? 'w-full sm:w-auto' : ''
  } inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full border text-sm font-semibold transition-colors`;
  const style = {
    background: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.14)',
    color: 'rgba(255,255,255,0.72)',
  } as const;

  return href ? (
    <Link href={href} className={cls} style={style}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  );
}
