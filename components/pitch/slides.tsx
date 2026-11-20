'use client';

// ---------------------------------------------------------------------------
// The Agency Pitch Deck's slides (/pitch). The words and examples live in
// lib/pitch-deck; the pictures in ./mocks; the slide pieces are /math's
// (components/math/ui), so this deck reads exactly like See the Math.
//
// Marcel presents it on the call, so there is no button or booking link on
// any slide; the last one asks the decision as questions. The price is on
// two: pricing, the full pricing block from /booking-confirmed-b (Marcel,
// 2026-11-19), then the-math, the illustrative economics. Each slide's
// <Slide id> is its PITCH_SLIDES id. The 2026-11-20 brief's wording rules are
// in lib/pitch-deck's header.
// ---------------------------------------------------------------------------
import React from 'react';
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Check,
  ClipboardCheck,
  Clapperboard,
  Film,
  Handshake,
  Layers,
  ListFilter,
  Megaphone,
  MessageSquareText,
  PenLine,
  PlayCircle,
  Repeat,
  Rocket,
  ScanSearch,
  Sparkles,
  Users,
  Briefcase,
  Globe,
  Mail,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedNumber from '@/components/AnimatedNumber';
import MetaLogo from '@/components/icons/MetaLogo';
import {
  AGENCY_MIN_AD_BUDGET,
  AGENCY_PERFORMANCE_PERCENT,
  AGENCY_RETAINER_MONTHLY,
  AGENCY_RETAINER_TERM_MONTHS,
  PERFORMANCE_SIMPLE_RULE,
  performanceMonth,
} from '@/lib/agency-offer';
import PricingBlock from '@/components/booking/PricingBlock';
import { AD_SPEND, MONTHLY_TOTAL, PLAN_FEE, SCENARIOS, SHOW_RATE, chain, times, usd } from '@/lib/see-the-math';
import { ShimmerBadge } from '@/components/math/ChainIcons';
import { Body, Callout, FAINT, GRADIENT_TEXT, HEADING, Heading, MUTED, Panel, Reveal, Slide } from '@/components/math/ui';
import type { DeckSlide } from '@/components/deck/DeckShell';
import {
  AVATAR_STUDY,
  CREATIVE_PIPELINE,
  EVALUATION_STAGES,
  FIRM_FIT,
  FOLLOW_UP,
  INSPECT_ITEMS,
  PITCH_AD,
  PITCH_AVATARS,
  PITCH_BUILD_DAYS,
  PITCH_CREATIVES,
  PITCH_FACE,
  PITCH_FIRM,
  PERFORMANCE_THRESHOLD,
  PITCH_HOOKS,
  PITCH_STEPS,
  PITCH_VALUE_NOTE,
  type PitchStepKey,
} from '@/lib/pitch-deck';
import {
  AvatarStage,
  BookingNotice,
  FaceInContext,
  CalendarMock,
  CreativeStrip,
  ExampleTag,
  Marker,
  MetaAdMock,
  PhoneFrame,
  QualifierDemo,
  SmsThread,
  Tile,
  VslPageMock,
  type Tone,
} from './mocks';

/** Each step's tile, in the order of PITCH_STEPS. */
const STEP_LOOK: Record<PitchStepKey, { Icon: LucideIcon; tone: Tone }> = {
  ad: { Icon: Megaphone, tone: 'blue' },
  avatar: { Icon: Sparkles, tone: 'violet' },
  vsl: { Icon: PlayCircle, tone: 'cyan' },
  qualifier: { Icon: ListFilter, tone: 'amber' },
  calendar: { Icon: CalendarCheck, tone: 'emerald' },
  'follow-up': { Icon: MessageSquareText, tone: 'blue' },
};

/** Scroll to a slide without adding a history entry (the deck keeps the
 *  hash with replaceState for the same reason). */
function goToSlide(e: React.MouseEvent, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

// ── 1. Cover ──────────────────────────────────────────────────────────────

function TopSlide() {
  return (
    <Slide id="top" className="pt-28 sm:pt-32">
      <Reveal>
        <ShimmerBadge>
          Digital Rainmaker System<span className="hidden sm:inline"> · Agency pitch deck</span>
        </ShimmerBadge>
        <h1
          className="mt-5 max-w-5xl text-pretty text-[2.4rem] sm:text-6xl lg:text-[clamp(3.4rem,5.2vw,5.2rem)]"
          style={{ ...HEADING, lineHeight: 1.02 }}
        >
          How a tax-planning client ends up <span className={GRADIENT_TEXT}>on your calendar.</span>
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-6 max-w-3xl text-base leading-relaxed sm:text-lg lg:text-xl" style={{ color: MUTED }}>
          Six connected pieces, built and run for your firm, to attract and screen business owners and high earners for
          proactive tax-planning conversations. You take the calls, confirm fit, and sell the engagement.
        </p>
        {/* Conditional, and secondary (the brief, 2026-11-20). */}
        <p className="mt-3 max-w-3xl text-[13px] leading-relaxed sm:text-sm" style={{ color: FAINT }}>
          {PITCH_VALUE_NOTE}
        </p>
      </Reveal>

      <Reveal delay={0.16} className="mt-10 lg:mt-12">
        <ol className="flex flex-wrap items-start gap-x-2 gap-y-5 sm:gap-x-3">
          {PITCH_STEPS.map((s, i) => {
            const look = STEP_LOOK[s.key];
            return (
              <li key={s.key} className="flex items-start gap-2 sm:gap-3">
                {i > 0 && <ArrowRight className="mt-4 h-4 w-4 shrink-0 text-white/25 sm:mt-5" aria-hidden="true" />}
                <a
                  href={`#${s.slide}`}
                  onClick={(e) => goToSlide(e, s.slide)}
                  className="group flex w-[4.6rem] flex-col items-center gap-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:w-24"
                >
                  <span className="transition-transform group-hover:-translate-y-1">
                    <Tile Icon={look.Icon} tone={look.tone} size="lg" />
                  </span>
                  <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.1em] text-white/55 group-hover:text-white/85 sm:text-[11px]">
                    {s.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </Reveal>

      <Reveal delay={0.28} className="mt-10 flex flex-wrap gap-2.5 lg:mt-12">
        {[`Estimated build: about ${PITCH_BUILD_DAYS} days`, 'Creative refreshed, typically every 7–14 days', 'One avatar, one firm', 'Nobody on camera'].map((t) => (
          <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-semibold text-white/80">
            {t}
          </span>
        ))}
        <span className="deck-hint items-center gap-2 pl-2 text-sm" style={{ color: FAINT }}>
          Press
          <kbd className="rounded-md border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-xs text-white/70">→</kbd>
          to walk through it
        </span>
      </Reveal>
    </Slide>
  );
}

// ── 2. The path ───────────────────────────────────────────────────────────

function PathSlide() {
  return (
    <Slide id="path">
      <Heading
        kicker="The system"
        sub="This is the path one prospect takes, from scrolling past your ad to sitting across from you on a call."
      >
        Six pieces. <span className={GRADIENT_TEXT}>Each hands off to the next.</span>
      </Heading>

      <Reveal delay={0.12} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-10 lg:grid-cols-6 lg:gap-0">
        {PITCH_STEPS.map((s, i) => {
          const look = STEP_LOOK[s.key];
          const last = i === PITCH_STEPS.length - 1;
          return (
            <div key={s.key} className="relative flex">
              <a
                href={`#${s.slide}`}
                onClick={(e) => goToSlide(e, s.slide)}
                className={`flex w-full flex-col rounded-2xl border p-4 transition-colors hover:border-white/25 lg:p-5 ${
                  last ? 'border-cyan-400/60 bg-cyan-400/[0.07] shadow-[0_0_40px_-12px_rgba(34,211,238,0.5)]' : 'border-white/10 bg-white/[0.035]'
                }`}
              >
                <span className="pr-1.5 pt-1.5">
                  <Tile Icon={look.Icon} tone={look.tone} n={i + 1} />
                </span>
                <span className="mt-3 text-[15px] font-bold text-white">{s.label}</span>
                <span className="mt-1.5 text-[13px] leading-snug" style={{ color: MUTED }}>
                  {s.line}
                </span>
              </a>
              {!last && <ArrowRight aria-hidden="true" className="mx-1 hidden h-4 w-4 shrink-0 self-center text-white/30 lg:block" />}
            </div>
          );
        })}
      </Reveal>

      <Reveal delay={0.24}>
        <Callout label="Not “we run ads and you pay us”" className="mt-6 max-w-4xl lg:mt-8">
          Every piece on the next slides is something we build, run and show you. You see the ads, the page, the
          questions and the messages your prospects get, before a single dollar of your ad budget is spent on them.
        </Callout>
      </Reveal>
    </Slide>
  );
}

// ── 3. The ad ─────────────────────────────────────────────────────────────
// Creative and testing, not certainty (the brief, 2026-11-20): no claim that
// Meta puts it "in front of the right owner".

function AdSlide() {
  const reads = [
    { n: 1, t: 'The words', d: 'Who it talks to and the problem it names.' },
    { n: 2, t: 'The video', d: 'The face, the voice and what she says.' },
    { n: 3, t: 'The headline', d: 'The promise under the video.' },
    { n: 4, t: 'The page it opens', d: 'Your landing page, and who acts on it.' },
  ];
  const flow = [
    { Icon: PenLine, tone: 'blue' as Tone, t: 'What the ad says', d: 'Everything marked on the ad.' },
    { Icon: ScanSearch, tone: 'violet' as Tone, t: 'Meta’s delivery system', d: 'Uses the ad’s content, the campaign settings and the conversion signals we send.' },
    { Icon: Users, tone: 'emerald' as Tone, t: 'Judged by opportunity quality', d: 'We measure it by the prospects reaching your firm, not by clicks alone.' },
  ];
  return (
    <Slide id="ad">
      <Heading kicker="1 · The ad">
        Creative written for <span className={GRADIENT_TEXT}>the clients your firm wants.</span>
      </Heading>

      <div className="mt-8 grid items-center gap-8 lg:mt-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14">
        <Reveal delay={0.1}>
          <MetaAdMock ad={PITCH_AD} avatar={PITCH_FACE} />
        </Reveal>

        <div className="space-y-5">
          <Reveal delay={0.16}>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {reads.map((r) => (
                <li key={r.n} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3">
                  <Marker n={r.n} className="mt-0.5" />
                  <span>
                    <span className="block text-[15px] font-bold text-white">{r.t}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: MUTED }}>
                      {r.d}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.24}>
            <Panel>
              <ol className="grid gap-4 sm:grid-cols-3 sm:gap-3">
                {flow.map((f, i) => (
                  <li key={f.t} className="flex items-start gap-3 sm:flex-col">
                    <div className="flex items-center gap-2">
                      <Tile Icon={f.Icon} tone={f.tone} />
                      {i < flow.length - 1 && <ArrowRight className="hidden h-4 w-4 text-white/30 sm:block" aria-hidden="true" />}
                    </div>
                    <span>
                      <span className="block text-[14px] font-bold leading-snug text-white">{f.t}</span>
                      <span className="mt-1 block text-[12.5px] leading-snug" style={{ color: MUTED }}>
                        {f.d}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
          </Reveal>

          <Reveal delay={0.32}>
            <Callout label="How we use creative">
              Creative helps communicate who the offer is for. We test messaging, campaign settings, and conversion signals
              against the quality of the opportunities reaching your firm.
            </Callout>
          </Reveal>
        </div>
      </div>
    </Slide>
  );
}

// ── 4. Written for your ideal client ──────────────────────────────────────

function IcpSlide() {
  const who = [
    'Business owners and high earners',
    'Paying six or seven figures in tax',
    'Nobody has ever shown them proactive planning',
    'In the market you serve',
  ];
  return (
    <Slide id="icp">
      <Heading kicker="Your ideal client">
        Every ad speaks to <span className={GRADIENT_TEXT}>one kind of client.</span>
      </Heading>

      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <Reveal delay={0.1}>
          <Panel title="Who we write for" className="h-full">
            <ul className="space-y-3">
              {who.map((w) => (
                <li key={w} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
                  <Body muted={false}>{w}</Body>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] leading-relaxed" style={{ color: FAINT }}>
              We set it with you on kickoff: your market, your fees and the clients you want more of.
            </p>
          </Panel>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-3">
          {PITCH_HOOKS.map(({ ad, tags }, i) => (
            <Reveal key={ad.id} delay={0.16 + i * 0.07}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300/90">{ad.angle}</div>
                <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-white/90">“{ad.primaryText}”</p>
                <div className="mt-3 border-t border-white/[0.07] pt-3 text-[13px] font-semibold text-white">{ad.headline}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.36}>
        <Callout label="A screening signal, not a verdict" tone="amber" className="mt-6 max-w-4xl">
          Tax liability is an initial screening signal. Your firm confirms the planning opportunity, willingness to
          invest, and scope during the consultation.
        </Callout>
      </Reveal>
    </Slide>
  );
}

// ── 5. Your AI avatar ─────────────────────────────────────────────────────

function AvatarSlide() {
  const rules = [
    'Cast from your firm, your market and the clients you want',
    'One avatar, one firm: no other client’s ads use yours while you’re with us',
    'Nobody at your firm ever gets on camera',
    'AI-generated, and labelled that way',
  ];
  return (
    <Slide id="avatar">
      <Heading kicker="2 · Your AI avatar">
        The face of your ads. <span className={GRADIENT_TEXT}>Cast by us, for your client.</span>
      </Heading>

      <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
        <Reveal delay={0.1}>
          <AvatarStage avatars={PITCH_AVATARS} />
          <p className="mt-3 text-[12px]" style={{ color: FAINT }}>
            A few of the faces we cast from. Every one is AI-generated.
          </p>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={0.16}>
            <Panel title="Cast by Nexli, for your firm">
              <Body muted={false} className="lg:text-lg">
                Nexli casts the presenter for your firm&apos;s brand and target client profile. You see the creative before
                launch. Performance is evaluated through actual opportunity quality, not appearance alone.
              </Body>
              {/* A source note, not a sales argument (the brief): creative can
                  affect delivery; no face is a promise of results. */}
              <p className="mt-4 text-[11.5px] leading-relaxed" style={{ color: FAINT }}>
                {AVATAR_STUDY.finding} Source:{' '}
                <a href={AVATAR_STUDY.href} target="_blank" rel="noopener noreferrer" className="underline decoration-white/25 underline-offset-2 hover:text-white/70">
                  {AVATAR_STUDY.cite}
                </a>
              </p>
            </Panel>
          </Reveal>
          <Reveal delay={0.24}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {rules.map((r) => (
                <li key={r} className="flex gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden="true" />
                  <span className="text-[13.5px] leading-snug text-white/85">{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Slide>
  );
}

// ── 6. One face, end to end ───────────────────────────────────────────────

function OneFaceSlide() {
  const frames = [
    { place: 'ad' as const, label: 'In the ad', sub: 'She stops the scroll.' },
    { place: 'vsl' as const, label: 'On the VSL', sub: 'She explains tax planning.' },
    { place: 'booked' as const, label: 'On the booking page', sub: 'She tells them what the call covers.' },
  ];
  return (
    <Slide id="one-face">
      <Heading
        kicker="One face, start to finish"
        sub="The prospect meets one person from the first scroll to the call. By the time they book, she has already explained what you do and why it matters to them."
      >
        The same avatar <span className={GRADIENT_TEXT}>at every step.</span>
      </Heading>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-3 lg:mt-10 lg:gap-6">
        {frames.map((f, i) => (
          <Reveal key={f.label} delay={0.1 + i * 0.08}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <FaceInContext avatar={PITCH_FACE} place={f.place} play={i === 0} />
              <div className="mt-3 flex items-center gap-2 px-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-black text-white">{i + 1}</span>
                <span className="text-[15px] font-bold text-white">{f.label}</span>
              </div>
              <p className="mt-1 px-1 pb-1 text-[13px]" style={{ color: MUTED }}>
                {f.sub}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Slide>
  );
}

// ── 7. The VSL ────────────────────────────────────────────────────────────

function VslSlide() {
  const points = [
    {
      t: 'She explains what planning can do',
      d: 'How a plan made before the year closes may lower what they owe, legally. Explained the same way to every prospect.',
    },
    {
      t: 'Tax planning is the front door',
      d: 'Planning earns the trust. Bookkeeping, payroll and the rest of what you do follow it.',
    },
    {
      t: 'Education before the consultation',
      d: 'The VSL explains the offer and helps prospects understand what the planning conversation covers before booking.',
    },
  ];
  return (
    <Slide id="vsl">
      <Heading kicker="3 · The VSL funnel">
        Before they ever talk to you, <span className={GRADIENT_TEXT}>she has made the case.</span>
      </Heading>
      <div className="mt-8 grid items-center gap-8 lg:mt-10 lg:grid-cols-[minmax(0,17.5rem)_1fr] lg:gap-14">
        <Reveal delay={0.1}>
          <PhoneFrame>
            <VslPageMock avatar={PITCH_FACE} />
          </PhoneFrame>
        </Reveal>
        <div className="space-y-3">
          {points.map((p, i) => (
            <Reveal key={p.t} delay={0.16 + i * 0.07}>
              <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-[13px] font-black text-cyan-300">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[16px] font-bold text-white sm:text-lg">{p.t}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed" style={{ color: MUTED }}>
                    {p.d}
                  </span>
                </span>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.4}>
            <p className="pt-1 text-[13px]" style={{ color: FAINT }}>
              The page is yours: your name, your domain, your brand. {PITCH_FIRM.name} is a demo firm.
            </p>
          </Reveal>
        </div>
      </div>
    </Slide>
  );
}

// ── 8. The qualifier ──────────────────────────────────────────────────────

function QualifierSlide() {
  return (
    <Slide id="qualifier">
      <Heading kicker="4 · The qualifier">
        Prospects who meet your initial screening criteria <span className={GRADIENT_TEXT}>can book.</span>
      </Heading>
      <div className="mt-8 grid items-start gap-8 lg:mt-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-14">
        <div className="space-y-4">
          <Reveal delay={0.1}>
            <Body muted={false} className="lg:text-lg">
              Right under the video, a few quick questions help separate likely planning prospects from people who only
              need a return filed. It takes them under a minute.
            </Body>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400/[0.06] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Meets your criteria
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                  Can book on your calendar, with their answers attached.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-400/35 bg-amber-400/[0.06] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                  <ListFilter className="h-4 w-4" aria-hidden="true" /> Doesn&apos;t meet them
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                  Not offered the calendar. They stay a contact in your CRM.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <Callout label="Your questions, your bar">
              These are examples. We set the questions and where the line sits with you: income, the tax they pay, whether
              there may be a planning opportunity, and anything else that matters to your firm. Screening uses
              prospect-provided information. Final fit and the planning opportunity are confirmed by your firm.
            </Callout>
          </Reveal>
        </div>
        <Reveal delay={0.14}>
          <QualifierDemo />
        </Reveal>
      </div>
    </Slide>
  );
}

// ── 9. The calendar ───────────────────────────────────────────────────────

function CalendarSlide() {
  return (
    <Slide id="calendar">
      <Heading
        kicker="5 · Your calendar"
        sub="A screened prospect picks a time on the same page. It lands on your calendar like any other meeting, with who they are and how they answered. Booked is not the same as attended or qualified: those come on the call."
      >
        Booked straight <span className={GRADIENT_TEXT}>onto your calendar.</span>
      </Heading>
      <div className="mt-8 grid items-start gap-5 lg:mt-10 lg:grid-cols-[1fr_minmax(0,19rem)] lg:gap-8">
        <Reveal delay={0.1}>
          <CalendarMock />
        </Reveal>
        <Reveal delay={0.18}>
          <BookingNotice />
          <p className="mt-3 text-[12px] leading-relaxed" style={{ color: FAINT }}>
            Example week. Names and answers are illustrations.
          </p>
        </Reveal>
      </div>
    </Slide>
  );
}

// ── 10. The follow-up ─────────────────────────────────────────────────────

function FollowUpSlide() {
  const icon = (c: string) => (c === 'Email' ? Mail : c === 'Text' ? Smartphone : MessageSquareText);
  return (
    <Slide id="follow-up">
      <Heading kicker="6 · The follow-up">
        Messages that speak to their problem, <span className={GRADIENT_TEXT}>and frame you as the fix.</span>
      </Heading>
      <div className="mt-8 grid items-start gap-8 lg:mt-10 lg:grid-cols-[minmax(0,17.5rem)_1fr] lg:gap-12">
        <Reveal delay={0.1}>
          <PhoneFrame>
            <SmsThread steps={FOLLOW_UP} />
          </PhoneFrame>
        </Reveal>
        <div>
          <Reveal delay={0.14}>
            <div className="mb-3 flex items-center gap-2.5">
              <ExampleTag>Example messages</ExampleTag>
              <span className="text-[12px]" style={{ color: FAINT }}>
                From {PITCH_FIRM.name} to a prospect
              </span>
            </div>
          </Reveal>
          <ol className="relative space-y-2.5 border-l border-white/10 pl-5">
            {FOLLOW_UP.map((s, i) => {
              const Icon = icon(s.channel);
              return (
                <Reveal key={s.title} delay={0.18 + i * 0.06}>
                  <li className="relative">
                    <span className="absolute -left-[1.72rem] top-3 flex h-4 w-4 items-center justify-center rounded-full border border-cyan-400/60 bg-[#020617]">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    </span>
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-300">{s.when}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: FAINT }}>
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {s.channel}
                        </span>
                      </div>
                      <div className="mt-1 text-[14.5px] font-bold text-white">{s.title}</div>
                      <p className="mt-0.5 text-[13px] leading-snug" style={{ color: MUTED }}>
                        {s.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </Slide>
  );
}

// ── 11. How we make the creative ──────────────────────────────────────────

function CreativeSlide() {
  const icons: LucideIcon[] = [PenLine, Sparkles, Clapperboard, Layers, Repeat];
  const tones: Tone[] = ['blue', 'violet', 'cyan', 'amber', 'emerald'];
  return (
    <Slide id="creative">
      <Heading kicker="How we make the creative">
        Built in house, <span className={GRADIENT_TEXT}>and never left to go stale.</span>
      </Heading>
      <div className="mt-8 grid items-start gap-6 lg:mt-10 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-10">
        <Reveal delay={0.1}>
          <ol className="grid gap-2.5">
            {CREATIVE_PIPELINE.map((p, i) => (
              <li key={p.title} className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                <Tile Icon={icons[i]} tone={tones[i]} n={i + 1} />
                <span>
                  <span className="block text-[15px] font-bold text-white">{p.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: MUTED }}>
                    {p.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300">
            <Film className="h-3.5 w-3.5" aria-hidden="true" /> Some of what we&apos;ve made
          </div>
          <CreativeStrip creatives={PITCH_CREATIVES} />
          <p className="mt-3 text-[12px] leading-relaxed" style={{ color: FAINT }}>
            Tap one to play it. We keep the ad creative we make; everything else we build is yours.
          </p>
        </Reveal>
      </div>
    </Slide>
  );
}

// ── 12. What it costs ─────────────────────────────────────────────────────

/**
 * The full pricing, "just like on the booking confirmed page" (Marcel,
 * 2026-11-19): /booking-confirmed-b's own PricingBlock, with the monthly
 * calculation worked out, in its one-screen deck layout. The same component,
 * so the slide and the page cannot disagree. Since 2026-11-20 it also shows
 * the optional prepay (six $10,000 credits), smaller than the monthly
 * option, so every pricing fact is on one slide (the brief's acceptance
 * test).
 */
function PricingSlide() {
  return (
    <Slide id="pricing">
      <Heading kicker="What it costs">
        One agency fee structure. <span className={GRADIENT_TEXT}>No separate setup fee.</span>
      </Heading>
      <div className="mt-6 lg:mt-8">
        <PricingBlock deck explainPerformance prepay />
      </div>
    </Slide>
  );
}

// ── 13. Illustrative economics ────────────────────────────────────────────

/**
 * The most valuable part of See the Math on one slide (Marcel, 2026-11-19),
 * relabelled by the 2026-11-20 brief: illustrative COLLECTED fees for 2, 3
 * and 5 clients (named by the client count, not "conservative" or "best
 * case"), their net, the base cash outlay, a low month and the disclosure.
 * The inputs are /math's own (lib/see-the-math), printed in the footer as
 * illustrative, not historical. The full monthly calculation is on the
 * pricing slide; this one carries only its one-line definition.
 */
function MoneySlide() {
  const rows = SCENARIOS.map((s) => {
    const c = chain(s);
    return { s, c, m: performanceMonth(c.newFees, AD_SPEND, 0) };
  });
  const top = rows[rows.length - 1];
  const scale = Math.max(...rows.map((r) => r.c.newFees)) * 1.12;
  const at = (n: number) => `${(n / scale) * 100}%`;
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <Slide id="the-math">
      <Heading kicker="Illustrative economics">
        What it could bring in. <span className={GRADIENT_TEXT}>What it costs you.</span>
      </Heading>

      <div className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[1.15fr_1fr]">
        <Reveal delay={0.1}>
          <Panel title="Illustrative monthly collected-fee scenarios" className="h-full">
            <ul className="space-y-3.5">
              {rows.map(({ s, c, m }, i) => (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="w-[7.5rem] shrink-0 sm:w-[8.5rem]">
                    <span className="block text-[14px] font-bold text-white">{c.clients} clients</span>
                    <span className="block text-[11.5px] leading-snug" style={{ color: MUTED }}>
                      {usd(c.newFees)} collected
                    </span>
                    <span className="block text-[11.5px] leading-snug" style={{ color: FAINT }}>
                      {usd(m.net)} net
                    </span>
                  </span>
                  <span className="relative h-10 flex-1">
                    {/* The base outlay, drawn in every row's own track so it
                        lines up with the bars at any width. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 -top-2 z-10 border-l-2 border-amber-400/80"
                      style={{ left: at(MONTHLY_TOTAL) }}
                    />
                    <motion.span
                      className="absolute inset-y-0 left-0 flex items-center justify-end rounded-lg bg-gradient-to-r from-blue-500/70 to-cyan-400/80 pr-2.5"
                      initial={{ width: 0 }}
                      whileInView={{ width: at(c.newFees) }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                    >
                      <span className="hidden whitespace-nowrap text-[14px] font-black text-white sm:inline">
                        <AnimatedNumber value={c.newFees} format={(n) => usd(Math.round(n))} animateOnView duration={1000} />
                      </span>
                    </motion.span>
                  </span>
                  <span className="w-12 shrink-0 rounded-full border border-amber-400/35 bg-amber-400/[0.08] py-0.5 text-center text-[12px] font-bold text-amber-200">
                    {times(c.multiple)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-2.5 text-[12px] leading-snug">
              <span className="flex items-start gap-2" style={{ color: MUTED }}>
                <span className="mt-1.5 h-0.5 w-4 shrink-0 bg-amber-400" aria-hidden="true" />
                <span>
                  <strong className="text-white">{usd(MONTHLY_TOTAL)} base monthly agency-and-ad cash outlay</strong> under the
                  monthly payment option: {usd(AGENCY_RETAINER_MONTHLY)} to Nexli plus {usd(AGENCY_MIN_AD_BUDGET)} in
                  advertising. Additional performance fees, larger advertising budgets, commissions, and your own delivery
                  costs can increase the outlay.
                </span>
              </span>
              <span className="flex items-start gap-2" style={{ color: MUTED }}>
                <span
                  className="mt-px shrink-0 rounded-full border border-amber-400/35 bg-amber-400/[0.08] px-1.5 text-[10px] font-bold text-amber-200"
                  aria-hidden="true"
                >
                  ×
                </span>
                <span>
                  Amber pills: collected revenue ÷ base agency-and-ad cash outlay. Not profit, ROI or ROAS; they leave out
                  delivery and every other cost.
                </span>
              </span>
            </div>
            <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-3">
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
                <strong className="font-bold text-emerald-300">Nothing more to pay in any of the three.</strong> All stay under{' '}
                {usd(PERFORMANCE_THRESHOLD)} of net attributed revenue (the highest is {usd(top.m.net)}). Billing starts above{' '}
                {usd(PERFORMANCE_THRESHOLD)} net, not above {usd(PERFORMANCE_THRESHOLD)} in gross collected fees.
              </p>
            </div>
          </Panel>
        </Reveal>

        <div className="grid content-start gap-4">
          <Reveal delay={0.16}>
            <Panel title="The 10%, in one line">
              <p className="text-[14px] font-semibold leading-relaxed text-white">{PERFORMANCE_SIMPLE_RULE}</p>
              <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: MUTED }}>
                Net attributed revenue = collected from clients the system brought in − agreed ad spend − agreed
                commissions. It is not your firm&apos;s net profit. Worked through on the pricing slide.
              </p>
            </Panel>
          </Reveal>
          <Reveal delay={0.22}>
            <Panel title="A low month">
              <ul className="space-y-2.5">
                <li className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] leading-snug" style={{ color: MUTED }}>
                    No engagements collected
                  </span>
                  <span className="shrink-0 text-right text-[13px] font-bold text-white">{usd(MONTHLY_TOTAL)} base outlay still paid</span>
                </li>
                <li>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] leading-snug" style={{ color: MUTED }}>
                      One {usd(PLAN_FEE)} engagement collected
                    </span>
                    <span className="shrink-0 text-right text-[13px] font-bold text-white">
                      {usd(PLAN_FEE - MONTHLY_TOTAL)} after the base outlay
                    </span>
                  </div>
                  <span className="mt-0.5 block text-[11.5px] leading-snug" style={{ color: FAINT }}>
                    Before commissions, fulfillment, taxes and other costs. Not profit, and not a break-even promise.
                  </span>
                </li>
              </ul>
            </Panel>
          </Reveal>
          <Reveal delay={0.28}>
            {/* Readable, but not louder than the heading (the brief). */}
            <Callout label="Illustrations, not promises" tone="amber">
              <span className="block text-[14px] leading-relaxed">
                Illustrations, not promises or forecasts. Appointment volume, attendance, qualification, sales conversion,
                collection timing, and engagement value vary. Launch and testing take time.
              </span>
            </Callout>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.34}>
        <p className="mt-5 max-w-5xl text-[12px] leading-relaxed" style={{ color: FAINT }}>
          Assumptions, all illustrative: {usd(PLAN_FEE)} collected per planning engagement within the modeled month,{' '}
          {usd(AD_SPEND)} in advertising, zero commissions and the standard {usd(AGENCY_RETAINER_MONTHLY)} monthly minimum.
          Booked calls at {SCENARIOS.map((s) => usd(s.costPerBookedCall)).join(' / ')} each, {pct(SHOW_RATE)} attended and{' '}
          {SCENARIOS.map((s) => pct(s.closeRate)).join(' / ')} signed: See the Math&apos;s inputs, not historical data. An
          engagement sold but not yet paid is not counted as collected revenue.
        </p>
      </Reveal>
    </Slide>
  );
}

// ── 14. What you can inspect before launch ───────────────────────────────
// The brief's evidence section (2026-11-20): what a firm can see for itself,
// each labelled for what it is. No results, case studies or testimonials.

const INSPECT_LOOK: Record<string, { Icon: LucideIcon; tone: Tone }> = {
  creative: { Icon: Film, tone: 'blue' },
  avatar: { Icon: Sparkles, tone: 'violet' },
  qualifier: { Icon: ListFilter, tone: 'amber' },
  calendar: { Icon: CalendarCheck, tone: 'emerald' },
  'follow-up': { Icon: MessageSquareText, tone: 'cyan' },
};

function InspectSlide() {
  return (
    <Slide id="inspect">
      <Heading
        kicker="Before you decide"
        sub="Everything here is sample work or demonstrated functionality. None of it is a client's acquisition results."
      >
        What you can inspect <span className={GRADIENT_TEXT}>before launch.</span>
      </Heading>
      <Reveal delay={0.12} className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
        {INSPECT_ITEMS.map((it) => {
          const look = INSPECT_LOOK[it.slide] ?? { Icon: Check, tone: 'cyan' as Tone };
          return (
            <a
              key={it.slide}
              href={`#${it.slide}`}
              onClick={(e) => goToSlide(e, it.slide)}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-4 outline-none transition-colors hover:border-white/25 focus-visible:ring-2 focus-visible:ring-cyan-300 lg:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <Tile Icon={look.Icon} tone={look.tone} />
                <ExampleTag>{it.kind}</ExampleTag>
              </div>
              <span className="mt-3 text-[15px] font-bold text-white">{it.title}</span>
              <span className="mt-1 text-[13px] leading-snug" style={{ color: MUTED }}>
                {it.body}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-cyan-300 group-hover:text-cyan-200">
                See it <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </a>
          );
        })}
        <div className="flex flex-col rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.05] p-4 lg:p-5">
          <div className="flex items-start justify-between gap-3">
            <Tile Icon={Check} tone="emerald" />
            <ExampleTag>Part of the build</ExampleTag>
          </div>
          <span className="mt-3 text-[15px] font-bold text-white">Before your budget is spent</span>
          <span className="mt-1 text-[13px] leading-snug" style={{ color: MUTED }}>
            You see the ads, the page, the questions and the messages before your ad budget is spent on them, and we check
            tracking before campaigns go live.
          </span>
        </div>
      </Reveal>
    </Slide>
  );
}

// ── 16. Who does what ─────────────────────────────────────────────────────

function RecapSlide() {
  const nexli: { Icon: LucideIcon; t: string }[] = [
    { Icon: Megaphone, t: 'The ads and the creative, tested and refreshed' },
    { Icon: Sparkles, t: 'Your AI avatar, cast for your client' },
    { Icon: PlayCircle, t: 'The VSL funnel and the qualifier' },
    { Icon: CalendarCheck, t: 'Booking onto your calendar' },
    { Icon: Bot, t: 'The follow-up and every automation' },
    { Icon: Globe, t: 'Your website and client portal' },
  ];
  const you: { Icon: LucideIcon; t: string }[] = [
    { Icon: CalendarCheck, t: 'Take the calls and confirm fit' },
    { Icon: Handshake, t: 'Sell the tax plan' },
    { Icon: Briefcase, t: 'Do the planning, and the work it brings' },
  ];
  const col = (title: string, items: typeof nexli, tone: 'cyan' | 'emerald') => (
    <Panel className="h-full">
      <div className={`text-[11px] font-bold uppercase tracking-[0.16em] ${tone === 'cyan' ? 'text-cyan-300' : 'text-emerald-300'}`}>{title}</div>
      <ul className="mt-5 space-y-2.5">
        {items.map(({ Icon, t }) => (
          <li key={t} className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                tone === 'cyan' ? 'bg-cyan-400/10 text-cyan-300' : 'bg-emerald-400/10 text-emerald-300'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-[15px] font-semibold text-white/90">{t}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
  return (
    <Slide id="recap">
      <Heading kicker="Who does what">
        We build and run all of it. <span className={GRADIENT_TEXT}>You take the calls.</span>
      </Heading>
      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[1.2fr_1fr]">
        <Reveal delay={0.12}>{col('Nexli builds and runs', nexli, 'cyan')}</Reveal>
        <Reveal delay={0.2}>{col('You', you, 'emerald')}</Reveal>
      </div>
      <Reveal delay={0.28}>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Body className="max-w-3xl">
            <strong className="font-bold text-white">What we build is yours</strong>: the website, the portal, the funnel
            and the automations. The ad creative we make stays ours.
          </Body>
          <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: FAINT }}>
            <MetaLogo className="h-3.5 w-3.5" /> Campaigns built and run on Meta
          </span>
        </div>
      </Reveal>
    </Slide>
  );
}

// ── 17. The decision ──────────────────────────────────────────────────────
// The brief's close (2026-11-20): fit, the agreement, the build, and how the
// engagement is judged. Asked as questions, no button: Marcel is already on
// the call, and nothing here invents a destination or a reporting promise.

function CloseSlide() {
  const steps: { Icon: LucideIcon; tone: Tone; t: string; d: string; list?: string[] }[] = [
    {
      Icon: ClipboardCheck,
      tone: 'cyan',
      t: 'Confirm fit',
      d: 'Confirm your planning offer, client profile, delivery capacity, and budget. A firm is a fit with:',
      list: FIRM_FIT,
    },
    {
      Icon: PenLine,
      tone: 'violet',
      t: 'Agree the plan',
      d: `Review the ${AGENCY_RETAINER_TERM_MONTHS}-month agreement and choose monthly payment or the optional prepaid route.`,
    },
    {
      Icon: Rocket,
      tone: 'emerald',
      t: 'Start the build',
      d: `Complete kickoff, access, and approvals. Nexli builds the system, checks tracking, and prepares campaigns for launch. Estimated build: about ${PITCH_BUILD_DAYS} days, depending on access and approvals.`,
    },
  ];
  return (
    <Slide id="close">
      <Heading kicker="The decision">
        Confirm fit. Agree the plan. <span className={GRADIENT_TEXT}>Start the build.</span>
      </Heading>
      <div className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[1.25fr_1fr]">
        <Reveal delay={0.1}>
          <ol className="space-y-3">
            {steps.map((st, i) => (
              <li key={st.t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <span className="pr-1.5 pt-1.5">
                  <Tile Icon={st.Icon} tone={st.tone} n={i + 1} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[16px] font-bold text-white">{st.t}</span>
                  <span className="mt-1 block text-[13.5px] leading-snug" style={{ color: MUTED }}>
                    {st.d}
                  </span>
                  {st.list && (
                    <ul className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                      {st.list.map((x) => (
                        <li key={x} className="flex items-start gap-2 text-[12.5px] leading-snug text-white/85">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
        <div className="grid content-start gap-4">
          <Reveal delay={0.18}>
            <Panel title="How the engagement is judged">
              <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                {EVALUATION_STAGES.map((st, i) => (
                  <li key={st} className="flex items-center gap-1.5">
                    {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />}
                    <span className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-[12px] font-semibold text-white/90">
                      {st}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                Evaluate booked appointments, attendance, qualification, paid engagements, and agreed, attributable net
                revenue. Use those stages to identify whether improvements are needed in acquisition, follow-up, screening,
                or the firm&apos;s sales process.
              </p>
            </Panel>
          </Reveal>
          <Reveal delay={0.26}>
            <Callout label="Before you decide" tone="emerald">
              <span className="block text-[15px] font-semibold leading-relaxed text-white">
                Does the plan fit your firm&apos;s goals and economics?
              </span>
              <span className="mt-1 block text-[15px] font-semibold leading-relaxed text-white">
                What remains unresolved before you can proceed?
              </span>
            </Callout>
          </Reveal>
        </div>
      </div>
    </Slide>
  );
}

// ── The deck ──────────────────────────────────────────────────────────────

export const PITCH_SLIDES: DeckSlide[] = [
  { id: 'top', title: 'How a client ends up on your calendar', node: <TopSlide /> },
  { id: 'path', title: 'The system in six pieces', node: <PathSlide /> },
  { id: 'ad', title: 'The ad', node: <AdSlide /> },
  { id: 'icp', title: 'Written for your ideal client', node: <IcpSlide /> },
  { id: 'avatar', title: 'Your AI avatar', node: <AvatarSlide /> },
  { id: 'one-face', title: 'One face, start to finish', node: <OneFaceSlide /> },
  { id: 'vsl', title: 'The VSL funnel', node: <VslSlide /> },
  { id: 'qualifier', title: 'The qualifier', node: <QualifierSlide /> },
  { id: 'calendar', title: 'Booked onto your calendar', node: <CalendarSlide /> },
  { id: 'follow-up', title: 'The follow-up', node: <FollowUpSlide /> },
  { id: 'creative', title: 'How we make the creative', node: <CreativeSlide /> },
  { id: 'inspect', title: 'What you can inspect before launch', node: <InspectSlide /> },
  { id: 'pricing', title: 'What it costs', node: <PricingSlide /> },
  { id: 'the-math', title: 'Illustrative economics', node: <MoneySlide /> },
  { id: 'recap', title: 'Who does what', node: <RecapSlide /> },
  { id: 'close', title: 'Confirm fit. Agree the plan. Start the build.', node: <CloseSlide /> },
];
