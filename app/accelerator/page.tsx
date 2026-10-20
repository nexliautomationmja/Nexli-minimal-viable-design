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
import { AGENCY_ENGAGEMENT_LOW } from '@/lib/agency-offer';
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
    `A free playbook for CPA firms: how to find the ${ACCELERATOR_TOP_N} clients on your own books who are overpaying tax, what to charge them for planning, and how to have the conversation.`,
  alternates: { canonical: `${SITE_URL}/accelerator` },
};

const STEPS = [
  {
    n: '01',
    title: 'Pull the twenty',
    body: `Which of your clients are overpaying, and how to spot them from returns you have already filed.`,
  },
  {
    n: '02',
    title: 'Price the work',
    body: 'What a planning engagement is worth, and how to say the number out loud without flinching.',
  },
  {
    n: '03',
    title: 'Have the conversation',
    body: 'The approach that turns a compliance client into a planning client.',
  },
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
              Send me the Accelerator
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
            The worked example
          </p>

          <div className="mt-5 space-y-3.5">
            {[
              [String(ACCELERATOR_TOP_N), 'your highest-income clients. You know who they are.'],
              [String(CONSERVATIVE_COUNT), `say yes to a planning engagement.`],
              [usd(ACCELERATOR_TARGET), `at ${usd(AGENCY_ENGAGEMENT_LOW)} each, the bottom of the range.`],
            ].map(([figure, label]) => (
              <div key={label} className="flex items-baseline gap-3">
                <span
                  className="shrink-0 text-xl sm:text-2xl font-black tabular-nums"
                  style={{ ...OUTFIT, color: '#4ade80' }}
                >
                  {figure}
                </span>
                <span className="text-sm sm:text-base leading-relaxed text-white/70">{label}</span>
              </div>
            ))}
          </div>

          {/* Both hedges. Do not remove either — see the header comment. */}
          <p className="mt-6 pt-5 border-t border-white/10 text-sm leading-relaxed text-white/60">
            {/* Spelled out rather than derived: "one-in-5" reads as a
                product code. The figure above IS derived, so the two only
                disagree if ACCELERATOR_CLOSE_RATE moves off 0.2 — if it
                ever does, this word changes with it. */}
            <strong className="text-white">
              That one-in-five is an assumption, not a promise.
            </strong>{' '}
            It is there to show you the shape; your number will be your own. At
            the guide&rsquo;s more conservative band &mdash; {CONSERVATIVE_COUNT}{' '}
            engagements at {usd(ACCELERATOR_LOW_FEE)} to {usd(ACCELERATOR_HIGH_FEE)}{' '}
            &mdash; it is {usd(CONSERVATIVE_LOW)} to {usd(CONSERVATIVE_HIGH)} from a
            list you already own.
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

          <div className="mt-9 grid gap-4 sm:gap-5">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <span
                  className="shrink-0 text-base font-black tabular-nums"
                  style={{ ...OUTFIT, color: '#4ade80' }}
                >
                  {s.n}
                </span>
                <div>
                  <p className="text-base sm:text-lg font-black text-white" style={OUTFIT}>
                    {s.title}
                  </p>
                  <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-white/65">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-base leading-relaxed text-white/65">
            No ad spend. No funnel. No system to buy. A list, a script, and{' '}
            {CONSERVATIVE_COUNT} conversations you were always allowed to have.
          </p>

          <div className="mt-9 flex justify-center">
            <FunnelCta href={ACCELERATOR_QUALIFY_PATH} size="lg">
              Send me the Accelerator
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
