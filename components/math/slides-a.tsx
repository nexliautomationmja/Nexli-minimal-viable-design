'use client';

// The first half of /math: the title, how the math works, the three
// scenarios, the return, the front door and the one-stop shop. Also the two
// "where these numbers come from" slides, which are hidden from the deck
// (see SLIDES in app/math/math-deck). Copy is the PDF's
// (Nexli-See-The-Math.pdf); every figure comes from lib/see-the-math.
import React, { useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import { RimCard } from '@/components/funnel/primitives';
import {
  AD_SPEND,
  BACK_END_ANNUAL,
  BACK_END_MONTHLY,
  MONTHLY_TOTAL,
  PLAN_FEE,
  PLAN_FEE_HIGH,
  PLAN_FEE_LOW,
  SCENARIOS,
  SETUP_FEE,
  SHOW_RATE,
  chain,
  pct,
  scenarioById,
  usd,
  usdCompact,
  yearOneValue,
  type ScenarioId,
} from '@/lib/see-the-math';
import Columns, { LineKey, SwatchKey } from './Columns';
import StackedBars from './StackedBars';
import { FunnelDots, ScenarioToggle } from './ScenarioBits';
import { FloatingChain, ShimmerBadge, StepTile } from './ChainIcons';
import { usePrint } from './print';
import {
  Badge,
  Body,
  C,
  Callout,
  FAINT,
  GRADIENT_TEXT,
  HEADING,
  Heading,
  MUTED,
  PDF_HREF,
  PDF_NAME,
  Panel,
  Reveal,
  Slide,
  Src,
  type Who,
} from './ui';

const count = (n: number) => String(Math.round(n));

export function DownloadPdf({ className = '' }: { className?: string }) {
  return (
    <a
      href={PDF_HREF}
      download={PDF_NAME}
      className={`inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-5 text-sm font-semibold text-white/85 transition-colors hover:border-white/25 hover:bg-white/[0.09] hover:text-white ${className}`}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Download the PDF
    </a>
  );
}

// ── 1. Title ───────────────────────────────────────────────────────────────

export function TitleSlide() {
  const print = usePrint();
  return (
    <Slide id="top" className="pt-28 sm:pt-32">
      <Reveal>
        <ShimmerBadge>
          Digital Rainmaker System<span className="hidden sm:inline"> · See the math</span>
        </ShimmerBadge>
        <h1
          className="mt-5 max-w-5xl text-pretty text-[2.4rem] sm:text-6xl lg:text-[clamp(3.6rem,5.6vw,5.6rem)]"
          style={{ ...HEADING, lineHeight: 1.02 }}
        >
          What {usd(AD_SPEND)} a month in ads <span className={GRADIENT_TEXT}>can turn into.</span>
        </h1>
      </Reveal>

      {/* The chain floats under the headline on a phone, as the Rainmaker
          page's icons do, and beside the paragraph on a desktop, where it
          costs the slide no height. */}
      <div className="mt-7 flex flex-col gap-7 lg:mt-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <Reveal delay={0.08} className="order-2 lg:order-1">
          <p className="max-w-2xl text-base leading-relaxed sm:text-lg lg:text-xl" style={{ color: MUTED }}>
            Three scenarios from conservative to best case, why the back end is where your firm grows, and
            when you can expect to break even.
          </p>
        </Reveal>
        <div className="order-1 shrink-0 lg:order-2 lg:pr-2">
          <FloatingChain />
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-14 lg:gap-5">
        {SCENARIOS.map((s, i) => {
          const c = chain(s);
          const inner = (
            <>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300/90">{s.label}</div>
              <div className="mt-3 text-4xl font-black tracking-tight text-white lg:text-5xl">
                <AnimatedNumber value={c.newFees} format={usd} animateOnView duration={1100} />
              </div>
              <div className="mt-1 text-sm" style={{ color: MUTED }}>
                new fees a month
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-white/80">
                  {c.clients} clients a month
                </span>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-2.5 py-1 text-amber-200">
                  {c.multiple}× the investment
                </span>
              </div>
            </>
          );
          return (
            <Reveal key={s.id} delay={0.12 + i * 0.08}>
              {i === 0 ? (
                <RimCard innerClassName="p-5 sm:p-6" className="h-full">
                  {inner}
                </RimCard>
              ) : (
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">{inner}</div>
              )}
            </Reveal>
          );
        })}
      </div>

      {/* The download and the key hint: neither means anything in the PDF. */}
      {!print && (
        <Reveal delay={0.4} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-10">
          <DownloadPdf />
          {/* Shown only in presenting mode, where the keys are live (math-deck). */}
          <span className="deck-hint items-center gap-2 text-sm" style={{ color: FAINT }}>
            Press
            <kbd className="rounded-md border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-xs text-white/70">→</kbd>
            or
            <kbd className="rounded-md border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-xs text-white/70">space</kbd>
            to walk through the math
          </span>
        </Reveal>
      )}
    </Slide>
  );
}

// ── 2. How the math works ─────────────────────────────────────────────────

export function HowSlide() {
  const [id, setId] = useState<ScenarioId>('conservative');
  const s = scenarioById(id);
  const c = chain(s);

  const steps = [
    { n: 1, label: 'Ad spend', value: c.adSpend, fmt: usd, note: 'a month, every scenario' },
    { n: 2, label: 'Booked calls', value: c.bookedCalls, fmt: count, note: `${usd(AD_SPEND)} ÷ ${usd(s.costPerBookedCall)} a booked call` },
    { n: 3, label: 'Calls held', value: c.callsHeld, fmt: count, note: `${pct(SHOW_RATE)} of booked calls show up` },
    { n: 4, label: 'Clients signed', value: c.clients, fmt: count, note: `${c.callsHeld} calls × ${pct(s.closeRate)} close rate` },
    { n: 5, label: 'New fees', value: c.newFees, fmt: usd, note: `${c.clients} × ${usd(PLAN_FEE)} average plan` },
  ];

  return (
    <Slide id="how">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <Heading
          kicker="How the math works"
          sub={`Every scenario starts with the same ${usd(AD_SPEND)} a month in ads. What changes is what each booked call costs and how many calls turn into clients.`}
        >
          Five numbers <span className={GRADIENT_TEXT}>decide the result.</span>
        </Heading>
        <Reveal delay={0.1} className="shrink-0">
          <ScenarioToggle value={id} onChange={setId} layoutId="how-toggle" />
        </Reveal>
      </div>

      <Reveal delay={0.15} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-10 lg:grid-cols-5 lg:gap-0">
        {steps.map((st, i) => {
          const last = i === steps.length - 1;
          return (
            <div key={st.n} className={`relative flex ${last ? 'col-span-2 sm:col-span-1' : ''}`}>
              <div
                className={`flex w-full flex-col rounded-2xl border p-4 lg:p-5 ${
                  last ? 'border-cyan-400/60 bg-cyan-400/[0.07] shadow-[0_0_40px_-12px_rgba(34,211,238,0.5)]' : 'border-white/10 bg-white/[0.035]'
                }`}
              >
                <div className="pr-1.5 pt-1.5">
                  <StepTile index={i} popKey={`${id}-${st.n}`} />
                </div>
                <div className="mt-3 text-sm font-bold text-white">{st.label}</div>
                <div className="mt-1 text-3xl font-black tracking-tight text-white lg:text-[2.1rem]">
                  <AnimatedNumber value={st.value} format={st.fmt} duration={700} />
                </div>
                <div className="mt-1.5 text-[13px] leading-snug" style={{ color: MUTED }}>
                  {st.note}
                </div>
              </div>
              {!last && (
                <ArrowRight
                  aria-hidden="true"
                  className="mx-1.5 hidden h-4 w-4 shrink-0 self-center text-white/30 lg:block"
                />
              )}
            </div>
          );
        })}
      </Reveal>

      <div className="mt-5 grid gap-4 lg:mt-6 lg:grid-cols-[1.5fr_1fr] lg:gap-5">
        <Reveal delay={0.25}>
          <Panel title="Every booked call in a month" className="h-full">
            <FunnelDots booked={c.bookedCalls} held={c.callsHeld} signed={c.clients} />
          </Panel>
        </Reveal>
        <Reveal delay={0.32}>
          <Callout label="You don't need 100 leads" className="h-full">
            This isn&apos;t the bottom-of-the-barrel compliance game. At the conservative pace the whole
            case rests on <strong className="font-bold text-white">{chain(SCENARIOS[0]).bookedCalls} booked calls</strong>{' '}
            and <strong className="font-bold text-white">{chain(SCENARIOS[0]).clients} new clients a month</strong>.
          </Callout>
        </Reveal>
      </div>
    </Slide>
  );
}

// ── 3. The three scenarios ────────────────────────────────────────────────

export function ScenariosSlide() {
  const cols = ['Scenario', 'Ad spend', 'Cost per booked call', 'Booked calls', 'Calls held', 'Close rate', 'Clients', 'New fees a month'];
  // Below lg the same table turned on its side: the three scenarios are the
  // columns and the chain runs down the rows. The wide one needs 760px, so on
  // a phone it scrolled sideways with booked calls, close rate, clients and
  // new fees (the whole point of the slide) off the screen, and nothing to
  // say they were there.
  const rows: { label: string; value: (s: (typeof SCENARIOS)[number]) => React.ReactNode }[] = [
    { label: 'Ad spend', value: (s) => usd(chain(s).adSpend) },
    { label: 'Cost per booked call', value: (s) => usd(s.costPerBookedCall) },
    { label: 'Booked calls', value: (s) => chain(s).bookedCalls },
    { label: 'Calls held', value: (s) => chain(s).callsHeld },
    { label: 'Close rate', value: (s) => pct(s.closeRate) },
    { label: 'Clients', value: (s) => chain(s).clients },
  ];
  return (
    <Slide id="scenarios">
      <Heading kicker="Three scenarios">
        Same {usd(AD_SPEND)}. <span className={GRADIENT_TEXT}>Three ways it plays out.</span>
      </Heading>

      <Reveal delay={0.12} className="mt-8 lg:hidden">
        <div className="overflow-hidden rounded-2xl border border-white/10" style={{ background: 'rgba(10,16,32,0.7)' }}>
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[31%]" />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <td className="py-3.5 pl-4" />
                {SCENARIOS.map((s, i) => (
                  <th
                    key={s.id}
                    scope="col"
                    className={`py-3.5 pl-1 text-right text-[12px] font-bold leading-tight text-white sm:text-sm ${i === SCENARIOS.length - 1 ? 'pr-4' : 'pr-2'}`}
                  >
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-white/[0.06]">
                  <th
                    scope="row"
                    className="py-3 pl-4 pr-1 text-[10px] font-bold uppercase leading-snug tracking-[0.12em] text-cyan-400/90 sm:text-[11px]"
                  >
                    {r.label}
                  </th>
                  {SCENARIOS.map((s, i) => (
                    <td
                      key={s.id}
                      className={`py-3 pl-1 text-right text-[15px] text-white/80 sm:text-base ${i === SCENARIOS.length - 1 ? 'pr-4' : 'pr-2'}`}
                    >
                      {r.value(s)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-cyan-400/[0.06]">
                <th
                  scope="row"
                  className="py-4 pl-4 pr-1 text-[10px] font-bold uppercase leading-snug tracking-[0.12em] text-cyan-300 sm:text-[11px]"
                >
                  New fees a month
                </th>
                {SCENARIOS.map((s, i) => (
                  <td
                    key={s.id}
                    className={`py-4 pl-1 text-right text-[15px] font-black text-white sm:text-lg ${i === SCENARIOS.length - 1 ? 'pr-4' : 'pr-2'}`}
                  >
                    {usd(chain(s).newFees)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal delay={0.12} className="mt-8 hidden lg:mt-10 lg:block">
        <div className="overflow-x-auto rounded-2xl border border-white/10" style={{ background: 'rgba(10,16,32,0.7)' }}>
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                {cols.map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={`px-4 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-400/90 sm:text-[11px] lg:px-5 ${i === cols.length - 1 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {SCENARIOS.map((s, i) => {
                const c = chain(s);
                return (
                  <tr key={s.id} className={i < SCENARIOS.length - 1 ? 'border-b border-white/[0.06]' : ''}>
                    <th scope="row" className="px-4 py-5 text-base font-bold text-white lg:px-5 lg:text-lg">
                      {s.label}
                    </th>
                    {[usd(c.adSpend), usd(s.costPerBookedCall), c.bookedCalls, c.callsHeld, pct(s.closeRate), c.clients].map((v, j) => (
                      <td key={j} className="px-4 py-5 text-[15px] text-white/80 lg:px-5 lg:text-lg">
                        {v}
                      </td>
                    ))}
                    <td className="px-4 py-5 text-right text-lg font-black text-white lg:px-5 lg:text-2xl">{usd(c.newFees)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <Body className="mt-5 max-w-3xl">
          Calls and clients are rounded down. New fees use a {usd(PLAN_FEE)} average tax plan, the conservative
          end of a {usd(PLAN_FEE_LOW)}–{usd(PLAN_FEE_HIGH)} range.
        </Body>
      </Reveal>
    </Slide>
  );
}

// ── 4. The return ─────────────────────────────────────────────────────────

export function ReturnSlide() {
  const [cons, mod, best] = SCENARIOS.map(chain);
  return (
    <Slide id="return">
      <Heading kicker="New fees each month">
        Even the conservative pace brings in{' '}
        <span className={GRADIENT_TEXT}>{cons.multiple}× the monthly investment.</span>
      </Heading>

      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[1.65fr_1fr]">
        <Reveal delay={0.12}>
          <Panel title="New tax planning fees each month, once ads reach full pace">
            <div className="mb-2">
              <LineKey color={C.invest} dash="7 6" label={`Your investment: ${usd(MONTHLY_TOTAL)} a month`} sub={`incl. ${usd(AD_SPEND)} in ads`} />
            </div>
            <Columns
              caption="New tax planning fees each month by scenario"
              height={320}
              maxBar={84}
              yMax={100_000}
              ticks={[0, 25_000, 50_000, 75_000, 100_000]}
              tickFormat={usdCompact}
              refLines={[{ value: MONTHLY_TOTAL, color: C.invest }]}
              data={SCENARIOS.map((s) => {
                const c = chain(s);
                return {
                  key: s.id,
                  label: s.label,
                  sublabel: `${c.clients} clients a month`,
                  sublabelShort: `${c.clients} clients`,
                  value: c.newFees,
                  color: C.planning,
                  capLabel: usd(c.newFees),
                  capSub: `${c.multiple}× the investment`,
                  tip: { value: usd(c.newFees), label: `${s.label}: ${c.clients} clients × ${usd(PLAN_FEE)}` },
                };
              })}
            />
          </Panel>
        </Reveal>

        <Reveal delay={0.22}>
          <Callout label="The setup fee" className="h-full">
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>
              Once ads reach full pace, one month of new fees at the conservative pace covers the{' '}
              {usd(SETUP_FEE)} setup ({usd(cons.newFees)}).
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: 'Conservative', when: 'Within the first month', v: cons.newFees },
                { label: 'Moderate', when: 'About two weeks', v: mod.newFees },
                { label: 'Best case', when: 'About 10 days', v: best.newFees },
              ].map((r) => (
                <li key={r.label} className="flex items-baseline justify-between gap-3 border-t border-white/[0.08] pt-2.5">
                  <span className="text-sm" style={{ color: MUTED }}>
                    {r.label}
                  </span>
                  <span className="text-[15px] font-bold text-white">{r.when}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm" style={{ color: MUTED }}>
              The break-even slide at the end shows when you get there, ramp-up included.
            </p>
          </Callout>
        </Reveal>
      </div>
    </Slide>
  );
}

// ── Where the numbers come from (HIDDEN) ──────────────────────────────────
// SourcesSlide and ValueSourcesSlide are not in the deck since 2026-11-09:
// see SLIDES in app/math/math-deck to put them back.

const WEBTONIC = 'https://www.webtonic.io/blog/tax-accounting-facebook-ads-statistics';
const EIGHTX = 'https://eightx.co/blog/average-bookkeeping-cost-by-revenue-band';


/**
 * One assumption: the number, who moves it, and why it is set where it is.
 * Marcel walks a prospect through these one card at a time, so the lead
 * line is the sentence he says and the body is the reasoning behind it.
 */
function AssumptionCard({
  label,
  value,
  who,
  lead,
  note,
  delay,
  children,
}: {
  label: string;
  value: string;
  who: Who;
  lead: string;
  note?: React.ReactNode;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300/90">{label}</span>
          <Badge who={who} />
        </div>
        <div className="mt-3 text-3xl font-black tracking-tight text-white lg:text-[2.1rem]">{value}</div>
        <div className="mt-3 text-base font-bold leading-snug text-white">{lead}</div>
        <p className="mt-2.5 text-[14.5px] leading-relaxed" style={{ color: MUTED }}>
          {children}
        </p>
        {note && (
          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/[0.07] px-3.5 py-3 text-[13.5px] leading-relaxed text-white/90">
              {note}
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
}

const ASSUMPTIONS_SUB_1 =
  'You run numbers for a living, so here is every input and why it is set where it is. First: getting the right people onto your calendar.';

/** 5a. Cost per booked call, show rate, close rate: the order of the chain. */
export function SourcesSlide() {
  const [cons, , best] = SCENARIOS;
  return (
    <Slide id="sources">
      <Heading kicker="Where these numbers come from · 1 of 2" sub={ASSUMPTIONS_SUB_1}>
        Every assumption, <span className={GRADIENT_TEXT}>on the table.</span>
      </Heading>

      <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-3 lg:gap-5">
        <AssumptionCard
          delay={0.1}
          label="Cost per booked call"
          value={`${usd(best.costPerBookedCall)}–${usd(cons.costPerBookedCall)}`}
          who="NEXLI"
          lead={`Business owners worth ${usd(PLAN_FEE)} cost more to reach.`}
        >
          Tax and accounting appointment leads run <Src href={WEBTONIC}>$65–$150</Src>. We&apos;re after owners who can
          pay for real planning, and that audience costs more per call. We budget above the going rate on purpose, so
          the math still works if ads cost more than expected.
        </AssumptionCard>

        <AssumptionCard
          delay={0.18}
          label="Show rate"
          value={pct(SHOW_RATE)}
          who="NEXLI"
          lead="Our follow-up gives every lead a reason to show up."
        >
          Booked isn&apos;t held. Between the booking and the call, our automated follow-up keeps the reason they booked
          in front of them: the problem, the issue or the goal that made them raise their hand. It&apos;s the same
          reason you showed up to ours. We still plan on {Math.round((1 - SHOW_RATE) * 10)} in 10 not showing.
        </AssumptionCard>

        <AssumptionCard
          delay={0.26}
          label="Close rate"
          value={`${pct(cons.closeRate)}–${pct(best.closeRate)}`}
          who="YOU"
          lead="Qualified owners, but you won't close everyone."
          note={
            <>
              <strong className="font-bold text-white">Track it every month.</strong> If calls are happening and closes
              aren&apos;t, that points to the sales process, not the leads, and it&apos;s the first thing to fix.
            </>
          }
        >
          Every call has passed the qualifier, so you&apos;re talking to owners who fit. The same source puts appointment
          bookings at <Src href={WEBTONIC}>25–40%</Src>; we plan below that, because closing comes down to your sales
          process.
        </AssumptionCard>
      </div>
    </Slide>
  );
}

/** 5b. Tax plan, back end, take rate: what a signed client is worth. */
export function ValueSourcesSlide() {
  return (
    <Slide id="sources-value">
      <Heading
        kicker="Where these numbers come from · 2 of 2"
        sub="Then: what a signed client brings in, at the low end of every range."
      >
        What each client <span className={GRADIENT_TEXT}>is worth to you.</span>
      </Heading>

      <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-3 lg:gap-5">
        <AssumptionCard
          delay={0.1}
          label="Tax plan"
          value={usd(PLAN_FEE)}
          who="YOU"
          lead={`The conservative end of ${usd(PLAN_FEE_LOW)}–${usd(PLAN_FEE_HIGH)}.`}
        >
          Tax plans for business owners run {usd(PLAN_FEE_LOW)} to {usd(PLAN_FEE_HIGH)}. Every number here uses{' '}
          {usd(PLAN_FEE)}, near the bottom of that range, so a bigger engagement only moves the numbers up.
        </AssumptionCard>

        <AssumptionCard
          delay={0.18}
          label="Back end"
          value={`${usd(BACK_END_ANNUAL)} a year`}
          who="YOU"
          lead="Per client: bookkeeping plus payroll, at the low end."
        >
          Bookkeeping runs <Src href={EIGHTX}>from $1,500 a month</Src> to about $2,000 depending on the business, plus
          payroll, which depends on the business and its headcount. We count {usd(BACK_END_MONTHLY)} a month for both
          together, the low end for a $1M–$5M business. Compliance isn&apos;t counted.
        </AssumptionCard>

        <AssumptionCard
          delay={0.26}
          label="Take rate"
          value="Half"
          who="YOU"
          lead="Not everyone moves over. The ones who do are worth far more."
        >
          Some clients will keep their bookkeeper and payroll company. We assume half of your planning clients move
          theirs to you. Each one who does adds recurring revenue on top of the tax plan, so a one-time engagement
          becomes a client who pays you every month.
        </AssumptionCard>
      </div>
    </Slide>
  );
}

// ── 6. Tax planning is the front door ─────────────────────────────────────

export function FrontDoorSlide() {
  return (
    <Slide id="front-door">
      <Heading
        kicker="Tax planning is the front door"
        sub={`A ${usd(PLAN_FEE)} tax plan proves your expertise. Once a client trusts you, bundle in the work they already pay someone for: bookkeeping and payroll. For a business doing $1M or more, that's about ${usd(BACK_END_ANNUAL)} a year, recurring, for each client who takes it. Expect about half to.`}
      >
        Planning earns the trust. <span className={GRADIENT_TEXT}>The back end builds the firm.</span>
      </Heading>

      <Reveal delay={0.14} className="mt-8 lg:mt-10">
        <Panel title="Year-one value of one month's new clients, at full pace">
          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2">
            <SwatchKey color={C.planning} label={`Tax planning (${usd(PLAN_FEE)} a client)`} />
            <SwatchKey color={C.backEnd} label={`Bookkeeping and payroll (${usd(BACK_END_ANNUAL)} a year, half your clients)`} />
          </div>
          <StackedBars
            aLabel="Planning"
            bLabel="Back end"
            format={usd}
            rows={SCENARIOS.map((s) => {
              const v = yearOneValue(s);
              return { key: s.id, label: s.label, sublabel: `${chain(s).clients} clients`, a: v.planning, b: v.backEnd };
            })}
          />
        </Panel>
      </Reveal>
    </Slide>
  );
}

// ── 7. The one-stop shop ──────────────────────────────────────────────────

function Node({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-center text-[13px] font-medium text-white/85 sm:text-sm ${className}`}
    >
      {children}
    </div>
  );
}

function ClientDot() {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-white/25 bg-[#0b1220] text-sm font-bold text-white sm:h-24 sm:w-24 sm:text-base">
      Client
    </div>
  );
}

export function OneStopSlide() {
  return (
    <Slide id="one-stop-shop">
      <Heading kicker="Become the one-stop shop">
        Four providers today. <span className={GRADIENT_TEXT}>One firm: yours.</span>
      </Heading>

      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2">
        <Reveal delay={0.12}>
          <Panel className="h-full">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-300">Today: four providers</div>
            <div className="relative mx-auto mt-6 grid max-w-md grid-cols-[1fr_auto_1fr] grid-rows-[auto_auto_auto] items-center gap-x-3 gap-y-5 sm:gap-x-6">
              <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {[
                  [22, 14],
                  [78, 14],
                  [22, 86],
                  [78, 86],
                ].map(([x, y]) => (
                  <line key={`${x}-${y}`} x1="50" y1="50" x2={x} y2={y} stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
              <Node className="relative">Tax planner</Node>
              <span />
              <Node className="relative">Bookkeeper</Node>
              <span />
              <div className="relative flex justify-center">
                <ClientDot />
              </div>
              <span />
              <Node className="relative">Payroll company</Node>
              <span />
              <Node className="relative">Tax preparer</Node>
            </div>
            <Body className="mt-6 text-center">Four bills, four logins, four relationships.</Body>
          </Panel>
        </Reveal>

        <Reveal delay={0.2}>
          <Panel className="h-full">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">With you: one firm</div>
            <div className="mt-6 flex items-center gap-3 sm:gap-5">
              <ClientDot />
              <span aria-hidden="true" className="h-px w-6 shrink-0 bg-white/30 sm:w-10" />
              <div className="flex-1 rounded-2xl border border-cyan-400/50 bg-cyan-400/[0.05] p-4 shadow-[0_0_40px_-16px_rgba(34,211,238,0.6)]">
                <div className="mb-3 text-base font-bold text-white">Your firm</div>
                <div className="space-y-2">
                  <div className="rounded-lg px-3 py-2 text-sm font-bold text-white" style={{ background: C.planning }}>
                    Tax planning: the front door
                  </div>
                  {['Bookkeeping', 'Payroll', 'Compliance'].map((t) => (
                    <div key={t} className="rounded-lg px-3 py-2 text-sm font-bold text-white" style={{ background: C.backEnd }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Body className="mt-6 text-center">One relationship, one bill, one trusted advisor.</Body>
          </Panel>
        </Reveal>
      </div>
    </Slide>
  );
}
