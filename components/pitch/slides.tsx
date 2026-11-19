'use client';

// ---------------------------------------------------------------------------
// The Agency Pitch Deck's slides (/pitch). The words and examples live in
// lib/pitch-deck; the pictures in ./mocks; the slide pieces are /math's
// (components/math/ui), so this deck reads exactly like See the Math.
//
// Marcel presents it on the call, so there is no call to action on any
// slide and no price. Each slide's <Slide id> is its PITCH_SLIDES id.
// ---------------------------------------------------------------------------
import React from 'react';
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Check,
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
  PERFORMANCE_EXAMPLE_EXTRA,
  PERFORMANCE_EXAMPLE_REVENUE,
  PERFORMANCE_EXAMPLE_TOTAL,
} from '@/lib/agency-offer';
import { AD_SPEND, MONTHLY_TOTAL, PLAN_FEE, SCENARIOS, chain, times, usd } from '@/lib/see-the-math';
import { ShimmerBadge } from '@/components/math/ChainIcons';
import { Body, Callout, FAINT, GRADIENT_TEXT, HEADING, Heading, MUTED, Panel, Reveal, Slide } from '@/components/math/ui';
import type { DeckSlide } from '@/components/deck/DeckShell';
import {
  AVATAR_STUDY,
  CREATIVE_PIPELINE,
  FOLLOW_UP,
  PITCH_AD,
  PITCH_AVATARS,
  PITCH_BUILD_DAYS,
  PITCH_CREATIVES,
  PITCH_FACE,
  PITCH_FIRM,
  PERFORMANCE_THRESHOLD,
  PITCH_HOOKS,
  PITCH_STEPS,
  PITCH_VALUE_LINE,
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
          Six pieces, built and run for you, each one handing off to the next, and {PITCH_VALUE_LINE}. You take the
          calls.
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
        {[`Built in about ${PITCH_BUILD_DAYS} days`, 'New creative every 7 to 14 days', 'One avatar, one firm', 'Nobody on camera'].map((t) => (
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

// ── 3. The ad does the targeting ──────────────────────────────────────────

function AdSlide() {
  const reads = [
    { n: 1, t: 'The words', d: 'Who it talks to and the problem it names.' },
    { n: 2, t: 'The video', d: 'The face, the voice and what she says.' },
    { n: 3, t: 'The headline', d: 'The promise under the video.' },
    { n: 4, t: 'The page it opens', d: 'Your landing page, and who acts on it.' },
  ];
  const flow = [
    { Icon: PenLine, tone: 'blue' as Tone, t: 'What the ad says', d: 'Everything marked on the ad.' },
    { Icon: ScanSearch, tone: 'violet' as Tone, t: 'Meta reads all of it', d: 'Its system works out who the ad is for from the ad itself.' },
    { Icon: Users, tone: 'emerald' as Tone, t: 'Shown to the people most likely to respond', d: 'On Facebook and Instagram, to the business owners and high earners who match it.' },
  ];
  return (
    <Slide id="ad">
      <Heading kicker="1 · The ad">
        The ad does the targeting. <span className={GRADIENT_TEXT}>So we write it for your client.</span>
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
            <Callout label="The creative is the targeting">
              The video, the photo and the copy underneath tell Meta who it&apos;s for. Meta&apos;s system scans all of it
              and puts it in front of the right owner. That&apos;s why every ad we make is written for your ideal client,
              not for everyone.
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
        <Callout label="Fresh creative, on purpose" tone="amber" className="mt-6 max-w-4xl">
          Meta tends to favor advertisers who keep feeding it new creative, so we refresh your videos and photos, usually
          every 7 to 14 days depending on how they perform.
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
            <Panel title="We cast your avatar. You don't pick one.">
              <Body muted={false} className="lg:text-lg">
                Meta decides who sees an ad partly from what is in it, and that includes the person on screen. So the face
                in your ads is chosen for the clients you want to reach, not for taste.
              </Body>
              <p className="mt-4 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                {AVATAR_STUDY.finding}
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: FAINT }}>
                Source:{' '}
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
      t: 'She teaches the outcome they want',
      d: 'Paying less tax, legally, with a plan made before the year closes. Explained once, the same way, to every prospect.',
    },
    {
      t: 'Tax planning is the front door',
      d: 'Planning earns the trust. Bookkeeping, payroll and the rest of what you do follow it.',
    },
    {
      t: 'Nobody books cold',
      d: 'By the time they reach the questions, they know what the call is for and who it is with.',
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
        Only the right people <span className={GRADIENT_TEXT}>reach your calendar.</span>
      </Heading>
      <div className="mt-8 grid items-start gap-8 lg:mt-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-14">
        <div className="space-y-4">
          <Reveal delay={0.1}>
            <Body muted={false} className="lg:text-lg">
              Right under the video, a few quick questions sort a real planning prospect from someone who only needs a
              return filed. It takes them under a minute.
            </Body>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400/[0.06] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" /> A fit
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                  Straight to your calendar, with their answers attached.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-400/35 bg-amber-400/[0.06] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                  <ListFilter className="h-4 w-4" aria-hidden="true" /> Not a fit
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                  Kept off your calendar. They stay a contact in your CRM.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <Callout label="Your questions, your bar">
              These are examples. We set the questions and where the line sits with you: income, the tax they pay, whether
              there is a real planning opportunity, and anything else that matters to your firm.
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
        sub="A qualified prospect picks a time on the same page. It lands on your calendar like any other meeting, with who they are and how they answered."
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

// ── 12. What it brings in, what it costs ──────────────────────────────────

/**
 * The most valuable part of See the Math on one slide (Marcel, 2026-11-19):
 * new fees a month at each of /math's three paces, against the monthly
 * investment, and where the 10% starts. The numbers are /math's own
 * (lib/see-the-math) so the two decks cannot disagree.
 */
function MoneySlide() {
  const rows = SCENARIOS.map((s) => ({ s, c: chain(s) }));
  // The scale runs a little past the threshold, so its line sits inside it.
  const scale = Math.max(PERFORMANCE_THRESHOLD, ...rows.map((r) => r.c.newFees)) * 1.25;
  const at = (n: number) => `${(n / scale) * 100}%`;
  return (
    <Slide id="the-math">
      <Heading kicker="The math, on one slide">
        What it can bring in. <span className={GRADIENT_TEXT}>What it costs you.</span>
      </Heading>

      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[1.35fr_1fr]">
        <Reveal delay={0.1}>
          <Panel title="New fees a month, at full pace" className="h-full">
            <div className="relative">
              <ul className="relative space-y-4">
                {rows.map(({ s, c }, i) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className="w-[7rem] shrink-0 sm:w-[8rem]">
                      <span className="block text-[13px] font-bold text-white">{s.label}</span>
                      <span className="block text-[11.5px]" style={{ color: FAINT }}>
                        {c.clients} clients a month
                      </span>
                      {/* On a phone the bars are too short to hold the figure. */}
                      <span className="block text-[14px] font-black text-white sm:hidden">{usd(c.newFees)}</span>
                    </span>
                    <span className="relative h-11 flex-1">
                      {/* The two reference lines, drawn in every row's own
                          track so they line up with the bars at any width;
                          they reach into the gaps so the rows join up. */}
                      <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -top-2 z-10 border-l-2 border-amber-400/80" style={{ left: at(MONTHLY_TOTAL) }} />
                      <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -top-2 z-10 border-l-2 border-dashed border-violet-400/80" style={{ left: at(PERFORMANCE_THRESHOLD) }} />
                      <motion.span
                        className="absolute inset-y-0 left-0 flex items-center justify-end rounded-lg bg-gradient-to-r from-blue-500/70 to-cyan-400/80 pr-2.5"
                        initial={{ width: 0 }}
                        whileInView={{ width: at(c.newFees) }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                      >
                        <span className="hidden whitespace-nowrap text-[15px] font-black text-white sm:inline">
                          <AnimatedNumber value={c.newFees} format={usd} animateOnView duration={1000} />
                        </span>
                      </motion.span>
                    </span>
                    <span className="w-12 shrink-0 rounded-full border border-amber-400/35 bg-amber-400/[0.08] py-0.5 text-center text-[12px] font-bold text-amber-200">
                      {times(c.multiple)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 grid gap-2 text-[12.5px] sm:grid-cols-2">
              <span className="flex items-start gap-2" style={{ color: MUTED }}>
                <span className="mt-1.5 h-0.5 w-4 shrink-0 bg-amber-400" aria-hidden="true" />
                <span>
                  <strong className="text-white">{usd(MONTHLY_TOTAL)} a month</strong> is your whole investment: our{' '}
                  {usd(AGENCY_RETAINER_MONTHLY)} plus at least {usd(AGENCY_MIN_AD_BUDGET)} in ads. The amber pills are how
                  many times over each pace covers it.
                </span>
              </span>
              <span className="flex items-start gap-2" style={{ color: MUTED }}>
                <span className="mt-1.5 w-4 shrink-0 border-t-2 border-dashed border-violet-400" aria-hidden="true" />
                <span>
                  <strong className="text-white">{usd(PERFORMANCE_THRESHOLD)}</strong> of agreed, attributable net revenue
                  in a month is where the {AGENCY_PERFORMANCE_PERCENT} starts.
                </span>
              </span>
            </div>
            <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-3">
              <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
                <strong className="font-bold text-emerald-300">Even the best case stays on the minimum.</strong> If all of
                those new fees counted as agreed, attributable net revenue, every pace on this chart would sit at or under{' '}
                {usd(PERFORMANCE_THRESHOLD)}: you would pay {usd(AGENCY_RETAINER_MONTHLY)}, and the{' '}
                {AGENCY_PERFORMANCE_PERCENT} only starts once you are past it.
              </p>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.18}>
          <Panel title="How we're paid" className="h-full">
            <ol className="space-y-3">
              <li className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                <div className="text-[15px] font-bold text-white">{usd(AGENCY_RETAINER_MONTHLY)} a month, the minimum</div>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: MUTED }}>
                  That is the whole fee while your agreed, attributable net revenue stays at or under{' '}
                  {usd(PERFORMANCE_THRESHOLD)} a month. No setup fee.
                </p>
              </li>
              <li className="rounded-xl border border-violet-400/30 bg-violet-400/[0.06] px-4 py-3">
                <div className="text-[15px] font-bold text-white">
                  Above {usd(PERFORMANCE_THRESHOLD)}: {AGENCY_PERFORMANCE_PERCENT}
                </div>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: MUTED }}>
                  Our fee for that month becomes {AGENCY_PERFORMANCE_PERCENT} of it. The {usd(AGENCY_RETAINER_MONTHLY)} you
                  have already paid counts toward it, so only the difference is invoiced.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                  {[
                    { v: usd(PERFORMANCE_EXAMPLE_TOTAL), l: `${AGENCY_PERFORMANCE_PERCENT} of ${usd(PERFORMANCE_EXAMPLE_REVENUE)}` },
                    { v: `−${usd(AGENCY_RETAINER_MONTHLY)}`, l: 'already paid' },
                    { v: usd(PERFORMANCE_EXAMPLE_EXTRA), l: 'more to invoice' },
                  ].map((x) => (
                    <span key={x.l} className="rounded-lg border border-white/10 bg-black/20 px-1.5 py-2">
                      <span className="block text-[14px] font-black text-white">{x.v}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wide" style={{ color: FAINT }}>
                        {x.l}
                      </span>
                    </span>
                  ))}
                </div>
              </li>
              <li className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                <div className="text-[15px] font-bold text-white">Your ad budget, separate</div>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: MUTED }}>
                  At least {usd(AGENCY_MIN_AD_BUDGET)} a month, paid straight to Meta on your own card. It never passes
                  through us.
                </p>
              </li>
            </ol>
          </Panel>
        </Reveal>
      </div>

      <Reveal delay={0.3}>
        <p className="mt-5 max-w-5xl text-[12px] leading-relaxed" style={{ color: FAINT }}>
          New fees come from See the Math: {usd(AD_SPEND)} a month in ads, a {usd(PLAN_FEE)} average plan, conservative to
          best case. They are illustrations, not promises. Agreed, attributable net revenue is defined in your agreement;
          it is not your firm&apos;s total revenue.
        </p>
      </Reveal>
    </Slide>
  );
}

// ── 13. Who does what ─────────────────────────────────────────────────────

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
    { Icon: CalendarCheck, t: 'Take the calls on your calendar' },
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

// ── The deck ──────────────────────────────────────────────────────────────

export const PITCH_SLIDES: DeckSlide[] = [
  { id: 'top', title: 'How a client ends up on your calendar', node: <TopSlide /> },
  { id: 'path', title: 'The system in six pieces', node: <PathSlide /> },
  { id: 'ad', title: 'The ad does the targeting', node: <AdSlide /> },
  { id: 'icp', title: 'Written for your ideal client', node: <IcpSlide /> },
  { id: 'avatar', title: 'Your AI avatar', node: <AvatarSlide /> },
  { id: 'one-face', title: 'One face, start to finish', node: <OneFaceSlide /> },
  { id: 'vsl', title: 'The VSL funnel', node: <VslSlide /> },
  { id: 'qualifier', title: 'The qualifier', node: <QualifierSlide /> },
  { id: 'calendar', title: 'Booked onto your calendar', node: <CalendarSlide /> },
  { id: 'follow-up', title: 'The follow-up', node: <FollowUpSlide /> },
  { id: 'creative', title: 'How we make the creative', node: <CreativeSlide /> },
  { id: 'the-math', title: 'What it brings in, what it costs', node: <MoneySlide /> },
  { id: 'recap', title: 'Who does what', node: <RecapSlide /> },
];
