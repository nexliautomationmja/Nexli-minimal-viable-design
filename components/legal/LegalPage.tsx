// ---------------------------------------------------------------------------
// The shell every policy page shares: Terms, Privacy, Refund Policy,
// Delivery Policy, Contact and Pricing.
//
// Terms and Privacy used to carry their own copies of this markup, each a
// client component only so a "Back to Home" button could call router.push.
// A plain <Link> does the same job, renders on the server, and is a link an
// underwriter's crawler can actually follow.
// ---------------------------------------------------------------------------

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

/** Inline links inside policy copy. */
export const legalLinkClass = 'text-blue-500 underline hover:text-blue-400 transition-colors';

/** Bold emphasis inside muted body copy. */
export const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="text-[var(--text-main)]">{children}</strong>
);

interface LegalPageProps {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  /** e.g. "Effective Date: November 9, 2026". Omit on pages that are not policies. */
  dateLine?: string;
  /** One short paragraph under the title. */
  intro?: React.ReactNode;
  children: React.ReactNode;
}

export default function LegalPage({ eyebrow, icon: Icon, title, dateLine, intro, children }: LegalPageProps) {
  return (
    <section className="min-h-screen py-32 bg-[var(--bg-main)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-500 font-bold mb-12 hover:gap-3 transition-all uppercase tracking-widest text-xs no-underline"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Home
        </Link>

        <div className="mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Icon className="text-blue-400" size={16} aria-hidden="true" />
            <span className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase">{eyebrow}</span>
          </div>
          <h1 className="text-[var(--text-main)] text-4xl sm:text-5xl md:text-7xl font-bold mb-8 break-words">{title}</h1>
          {dateLine && (
            <p className="text-[var(--text-muted)] text-xl leading-relaxed">{dateLine}</p>
          )}
          {intro && (
            <p className="text-[var(--text-muted)] text-lg leading-relaxed mt-4">{intro}</p>
          )}
        </div>

        <div className="space-y-12 text-[var(--text-muted)] leading-relaxed text-lg">{children}</div>
      </div>
    </section>
  );
}

interface LegalSectionProps {
  title: string;
  /** Anchor target, so other pages can link straight to the section. */
  id?: string;
  /**
   * plain   — heading and body.
   * card    — subtle glass card.
   * feature — the blue-tinted card, for the section a reader most needs.
   */
  variant?: 'plain' | 'card' | 'feature';
  children: React.ReactNode;
}

export function LegalSection({ title, id, variant = 'plain', children }: LegalSectionProps) {
  const box =
    variant === 'feature'
      ? 'p-6 sm:p-8 glass-card rounded-3xl border border-blue-500/20 bg-blue-500/5'
      : variant === 'card'
        ? 'p-6 sm:p-8 glass-card rounded-3xl border border-blue-500/10'
        : '';

  return (
    <section id={id} className={`space-y-4 scroll-mt-32 ${box}`}>
      <h2 className={`text-2xl font-bold ${variant === 'feature' ? 'text-blue-500' : 'text-[var(--text-main)]'}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}
