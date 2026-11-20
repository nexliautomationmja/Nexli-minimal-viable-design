'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clapperboard, Fingerprint, RefreshCw, Sparkles, Tag, Users, X } from 'lucide-react';
import { AvatarVideo } from '@/components/pitch/mocks';
import { AVATAR_STUDY, PITCH_AVATARS } from '@/lib/pitch-deck';

/**
 * The AI avatar, on /booking-confirmed-b between the portal and the ads
 * (Marcel, 2026-11-19). Two arguments, in his words:
 *
 *   1. NO INFLUENCER GRIND. "Never having to record and become an
 *      influencer and posting yapping videos, taking time away from your
 *      firm, and actually focusing on business."
 *   2. NO AD FATIGUE. Most agencies rely on the firm for content (read a
 *      script, send in videos and photos), so new ads stop when the firm is
 *      busy and the old ones go stale. We create all of it, every 7 to 14
 *      days.
 *   3. BRANDING. "We use the AI avatar to position their ads, for
 *      branding": one face, theirs alone while they are a client, across
 *      every ad and the video page, cast for the clients they want. The
 *      reason in lib/ai-avatars (WHY WE DO IT): agencies run the same ads
 *      for every client, and firms that look the same get priced the same.
 *
 * THE RULES (lib/ai-avatars): every face is AI-generated and labelled so;
 * Nexli casts the avatar, the firm does not pick (said neutrally, with the
 * study); one avatar, one firm while it is a client, which is not market
 * exclusivity; the avatar stays Nexli's like all ad creative. The faces are
 * the pitch deck's (PITCH_AVATARS): never Daniela, who is Nexli's own.
 *
 * Dark whatever the theme, like PricingBlock, so the video and the faces
 * read the same on the light page. Paragraph colours are inline because the
 * globals.css `p` rule would otherwise win.
 */

const SURFACE = 'linear-gradient(160deg, #101c33 0%, #0a1020 100%)';
const MUTED = 'rgba(255,255,255,0.66)';
const FAINT = 'rgba(255,255,255,0.5)';

const THE_GRIND = [
  'Read off the script your agency sends you',
  'Film yourself, do the retakes, send in videos and photos',
  'Post yapping videos and hope one of them lands',
  'Hours a week away from your clients, tax season included',
];

const THE_AVATAR = [
  'You never record or send in a thing',
  'Your avatar fronts every ad, and the video they watch before they book',
  'We write every script and make every video and photo',
  'Your hours stay on your clients and your business',
];

const BRAND_POINTS = [
  { Icon: Fingerprint, title: 'One avatar, one firm', body: 'While you are a client, no other firm’s ads use your avatar.' },
  { Icon: Users, title: 'Cast for your clients', body: 'We cast it from your firm, your market and the clients you want.' },
  { Icon: Tag, title: 'Labelled as AI', body: 'Every avatar is AI-generated, and we label it as AI.' },
];

function List({ items, good }: { items: string[]; good: boolean }) {
  return (
    <ul className="mt-3 list-none space-y-2.5 p-0">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              good ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
            }`}
          >
            {good ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /> : <X className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
          </span>
          <span className="text-[13.5px] leading-snug sm:text-sm" style={{ color: good ? 'rgba(255,255,255,0.9)' : MUTED }}>
            {t}
          </span>
        </li>
      ))}
    </ul>
  );
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' as const, delay },
});

export default function AvatarSection() {
  const [active, setActive] = useState(0);
  const face = PITCH_AVATARS[active];

  return (
    <div className="rounded-3xl border border-white/10 p-4 sm:p-6 lg:p-8" style={{ background: SURFACE }}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-10">
        {/* The stage: one avatar playing (silent), the others as stills.
            Only the one on stage streams. */}
        <motion.div {...rise(0)} className="mx-auto w-full max-w-[19rem]">
          <AvatarVideo
            key={face.slug}
            avatar={face}
            sizes="(min-width: 1024px) 608px, 90vw"
            className="aspect-[9/16] w-full rounded-2xl border border-white/10"
          />
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {PITCH_AVATARS.map((a, i) => (
              <button
                key={a.slug}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Show ${a.name}, an AI-generated avatar`}
                className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
                  i === active ? 'border-cyan-400/80 shadow-[0_0_16px_-4px_rgba(34,211,238,0.7)]' : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={a.portrait} alt="" fill sizes="120px" className="object-cover object-top" />
              </button>
            ))}
          </div>
          <span className="mt-2.5 block text-center text-[12px] leading-snug" style={{ color: FAINT }}>
            {face.name}, one of the faces we cast from. Every one is AI-generated.
          </span>
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* The grind, against the avatar. */}
          <div className="grid gap-3 sm:grid-cols-2">
            <motion.div {...rise(0.08)} className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-300 sm:text-[11px]">
                <Clapperboard className="h-3.5 w-3.5" aria-hidden="true" />
                The influencer route
              </span>
              <span className="mt-2 block text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
                Become a content creator.
              </span>
              <List items={THE_GRIND} good={false} />
            </motion.div>
            <motion.div
              {...rise(0.14)}
              className="rounded-2xl border p-4 sm:p-5"
              style={{ borderColor: 'rgba(52,211,153,0.45)', background: 'rgba(16,185,129,0.08)', boxShadow: '0 0 50px -18px rgba(52,211,153,0.55)' }}
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:text-[11px]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Your AI avatar
              </span>
              <span className="mt-2 block text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
                Run the firm instead.
              </span>
              <List items={THE_AVATAR} good />
            </motion.div>
          </div>

          {/* Ad fatigue (Marcel, 2026-11-19): agencies that need the firm to
              film and send content in stall when the firm is busy, and the
              same ads run until they are stale. We make all of it. */}
          <motion.div {...rise(0.17)} className="flex gap-3.5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-4 sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
              <RefreshCw className="h-[18px] w-[18px] text-amber-300" aria-hidden="true" />
            </span>
            <span className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300 sm:text-[11px]">No ad fatigue</span>
              <span className="mt-1 block text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
                Creative reviewed and refreshed, typically every 7 to 14 days.
              </span>
              <span className="mt-2 block text-[13.5px] leading-relaxed sm:text-sm" style={{ color: MUTED }}>
                Ads wear out: show people the same one long enough and they stop seeing it. Most agencies rely on you for
                the content: they send a script, you read it on camera and send in the videos and photos. The week you
                get busy, the new ads stop and the old ones keep running until they are stale. We create all of it, so
                there is always something new for Meta to show.
              </span>
            </span>
          </motion.div>

          {/* Branding: the avatar is how the ads are positioned. */}
          <motion.div {...rise(0.22)} className="rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.05] p-4 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300 sm:text-[11px]">
              It becomes your brand
            </span>
            <span className="mt-2 block text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
              The same face in every ad, and it is only yours.
            </span>
            <span className="mt-2 block text-[13.5px] leading-relaxed sm:text-sm" style={{ color: MUTED }}>
              Most agencies run the same ads for every client, so people see the same ad with a different firm’s name
              on it, and firms that look the same get priced the same. We use your avatar to position your ads: one
              face, from the ad to the video they watch before they book, so your firm has a face people remember.
            </span>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {BRAND_POINTS.map(({ Icon, title, body }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-3">
                  <span className="flex items-center gap-2 text-[13px] font-bold text-white">
                    <Icon className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                    {title}
                  </span>
                  <span className="mt-1 block text-[12px] leading-snug" style={{ color: FAINT }}>
                    {body}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...rise(0.28)} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <span className="block max-w-xl text-[11.5px] leading-relaxed" style={{ color: FAINT }}>
              You do not pick your avatar; we cast it, because who appears in an ad changes who Meta shows it to (
              <a href={AVATAR_STUDY.href} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-2 hover:text-white">
                Ali et al., 2019
              </a>
              ). Like all the ad creative we make, it stays ours.
            </span>
            <Link
              href="/ai-avatars"
              className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-cyan-300 transition-colors hover:text-cyan-200"
            >
              See the faces we cast from
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
