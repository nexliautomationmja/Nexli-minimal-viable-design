// ---------------------------------------------------------------------------
// Advisory funnel — where a buyer lands when their firm is below the bar for
// the done-for-you engine.
//
// This page is the reason the gate is safe to have at all. Someone here paid
// $97 a few minutes ago; told "you don't qualify" and nothing else, they
// read it as "you took my money and rejected me" — which is a chargeback and
// a one-star review. So, in this order:
//
//   1. the thing they bought, before any mention of fit;
//   2. the actual reason, named, framed as the engine not fitting them;
//   3. a real refund offer;
//   4. a next step that is neither a call nor the other funnel;
//   5. no calendar anywhere — a "book anyway" link would make the gate theatre.
//
// The URL deliberately says next-steps, not not-a-fit. People read address bars.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Mail } from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import DeliveryBlock from '@/components/advisory/DeliveryBlock';
import { requireAdvisoryBuyer } from '@/lib/advisory-session';
import { reasonFor } from '@/lib/advisory-fit';
import { ADVISORY_REFUND_DAYS } from '@/lib/advisory-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your guide, and where to go next | Nexli',
  robots: 'noindex, nofollow',
};

const OUTFIT: CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

export default async function AdvisoryNextStepsPage() {
  const { lead } = await requireAdvisoryBuyer();
  const firstName = (lead.firstName || '').trim();
  const reason = reasonFor(lead);

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full blur-[130px] bg-emerald-500/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-28 pb-20 md:pt-32">
        <h1
          className="text-3xl sm:text-4xl font-black leading-[1.08] tracking-tight text-white"
          style={OUTFIT}
        >
          {firstName ? `${firstName}, your guide is ready.` : 'Your guide is ready.'}
        </h1>
        <p
          className="mt-4 text-sm sm:text-base leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Everything you paid for is below. Pull your top twenty with it this week —
          that is where it earns its keep.
        </p>

        {/* 1. What they bought, before anything about fit. */}
        <div className="mt-8">
          <DeliveryBlock email={lead.email} />
        </div>

        {/* 2. The reason, named. */}
        <section
          className="mt-12 rounded-2xl border p-6 sm:p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            About the done-for-you engine
          </span>

          <h2
            className="mt-3 text-xl sm:text-2xl font-black leading-tight tracking-[-0.02em] text-white"
            style={OUTFIT}
          >
            {reason.heading}
          </h2>

          <p
            className="mt-4 text-sm sm:text-base leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.68)' }}
          >
            {reason.body}
          </p>

          <p
            className="mt-4 text-sm sm:text-base leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.68)' }}
          >
            We would rather tell you that now than take you onto a call and tell you at
            the end of it.
          </p>

          {/* 3. The refund line. */}
          <div
            className="mt-6 rounded-xl border p-4 sm:p-5"
            style={{
              background: 'rgba(16,185,129,0.06)',
              borderColor: 'rgba(16,185,129,0.22)',
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <span className="font-bold text-white">And if the guide is not worth it</span>
              {' '}— reply to your receipt within {ADVISORY_REFUND_DAYS} days and we refund you.
              No form, no questions. You keep the file either way.
            </p>
          </div>
        </section>

        {/* 4. Somewhere useful to go that is not a call. */}
        <section className="mt-10">
          <h2 className="text-lg font-black text-white" style={OUTFIT}>
            Worth your time instead
          </h2>

          <div className="mt-4 space-y-3">
            <Link
              href="/guides"
              className="flex items-start gap-3.5 rounded-xl border p-4 transition-colors hover:border-white/20"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <BookOpen size={18} className="mt-0.5 shrink-0 text-blue-400" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-white">The guides</span>
                <span className="mt-0.5 block text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  How firms move from filing work to advisory fees, written out in full.
                </span>
              </span>
              <ArrowRight size={16} className="ml-auto mt-1 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} aria-hidden="true" />
            </Link>
          </div>

          {/* The come-back-when trigger. */}
          <p
            className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <Mail size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              When that changes — you cross $400K, or the decision becomes yours —
              email <span className="font-semibold text-white/80">mail@nexli.net</span> and
              we will pick this up where we left off.
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}
