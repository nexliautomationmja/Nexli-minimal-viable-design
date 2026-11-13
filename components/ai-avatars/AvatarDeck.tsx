'use client';

// ---------------------------------------------------------------------------
// /ai-avatars as a pitch deck — the See the Math look, pitching BRANDING.
//
// THE ARGUMENT, headline down (Marcel, 2026-11-13): most agencies run the
// same ads for every client. The same people see the same ad under a
// different firm's name (ad fatigue), and firms that all look the same get
// treated the same and priced the same. A firm's own AI avatar sets it apart
// and makes it a brand. The cover says it, "Same ad. Different firm." spells
// it out, and every slide after it comes back to it.
//
// The supporting case (2026-11-11): Flo, Jake from State Farm, Billy Mays,
// Papa John. A recurring face is how a brand gets remembered, and a firm can
// have one without the owner ever getting on camera or running it.
//
// DANIELA'S VIDEO at the top explains the page. Its Mux id is
// DANIELA_PAGE_VIDEO in lib/ai-avatars; until it is set the cover shows her
// portrait card instead.
//
// THE BRAND FACES ARE WORDS ONLY. Never their pictures, logos or likenesses:
// they are other companies' trademarks and real people. Named in copy for
// illustration, with the trademark note on the last slide. Neutral, factual
// lines only — nothing about their histories.
//
// Built from /math's primitives (components/math/ui) so the two decks look
// and move the same, with its own small shell: full-screen snapping slides,
// a progress bar, dot nav and the arrow keys on a desktop tall enough
// (DECK_QUERY); a plain scrolling page on a phone. Just the logo, top left —
// ConditionalNavbar and Footer hide on /ai-avatars like the funnel pages.
//
// THE PROMISES, which lib/ai-avatars states too: one avatar, one firm while
// it is a client; Daniela is Nexli's own; the avatar stays Nexli's (Terms
// §6). No growth figures. Every face is labelled AI-generated.
//
// THE LIBRARY IS THE SECOND SECTION (Marcel, 2026-11-13: "more like a page
// library"), straight after the cover, with every avatar's intro video
// (components/ai-avatars/AvatarLibrary). It is the one section taller than
// the window, so it is not a Slide (Slide scales its content down to fit)
// but its own section, snapping a row of cards at a time in deck mode.
//
// PARAGRAPH COLOUR IS INLINE (see components/math/ui): globals.css colours
// <p> outside any layer, so a text-* class on a <p> does nothing.
// ---------------------------------------------------------------------------
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MotionConfig, useInView } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Layers,
  MapPin,
  Play,
  RefreshCw,
  ShieldCheck,
  Target,
  UserCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import { OUTFIT } from '@/components/funnel/primitives';
import { ShimmerBadge } from '@/components/math/ChainIcons';
import {
  Body,
  DECK_QUERY,
  GRADIENT_TEXT,
  HEADING,
  Heading,
  MUTED,
  FAINT,
  Panel,
  Reveal,
  Slide,
} from '@/components/math/ui';
import { DANIELA_PAGE_VIDEO, EXAMPLE_AVATAR_SLUG } from '@/lib/ai-avatars';
import { AiBadge, AvatarPortrait, type CardAvatar } from './AvatarCard';
import AvatarLibrary from './AvatarLibrary';

const AvatarPlayer = dynamic(() => import('./AvatarPlayer'), { ssr: false });

export interface AvatarDeckProps {
  daniela: CardAvatar;
  library: CardAvatar[];
  /** AGENCY_FIRM_SPOTS, spelled out. */
  firmSpots: string;
  /** Where the close slide sends them: ADVISORY_PATH. */
  ctaHref: string;
}

const DECK_CSS = `
@media ${DECK_QUERY} {
  .deck-scroller {
    height: 100svh;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-snap-type: y mandatory;
    overscroll-behavior: contain;
  }
  .deck-slide {
    height: 100svh;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
  /* The library, taller than the window. Mandatory snapping with only its
     top as a snap point would leave the rows below unreachable, so every
     card is a snap point too: the deck steps through it a row at a time,
     each row landing just under the logo. */
  .deck-tall {
    min-height: 100svh;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
  .deck-tall [data-library-card] {
    scroll-snap-align: start;
    scroll-margin-top: 5.5rem;
  }
}
`;

const pad = (n: number) => String(n).padStart(2, '0');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** GRADIENT_TEXT minus its desktop no-wrap. The cover's gradient phrase is a
 *  whole sentence: held to one line it pushed the headline wider than its
 *  column and crushed Daniela's card to a sliver. */
const GRADIENT_WRAP = GRADIENT_TEXT.replace('lg:whitespace-nowrap', '').trim();

// ── Slides ─────────────────────────────────────────────────────────────────

/** Daniela explaining the page. Click to play, with sound: it is the pitch,
 *  not a background loop. */
function ExplainerCard({ video }: { video: NonNullable<typeof DANIELA_PAGE_VIDEO> }) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)' }}
      />
      <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
        <AvatarPlayer
          mode="full"
          playbackId={video.playbackId}
          thumbnailTime={video.posterTime}
          name="Daniela, AI avatars explained"
        />
        <AiBadge className="pointer-events-none absolute left-3 top-3" />
      </div>
      <p className="mt-3 text-center text-sm leading-snug" style={{ color: MUTED }}>
        <span className="font-bold text-white">Daniela</span>, Nexli&apos;s own AI avatar, on why your firm needs one
        of its own. <span className="whitespace-nowrap text-white/45">{video.seconds} sec</span>
      </p>
    </div>
  );
}

function CoverSlide({
  daniela,
  library,
  explainer,
}: {
  daniela: CardAvatar;
  library: CardAvatar[];
  explainer: typeof DANIELA_PAGE_VIDEO;
}) {
  const faces = library.filter((a) => a.portrait).slice(0, 5);
  return (
    <Slide id="top" className="pt-28 sm:pt-32">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-16">
        <Reveal>
          <ShimmerBadge>
            AI Avatars<span className="hidden sm:inline"> · Branding for your firm</span>
          </ShimmerBadge>
          <h1
            className="mt-5 max-w-4xl text-pretty text-[2.3rem] sm:text-6xl lg:text-[clamp(3rem,4.4vw,4.6rem)]"
            style={{ ...HEADING, lineHeight: 1.02 }}
          >
            Look like every other firm, <span className={GRADIENT_WRAP}>get priced like every other firm.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg lg:text-xl" style={{ color: MUTED }}>
            Most agencies run the same ads for every client and swap in the name. Your prospects see the same ad
            from firm after firm, tune it out, and treat every firm the same, right down to what they expect to
            pay. Your own AI avatar gives your firm a face no other firm&apos;s ads use. That is how a firm
            becomes a brand.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#library"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white no-underline shadow-xl shadow-blue-600/25 transition-transform hover:scale-[1.02] sm:text-base"
            >
              <Play className="h-4 w-4 fill-white" aria-hidden="true" />
              Meet the cast
            </a>
            {faces.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3" aria-hidden="true">
                  {faces.map((a) => (
                    <span
                      key={a.slug}
                      className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#020617] bg-white/5"
                    >
                      <Image src={a.portrait!} alt="" fill sizes="40px" className="object-cover object-top" />
                    </span>
                  ))}
                </div>
                <span className="text-sm leading-snug" style={{ color: MUTED }}>
                  {library.length} avatars, each with
                  <br className="sm:hidden" /> her own intro video
                </span>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.12} className="mx-auto w-full max-w-[19rem] lg:max-w-none">
          {explainer ? (
            <ExplainerCard video={explainer} />
          ) : (
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-8 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)' }}
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                <AvatarPortrait avatar={daniela} sizes="(min-width: 1024px) 360px, 80vw" priority />
                <AiBadge className="absolute left-3 top-3" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-16">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Nexli&apos;s own</div>
                  <div className="mt-1 text-2xl font-black text-white">Daniela</div>
                  <p className="mt-1 text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.78)' }}>
                    AI-generated. She&apos;s the face of Nexli, and nobody films her.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </Slide>
  );
}

const SAME_AD_STEPS = [
  {
    title: 'They have seen it before.',
    body: "The same people see the same ad again and again, with a different firm's name on it each time.",
  },
  {
    title: 'So they stop seeing it.',
    body: 'That is ad fatigue. An ad they have already seen under another name gets scrolled straight past.',
  },
  {
    title: 'And they price you like the rest.',
    body: 'When every firm looks the same, prospects treat them the same and price them the same. You end up competing on fee.',
  },
];

/** One of the recycled ads: the same stock creative, only the name changes.
 *  Placeholder names on purpose, never a real firm's. */
function RecycledAd({ firm, initials, you = false }: { firm: string; initials: string; you?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-[#0b1220] ${you ? 'border-cyan-400/50' : 'border-white/10'}`}
    >
      <div className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[7px] font-black text-white sm:h-6 sm:w-6 sm:text-[8px]">
          {initials}
        </span>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[9px] font-bold text-white sm:text-[11px]">{firm}</div>
          <div className="text-[8px] sm:text-[9px]" style={{ color: FAINT }}>
            Sponsored
          </div>
        </div>
      </div>
      <div className="relative flex aspect-[4/5] flex-col items-center justify-center bg-gradient-to-b from-slate-400/20 to-slate-700/25">
        {/* In the picture, not the header: on a phone the header is too
            narrow for the firm's name and a tag. */}
        {you && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-cyan-400 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#020617] sm:text-[9px]">
            You
          </span>
        )}
        <UserRound className="h-9 w-9 text-white/25 sm:h-12 sm:w-12" strokeWidth={1.2} aria-hidden="true" />
        <span className="mt-1 px-1 text-center text-[7px] font-bold uppercase tracking-[0.14em] text-white/35 sm:text-[8px]">
          Same stock video
        </span>
      </div>
      <div className="px-2 py-1.5 text-[8px] font-semibold leading-snug text-white/80 sm:px-2.5 sm:py-2 sm:text-[10px]">
        Are you overpaying in taxes this year?
      </div>
    </div>
  );
}

function SameAdSlide() {
  return (
    <Slide id="same-ad">
      <Heading
        kicker="The problem"
        sub="Most agencies build one set of ads and run it for every client they have, changing only the name. It saves them time. It costs you the one thing an ad is for: being remembered."
      >
        Same ad. <span className={GRADIENT_TEXT}>Different firm.</span>
      </Heading>
      <div className="mt-8 grid items-center gap-8 lg:mt-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-12">
        <Reveal delay={0.08}>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]" style={{ color: FAINT }}>
            Your prospect&apos;s feed, this week
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3" aria-label="Three ads, identical except for the firm's name">
            <RecycledAd firm="Firm A CPA" initials="FA" />
            <RecycledAd firm="Firm B CPA" initials="FB" />
            <RecycledAd firm="Your Firm CPA" initials="YF" you />
          </div>
        </Reveal>
        <Reveal delay={0.14}>
          <ol className="space-y-5">
            {SAME_AD_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-sm font-black text-cyan-300">
                  {i + 1}
                </span>
                <div>
                  <div className="text-lg font-bold text-white" style={OUTFIT}>
                    {s.title}
                  </div>
                  <Body className="mt-1">{s.body}</Body>
                </div>
              </li>
            ))}
          </ol>
          <Body muted={false} className="mt-6 lg:text-lg">
            Your own AI avatar breaks the pattern: a face in your ads that no other firm&apos;s ads use.
          </Body>
        </Reveal>
      </div>
    </Slide>
  );
}

const FACES = [
  {
    name: 'Flo',
    brand: 'Progressive',
    line: 'One recurring character across years of ads. Most people can picture her before they can name a policy.',
  },
  {
    name: 'Jake from State Farm',
    brand: 'State Farm',
    line: 'Two words, and you already know the company.',
  },
  {
    name: 'Billy Mays',
    brand: 'OxiClean',
    line: 'A voice and a face that made a stain remover a household name.',
  },
  {
    name: 'Papa John',
    brand: "Papa John's",
    line: 'The name on the box was the face in the ad.',
  },
];

function FacesSlide() {
  return (
    <Slide id="faces">
      <Heading kicker="How branding works" sub="None of these is a logo. Each is a person the audience sees again and again, in ad after ad, until the face alone says the company's name.">
        The face <span className={GRADIENT_TEXT}>is the brand.</span>
      </Heading>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-5">
        {FACES.map((f, i) => (
          <Reveal key={f.name} delay={0.06 * i}>
            <Panel className="h-full">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400/90 sm:text-[11px]">
                {f.brand}
              </div>
              <div className="mt-2 text-2xl font-black leading-tight text-white lg:text-[1.7rem]" style={OUTFIT}>
                {f.name}
              </div>
              <Body className="mt-3">{f.line}</Body>
            </Panel>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.3}>
        <Body muted={false} className="mt-8 max-w-3xl lg:text-lg">
          Recognition compounds. By the tenth time someone sees the same face, they already feel like they know
          who is talking, and that trust is what every next ad gets to spend.
        </Body>
      </Reveal>
    </Slide>
  );
}

const COMPARE: [string, string][] = [
  ['You film every ad yourself', 'Never needs a filming day'],
  ['New ads mean new scripts and new takes', 'New creative every 7 to 14 days, without your time'],
  ['The ads go quiet when tax season starts', 'The same face shows up every week, all year'],
  ['The brand runs on your calendar', 'The brand runs without you operating it'],
];

function CatchSlide() {
  return (
    <Slide id="the-catch">
      <Heading
        kicker="The catch"
        sub="For a CPA firm, a face usually means the owner: scripts, filming days and re-takes squeezed between client meetings."
      >
        For most firms, the face <span className={GRADIENT_TEXT}>is the owner.</span>
      </Heading>
      <Reveal delay={0.1}>
        <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-2 lg:gap-5">
          <Panel title="You on camera">
            <ul className="space-y-3.5">
              {COMPARE.map(([you]) => (
                <li key={you} className="flex gap-3">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-white/35" aria-hidden="true" />
                  <Body>{you}</Body>
                </li>
              ))}
            </ul>
          </Panel>
          <div
            className="rounded-2xl border border-cyan-400/30 p-4 sm:p-6"
            style={{ background: 'linear-gradient(160deg, rgba(14,165,196,0.14) 0%, rgba(59,130,246,0.08) 100%)' }}
          >
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300 sm:text-[11px]">
              Your AI avatar
            </div>
            <ul className="space-y-3.5">
              {COMPARE.map(([, ai]) => (
                <li key={ai} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
                  <Body muted={false}>{ai}</Body>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </Slide>
  );
}

function ExampleAd({ avatar }: { avatar: CardAvatar | undefined }) {
  // Her video plays in the mock ad, silent and looping, from the first time
  // the slide comes near the window; mounted then and kept, not before.
  const box = useRef<HTMLDivElement>(null);
  const near = useInView(box, { margin: '200px 0px' });
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (near) setMounted(true);
  }, [near]);

  return (
    <div className="mx-auto w-full max-w-[19rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0b1220] shadow-2xl">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[11px] font-black text-white">
          YF
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold text-white">Your Firm CPA</div>
          <div className="text-[11px]" style={{ color: FAINT }}>
            Sponsored
          </div>
        </div>
      </div>
      <div ref={box} className="relative aspect-[4/5] overflow-hidden bg-white/[0.03]">
        {avatar?.portrait ? (
          // Centred, like the video's cover crop, so the fade from still to
          // video does not jump.
          <Image src={avatar.portrait} alt={`${avatar.name}, an AI-generated avatar`} fill sizes="300px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <UserRound className="h-16 w-16 text-white/20" aria-hidden="true" />
          </div>
        )}
        {mounted && avatar?.playbackId && (
          <AvatarPlayer
            mode="preview"
            playbackId={avatar.playbackId}
            name={avatar.name}
            onPlaying={() => setPlaying(true)}
            style={{ position: 'absolute', inset: 0, opacity: playing ? 1 : 0, transition: 'opacity 400ms ease' }}
          />
        )}
        <AiBadge className="absolute left-2.5 top-2.5" />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="text-[13px] font-semibold leading-snug text-white">Are you overpaying in taxes this year?</div>
        <span className="shrink-0 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white">Book now</span>
      </div>
    </div>
  );
}

function AnswerSlide({ example }: { example: CardAvatar | undefined }) {
  const points = [
    'One face, in every ad your firm runs',
    "In no other firm's ads while you are with us",
    'Nobody at your firm ever on camera',
  ];
  return (
    <Slide id="your-face">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div>
          <Heading kicker="The answer">
            A face that&apos;s yours, <span className={GRADIENT_TEXT}>not every firm&apos;s.</span>
          </Heading>
          <Reveal delay={0.08}>
            <Body className="mt-5 max-w-2xl lg:text-lg">
              We build your ads around an AI-generated presenter chosen for your firm, and while you are with us
              no other client&apos;s ads use her. The same face shows up in every ad you run, so your market
              starts to know your firm by it, and stops lumping you in with everyone else. You never film it and
              you never run it: we make the ads and run the campaigns.
            </Body>
            <ul className="mt-6 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
                  <Body muted={false}>{p}</Body>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.14}>
          <ExampleAd avatar={example} />
          <p className="mt-3 text-center text-xs" style={{ color: FAINT }}>
            An example ad{example ? ` with ${example.name}` : ''}. Yours uses your firm and your avatar.
          </p>
        </Reveal>
      </div>
    </Slide>
  );
}

const HOW_WE_CHOOSE = [
  {
    icon: MapPin,
    title: 'Where your firm is',
    body: 'A firm in Scottsdale and a firm in Brooklyn sell to different people. The face in your ads should look like it belongs in your market.',
  },
  {
    icon: Target,
    title: 'Who you want to reach',
    body: 'Business owners, high-income professionals, real estate investors. The avatar fits the people your ads are actually shown to.',
  },
  {
    icon: UserCheck,
    title: 'Your ideal client',
    body: 'We start from the clients you want more of, so the face on screen feels familiar to them, for tax planning and the rest of your work.',
  },
];

function CastingSlide() {
  return (
    <Slide id="casting">
      <Heading
        kicker="How we choose"
        sub="Pick one from the library yourself, or tell us about your firm and we choose. Three things decide it."
      >
        Cast for your market, <span className={GRADIENT_TEXT}>not for &ldquo;accounting.&rdquo;</span>
      </Heading>
      <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-3 lg:gap-5">
        {HOW_WE_CHOOSE.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={0.06 * i}>
            <Panel className="h-full">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10">
                <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              </div>
              <div className="mt-4 text-lg font-bold text-white" style={OUTFIT}>
                {title}
              </div>
              <Body className="mt-2">{body}</Body>
            </Panel>
          </Reveal>
        ))}
      </div>
    </Slide>
  );
}

type Filter = 'all' | 'female' | 'male';
const TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'female', label: 'Women' },
  { key: 'male', label: 'Men' },
];

/** Not a Slide: taller than the window, see .deck-tall in DECK_CSS. The
 *  filter tabs only show once the library has both women and men in it. */
function LibrarySection({ library }: { library: CardAvatar[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = filter === 'all' ? library : library.filter((a) => a.gender === filter);
  const count = (f: Filter) => (f === 'all' ? library.length : library.filter((a) => a.gender === f).length);
  const mixed = count('female') > 0 && count('male') > 0;
  return (
    <section
      id="library"
      data-slide
      className="deck-tall relative w-full px-5 py-16 sm:px-8 sm:py-20 lg:px-16 lg:pb-24 lg:pt-28"
    >
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <Heading
            kicker="The library"
            sub={`${library.length} AI-generated presenters, each with her own intro video. Each one runs for one firm at a time, so the face in your ads never turns up in another firm's.`}
          >
            Meet <span className={GRADIENT_TEXT}>the cast.</span>
          </Heading>
          <Reveal delay={0.06}>
            {mixed ? (
              <div role="tablist" aria-label="Filter avatars" className="flex gap-2">
                {TABS.map((t) => {
                  const active = filter === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(t.key)}
                      className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                        active
                          ? 'border-cyan-400/60 bg-cyan-400/15 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
                      }`}
                    >
                      {t.label} <span className="opacity-60">{count(t.key)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Only where there is a mouse to hover with.
              <div className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/60 [@media(hover:hover)]:inline-flex">
                <Play className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                Hover to preview, click for sound
              </div>
            )}
          </Reveal>
        </div>
        <Reveal delay={0.1} className="mt-8 lg:mt-10">
          <AvatarLibrary avatars={shown} />
        </Reveal>
      </div>
    </section>
  );
}

function YoursAloneSlide({ firmSpots }: { firmSpots: string }) {
  const why = [
    {
      icon: Layers,
      title: 'A brand, not a commodity.',
      body: "When your ads look like no one else's, you stop being one more name to compare on fee. You become the firm with the face, the one prospects remember.",
    },
    {
      icon: ShieldCheck,
      title: 'One avatar, one firm.',
      body: "While you are with us, no other client's ads use your avatar. The face your market learns is yours.",
    },
    {
      icon: Users,
      title: `${cap(firmSpots)} firms at a time.`,
      body: `We work with ${firmSpots} firms at once, so your ads are not one of dozens, and no creative of ours is wearing out the same audience under another firm's name.`,
    },
    {
      icon: RefreshCw,
      title: 'Fresh creative, every week or two.',
      body: 'Same face, new ads, usually every 7 to 14 days depending on performance, because Meta favors advertisers who keep feeding it new creative.',
    },
  ];
  return (
    <Slide id="yours-alone">
      <Heading
        kicker="Why it's yours alone"
        sub="If the firm across town ran the same face, it would be their brand too, and you would be back to looking like everyone else."
      >
        A brand face only works <span className={GRADIENT_TEXT}>if it&apos;s yours.</span>
      </Heading>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:gap-5">
        {why.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={0.06 * i}>
            <Panel className="h-full">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10">
                  <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white" style={OUTFIT}>
                    {title}
                  </div>
                  <Body className="mt-1.5">{body}</Body>
                </div>
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>
    </Slide>
  );
}

const QA = [
  ['Are these real people?', 'No. Every avatar is AI-generated: presenters we create for ads, not models, actors or employees.'],
  ['Do I own my avatar?', 'No. Like all the ad creative we make, it stays ours. While you are with us it runs only in your ads; after you leave, it can go to another firm.'],
  ['Can I have Daniela?', 'No. Daniela is the face of Nexli and is not available to clients.'],
];

function CloseSlide({ ctaHref }: { ctaHref: string }) {
  return (
    <Slide id="next">
      <Heading
        kicker="Next step"
        sub="Your avatar is one part of the Digital Rainmaker System: the website, the funnel, the automations and the ads that bring you tax-planning clients."
      >
        Stop looking like <span className={GRADIENT_TEXT}>every other firm.</span>
      </Heading>
      <Reveal delay={0.08}>
        <Link
          href={ctaHref}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white no-underline shadow-xl shadow-blue-600/25 transition-transform hover:scale-[1.02] sm:text-base"
        >
          See how the system works
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </Reveal>
      <Reveal delay={0.14}>
        <dl className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-3 lg:gap-5">
          {QA.map(([q, a]) => (
            <div key={q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <dt className="text-sm font-bold text-white sm:text-base" style={OUTFIT}>
                {q}
              </dt>
              <dd className="mt-1.5">
                <Body className="text-sm sm:text-[15px]">{a}</Body>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 max-w-4xl text-[11px] leading-relaxed" style={{ color: FAINT }}>
          Flo and Progressive, Jake from State Farm and State Farm, OxiClean, and Papa John&apos;s are trademarks
          of their respective owners, named here only to illustrate how brands use a recurring face. Nexli is not
          affiliated with or endorsed by any of them. Terms for avatars and all ad creative are in our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-white">
            Terms and Conditions
          </Link>
          .
        </p>
      </Reveal>
    </Slide>
  );
}

// ── The deck shell ─────────────────────────────────────────────────────────

const slideEls = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<HTMLElement>('[data-slide]') ?? []);

export default function AvatarDeck({ daniela, library, firmSpots, ctaHref }: AvatarDeckProps) {
  const example = library.find((a) => a.slug === EXAMPLE_AVATAR_SLUG) ?? library.find((a) => a.portrait);
  const slides = [
    {
      id: 'top',
      title: 'Look like every firm, priced like every firm',
      node: <CoverSlide daniela={daniela} library={library} explainer={DANIELA_PAGE_VIDEO} />,
    },
    { id: 'library', title: 'Meet the cast', node: <LibrarySection library={library} /> },
    { id: 'same-ad', title: 'Same ad, different firm', node: <SameAdSlide /> },
    { id: 'faces', title: 'The face is the brand', node: <FacesSlide /> },
    { id: 'the-catch', title: 'The owner on camera', node: <CatchSlide /> },
    { id: 'your-face', title: "Your firm's own face", node: <AnswerSlide example={example} /> },
    { id: 'casting', title: 'Cast for your market', node: <CastingSlide /> },
    { id: 'yours-alone', title: "Why it's yours alone", node: <YoursAloneSlide firmSpots={firmSpots} /> },
    { id: 'next', title: 'Next step', node: <CloseSlide ctaHref={ctaHref} /> },
  ];

  const [current, setCurrent] = useState(0);
  const [deckMode, setDeckMode] = useState(false);
  const target = useRef(0);
  const scroller = useRef<HTMLElement>(null);

  const goTo = useCallback((i: number, smooth = true) => {
    const els = slideEls(scroller.current);
    const next = Math.max(0, Math.min(els.length - 1, i));
    target.current = next;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    els[next]?.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(DECK_QUERY);
    const sync = () => setDeckMode(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const els = slideEls(scroller.current);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = els.indexOf(e.target as HTMLElement);
          if (i >= 0) {
            setCurrent(i);
            target.current = i;
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // A link to /ai-avatars#library lands on that slide.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const i = slides.findIndex((s) => s.id === id);
    if (i > 0) requestAnimationFrame(() => goTo(i, false));
    // slides is rebuilt each render; the ids never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goTo]);

  useEffect(() => {
    if (!deckMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // The library's video pop-up owns the keys while it is open.
      if (document.querySelector('[aria-modal="true"]')) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable) return;

      // Inside the library, which is taller than the window, the keys scroll
      // it a row at a time (the snap points pick the row) until its edge is
      // in view, and only then move to the next or previous slide.
      const forward = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
      const back = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      const here = slideEls(scroller.current)[target.current];
      if (here && (forward || back) && !(e.key === ' ' && (tag === 'BUTTON' || tag === 'A'))) {
        const r = here.getBoundingClientRect();
        const vh = window.innerHeight;
        if ((forward && r.bottom > vh + 8) || (back && r.top < -8)) {
          e.preventDefault();
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          scroller.current?.scrollBy({ top: (forward ? 1 : -1) * vh * 0.5, behavior: reduce ? 'auto' : 'smooth' });
          return;
        }
      }

      let to: number | null = null;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          to = target.current + 1;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          to = target.current - 1;
          break;
        case ' ':
          if (tag === 'BUTTON' || tag === 'A') return;
          to = target.current + (e.shiftKey ? -1 : 1);
          break;
        case 'Home':
          to = 0;
          break;
        case 'End':
          to = slides.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      goTo(to);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deckMode, goTo, slides.length]);

  return (
    <MotionConfig reducedMotion="user">
      <style>{DECK_CSS}</style>
      <main
        ref={scroller}
        className="deck-scroller relative overflow-x-hidden text-white"
        style={{ backgroundColor: '#020617', ...OUTFIT }}
      >
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-32 -right-24 h-[480px] w-[480px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)' }}
          />
        </div>

        <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[120] h-[3px] bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-violet-400 to-cyan-400 transition-[width] duration-500 ease-out"
            style={{ width: `${((current + 1) / slides.length) * 100}%` }}
          />
        </div>

        <FunnelLogo scrollAway={!deckMode} />

        {slides.map((s) => (
          <React.Fragment key={s.id}>{s.node}</React.Fragment>
        ))}

        {deckMode && (
          <>
            <nav aria-label="Slides" className="fixed right-5 top-1/2 z-[100] flex -translate-y-1/2 flex-col items-end gap-2.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}: ${s.title}`}
                  aria-current={i === current ? 'step' : undefined}
                  className="group flex items-center gap-3"
                >
                  <span className="pointer-events-none whitespace-nowrap rounded-md bg-[#0b1220]/95 px-2 py-1 text-xs font-medium text-white/85 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {s.title}
                  </span>
                  <span
                    className={`block w-1.5 rounded-full transition-all duration-300 ${
                      i === current ? 'h-6 bg-cyan-400' : 'h-1.5 bg-white/25 group-hover:bg-white/60'
                    }`}
                  />
                </button>
              ))}
            </nav>
            <div className="pointer-events-none fixed bottom-6 right-8 z-[100] text-xs font-semibold tabular-nums tracking-[0.12em] text-white/45">
              <span className="text-white/85">{pad(current + 1)}</span> / {pad(slides.length)}
            </div>
          </>
        )}
      </main>
    </MotionConfig>
  );
}
