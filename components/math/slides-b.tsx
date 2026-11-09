'use client';

// The second half of /math: who does what, the first 90 days, what you
// invest, your clients paying for the system, break-even and the close. Also
// the stacking back end, which is hidden from the deck (see SLIDES in
// app/math/math-deck).
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedNumber from '@/components/AnimatedNumber';
import {
  Bot,
  Briefcase,
  CalendarCheck,
  Download,
  Filter,
  Globe,
  Handshake,
  Layers,
  Megaphone,
} from 'lucide-react';
import { RimCard } from '@/components/funnel/primitives';
import {
  AD_SPEND,
  BACK_END_ANNUAL,
  MONTHLY_TOTAL,
  MONTHS,
  PLANS,
  PLAN_FEE,
  PLAN_FEE_HIGH,
  PLAN_FEE_LOW,
  RETENTION,
  RETENTION_BENCHMARK,
  RETENTION_SOURCE,
  SCENARIOS,
  SETUP_FEE,
  TAKE_RATE,
  aboutThousands,
  annualAheadFromMonth,
  backEndAnnualAfter,
  backEndBilledIn,
  breakEvenMonth,
  chain,
  clientsBy,
  clientsSignedIn,
  netSeries,
  pct,
  recurringBook,
  scenarioById,
  usd,
  usdCompact,
  yearOneCost,
  type Plan,
  type ScenarioId,
} from '@/lib/see-the-math';
import BreakEvenChart from './BreakEvenChart';
import CoverChart from './CoverChart';
import { ScenarioToggle } from './ScenarioBits';
import { usePdfHref } from './pdf-link';
import { usePrint } from './print';
import { SITE_URL } from '@/lib/site';
import Columns, { LineKey } from './Columns';
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
  PDF_NAME,
  Panel,
  Reveal,
  Slide,
  Src,
  useSeen,
  type Who,
} from './ui';

const CONS = SCENARIOS[0];
const BEST = SCENARIOS[2];
const months = Array.from({ length: MONTHS }, (_, i) => i + 1);

// ── Every month's clients stack (HIDDEN) ──────────────────────────────────
// Not in the deck since 2026-11-09: see SLIDES in app/math/math-deck to put
// it back.

export function StackSlide() {
  const pace = chain(CONS).clients;
  const by12 = clientsBy(CONS, MONTHS);
  const labelled = new Set([2, 6, 12]);
  return (
    <Slide id="stack">
      <Heading
        kicker="Why the back end matters"
        sub={`Every client you sign pays you for a tax plan once. Sell them bookkeeping and payroll too, and they pay you every month. Here's what that adds up to at the conservative pace of ${pace} new clients a month, if half of them say yes.`}
      >
        Every month&apos;s clients <span className={GRADIENT_TEXT}>stack on top of the last.</span>
      </Heading>

      <Reveal delay={0.14} className="mt-8 lg:mt-10">
        <Panel title="Bookkeeping and payroll a year, conservative pace, half your clients taking it">
          <Columns
            caption="Yearly bookkeeping and payroll value after each month, conservative pace"
            xTitle="Month"
            height={236}
            maxBar={30}
            yMax={250_000}
            ticks={[0, 50_000, 100_000, 150_000, 200_000, 250_000]}
            tickFormat={usdCompact}
            data={months.map((m) => {
              const v = backEndAnnualAfter(CONS, m);
              return {
                key: String(m),
                label: m === MONTHS ? `${m}` : String(m),
                value: v,
                color: C.backEnd,
                capLabel: labelled.has(m) ? usd(v) : undefined,
                tip: { value: `${usd(v)} a year`, label: `After month ${m}: ${clientsBy(CONS, m) * TAKE_RATE} clients on the bundle` },
              };
            })}
          />
        </Panel>
      </Reveal>

      {/* The two reasons a firm owner should care about this chart, in plain
          terms: more revenue now, and a firm worth more later. */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2 lg:gap-5">
        <Reveal delay={0.22} className="h-full">
          <Callout label="It adds to your top line" className="h-full">
            After 12 months, {by12} planning clients, {by12 * TAKE_RATE} of them on bookkeeping and payroll, bring in
            about <strong className="font-bold text-white">{usd(backEndAnnualAfter(CONS, MONTHS))} a year</strong> in
            back-end work alone. That&apos;s on top of every tax plan, and it repeats every year they stay.
          </Callout>
        </Reveal>
        <Reveal delay={0.3} className="h-full">
          <Callout label="It makes your firm worth more" tone="emerald" className="h-full">
            Recurring revenue is what makes a firm valuable. A firm that gets paid every month is worth more than one
            that starts from zero every January, whether you sell it, borrow against it or bring in a partner.
          </Callout>
        </Reveal>
      </div>
    </Slide>
  );
}

// ── 9. Who does what ──────────────────────────────────────────────────────

export function WhoSlide() {
  const nexli = [
    { icon: Globe, t: 'Website and funnel' },
    { icon: Filter, t: 'The qualifier that screens out bad fits' },
    { icon: Bot, t: 'Client portal and AI automations' },
    { icon: Megaphone, t: 'Ads, creative testing and scaling' },
  ];
  const you = [
    { icon: CalendarCheck, t: 'Every sales call on your calendar' },
    { icon: Handshake, t: 'Selling the tax plan' },
    { icon: Layers, t: 'Upselling bookkeeping, payroll and compliance' },
    { icon: Briefcase, t: 'Delivering the work' },
  ];
  const col = (title: string, items: typeof nexli, tone: 'cyan' | 'emerald') => (
    <Panel className="h-full">
      <div className={`text-[11px] font-bold uppercase tracking-[0.16em] ${tone === 'cyan' ? 'text-cyan-300' : 'text-emerald-300'}`}>
        {title}
      </div>
      <ul className="mt-5 space-y-3">
        {items.map(({ icon: Icon, t }) => (
          <li key={t} className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                tone === 'cyan' ? 'bg-cyan-400/10 text-cyan-300' : 'bg-emerald-400/10 text-emerald-300'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-[15px] font-semibold text-white/90 sm:text-base">{t}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
  return (
    <Slide id="who-does-what">
      <Heading kicker="Who does what">
        We build and run the machine. <span className={GRADIENT_TEXT}>You run the calls.</span>
      </Heading>
      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2">
        <Reveal delay={0.12}>{col('Nexli builds and runs', nexli, 'cyan')}</Reveal>
        <Reveal delay={0.2}>{col('You run', you, 'emerald')}</Reveal>
      </div>
      <Reveal delay={0.28}>
        <Body className="mt-6 max-w-4xl lg:text-lg">
          <strong className="font-bold text-white">The sales process is the one part we don&apos;t run.</strong> How well
          you sell tax planning and upsell the back end decides where you land in these scenarios.
        </Body>
      </Reveal>
    </Slide>
  );
}

// ── 10. The first 90 days ─────────────────────────────────────────────────

export function TimelineSlide() {
  const beCons = breakEvenMonth(CONS, PLANS.monthly);
  const beBest = breakEvenMonth(BEST, PLANS.monthly);
  const steps: { when: string; title: string; who: Who; body: string; green?: boolean }[] = [
    { when: 'Days 1–21', title: 'Build', who: 'NEXLI', body: 'Website, funnel and qualifier, client portal, AI automations and ads. The full build takes 21 days at most.' },
    { when: 'Day 21', title: 'Ads go live', who: 'NEXLI', body: "We test ad creative for the first 7 to 14 days. New ad accounts take the longest to find their footing, so it won't be perfect yet." },
    { when: 'By day 30', title: 'First bookings', who: 'YOU', body: 'Your first couple of calls land on your calendar, and you run them.' },
    { when: 'Days 30–90', title: 'Ramp up', who: 'NEXLI + YOU', body: 'We put the budget behind the winning ads and bookings get steadier. You sign your first tax planning clients.' },
    { when: 'Day 90+', title: 'Full pace', who: 'NEXLI + YOU', body: 'Results start to compound. You upsell bookkeeping, payroll and compliance, and we amplify ad spend.' },
    {
      when: `By month ${beCons}`,
      title: 'In the green',
      who: null,
      green: true,
      body: `Paying month to month, you've earned back everything you put in, setup included: month ${beCons} at the conservative pace, month ${beBest} at the best-case pace.`,
    },
  ];

  return (
    <Slide id="first-90-days">
      <Heading kicker="When to expect results">
        What the first 90 days <span className={GRADIENT_TEXT}>really look like.</span>
      </Heading>

      <ol className="relative mt-8 grid gap-4 lg:mt-12 lg:grid-cols-6 lg:gap-3">
        {/* The rail: down the left on a phone, across the top from lg. */}
        <span aria-hidden="true" className="absolute bottom-3 left-[7px] top-3 w-px bg-white/15 lg:bottom-auto lg:left-2 lg:right-2 lg:top-[7px] lg:h-px lg:w-auto" />
        {steps.map((s, i) => (
          <li key={s.when} className="relative pl-8 lg:pl-0 lg:pt-8">
            <Reveal delay={0.1 + i * 0.07}>
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-[3px] border-[#020617] lg:left-0 lg:top-0 ${
                  s.green ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]' : 'bg-cyan-400'
                }`}
              />
              <div className={`text-sm font-bold ${s.green ? 'text-emerald-300' : 'text-white'}`}>{s.when}</div>
              <div
                className={`mt-2.5 rounded-2xl border p-4 lg:min-h-[13.5rem] ${
                  s.green ? 'border-emerald-400/50 bg-emerald-400/[0.07]' : 'border-white/10 bg-white/[0.035]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base font-bold text-white">{s.title}</span>
                  <Badge who={s.who} />
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
                  {s.body}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal delay={0.5} className="mt-6 lg:mt-8">
        <Callout label="Why we build the systems first">
          Meta ads are cold traffic. Cold traffic exposes your systems, who you&apos;re targeting and whether people are
          the right fit. That&apos;s why we build the systems and the qualifier before a single ad runs.
        </Callout>
      </Reveal>
    </Slide>
  );
}

// ── 11. What you invest ───────────────────────────────────────────────────

function PlanCard({ plan, highlight, footer }: { plan: Plan; highlight?: boolean; footer: React.ReactNode }) {
  // The annual plan's $74,000 is the full system setup PLUS the year of
  // service, so after signing the only thing billed monthly is the ads.
  // The rows say that outright rather than leaving it to be inferred.
  const annual = plan.id === 'annual';
  const rows: [string, string][] = [
    ['Due at signing', annual ? `${usd(plan.upfront)} setup + annual plan` : `${usd(plan.upfront)} setup`],
    ['Billed monthly', annual ? 'Ads only, from about day 21' : 'Ads + service, from about day 21'],
    ['Ads', `${usd(AD_SPEND)} a month`],
    ['Nexli service', annual ? `In the annual plan (${usd(plan.serviceMonthly)} a month)` : `${usd(plan.serviceMonthly)} a month`],
    ['Year one total', usd(yearOneCost(plan))],
  ];
  return (
    <div
      className={`flex h-full flex-col rounded-3xl border p-5 sm:p-7 ${
        highlight
          ? 'border-emerald-400/55 bg-gradient-to-br from-emerald-400/[0.09] to-cyan-400/[0.04] shadow-[0_0_60px_-24px_rgba(52,211,153,0.6)]'
          : 'border-white/10 bg-white/[0.035]'
      }`}
    >
      <div className={`text-[11px] font-bold uppercase tracking-[0.16em] ${highlight ? 'text-emerald-300' : 'text-cyan-300'}`}>
        {plan.label}
      </div>
      <dl className="mt-4 flex-1">
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className={`flex items-baseline justify-between gap-4 py-3 ${i < rows.length - 1 ? 'border-b border-white/[0.08]' : ''}`}
          >
            <dt className="shrink-0 whitespace-nowrap text-sm sm:text-[15px]" style={{ color: MUTED }}>
              {k}
            </dt>
            <dd className={`text-pretty text-right font-bold text-white ${i === rows.length - 1 ? 'text-xl sm:text-2xl' : 'text-[15px] sm:text-base'}`}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <div className={`mt-4 text-[15px] font-bold ${highlight ? 'text-emerald-300' : 'text-white/60'}`}>{footer}</div>
    </div>
  );
}

export function InvestSlide() {
  const saved = yearOneCost(PLANS.monthly) - yearOneCost(PLANS.annual);
  const extraUpfront = PLANS.annual.upfront - PLANS.monthly.upfront;
  return (
    <Slide id="invest">
      <Heading kicker="What you invest">
        Pay annually and <span className={GRADIENT_TEXT}>keep about {usd(aboutThousands(saved))} more.</span>
      </Heading>

      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2">
        <Reveal delay={0.12}>
          <PlanCard plan={PLANS.monthly} footer="Less cash up front" />
        </Reveal>
        <Reveal delay={0.2}>
          <PlanCard plan={PLANS.annual} highlight footer={`Keep ${usd(saved)} more in year one`} />
        </Reveal>
      </div>

      <Reveal delay={0.28}>
        <Body className="mt-6 max-w-4xl">
          Nothing monthly is billed until your build is done and ads launch, about day 21. On the annual plan, your ads
          are the only monthly bill. Paying annually puts{' '}
          {usd(extraUpfront)} more in at signing, so you break even in the same month or one month later. From month{' '}
          {annualAheadFromMonth()} on you&apos;re ahead, and by month 12 you&apos;ve kept about {usd(aboutThousands(saved))} more.
        </Body>
      </Reveal>
    </Slide>
  );
}

// ── Your clients cover our monthly fee ────────────────────────────────────

export function BundleSlide() {
  const billed = months.map((m) => backEndBilledIn(CONS, m));
  const plans = months.map((m) => clientsSignedIn(CONS, m) * PLAN_FEE);
  const covers = billed.findIndex((v) => v >= MONTHLY_TOTAL) + 1;
  const firstPlan = plans.findIndex((v) => v > 0) + 1;
  return (
    <Slide id="bundle">
      {/* The full picture, in Marcel's framing (2026-11-09): tax planning
          pays for the system first; bookkeeping and payroll, built up month
          by month, then cover it on their own; from there every tax plan,
          paid up front, is the bonus. The chart (CoverChart) shows both
          against the monthly bill, monthly plan only. "What you invest" and
          break-even still compare the two ways of paying. */}
      <Heading
        kicker="The full picture"
        sub={`Tax planning pays for it first. Bookkeeping and payroll build up month by month until, by month ${covers}, they cover the whole bill on their own: our fee and your ads, ${usd(MONTHLY_TOTAL)} a month. After that, every tax plan is the bonus.`}
      >
        Your new bookkeeping and payroll clients <span className={GRADIENT_TEXT}>cover our monthly fee for you.</span>
      </Heading>

      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[1.75fr_1fr]">
        <Reveal delay={0.12}>
          <Panel title="What comes in each month, conservative pace">
            <CoverChart
              bill={MONTHLY_TOTAL}
              data={months.map((m, i) => ({ month: m, backEnd: billed[i], planning: plans[i] }))}
            />
          </Panel>
        </Reveal>

        <Reveal delay={0.22}>
          <Callout label="Tax planning becomes the cherry on top" tone="emerald" className="h-full">
            <ol className="mt-3 space-y-4">
              <Beat n={1} color={C.planning} title="First, tax planning pays for it.">
                From month {firstPlan}, your new plans bring in {usd(plans[firstPlan - 1])} a month, then{' '}
                {usd(plans[MONTHS - 1])}, against a {usd(MONTHLY_TOTAL)} bill.
              </Beat>
              <Beat n={2} color={C.backEnd} title={`By month ${covers}, bookkeeping and payroll cover it alone.`}>
                {usd(billed[covers - 1])} a month, and still growing: {usd(billed[MONTHS - 1])} a month by month 12.
              </Beat>
              <Beat n={3} color={C.planning} title="From then on, every tax plan is the bonus.">
                Paid up front, on top of a bill that&apos;s already covered, and it keeps compounding.
              </Beat>
            </ol>
          </Callout>
        </Reveal>
      </div>
    </Slide>
  );
}

// ── Going into year two ───────────────────────────────────────────────────

/**
 * The payoff after twelve months, Marcel's ask (2026-11-09): tax planning
 * clients renew every year, bookkeeping and payroll keep paying, RETENTION
 * of each stay, and the system's year comes off. What is left is how far in
 * the green the firm starts year two, before it signs anyone new. Figures
 * from recurringBook in lib/see-the-math; the retention research is there.
 */
export function YearTwoSlide({ scenario }: { scenario?: ScenarioId } = {}) {
  // Conservative first, as every scenario picker in the deck opens; the
  // headline, rows, bar and total all follow the pick. On paper there is no
  // pick, so the PDF prints this slide once per scenario (app/math/print),
  // each labelled with its scenario where the toggle would be.
  const print = usePrint();
  const [id, setId] = useState<ScenarioId>(scenario ?? 'conservative');
  const s = scenarioById(id);
  const b = recurringBook(s);
  const kept = pct(RETENTION);
  return (
    <Slide id={scenario && scenario !== 'conservative' ? `year-two-${scenario}` : 'year-two'}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <Heading
          kicker="After 12 months"
          sub={`Tax planning clients renew every year, and bookkeeping and payroll keep paying every month. Even if only ${kept} stay, this is the recurring revenue you start year two with, before you sign anyone new.`}
        >
          Going into year two, you&apos;re{' '}
          <span className={GRADIENT_TEXT}>about {usd(aboutThousands(b.inTheGreen))} a year in the green.</span>
        </Heading>
        <Reveal delay={0.1} className="shrink-0">
          {print ? (
            // Solid, not the toggle's gradient: Preview drew a seam through a
            // gradient this small.
            <span className="inline-flex rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white">
              {s.label} scenario
            </span>
          ) : (
            <ScenarioToggle value={id} onChange={setId} layoutId="year-two-toggle" />
          )}
        </Reveal>
      </div>

      <div className="mt-7 grid gap-5 lg:mt-9 lg:grid-cols-[1.55fr_1fr]">
        <Reveal delay={0.12}>
          <Panel
            title={`Your recurring book after 12 months, ${s.label.toLowerCase()} pace, ${kept} staying`}
            className="h-full"
          >
            <dl className="space-y-3">
              <BookRow
                swatch={C.planning}
                label="Tax planning renewals"
                note={`${b.keptPlanning} of ${b.planningClients} clients × ${usd(PLAN_FEE)}`}
                value={<AnimatedNumber value={b.planning} format={usd} duration={600} />}
              />
              <BookRow
                swatch={C.backEnd}
                label="Bookkeeping and payroll"
                note={`${b.keptBackEnd} of ${b.backEndClients} clients × ${usd(BACK_END_ANNUAL)} a year`}
                value={<AnimatedNumber value={b.backEnd} format={usd} duration={600} />}
              />
              <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-[15px] font-bold text-white">Recurring revenue a year</dt>
                <dd className="text-xl font-black tabular-nums text-white">
                  <AnimatedNumber value={b.total} format={usd} duration={600} />
                </dd>
              </div>
              <BookRow
                swatch={SYSTEM_HATCH}
                label="The system for a year"
                note={`${usd(MONTHLY_TOTAL)} a month × 12, ads and our fee`}
                value={usd(-b.systemYear)}
              />
            </dl>

            <BookTrack planning={b.planning} backEnd={b.backEnd} system={b.systemYear} />

            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">In the green</span>
              <span className="text-2xl font-black tabular-nums text-white sm:text-3xl">
                <AnimatedNumber value={b.inTheGreen} format={usd} animateOnView duration={1100} />
                <span className="ml-1.5 text-sm font-semibold" style={{ color: MUTED }}>
                  a year
                </span>
              </span>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.22}>
          <Callout label="Why it's still conservative" className="h-full">
            <ul className="mt-2 space-y-3">
              <li>
                {kept} is the low end of the {pct(RETENTION_BENCHMARK.low)}–{pct(RETENTION_BENCHMARK.high)}{' '}
                <Src href={RETENTION_SOURCE}>full-service firms average</Src>. Top firms keep{' '}
                {pct(RETENTION_BENCHMARK.topLow)}–{pct(RETENTION_BENCHMARK.topHigh)}.
              </li>
              <li>Only your year-one clients. Everyone you sign in year two is on top.</li>
              <li>
                Tax plans at {usd(PLAN_FEE)}, the low end of {usd(PLAN_FEE_LOW)}–{usd(PLAN_FEE_HIGH)}, and compliance work
                isn&apos;t counted.
              </li>
            </ul>
          </Callout>
        </Reveal>
      </div>
    </Slide>
  );
}

/** The system's slice: the amber of "your investment" elsewhere, hatched, as money going out. */
const SYSTEM_HATCH = `repeating-linear-gradient(135deg, ${C.invest} 0 5px, rgba(245,158,11,0.45) 5px 10px)`;

function BookRow({ swatch, label, note, value }: { swatch: string; label: string; note: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="min-w-0">
        <span className="flex items-center gap-2 text-[15px] font-semibold text-white/90">
          <span
            aria-hidden="true"
            className={`h-3 w-3 shrink-0 rounded-[3px] ${swatch === SYSTEM_HATCH ? 'system-hatch' : ''}`}
            style={{ background: swatch }}
          />
          {label}
        </span>
        <span className="mt-0.5 block pl-5 text-[13px]" style={{ color: MUTED }}>
          {note}
        </span>
      </dt>
      <dd className="shrink-0 text-[17px] font-bold tabular-nums text-white">{value}</dd>
    </div>
  );
}

/**
 * The book as one bar: tax planning and bookkeeping fill it, the system's
 * year is carved off the end, and the rest is bracketed as the green. Grows
 * in once on first sight; transforms only, so reduced motion simply draws it.
 */
function BookTrack({ planning, backEnd, system }: { planning: number; backEnd: number; system: number }) {
  const [ref, seen] = useSeen<HTMLDivElement>(0.5);
  const total = planning + backEnd;
  const p = (v: number) => (v / total) * 100;
  const green = p(total - system);
  const grow = (delay: number) => ({
    initial: { scaleX: 0 },
    animate: { scaleX: seen ? 1 : 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
  });
  return (
    <div ref={ref} className="mt-6" aria-hidden="true">
      <div className="relative h-9 w-full overflow-hidden rounded-lg bg-white/[0.04]">
        <motion.div
          className="absolute inset-y-0 left-0 origin-left transition-[width] duration-500 ease-out"
          style={{ width: `calc(${p(planning)}% - 1px)`, background: C.planning }}
          {...grow(0)}
        />
        <motion.div
          className="absolute inset-y-0 origin-left transition-[left,width] duration-500 ease-out"
          style={{ left: `calc(${p(planning)}% + 1px)`, width: `calc(${p(backEnd)}% - 1px)`, background: C.backEnd }}
          {...grow(0.45)}
        />
        <motion.div
          className="system-hatch absolute inset-y-0 right-0 origin-right border-l-2 border-[#0d1526] transition-[width] duration-500 ease-out"
          style={{ width: `${100 - green}%`, background: SYSTEM_HATCH }}
          {...grow(1.05)}
        />
      </div>
      <div className="relative mt-1.5 h-12 text-[12px] font-bold">
        <motion.div
          className="absolute top-0 flex flex-col items-center transition-[left,width] duration-500 ease-out"
          style={{ left: 0, width: `${green}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: seen ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <span className="h-2 w-full rounded-b-sm border-x-2 border-b-2 border-emerald-400" />
          <span className="mt-1 text-white/85">In the green</span>
        </motion.div>
        <motion.div
          className="absolute top-0 flex flex-col items-center transition-[left,width] duration-500 ease-out"
          style={{ left: `${green}%`, width: `${100 - green}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: seen ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <span className="ml-0.5 h-2 w-[calc(100%-2px)] rounded-b-sm border-x-2 border-b-2 border-amber-400" />
          <span className="mt-1 whitespace-nowrap text-white/70">The system</span>
        </motion.div>
      </div>
    </div>
  );
}

/** One step of the cherry-on-top story, numbered in its series colour. */
function Beat({ n, color, title, children }: { n: number; color: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-[#020617]"
        style={{ background: color }}
      >
        {n}
      </span>
      <div>
        <div className="text-[15px] font-bold leading-snug text-white">{title}</div>
        <div className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {children}
        </div>
      </div>
    </li>
  );
}

// ── 13. When you break even ───────────────────────────────────────────────

export function BreakEvenSlide() {
  const print = usePrint();
  const [id, setId] = useState<ScenarioId>('conservative');
  const scenario = scenarioById(id);
  const consBe = breakEvenMonth(CONS, PLANS.monthly);

  return (
    <Slide id="break-even">
      <Heading kicker="When you break even">
        Conservative pace: <span className={GRADIENT_TEXT}>in the green by month {consBe}.</span>
      </Heading>

      <div className="mt-7 grid gap-5 lg:mt-9 lg:grid-cols-[1.55fr_1fr]">
        <Reveal delay={0.12}>
          <Panel
            title={`Where you stand at the ${scenario.label.toLowerCase()} pace, bundle included, after everything paid to Nexli`}
            className="h-full"
          >
            <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2">
              <LineKey color={C.monthly} label="Month to month" />
              <LineKey color={C.annual} dash="7 6" label="Paid annually" />
            </div>
            <BreakEvenChart scenario={scenario} height={290} />
          </Panel>
        </Reveal>

        <Reveal delay={0.2} className="flex flex-col gap-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: FAINT }}>
            {print ? 'By scenario' : 'Pick a scenario'}
          </div>
          {SCENARIOS.map((s) => {
            const on = s.id === id;
            const cell = (plan: Plan) => {
              const be = breakEvenMonth(s, plan);
              const net = aboutThousands(netSeries(s, plan)[MONTHS]);
              return (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: FAINT }}>
                    {plan.label}
                  </div>
                  <div className="mt-0.5 text-[15px] font-bold text-white">In the green month {be}</div>
                  <div className="text-[13px]" style={{ color: MUTED }}>
                    about {usd(net)} by month 12
                  </div>
                </div>
              );
            };
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => setId(s.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  on
                    ? 'border-cyan-400/60 bg-cyan-400/[0.07] shadow-[0_0_40px_-16px_rgba(34,211,238,0.6)]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-bold text-white">{s.label}</span>
                  <span className="text-xs" style={{ color: MUTED }}>
                    {clientsBy(s, MONTHS)} clients by month 12
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {cell(PLANS.monthly)}
                  {cell(PLANS.annual)}
                </div>
              </button>
            );
          })}
        </Reveal>
      </div>

      <Reveal delay={0.3}>
        <details open={print || undefined} className="group mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-white/75 hover:text-white">
            <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">›</span>
            How this is figured
          </summary>
          <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
            Every number counts the bundle: the tax plan when a client signs, plus $2,000 a month in bookkeeping and payroll
            from the next month for half your planning clients. Compliance work isn&apos;t counted. No new clients in month
            1, half your pace in months 2 and 3, full pace from month 4. Month to month: {usd(SETUP_FEE)} at signing, then{' '}
            {usd(MONTHLY_TOTAL)} a month from launch (about day 21). Paid annually: {usd(PLANS.annual.upfront)} at signing (
            {usd(SETUP_FEE)} setup plus {usd(PLANS.annual.upfront - SETUP_FEE)} for the annual plan), then {usd(AD_SPEND)} a
            month in ads from launch. Net is after everything paid to Nexli, before your cost of doing the work.
          </p>
        </details>
      </Reveal>
    </Slide>
  );
}

// ── 14. The close ─────────────────────────────────────────────────────────

export function CloseSlide() {
  const print = usePrint();
  const pdfHref = usePdfHref();
  const c = chain(CONS);
  const be = breakEvenMonth(CONS, PLANS.monthly);
  // The whole conservative case in four numbers: what a firm owner should
  // still remember a week and three other agency calls later.
  const recap = [
    { v: String(c.bookedCalls), l: 'booked calls a month' },
    { v: String(c.clients), l: 'new clients a month' },
    { v: `${c.multiple}×`, l: 'the monthly investment' },
    { v: `Month ${be}`, l: 'in the green' },
  ];
  return (
    <Slide id="next">
      <Reveal>
        <RimCard innerClassName="p-6 sm:p-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">See it built for your firm</div>
          <h2 className="mt-3 text-pretty text-3xl sm:text-4xl lg:text-[3.4rem]" style={HEADING}>
            Run these numbers <span className={GRADIENT_TEXT}>with your own fees.</span>
          </h2>

          <div className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: FAINT }}>
            The conservative case
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recap.map((r) => (
              <div key={r.l} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <dt className="sr-only">{r.l}</dt>
                <dd>
                  <div className="text-2xl font-black tracking-tight text-white sm:text-3xl">{r.v}</div>
                  <div className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
                    {r.l}
                  </div>
                </dd>
              </div>
            ))}
          </dl>

          {/* The one action on the close: the prospect leaves with the
              document. No booking button by design; they are already on the
              call, or have just had it. Not in the PDF, which is the document. */}
          {!print && (
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={pdfHref}
                download={PDF_NAME}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 px-6 text-[15px] font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download the PDF
              </a>
            </div>
          )}
        </RimCard>
      </Reveal>

      <Reveal delay={0.12} className="mt-5">
        <Callout label="Illustrative, not a promise" tone="amber">
          These scenarios show the math, not Nexli client results or a guarantee. Your results depend on your market,
          your offer and how your firm runs its calls.
        </Callout>
      </Reveal>

      <Reveal delay={0.2}>
        <footer className="mt-8 border-t border-white/[0.08] pt-5">
          <p className="max-w-4xl text-xs leading-relaxed" style={{ color: FAINT }}>
            <span className="font-bold text-white/60">Earnings disclaimer.</span> Every figure here is an illustration
            built from the stated assumptions, not a projection of what your firm will earn. Nexli does not guarantee
            results of any kind. Nothing here is financial, legal or tax advice.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" style={{ color: FAINT }}>
            <span>© 2026 Nexli Automation LLC.</span>
            {/* Absolute in the PDF, or they point at wherever it was built. */}
            <Link href={print ? `${SITE_URL}/privacy` : '/privacy'} className="hover:text-white/80">
              Privacy
            </Link>
            <Link href={print ? `${SITE_URL}/terms` : '/terms'} className="hover:text-white/80">
              Terms
            </Link>
          </div>
        </footer>
      </Reveal>
    </Slide>
  );
}
