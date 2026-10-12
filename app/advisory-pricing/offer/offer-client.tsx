'use client';

// ---------------------------------------------------------------------------
// Advisory funnel, page 2 — the $97 sales page.
//
// Built to the house visual standard set by components/demo/DemoExperience.tsx:
// animated rims over opaque interiors, in-card orbs, a two-card comparison as
// the climax, rounded-full buttons. Deliberately NO framer-motion entrances —
// the benchmark uses none, and a scroll stagger against a slow rotating rim
// reads as two design systems arguing.
//
// Every CTA is a real checkout button, not a #checkout anchor: an anchor adds
// a scroll and a second click to an impulse purchase. They all call the same
// re-entrant-guarded callback, and each renders its own error, so a Stripe
// failure shows up where the visitor actually clicked.
// ---------------------------------------------------------------------------

import React, { useCallback, useEffect, useState } from 'react';
import { BadgePercent, Check, Minus } from 'lucide-react';
import { ShimmerBadge } from '@/components/TransformationCards';
import AnimatedNumber from '@/components/AnimatedNumber';
import FunnelCta from '@/components/funnel/FunnelCta';
import DeadlineUrgency, { DeadlinePill } from '@/components/advisory/DeadlineUrgency';
import { AmbientGlow, OUTFIT, RimCard, SectionHeading } from '@/components/funnel/primitives';
import { generateEventId, trackMetaEvent } from '@/lib/meta-events';
import {
  ADVISORY_LIST_PRICE_DISPLAY,
  ADVISORY_PRICE_DISPLAY,
  ADVISORY_PRICE_VALUE,
  ADVISORY_SAVINGS_DISPLAY,
  ADVISORY_PRODUCT_ID,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_REFUND_DAYS,
} from '@/lib/advisory-config';

const MUTED = 'rgba(255,255,255,0.7)';

/** The hero strip. Every figure is either a price this site already uses or
 *  the literal cost of the product — nothing here is an invented statistic. */
const STRIP = [
  { value: 800, label: 'What you billed them', hint: 'the return you already file' },
  { value: 15000, label: 'What the planning prices at', hint: 'same client, same year', highlight: true },
  { value: ADVISORY_PRICE_VALUE, label: 'What this costs you', hint: `once, down from ${ADVISORY_LIST_PRICE_DISPLAY}` },
];

/** What they already own, and never used. */
const ALREADY_YOURS = [
  'Their full return — every number you would need to spot the opportunity',
  'Their entity structure, their K-1s, their depreciation schedule',
  'Years of history nobody else in the market can see',
  'A relationship warm enough to call them today',
];

const ADDS = [
  'The criteria that surface your top 20, and the sheet to list them on',
  'The call that books the meeting, word for word',
  'A fee table that turns projected savings into one fixed number',
];

const INCLUDED = [
  {
    title: 'Step one — find your top 20',
    text: 'The exact markers to look for on last year\u2019s returns: $250K+ net profit, large quarterly estimates, a big balance due, multiple entities. Plus the clients everyone skips — high-income W-2 earners, a spouse with a business. A blank twenty-row sheet to fill in.',
  },
  {
    title: 'Step two — the call that books the meeting',
    text: 'Thirty seconds, word for word. What to say when they ask what it costs. And the sentence that feels honest but costs you the client, which you must never say.',
  },
  {
    title: 'Step three — run it, price it, sign it',
    text: 'The two or three levers to show, a pricing table that turns projected savings into one fixed fee, and the five rules that keep it value pricing rather than a cut of the savings. Sign the letter in the meeting.',
  },
  {
    title: 'Five pages. Yours permanently.',
    text: 'A PDF. No login, no seat, no software to learn. Print it, work off it, use it on every client you have.',
  },
];

const FAQS = [
  {
    q: 'Is this a subscription?',
    a: `No. ${ADVISORY_PRICE_DISPLAY} once — down from ${ADVISORY_LIST_PRICE_DISPLAY} — and it is yours. Nothing recurring, nothing to cancel.`,
  },
  {
    q: 'What format is it?',
    a: 'A five-page PDF, emailed to you within a couple of minutes. No login, no software, nothing to learn.',
  },
  {
    q: 'What if it is not useful?',
    a: `Reply to your receipt within ${ADVISORY_REFUND_DAYS} days and we refund you. No form, no questions, and you keep the file.`,
  },
];

interface Props {
  firstName: string;
  cancelled: boolean;
  /**
   * Set when the visitor arrived straight from the qualifier having missed the
   * bar. This page is then a downsell, so it opens by naming the reason before
   * it sells anything — the same reason /next-steps gives, from lib/advisory-fit.
   */
  notAFit?: { heading: string; body: string } | null;
}

export default function AdvisoryOfferClient({ firstName, cancelled, notAFit = null }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackMetaEvent('ViewContent', {
      content_name: ADVISORY_PRODUCT_NAME,
      content_category: 'Advisory Funnel',
      content_ids: [ADVISORY_PRODUCT_ID],
    });
  }, []);

  const checkout = useCallback(async () => {
    if (pending) return;
    setPending(true);
    setError(null);

    // Browser pixel first, so the server CAPI event dedupes against it.
    const eventId = generateEventId();
    trackMetaEvent(
      'InitiateCheckout',
      { content_name: ADVISORY_PRODUCT_NAME, content_ids: [ADVISORY_PRODUCT_ID] },
      eventId,
    );

    try {
      const res = await fetch('/api/advisory-pricing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        checkoutUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Could not start checkout. Please try again.');
      }
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout. Please try again.');
      setPending(false);
    }
  }, [pending]);

  /** One factory so all four buttons stay identical and disable together. */
  const cta = (label: string, size: 'md' | 'lg' | 'sm' = 'md', block = true) => (
    <FunnelCta
      onClick={checkout}
      pending={pending}
      pendingLabel="Taking you to checkout..."
      error={error}
      size={size}
      block={block}
    >
      {label}
    </FunnelCta>
  );

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <AmbientGlow />

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-28 md:pt-32 pb-32 md:pb-24 space-y-14 md:space-y-16">
        {/* ── A. Hero ─────────────────────────────────────────────────── */}
        <section>
          {cancelled && (
            <p
              className="mb-6 max-w-3xl rounded-xl border px-4 py-3 text-sm"
              style={{
                background: 'rgba(251,191,36,0.08)',
                borderColor: 'rgba(251,191,36,0.3)',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              Checkout was cancelled — nothing was charged. Pick it back up whenever you like.
            </p>
          )}

          {/* The news first, then the offer. A firm that has just been told it
              is not a fit and is immediately sold to reads the whole page as
              the pitch it was being softened up for. Naming the reason costs
              one paragraph and is the difference. */}
          {notAFit && (
            <section
              className="mb-8 max-w-3xl rounded-2xl border p-5 sm:p-6"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                First, the straight answer
              </p>
              <h2 className="mt-2.5 text-lg sm:text-xl font-bold text-white" style={OUTFIT}>
                {notAFit.heading}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {notAFit.body}
              </p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                So we are not going to sell you the done-for-you engine. What is below is
                the same play our clients run, written so you can run it yourself on the
                book you already have — no ads, no retainer, no us.
              </p>
            </section>
          )}

          <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-[0.2em] text-[10px] font-black px-3.5 py-1.5">
            {ADVISORY_PRODUCT_NAME}
          </span>

          <h1
            className="mt-5 max-w-4xl text-[2rem] sm:text-4xl md:text-5xl font-black tracking-[-0.035em] leading-[1.05] text-white"
            style={OUTFIT}
          >
            {firstName ? `${firstName}, your ` : 'Your '}next{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #22d3ee)' }}
            >
              $60,000
            </span>{' '}
            is already in your client list.
          </h1>

          <p className="mt-5 max-w-3xl text-base md:text-lg leading-relaxed" style={{ color: MUTED }}>
            Your biggest clients write five- and six-figure cheques to the IRS every quarter,
            and you are the one person who sees those numbers. You filed their returns in March.
            You invoiced eight hundred dollars and said nothing about it.
          </p>

          <RimCard className="mt-10 md:mt-12 max-w-4xl">
            <div className="mb-4">
              <ShimmerBadge
                conicStops="#60a5fa, #a78bfa, #22d3ee, #60a5fa"
                starClass="text-blue-400 fill-blue-400"
                labelClass="text-blue-300"
              >
                The clients you already have
              </ShimmerBadge>
            </div>

            <h2
              className="text-xl sm:text-2xl md:text-[1.9rem] font-black tracking-[-0.03em] leading-[1.12] text-white"
              style={OUTFIT}
            >
              You do not have a lead problem. You have a list you never looked at properly.
            </h2>

            <p
              className="mt-2.5 text-base sm:text-lg font-black tracking-[-0.02em] bg-clip-text text-transparent"
              style={{
                ...OUTFIT,
                backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa, #22d3ee)',
              }}
            >
              Every one of them already trusts you with their numbers.
            </p>

            <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
              A three-step play: find the twenty clients sending the IRS the most money, make
              one call, then price it and sign it in the meeting. No ads, no new leads. Just the
              people already paying you.
            </p>

            {/* Counter strip — the whole price argument in three figures. */}
            <div
              className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-2 rounded-2xl border px-3.5 py-3.5"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              {STRIP.map((s) => (
                <div key={s.label}>
                  <p
                    className="text-[9px] font-black tracking-[0.15em] uppercase"
                    style={{ color: s.highlight ? '#60a5fa' : 'rgba(255,255,255,0.45)' }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="mt-1 text-base sm:text-xl font-black tracking-tight leading-none"
                    style={{ color: s.highlight ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
                  >
                    <AnimatedNumber
                      value={s.value}
                      format={(n) => `$${Math.round(n).toLocaleString('en-US')}`}
                      animateOnView
                      duration={1100}
                    />
                  </p>
                  <p className="mt-1 text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {s.hint}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              $15,000 is the average planning fee. The guide&apos;s pricing table tells you where
              a specific engagement lands — sometimes $4,000, sometimes well above $15,000.
            </p>

            <DeadlinePill className="mt-5" />

            <div className="mt-6">{cta('Show me who to call first', 'md')}</div>
          </RimCard>
        </section>

        {/* ── D. What is in it ─────────────────────────────────────────
            Four lines, not four cards. It is a five-page PDF; a page that
            works harder than the product it sells reads as overselling. */}
        <section>
          <SectionHeading eyebrow="What is in it" title="Five pages, and nothing you have to learn." />
          <ul className="mt-5 max-w-2xl space-y-2.5">
            {INCLUDED.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <Check size={17} className="mt-0.5 shrink-0 text-blue-400" aria-hidden="true" />
                <span className="text-sm sm:text-base leading-relaxed text-white/80">
                  <span className="font-bold text-white">{item.title}</span>
                  {' — '}
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── E. Price ─────────────────────────────────────────────────── */}
        <section>
          <RimCard className="max-w-4xl mx-auto" innerClassName="p-7 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
              <div>
                <h2
                  className="text-xl sm:text-2xl md:text-[1.9rem] font-black tracking-[-0.03em] leading-[1.12] text-white"
                  style={OUTFIT}
                >
                  One client priced properly pays for this fifty times over.
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  You do not need all twenty to sign. You need one name off that sheet and one
                  conversation you were never going to have otherwise.
                </p>
              </div>

              <div className="text-center md:text-right">
                <p
                  className="text-[11px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  One payment
                </p>
                <div className="mt-2 flex items-baseline justify-center md:justify-end gap-2.5">
                  {/* A real former price, not an invented anchor. The
                      aria-label spells it out, because a line through a
                      number means nothing read aloud. */}
                  <span
                    className="text-2xl sm:text-3xl font-bold line-through decoration-2"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    aria-label={`Was ${ADVISORY_LIST_PRICE_DISPLAY}`}
                  >
                    {ADVISORY_LIST_PRICE_DISPLAY}
                  </span>
                  <span className="text-5xl sm:text-6xl font-black text-white" style={OUTFIT}>
                    {ADVISORY_PRICE_DISPLAY}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    once
                  </span>
                </div>
                <p className="mt-2.5 flex items-center justify-center md:justify-end gap-1.5 text-sm font-bold text-emerald-400">
                  <BadgePercent size={15} aria-hidden="true" />
                  You save {ADVISORY_SAVINGS_DISPLAY}
                </p>
                <div className="mt-6 flex md:justify-end">{cta('Get the guide', 'md')}</div>
                <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Secure checkout by Stripe · {ADVISORY_REFUND_DAYS}-day refund, no questions
                </p>
                <div className="mt-4 flex md:justify-end">
                  <DeadlinePill />
                </div>
              </div>
            </div>
          </RimCard>
        </section>

        {/* ── F. FAQ ───────────────────────────────────────────────────── */}
        <section>
          <SectionHeading eyebrow="Before you buy" title="The things people ask." />
          <div className="mt-8 max-w-3xl space-y-3">
            {FAQS.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border p-5"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <p className="text-sm font-bold text-white" style={OUTFIT}>
                  {f.q}
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── H. Sticky mobile CTA ───────────────────────────────────────── */}
      <div
        className="md:hidden fixed inset-x-0 bottom-0 z-[100] px-4 py-3"
        style={{
          background: 'rgba(10,15,28,0.92)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          // env() resolves to 0 today (no viewport-fit=cover in layout), so the
          // 1rem floor is what actually does the work. Improves automatically
          // if that viewport export is ever added.
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <FunnelCta
          onClick={checkout}
          pending={pending}
          pendingLabel="Taking you to checkout..."
          size="sm"
          block={false}
          className="w-full"
        >
          Get the guide — {ADVISORY_PRICE_DISPLAY}
        </FunnelCta>
      </div>
    </div>
  );
}
