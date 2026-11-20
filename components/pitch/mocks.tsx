'use client';

// ---------------------------------------------------------------------------
// The pictures in the Agency Pitch Deck (/pitch): an ad in a Facebook feed,
// a phone, the firm's VSL page, its qualifier, its calendar, the follow-up
// and the avatar stage. Mock-ups of what Nexli builds for a firm, drawn with
// the demo firm (lib/pitch-deck PITCH_FIRM), never a client's real account.
//
// VIDEO. Every moving face is an AvatarPlayer preview (silent, looping) laid
// over the avatar's portrait still, mounted only while it is on screen and
// unmounted when it leaves, so a twelve-slide deck never has more than a
// slide's worth of streams running. The deck is fixed-dark, like /math.
// ---------------------------------------------------------------------------
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Check,
  ChevronLeft,
  Globe,
  Lock,
  MessageSquareText,
  RotateCcw,
  ThumbsUp,
  X,
  type LucideIcon,
} from 'lucide-react';
import { AiBadge } from '@/components/ai-avatars/AvatarCard';
import MetaLogo from '@/components/icons/MetaLogo';
import { FAINT, MUTED } from '@/components/math/ui';
import {
  EXAMPLE_BOOKINGS,
  EXAMPLE_QUALIFIER,
  PITCH_AD,
  PITCH_FIRM,
  type FollowUpStep,
  type PitchAvatar,
} from '@/lib/pitch-deck';
import type { AdCreative } from '@/lib/ad-creatives';

const AvatarPlayer = dynamic(() => import('@/components/ai-avatars/AvatarPlayer'), { ssr: false });

// ── Tiles, in /math's colours (components/math/ChainIcons) ───────────────

export type Tone = 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber';

export const TONES: Record<Tone, { tile: string; text: string; shadow: string; ring: string }> = {
  blue: { tile: 'bg-blue-500/20 border-blue-500/30', text: 'text-blue-400', shadow: 'rgba(37,99,235,0.35)', ring: 'border-blue-400/50' },
  violet: { tile: 'bg-violet-500/20 border-violet-500/30', text: 'text-violet-400', shadow: 'rgba(139,92,246,0.35)', ring: 'border-violet-400/50' },
  cyan: { tile: 'bg-cyan-500/20 border-cyan-500/30', text: 'text-cyan-400', shadow: 'rgba(6,182,212,0.35)', ring: 'border-cyan-400/50' },
  emerald: { tile: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-400', shadow: 'rgba(16,185,129,0.35)', ring: 'border-emerald-400/50' },
  amber: { tile: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-400', shadow: 'rgba(245,158,11,0.35)', ring: 'border-amber-400/50' },
};

export function Tile({
  Icon,
  tone,
  n,
  size = 'md',
}: {
  Icon: LucideIcon;
  tone: Tone;
  n?: number;
  size?: 'md' | 'lg';
}) {
  const t = TONES[tone];
  const box = size === 'lg' ? 'h-12 w-12 rounded-2xl sm:h-14 sm:w-14' : 'h-10 w-10 rounded-xl';
  const icon = size === 'lg' ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-5 w-5';
  return (
    <span className="relative inline-flex">
      <span className={`flex items-center justify-center border ${t.tile} ${box}`} style={{ filter: `drop-shadow(0 4px 8px ${t.shadow})` }}>
        <Icon className={`${t.text} ${icon}`} aria-hidden="true" />
      </span>
      {n !== undefined && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-[#020617] ring-2 ring-[#0b1220]"
        >
          {n}
        </span>
      )}
    </span>
  );
}

/** A small numbered marker, for pointing at a part of a mock-up. */
export function Marker({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[11px] font-black text-[#020617] shadow-[0_0_0_3px_rgba(2,6,23,0.9),0_0_18px_rgba(34,211,238,0.6)] ${className}`}
    >
      {n}
    </span>
  );
}

/** "Example" pill: every mock-up on the deck is one. */
export function ExampleTag({ children = 'Example' }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-400/35 bg-amber-400/[0.08] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200">
      {children}
    </span>
  );
}

// ── A face on screen ─────────────────────────────────────────────────────

/**
 * The avatar's portrait, and her silent preview over it while it is on
 * screen. `play` false keeps it a still (the second and third copies of the
 * same face on one slide do not each need a stream).
 */
export function AvatarVideo({
  avatar,
  play = true,
  sizes = '640px',
  className = '',
  badge = true,
}: {
  avatar: PitchAvatar;
  play?: boolean;
  sizes?: string;
  className?: string;
  badge?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: '120px 0px' });
  const [playing, setPlaying] = useState(false);
  const live = play && inView;
  useEffect(() => {
    if (!live) setPlaying(false);
  }, [live]);
  return (
    <div ref={box} className={`relative overflow-hidden bg-white/[0.04] ${className}`}>
      <Image src={avatar.portrait} alt={`${avatar.name}, an AI-generated avatar`} fill sizes={sizes} className="object-cover" />
      {live && (
        <AvatarPlayer
          key={avatar.slug}
          mode="preview"
          playbackId={avatar.playbackId}
          name={avatar.name}
          onPlaying={() => setPlaying(true)}
          style={{ position: 'absolute', inset: 0, opacity: playing ? 1 : 0, transition: 'opacity 400ms ease' }}
        />
      )}
      {badge && <AiBadge className="absolute left-2.5 top-2.5" />}
    </div>
  );
}

// ── Frames ───────────────────────────────────────────────────────────────

export function PhoneFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[17.5rem] rounded-[2.4rem] border border-white/15 bg-[#05080f] p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ${className}`}
    >
      <div className="relative overflow-hidden rounded-[1.9rem] bg-[#0b1220]">
        <div aria-hidden="true" className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}

export function BrowserChrome({ address, children, className = '' }: { address: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl ${className}`}>
      <div className="flex items-center gap-3 border-b border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/60">
          <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{address}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function FirmMark({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-amber-400 font-black text-white ${
        size === 'md' ? 'h-9 w-9 text-[12px]' : 'h-8 w-8 text-[11px]'
      }`}
    >
      {PITCH_FIRM.initials}
    </span>
  );
}

// ── The ad ───────────────────────────────────────────────────────────────

/**
 * A Facebook feed ad for the demo firm, with numbered markers on the parts
 * Meta reads: ① the words ② the video ③ the headline ④ the page it opens.
 */
export function MetaAdMock({ ad, avatar, markers = true }: { ad: AdCreative; avatar: PitchAvatar; markers?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[20rem]">
      {/* Not overflow-hidden: the markers sit half outside the card. Nothing
          inside reaches the rounded corners, so nothing needs clipping. */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#0b1220] shadow-2xl">
        <div className="flex items-center gap-2.5 px-4 pt-3.5">
          <FirmMark />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] font-bold text-white">{PITCH_FIRM.name}</div>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: FAINT }}>
              Sponsored · <Globe className="h-3 w-3" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="relative px-4 pb-3 pt-2.5">
          {markers && <Marker n={1} className="absolute -left-3 top-2.5" />}
          <p className="line-clamp-3 text-[12.5px] leading-snug" style={{ color: 'rgba(255,255,255,0.86)' }}>
            {ad.primaryText}
          </p>
        </div>
        <div className="relative">
          {markers && <Marker n={2} className="absolute -left-3 top-3 z-10" />}
          <AvatarVideo avatar={avatar} className="aspect-[4/5]" sizes="640px" />
        </div>
        <div className="relative flex items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.03] px-4 py-3">
          {markers && <Marker n={3} className="absolute -left-3 top-3" />}
          <div className="min-w-0">
            <div className="truncate text-[10px] uppercase tracking-wide" style={{ color: FAINT }}>
              {PITCH_FIRM.domain}
            </div>
            <div className="text-[13px] font-semibold leading-snug text-white">{ad.headline}</div>
          </div>
          <span className="relative shrink-0 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white">
            {markers && <Marker n={4} className="absolute -right-3 -top-3" />}
            Book now
          </span>
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5 text-[11px]" style={{ color: FAINT }}>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" /> Like
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" /> Comment
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <MetaLogo className="h-3.5 w-3.5" /> Facebook &amp; Instagram
          </span>
        </div>
      </div>
    </div>
  );
}

// ── One face, three places ───────────────────────────────────────────────

/**
 * The same avatar dressed as each place the prospect meets her: the ad, the
 * VSL and the booking page. A strip of that page's chrome over the top and
 * along the bottom, so three copies of one face read as three places.
 */
export function FaceInContext({ avatar, place, play }: { avatar: PitchAvatar; place: 'ad' | 'vsl' | 'booked'; play: boolean }) {
  const top =
    place === 'ad' ? (
      <div className="flex items-center gap-2">
        <FirmMark />
        <div className="leading-tight">
          <div className="text-[12px] font-bold text-white">{PITCH_FIRM.name}</div>
          <div className="text-[10px]" style={{ color: FAINT }}>
            Sponsored
          </div>
        </div>
      </div>
    ) : place === 'vsl' ? (
      <div>
        <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-emerald-300">For business owners</div>
        <div className="text-[15px] font-extrabold leading-tight text-white">Stop overpaying the IRS.</div>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <div className="text-[12px] font-bold text-white">You&apos;re booked, {PITCH_FIRM.prospect}</div>
          <div className="text-[10px]" style={{ color: FAINT }}>
            Thursday, 2:00 PM
          </div>
        </div>
      </div>
    );
  const bottom =
    place === 'ad' ? (
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11.5px] font-semibold text-white">{PITCH_AD.headline}</span>
        <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white">Book now</span>
      </div>
    ) : place === 'vsl' ? (
      <div className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 py-2 text-[11.5px] font-bold text-white">
        See if you qualify <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
    ) : (
      <div className="text-[11.5px] leading-snug" style={{ color: MUTED }}>
        Watch this before your call: what we&apos;ll look at, and what to bring.
      </div>
    );
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
      <div className="px-3 py-2.5">{top}</div>
      <AvatarVideo avatar={avatar} play={play} className="aspect-[4/5]" sizes="640px" />
      <div className="px-3 py-2.5">{bottom}</div>
    </div>
  );
}

// ── The firm's VSL page ──────────────────────────────────────────────────

export function VslPageMock({ avatar }: { avatar: PitchAvatar }) {
  return (
    <div className="bg-[#0a0f1c] px-4 pb-5 pt-9">
      <div className="flex items-center gap-2">
        <FirmMark />
        <span className="text-[12px] font-bold text-white">{PITCH_FIRM.name}</span>
      </div>
      <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">For business owners</div>
      <div className="mt-1.5 text-[19px] font-extrabold leading-[1.1] text-white">
        Stop overpaying <span className="text-emerald-300">the IRS.</span>
      </div>
      <p className="mt-2 text-[11.5px] leading-snug" style={{ color: MUTED }}>
        A short video on what a plan made before the year closes keeps in your pocket.
      </p>
      <AvatarVideo avatar={avatar} className="mt-3 aspect-[4/5] rounded-xl" sizes="560px" />
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 py-2.5 text-[12px] font-bold text-white">
        See if you qualify <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
    </div>
  );
}

// ── The qualifier (clickable, never posts anything) ──────────────────────

export function QualifierDemo() {
  const [answers, setAnswers] = useState<boolean[]>([]);
  const step = answers.length;
  const done = step >= EXAMPLE_QUALIFIER.length || answers.includes(false);
  const fit = done && !answers.includes(false);
  const q = EXAMPLE_QUALIFIER[Math.min(step, EXAMPLE_QUALIFIER.length - 1)];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FirmMark />
          <span className="text-[12px] font-bold text-white">{PITCH_FIRM.name}</span>
        </div>
        <ExampleTag />
      </div>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {EXAMPLE_QUALIFIER.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? (answers[i] ? 'bg-emerald-400' : 'bg-amber-400') : i === step && !done ? 'bg-white/40' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <div className="mt-5 min-h-[15.5rem]">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: FAINT }}>
                Question {step + 1} of {EXAMPLE_QUALIFIER.length}
              </div>
              <div className="mt-1.5 text-lg font-bold leading-snug text-white">{q.question}</div>
              <div className="mt-4 grid gap-2">
                {q.options.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setAnswers((a) => [...a, o.fit])}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-[15px] font-semibold text-white/90 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/[0.06]"
                  >
                    {o.label}
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/35" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {fit ? (
                <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.08] p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                    <CalendarCheck className="h-5 w-5" aria-hidden="true" /> Meets the criteria: the calendar opens
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                    The calendar opens on the same page. They pick a time, and their answers arrive with the booking.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px] font-semibold text-white/85">
                    {['Tue 10:00', 'Thu 2:00', 'Fri 11:30'].map((t) => (
                      <span key={t} className="rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] py-2">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-400/40 bg-amber-400/[0.07] p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                    <X className="h-5 w-5" aria-hidden="true" /> Doesn&apos;t meet them: no calendar
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                    They are thanked and told what happens next. They never reach your calendar, and they stay a contact in
                    your CRM.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setAnswers([])}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-cyan-300 hover:text-cyan-200"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Try it again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── The calendar ─────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = [9, 10, 11, 12, 13, 14, 15];
const hourLabel = (h: number) => `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`;

export function CalendarMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] font-bold text-white">
          <ChevronLeft className="h-4 w-4 text-white/40" aria-hidden="true" />
          Your calendar, this week
        </div>
        <ExampleTag />
      </div>
      <div className="grid grid-cols-[2.6rem_repeat(5,minmax(0,1fr))]">
        <div />
        {DAYS.map((d) => (
          <div key={d} className="border-l border-white/[0.06] py-2 text-center text-[11px] font-bold uppercase tracking-wide" style={{ color: FAINT }}>
            {d}
          </div>
        ))}
        {HOURS.map((h) => (
          <React.Fragment key={h}>
            <div className="border-t border-white/[0.06] pr-1.5 pt-1 text-right text-[10px]" style={{ color: FAINT }}>
              {hourLabel(h)}
            </div>
            {DAYS.map((_, di) => {
              const b = EXAMPLE_BOOKINGS.find((x) => x.day === di && x.start === h);
              return (
                <div key={di} className="relative h-11 border-l border-t border-white/[0.06] sm:h-12">
                  {b && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.15 + di * 0.08 }}
                      className="absolute inset-0.5 overflow-hidden rounded-md border border-emerald-400/40 bg-emerald-400/[0.14] px-1.5 py-1"
                    >
                      <div className="truncate text-[10px] font-bold text-emerald-200 sm:text-[11px]">Tax planning review</div>
                      <div className="truncate text-[10px] text-white/70">{b.who}</div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/** The notification a firm gets when someone books. */
export function BookingNotice() {
  const b = EXAMPLE_BOOKINGS[0];
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1526] p-4 shadow-2xl">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300">
        <Bell className="h-3.5 w-3.5" aria-hidden="true" /> New booking
      </div>
      <div className="mt-2 text-[15px] font-bold text-white">Tax planning review · Tue 10:00 AM</div>
      <div className="mt-1 text-[13px]" style={{ color: MUTED }}>
        {b.who} · {b.what}
      </div>
      <ul className="mt-3 space-y-1.5 text-[12.5px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {['Owns a business', 'Paid $100,000 to $250,000 in federal tax', 'Never had a proactive plan', 'US-based'].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── The follow-up ────────────────────────────────────────────────────────

/** The texts, as the prospect sees them. */
export function SmsThread({ steps }: { steps: FollowUpStep[] }) {
  const texts = steps.filter((s) => s.channel !== 'Email');
  return (
    <div className="bg-[#0b1220] px-3 pb-5 pt-9">
      <div className="flex flex-col items-center gap-1 border-b border-white/[0.06] pb-3">
        <FirmMark size="md" />
        <div className="text-[11px] font-semibold text-white/80">{PITCH_FIRM.name}</div>
      </div>
      <div className="mt-3 space-y-2.5">
        {texts.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.25 }}
          >
            <div className="mb-1 text-center text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: FAINT }}>
              {s.when}
            </div>
            <div className="mr-6 rounded-2xl rounded-bl-md bg-white/[0.09] px-3 py-2 text-[11.5px] leading-snug text-white/90">{s.body}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── The avatar stage ─────────────────────────────────────────────────────

/** One avatar large and playing, the rest as a strip to switch between. */
export function AvatarStage({ avatars }: { avatars: PitchAvatar[] }) {
  const [active, setActive] = useState(0);
  const a = avatars[active];
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <AvatarVideo key={a.slug} avatar={a} className="aspect-[9/16] w-full max-w-[15rem] shrink-0 self-center rounded-2xl border border-white/10 sm:self-start" sizes="560px" />
      <div className="grid flex-1 grid-cols-3 content-start gap-2 sm:grid-cols-2">
        {avatars.map((x, i) => (
          <button
            key={x.slug}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`group relative aspect-[3/4] overflow-hidden rounded-xl border transition-all ${
              i === active ? 'border-cyan-400/70 shadow-[0_0_24px_-6px_rgba(34,211,238,0.6)]' : 'border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            {/* Asked for well above its CSS width: the deck scales slides up to
                fit the screen (components/math/ui useFitScale), and a retina
                display doubles that again. At 120px it came out blurry. */}
            <Image src={x.portrait} alt={`${x.name}, an AI-generated avatar`} fill sizes="360px" className="object-cover object-top" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pb-1.5 pt-5 text-left text-[12px] font-bold text-white">
              {x.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── The creative strip ───────────────────────────────────────────────────

/** Real example creatives (lib/ad-creatives): the active one plays. */
export function CreativeStrip({ creatives }: { creatives: AdCreative[] }) {
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: '120px 0px' });
  return (
    <div ref={box} className="grid grid-cols-3 gap-3">
      {creatives.map((c, i) => {
        const poster = c.muxPlaybackId ? `https://image.mux.com/${c.muxPlaybackId}/thumbnail.webp?time=0&width=720` : c.src || '';
        const live = inView && i === active && !!c.muxPlaybackId;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`relative aspect-[9/16] overflow-hidden rounded-xl border text-left transition-all ${
              i === active ? 'border-cyan-400/70 shadow-[0_0_24px_-6px_rgba(34,211,238,0.6)]' : 'border-white/10 opacity-75 hover:opacity-100'
            }`}
          >
            {poster && <Image src={poster} alt={`Example ad: ${c.angle}`} fill sizes="360px" className="object-cover" />}
            {live && (
              <AvatarPlayer
                key={c.id}
                mode="preview"
                playbackId={c.muxPlaybackId!}
                name={c.angle}
                style={{ position: 'absolute', inset: 0 }}
              />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pb-2 pt-6 text-[11px] font-bold leading-tight text-white">
              {c.angle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
