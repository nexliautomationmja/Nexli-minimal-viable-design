'use client';

// ---------------------------------------------------------------------------
// Advisory funnel, page 2 — the $297 sales page.
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
import { Check, Minus } from 'lucide-react';
import { ShimmerBadge } from '@/components/TransformationCards';
import AnimatedNumber from '@/components/AnimatedNumber';
import FunnelCta from '@/components/funnel/FunnelCta';
import DeadlineUrgency, { DeadlinePill } from '@/components/advisory/DeadlineUrgency';
import { AmbientGlow, OUTFIT, RimCard, SectionHeading } from '@/components/funnel/primitives';
import { generateEventId, trackMetaEvent } from '@/lib/meta-events';
import {
  ADVISORY_PRICE_DISPLAY,
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
  { value: 297, label: 'What this costs you', hint: 'once, yours permanently' },
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
    q: 'Does it work on clients I already have?',
    a: 'That is the entire point. There is no prospecting in it. You open last year\u2019s returns, pull the twenty clients sending the IRS the most money, and start there.',
  },
  {
    q: 'Is this a subscription?',
    a: `No. ${ADVISORY_PRICE_DISPLAY} once, and it is yours. Nothing recurring, nothing to cancel.`,
  },
  {
    q: 'What format is it?',
    a: 'A five-page PDF. Download it, print it, work straight off it. Nothing to install and nothing to learn.',
  },
  {
    q: 'How fast do I get it?',
    a: 'It is emailed to you the moment you pay — it lands within a couple of minutes. Check spam if it has not shown up, and we will resend it if anything goes wrong.',
  },
  {
    q: 'What if it is not useful?',
    a: `Reply to your receipt within ${ADVISORY_REFUND_DAYS} days and we refund it. No form, no questions.`,
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

        {/* ── B. The accusation (the light breather) ───────────────────── */}
        <section>
          <SectionHeading
            eyebrow="How it actually happened"
            title="Nobody took the work from you. You gave it away at the counter."
            sub="Not through laziness, and not because you missed something technical. Because filing season is a conveyor belt and nothing on it ever asks the question."
          />
          <ol className="mt-8 max-w-3xl space-y-5">
            {[
              {
                n: '01',
                t: 'You saw the number.',
                b: 'It was on the return. A six-figure earner in the wrong entity, no retirement vehicle, no planning of any kind. You typed it into a form.',
              },
              {
                n: '02',
                t: 'You knew what to do about it.',
                b: 'You have known for years. The restructure, the timing, the elections. None of it is a mystery to you — it is just not what you were hired for that week.',
              },
              {
                n: '03',
                t: 'You filed it and invoiced $800.',
                b: 'Then you did it again for the next one. Somewhere in that stack were the ten clients who would have paid you properly if anyone had raised it.',
              },
            ].map((row) => (
              <li key={row.n} className="flex items-start gap-4">
                <span
                  className="mt-0.5 shrink-0 text-[11px] font-black tracking-[0.2em]"
                  style={{ color: 'rgba(96,165,250,0.7)' }}
                >
                  {row.n}
                </span>
                <span>
                  <span className="block text-base sm:text-lg font-bold text-white" style={OUTFIT}>
                    {row.t}
                  </span>
                  <span className="mt-1 block text-sm sm:text-base leading-relaxed" style={{ color: MUTED }}>
                    {row.b}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── C. The comparison — the climax ───────────────────────────── */}
        <section>
          <SectionHeading
            align="center"
            eyebrow="The same client, twice"
            title="One tax year. Two invoices."
            sub="If you have ever saved a client $50,000 in tax, you already know what the work was worth. You invoiced $800 for it."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Left — what they settle for. */}
            <div
              className="rounded-3xl border p-6 sm:p-8"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <p
                className="text-[11px] font-black uppercase tracking-[0.2em]"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                What you do today
              </p>
              <h3 className="mt-2 text-xl sm:text-2xl font-black text-white" style={OUTFIT}>
                Everything you need, already in the file.
              </h3>
              <ul className="mt-5 space-y-2.5">
                {ALREADY_YOURS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: MUTED }}>
                    <Minus
                      size={15}
                      className="mt-0.5 shrink-0"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <p
                  className="text-[11px] font-black uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  One client, one tax year
                </p>
                <p
                  className="mt-1 text-4xl sm:text-5xl font-black"
                  style={{ color: 'rgba(255,255,255,0.35)', ...OUTFIT }}
                >
                  $800
                </p>
                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Filing the return. What you invoiced.
                </p>
              </div>
            </div>

            {/* Right — the same client, priced. */}
            <RimCard innerClassName="p-6 sm:p-8">
              <p
                className="text-[11px] font-black uppercase tracking-[0.2em]"
                style={{ color: '#60a5fa' }}
              >
                What the play changes
              </p>
              <h3 className="mt-2 text-xl sm:text-2xl font-black text-white" style={OUTFIT}>
                The same file, read as a sales document.
              </h3>
              <ul className="mt-5 space-y-2.5">
                {ADDS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white">
                    <Check size={15} className="mt-0.5 shrink-0" style={{ color: '#34d399' }} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p
                  className="text-[11px] font-black uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  One client, one tax year
                </p>
                <p className="mt-1 text-4xl sm:text-5xl font-black text-white" style={OUTFIT}>
                  $15,000
                </p>
                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Pricing the tax position. Same client, same year.
                </p>
              </div>
            </RimCard>
          </div>

          {/* The honesty line. Without it the $15,000 reads as a promise. */}
          <div
            className="mt-5 max-w-3xl mx-auto rounded-2xl border px-4 py-4"
            style={{ background: 'rgba(52,211,153,0.07)', borderColor: 'rgba(52,211,153,0.3)' }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <span className="font-bold text-white">To be straight about it:</span> $15,000 is
              the typical planning fee, not a number every client supports. The pricing table
              tells you when the honest answer is $4,000 — and when projected savings clear
              $75,000, it tells you to quote well above $15,000.
              <span className="mt-2 block" style={{ color: 'rgba(255,255,255,0.6)' }}>
                The $60,000 assumes you call twenty clients and four of them sign at the average
                fee. At $7,000–$12,000 each, those same four are $28,000–$48,000. It is a worked
                example, not a promise.
              </span>
            </p>
          </div>

          <div className="mt-8 flex justify-center">{cta('Price my book', 'lg', false)}</div>
        </section>

        {/* ── D. What you get ──────────────────────────────────────────── */}
        <section>
          <SectionHeading
            eyebrow="What you actually get"
            title="Five pages. Three steps. No software."
            sub="Open it, pull twenty names off last year's returns, and make the first call today."
          />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {INCLUDED.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border p-6 sm:p-7"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 inline-flex w-6 h-6 shrink-0 rounded-full items-center justify-center"
                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                  >
                    <Check size={14} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white" style={OUTFIT}>
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: MUTED }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── D2. The deadline ─────────────────────────────────────────── */}
        <section>
          <DeadlineUrgency className="max-w-3xl" />
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
                <div className="mt-2 flex items-baseline justify-center md:justify-end gap-2">
                  <span className="text-5xl sm:text-6xl font-black text-white" style={OUTFIT}>
                    {ADVISORY_PRICE_DISPLAY}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    once
                  </span>
                </div>
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

        {/* ── G. Close ─────────────────────────────────────────────────── */}
        <section>
          <div
            className="rounded-3xl border px-6 sm:px-10 py-10 sm:py-14 text-center"
            style={{
              background:
                'linear-gradient(140deg, rgba(37,99,235,0.18) 0%, rgba(255,255,255,0.03) 55%, rgba(6,182,212,0.12) 100%)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <h2
              className="mx-auto max-w-3xl text-2xl sm:text-3xl md:text-[2.5rem] font-black tracking-[-0.03em] leading-[1.1] text-white"
              style={OUTFIT}
            >
              Next April you will file those same returns again.
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed"
              style={{ color: MUTED }}
            >
              Same clients, same numbers, same eight hundred dollars — and by then the only
              year you could still have changed is closed. What lands on that return is
              decided before December 31, not in April.
            </p>
            <div className="mt-7 flex justify-center">{cta('Price my book', 'lg', false)}</div>
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
