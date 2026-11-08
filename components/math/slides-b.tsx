'use client';

// Slides 8–14 of /math: the stacking back end, who does what, the first 90
// days, what you invest, the bundle as a baseline, break-even and the close.
import React, { useState } from 'react';
import Link from 'next/link';
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
  ANNUAL_MONTHLY_EQUIVALENT,
  MONTHLY_TOTAL,
  MONTHS,
  PLANS,
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
  netSeries,
  scenarioById,
  usd,
  usdCompact,
  yearOneCost,
  type Plan,
  type ScenarioId,
} from '@/lib/see-the-math';
import BreakEvenChart from './BreakEvenChart';
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
  PDF_HREF,
  PDF_NAME,
  Panel,
  Reveal,
  Slide,
  type Who,
} from './ui';

const CONS = SCENARIOS[0];
const BEST = SCENARIOS[2];
const months = Array.from({ length: MONTHS }, (_, i) => i + 1);

// ── 8. Every month's clients stack ────────────────────────────────────────

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

// ── 12. The bundle becomes your baseline ──────────────────────────────────

export function BundleSlide() {
  const billed = months.map((m) => backEndBilledIn(CONS, m));
  const covers = billed.findIndex((v) => v >= MONTHLY_TOTAL) + 1;
  return (
    <Slide id="bundle">
      {/* The picture this slide paints: once the MRR pays the bill, the firm
          is not hunting new business just to stay even. Upselling the bundle
          keeps the baseline covered; new tax plans become the extra. */}
      <Heading
        kicker="Monthly recurring revenue"
        sub={`MRR is your monthly recurring revenue: the bookkeeping and payroll your clients pay you every month. By month ${covers} it covers your whole monthly bill, ads and our service, on either plan. From then on you're not hunting for new business just to stay even.`}
      >
        What the MRR <span className={GRADIENT_TEXT}>covers.</span>
      </Heading>

      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[1.75fr_1fr]">
        <Reveal delay={0.12}>
          <Panel title="Your MRR from bookkeeping and payroll, conservative pace, half your clients">
            <div className="mb-2 flex flex-wrap gap-x-6 gap-y-2">
              <LineKey color={C.invest} dash="7 6" label="Month to month" sub={`${usd(MONTHLY_TOTAL)} a month`} />
              <LineKey color="rgba(255,255,255,0.75)" dash="2 5" label="Paid annually" sub={`${usd(ANNUAL_MONTHLY_EQUIVALENT)} a month`} />
            </div>
            <Columns
              caption="Monthly recurring revenue from bookkeeping and payroll, conservative pace"
              xTitle="Month"
              height={300}
              maxBar={30}
              yMax={20_000}
              ticks={[0, 5_000, 10_000, 15_000, 20_000]}
              tickFormat={usdCompact}
              refLines={[
                { value: MONTHLY_TOTAL, color: C.invest },
                { value: ANNUAL_MONTHLY_EQUIVALENT, color: 'rgba(255,255,255,0.75)', dash: '2 5' },
              ]}
              data={months.map((m, i) => ({
                key: String(m),
                label: String(m),
                value: billed[i],
                color: C.backEnd,
                dim: m < covers,
                capLabel: m === covers || m === MONTHS ? usd(billed[i]) : undefined,
                tip: { value: `${usd(billed[i])} MRR`, label: `Month ${m}` },
              }))}
            />
          </Panel>
        </Reveal>

        <Reveal delay={0.22}>
          <Callout label="New business is the cherry on top" tone="emerald" className="h-full">
            <div className="mb-4 mt-2">
              <div className="text-5xl font-black tracking-tight text-white">{usd(billed[covers - 1])}</div>
              <div className="mt-1 text-sm" style={{ color: MUTED }}>
                MRR by month {covers}, against a {usd(MONTHLY_TOTAL)} monthly bill
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>
              Keep upselling bookkeeping and payroll and your baseline stays covered, and keeps growing:{' '}
              <strong className="text-white">{usd(billed[MONTHS - 1])} a month by month 12</strong>.
            </p>
            <p className="mt-3" style={{ color: 'rgba(255,255,255,0.9)' }}>
              So every new tax plan you sign, with its fee paid up front, isn&apos;t keeping the lights on.{' '}
              <strong className="font-bold text-white">It&apos;s the cherry on top.</strong>
            </p>
          </Callout>
        </Reveal>
      </div>
    </Slide>
  );
}

// ── 13. When you break even ───────────────────────────────────────────────

export function BreakEvenSlide() {
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
            Pick a scenario
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
        <details className="group mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
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

          <div className="mt-8 flex flex-wrap gap-3">
            {/* The one action on the close: the prospect leaves with the
                document. No booking button by design; they are already on
                the call, or have just had it. */}
            <a
              href={PDF_HREF}
              download={PDF_NAME}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 px-6 text-[15px] font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download the PDF
            </a>
          </div>
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
            <Link href="/privacy" className="hover:text-white/80">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/80">
              Terms
            </Link>
          </div>
        </footer>
      </Reveal>
    </Slide>
  );
}
