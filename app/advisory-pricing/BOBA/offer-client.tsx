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
import MuxPlayer from '@mux/mux-player-react';
import { BadgePercent } from 'lucide-react';
import FunnelCta from '@/components/funnel/FunnelCta';
import { DeadlinePill } from '@/components/advisory/DeadlineUrgency';
import { AmbientGlow, OUTFIT, RimCard } from '@/components/funnel/primitives';
import { generateEventId, trackMetaEvent } from '@/lib/meta-events';
import {
  ADVISORY_LIST_PRICE_DISPLAY,
  ADVISORY_PRICE_DISPLAY,
  ADVISORY_OFFER_VIDEO_PLAYBACK_ID,
  ADVISORY_OFFER_VIDEO_TITLE,
  ADVISORY_SAVINGS_DISPLAY,
  ADVISORY_PRODUCT_ID,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_REFUND_DAYS,
} from '@/lib/advisory-config';

const MUTED = 'rgba(255,255,255,0.7)';


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

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-20 md:pt-24 pb-32 md:pb-20 space-y-8 md:space-y-10">
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

          {/* One line, not a eulogy. The old block ran an eyebrow, a
              heading, the reason and a paragraph of reassurance before the
              offer — four times the words needed to say the thing, on a
              page selling a $97 PDF. */}
          <div className="flex flex-wrap items-center gap-2">
          {notAFit && (
            <p
              className="inline-flex rounded-full border px-4 py-1.5 text-xs sm:text-sm font-semibold"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              Not a fit right now for the done-for-you engine.
            </p>
          )}

          <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-[0.2em] text-[10px] font-black px-3.5 py-1.5">
            {ADVISORY_PRODUCT_NAME}
          </span>
          </div>

          <h1
            className="mt-4 max-w-4xl text-[2rem] sm:text-4xl md:text-5xl font-black tracking-[-0.035em] leading-[1.05] text-white"
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

          <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed" style={{ color: MUTED }}>
            Your biggest clients write five- and six-figure cheques to the IRS every quarter,
            and you are the one person who sees those numbers. You filed their returns in March.
            You invoiced eight hundred dollars and said nothing about it.
          </p>

          {/*
            The VSL, where a 400-line pitch panel used to be.

            That panel restated the whole argument — a second headline, a
            three-step play, a counter strip, a deadline — above a $97 PDF.
            The video makes the case better and in less space, so the page
            is now: what it is, watch, buy. Nothing between the headline and
            the price that the video does not already cover.
          */}
          <div className="mt-6 md:mt-7 mx-auto max-w-4xl overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--glass-border)] shadow-2xl">
            <MuxPlayer
              playbackId={ADVISORY_OFFER_VIDEO_PLAYBACK_ID}
              metadata={{ video_title: ADVISORY_OFFER_VIDEO_TITLE }}
              streamType="on-demand"
              // Mux serves a mid-video frame without this, captions and all.
              thumbnailTime={0}
              accentColor="#2563eb"
              style={{ aspectRatio: '16/9', width: '100%', display: 'block' }}
            />
          </div>
        </section>

        {/* ── E. Price ─────────────────────────────────────────────────── */}
        <section>
          <RimCard className="max-w-4xl mx-auto" innerClassName="p-5 sm:p-7">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
              <div>
                <h2
                  className="text-xl sm:text-2xl md:text-[1.9rem] font-black tracking-[-0.03em] leading-[1.12] text-white"
                  style={OUTFIT}
                >
                  One client priced properly pays for this fifty times over.
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  You do not need your whole book to sign. You need one name off that sheet and one
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
