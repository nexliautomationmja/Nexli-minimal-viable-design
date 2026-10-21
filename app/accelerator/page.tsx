// ---------------------------------------------------------------------------
// The Accelerator funnel, page 1 — the free offer. This is the ad
// destination.
//
// CRAWLABLE, unlike every other page in this funnel. It is a legitimate
// free-resource page for a CPA firm and there is no reason to hide it from
// search; the three pages behind it are in robots.ts DISALLOW.
//
// THE NUMBER IS A WORKED EXAMPLE AND THIS PAGE MUST SAY SO. ACCELERATOR_TARGET
// is ACCELERATOR_TOP_N clients x ACCELERATOR_CLOSE_RATE x the engagement
// floor, and lib/advisory-config.ts states outright that the close rate is
// an ASSUMPTION, not a promise. Both hedges below are load-bearing: the
// sentence naming it an assumption, and the conservative band underneath.
// Putting an unhedged $60,000 on a page aimed at accountants — people who
// audit numbers for a living — loses the room, quite apart from being
// untrue.
//
// ONE CTA, repeated. Everything points at the qualifier; there is nothing
// else to click, because the only conversion this page has is a lead.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import FunnelLogo from '@/components/FunnelLogo';
import FunnelCta from '@/components/funnel/FunnelCta';
import { AmbientGlow, CANVAS, OUTFIT, RimCard } from '@/components/funnel/primitives';
import {
  ACCELERATOR_CLOSE_RATE,
  ACCELERATOR_HIGH_FEE,
  ACCELERATOR_LOW_FEE,
  ACCELERATOR_TARGET,
  ACCELERATOR_TOP_N,
} from '@/lib/advisory-config';
import { ACCELERATOR_QUALIFY_PATH } from '@/lib/accelerator-config';
import { SITE_URL } from '@/lib/site';

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** Four engagements at the guide's conservative band, not its headline one. */
const CONSERVATIVE_COUNT = Math.round(ACCELERATOR_TOP_N * ACCELERATOR_CLOSE_RATE);
const CONSERVATIVE_LOW = CONSERVATIVE_COUNT * ACCELERATOR_LOW_FEE;
const CONSERVATIVE_HIGH = CONSERVATIVE_COUNT * ACCELERATOR_HIGH_FEE;

export const metadata: Metadata = {
  title: `The Book of Business Accelerator | Free for CPA firms | Nexli`,
  description:
    `A free playbook for CPA firms: how to pull up to ${usd(ACCELERATOR_TARGET)} out of the book of business you already have. No ads, no funnel, no system to buy.`,
  alternates: { canonical: `${SITE_URL}/accelerator` },
};

/**
 * Three questions it ANSWERS, not three steps it tells you to take.
 *
 * This section used to be the method - pull the twenty, price the work,
 * have the conversation - which is the guide's actual content laid out
 * on a page you can read without downloading anything. Naming what a
 * reader will know afterwards sells it; naming what to do removes the
 * reason to open the file.
 */
const ANSWERS = [
  'Which of the clients already on your books are quietly overpaying',
  'What that planning work is genuinely worth, and what to charge for it',
  'How to raise it with a compliance client without it feeling like a sale',
];

export default function AcceleratorLandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: CANVAS }}>
      <FunnelLogo />
      <AmbientGlow />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-6 pt-24 md:pt-28 pb-12 md:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 uppercase tracking-[0.2em] text-[10px] font-black px-3.5 py-1.5">
            Free — no card
          </span>

          <h1
            className="mt-6 text-3xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[1.04] text-white"
            style={OUTFIT}
          >
            Get an extra{' '}
            <span style={{ color: '#4ade80' }}>{usd(ACCELERATOR_TARGET)}</span> out
            of the book of business you already have.
          </h1>

          <p
            className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Not new clients. The ones whose returns you are already filing &mdash;
            who are overpaying tax right now and have never been offered a plan.
          </p>

          <div className="mt-9 flex justify-center">
            <FunnelCta href={ACCELERATOR_QUALIFY_PATH} size="lg">
              Download it for free
            </FunnelCta>
          </div>

          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Five questions, about a minute. It arrives by email.
          </p>
        </div>
      </section>

      {/* ── The maths, hedged ────────────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-6 pb-14 md:pb-20">
        <RimCard className="mx-auto max-w-2xl" innerClassName="p-6 sm:p-9">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
            What it shows you
          </p>

          {/* The promise, not the derivation. The old version printed
              "20 clients x 4 say yes x $15,000" down the page, which is
              the guide's own arithmetic - readable, memorable, and
              enough to skip the download. The number survives; the
              method does not. */}
          <p
            className="mt-4 text-xl sm:text-2xl md:text-3xl font-black leading-[1.15] text-white"
            style={OUTFIT}
          >
            How to pull up to{' '}
            <span style={{ color: '#4ade80' }}>{usd(ACCELERATOR_TARGET)}</span>{' '}
            that is already hiding in your existing book of business.
          </p>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
            No ads, no funnel, no system to buy. The clients are people whose
            returns you are already filing.
          </p>

          {/* Both hedges. Do not remove either — see the header comment. */}
          <p className="mt-6 pt-5 border-t border-white/10 text-sm leading-relaxed text-white/60">
            {/* Spelled out rather than derived: "one-in-5" reads as a
                product code. The figure above IS derived, so the two only
                disagree if ACCELERATOR_CLOSE_RATE moves off 0.2 — if it
                ever does, this word changes with it. */}
            <strong className="text-white">
              {usd(ACCELERATOR_TARGET)} is a worked example, not a promise.
            </strong>{' '}
            It assumes a close rate the guide states plainly, and your number
            will be your own. On its more conservative band it is{' '}
            {usd(CONSERVATIVE_LOW)} to {usd(CONSERVATIVE_HIGH)} &mdash; still
            from clients you already have.
          </p>
        </RimCard>
      </section>

      {/* ── What is in it ────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-6 pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-2xl sm:text-3xl md:text-[2.5rem] font-black tracking-[-0.03em] leading-[1.08] text-white text-center"
            style={OUTFIT}
          >
            A method, not a motivational PDF.
          </h2>

          <p className="mt-5 text-center text-base sm:text-lg leading-relaxed text-white/70">
            By the end of it you will know:
          </p>

          <div className="mt-7 grid gap-3 sm:gap-4">
            {ANSWERS.map((a) => (
              <div
                key={a}
                className="flex gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-lg font-black leading-none"
                  style={{ color: '#4ade80' }}
                >
                  &rarr;
                </span>
                <p className="text-sm sm:text-base leading-relaxed text-white/75">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex justify-center">
            <FunnelCta href={ACCELERATOR_QUALIFY_PATH} size="lg">
              Download it for free
            </FunnelCta>
          </div>

          <p className="mt-4 text-center text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Free. We do not ask for a card, because there is nothing to pay for.
          </p>
        </div>
      </section>
    </main>
  );
}
